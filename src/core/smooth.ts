/**
 * Lissage d'une valeur numérique.
 *
 * La position d'un `input[type=range]` découle de sa valeur, pas d'une
 * propriété CSS : aucune transition ne peut l'adoucir. On anime donc la valeur
 * elle-même, image par image, ce qui garde l'input natif et donc le tactile,
 * le clavier et la sémantique ARIA.
 *
 * Sert aussi à absorber les paliers réels : un volet motorisé remonte des
 * positions par sauts (65, 58, 43...), et interpoler entre deux relevés donne
 * un mouvement continu au lieu d'une succession de bonds.
 */

import type { ReactiveController, ReactiveControllerHost } from "lit";

/**
 * Réveiller la carte à chaque image demande deux précautions.
 *
 * Les cartes filtrent leurs rendus dans shouldUpdate pour ne pas se redessiner
 * à chaque battement de `hass`, et un `requestUpdate()` sans argument produit
 * une liste de propriétés modifiées vide, que ce filtre rejette. Il faut donc
 * nommer une propriété.
 *
 * Mais nommer une propriété que la carte ne déclare pas ne suffit pas non plus :
 * Lit lit alors `hôte[nom]`, le compare à l'ancienne valeur, trouve `undefined`
 * des deux côtés, en conclut que rien n'a bougé et annule la mise à jour. On
 * pose donc réellement un compteur sur l'hôte et on passe sa valeur précédente,
 * ce qui rend le changement indiscutable.
 */
type SmoothHost = ReactiveControllerHost & {
  requestUpdate(name?: PropertyKey, oldValue?: unknown): void;
};

const TICK = "__skeuoSmoothTick";

/**
 * Accélération puis ralentissement.
 *
 * La première moitié de la course monte en vitesse, la seconde la perd, avec
 * une vitesse maximale à mi-parcours et nulle aux deux extrémités. C'est le
 * profil d'un volet motorisé qui démarre en douceur et se range sans à-coup,
 * par opposition à une vitesse constante qui donnerait un départ et un arrêt
 * secs.
 */
const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const prefersReducedMotion = (): boolean =>
  typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

interface SmoothOptions {
  /** Durée minimale, pour qu'un petit écart reste perceptible. */
  minDuration?: number;
  /** Durée maximale, pour qu'une course complète ne traîne pas. */
  maxDuration?: number;
  /** Millisecondes par unité parcourue. */
  msPerUnit?: number;
  /** En deçà, on se place sans animer. */
  epsilon?: number;
  /**
   * Remplace le calcul de durée quand l'échelle n'est pas connue d'avance.
   * Un capteur de CO2 va de 400 à 2000 et un capteur d'humidité de 0 à 100 :
   * une durée exprimée en millisecondes par unité donnerait à l'un une course
   * seize fois plus longue qu'à l'autre pour le même déplacement d'aiguille.
   */
  duration?: (delta: number) => number;
}

/**
 * Au-delà, on considère que la commande s'est perdue et on reprend ce que dit
 * l'entité. Assez long pour couvrir un appareil Zigbee lent ou une passerelle
 * qui groupe ses rapports, assez court pour qu'un contrôle resté faux se
 * corrige de lui-même sans que l'utilisateur ait à recharger la page.
 */
const PENDING_TIMEOUT = 6000;

const now = (): number =>
  typeof performance !== "undefined" ? performance.now() : Date.now();

export class SmoothValue implements ReactiveController {
  private _host: SmoothHost;
  private _opts: {
    minDuration: number;
    maxDuration: number;
    msPerUnit: number;
    epsilon: number;
    duration?: (delta: number) => number;
  };

  private _current = 0;
  private _from = 0;
  private _target = 0;
  private _startedAt = 0;
  private _duration = 0;
  private _frame?: number;
  private _initialised = false;
  private _seq = 0;

  /** Dernière valeur venue de l'entité, avant toute consigne locale. */
  private _lastFromState?: number;
  /** Valeur que l'entité annonçait quand l'utilisateur a posé sa consigne. */
  private _pendingFrom?: number;
  private _pendingSince = 0;

  constructor(host: SmoothHost, options: SmoothOptions = {}) {
    this._host = host;
    // Assez long pour que l'accélération et le ralentissement se voient, assez
    // court pour que la carte ne paraisse jamais en retard sur l'appareil.
    this._opts = {
      minDuration: options.minDuration ?? 300,
      maxDuration: options.maxDuration ?? 820,
      msPerUnit: options.msPerUnit ?? 6.5,
      epsilon: options.epsilon ?? 0.5,
      duration: options.duration,
    };
    host.addController(this);
  }

  public get value(): number {
    return this._current;
  }

  public get animating(): boolean {
    return this._frame !== undefined;
  }

  /**
   * Valeur visée, animation comprise. C'est elle qu'il faut prendre pour base
   * quand l'utilisateur enchaîne les appuis : repartir de l'entité ferait
   * calculer trois fois le même pas tant qu'elle n'a pas répondu.
   */
  public get goal(): number {
    return this._target;
  }

  /**
   * Vise une nouvelle valeur.
   *
   * `immediate` sert quand le changement vient du geste de l'utilisateur
   * lui-même : sans lui, le curseur reviendrait à son ancienne position au
   * relâchement pour ensuite glisser jusqu'à là où le doigt l'avait déjà mis.
   */
  public set(target: number, immediate = false): void {
    if (!Number.isFinite(target)) return;

    // Une consigne posée par l'utilisateur met un moment à revenir confirmée
    // par l'appareil. Entre les deux, l'entité continue d'annoncer son ancienne
    // valeur, et la recaler dessus ferait repartir le contrôle en arrière avant
    // qu'il ne refasse le trajet. On ignore donc cet écho périmé, jusqu'à ce
    // que l'entité bouge pour de bon ou que l'attente devienne déraisonnable.
    if (!immediate) {
      this._lastFromState = target;
      if (this._pendingFrom !== undefined) {
        const attente = now() - this._pendingSince;
        if (target === this._pendingFrom && attente < PENDING_TIMEOUT) return;
        this._pendingFrom = undefined;
      }
    }

    // Première valeur connue : on se place dessus sans animer, sinon toute
    // carte partirait de zéro à l'affichage.
    if (!this._initialised) {
      this._initialised = true;
      this._current = target;
      this._target = target;
      return;
    }

    if (target === this._target && !immediate) return;

    this._target = target;

    if (immediate || prefersReducedMotion()) {
      this._cancel();
      this._current = target;
      this._notify();
      return;
    }

    const delta = Math.abs(target - this._current);
    if (delta < this._opts.epsilon) {
      this._cancel();
      this._current = target;
      this._notify();
      return;
    }

    this._from = this._current;
    this._duration = this._opts.duration
      ? this._opts.duration(delta)
      : Math.min(
          this._opts.maxDuration,
          Math.max(this._opts.minDuration, delta * this._opts.msPerUnit)
        );
    this._startedAt = performance.now();
    if (this._frame === undefined) this._frame = requestAnimationFrame(this._tick);
  }

  /**
   * Consigne posée par l'utilisateur. Le contrôle s'y place tout de suite et y
   * reste, au lieu de retomber sur ce que l'entité continue d'annoncer le temps
   * que l'appareil réponde. Ce que l'on retient n'est pas la valeur demandée
   * mais celle que l'entité affichait à cet instant : dès qu'elle en change,
   * quelle qu'elle soit, on lui rend la main. Un appareil qui borne la demande
   * ou qui refuse la commande reprend donc la main sans cas particulier.
   */
  public commit(target: number): void {
    if (!Number.isFinite(target)) return;
    this._pendingFrom = this._lastFromState;
    this._pendingSince = now();
    this.set(target, true);
  }

  private _tick = (now: number): void => {
    const elapsed = now - this._startedAt;
    const t = this._duration === 0 ? 1 : Math.min(1, elapsed / this._duration);
    this._current = this._from + (this._target - this._from) * easeInOutCubic(t);

    if (t >= 1) {
      this._current = this._target;
      this._frame = undefined;
    } else {
      this._frame = requestAnimationFrame(this._tick);
    }
    this._notify();
  };

  /** Marque un changement que Lit ne peut pas prendre pour un non-événement. */
  private _notify(): void {
    const previous = this._seq;
    (this._host as unknown as Record<string, unknown>)[TICK] = ++this._seq;
    this._host.requestUpdate(TICK, previous);
  }

  private _cancel(): void {
    if (this._frame !== undefined) {
      cancelAnimationFrame(this._frame);
      this._frame = undefined;
    }
  }

  public hostDisconnected(): void {
    // Une carte est détruite et recréée à chaque passage en mode édition ;
    // sans ça, la boucle continuerait sur un élément détaché.
    this._cancel();
    // Une consigne en attente ne survit pas au démontage : au remontage, ce que
    // dit l'entité fait autorité.
    this._pendingFrom = undefined;
  }
}
