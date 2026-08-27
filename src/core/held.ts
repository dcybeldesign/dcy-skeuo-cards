/**
 * Tenue d'une valeur posée par l'utilisateur, sans animation.
 *
 * Même problème que dans SmoothValue : l'entité continue d'annoncer son
 * ancienne valeur le temps que l'appareil réponde, et un contrôle recalé
 * dessus repart en arrière juste après le geste. La différence est qu'ici on
 * ne veut aucun mouvement interpolé, seulement que le curseur reste où le
 * doigt l'a laissé. Un fader de teinte que l'on vient de placer n'a pas à
 * glisser tout seul.
 *
 * Volontairement sans contrôleur ni image par image : la valeur est lue au
 * rendu, et les rendus arrivent déjà à chaque changement de `hass`.
 */

/** Au-delà, la commande est considérée perdue et l'entité reprend la main. */
const PENDING_TIMEOUT = 6000;

const now = (): number =>
  typeof performance !== "undefined" ? performance.now() : Date.now();

/** Même mécanique que dans SmoothValue : un compteur réellement posé sur
 *  l'hôte, sinon Lit compare deux `undefined` et annule la mise à jour. */
const TICK = "__skeuoHeldTick";

type HeldHost = {
  requestUpdate(name?: PropertyKey, oldValue?: unknown): void;
};

export class HeldValue {
  private _host?: HeldHost;
  private _seq = 0;
  private _local?: number;
  private _pendingFrom?: number;
  private _pendingSince = 0;

  /**
   * L'hôte est facultatif, mais sans lui rien ne redessine la carte entre le
   * geste et le prochain battement de `hass`. Le fader retomberait alors sur
   * l'ancienne valeur le temps de cet intervalle, ce qui est précisément le
   * défaut que cette classe corrige.
   */
  constructor(host?: HeldHost) {
    this._host = host;
  }

  /**
   * Valeur à afficher, connaissant celle de l'entité.
   *
   * Ce que l'on retient n'est pas la valeur demandée mais celle que l'entité
   * annonçait au moment du geste : dès qu'elle en change, quelle qu'elle soit,
   * on lui rend la main. Un appareil qui borne la demande, ou qui la refuse,
   * reprend donc la main sans cas particulier.
   */
  public read(fromState: number): number {
    if (this._pendingFrom === undefined) return fromState;
    const attente = now() - this._pendingSince;
    if (fromState !== this._pendingFrom || attente >= PENDING_TIMEOUT) {
      this._pendingFrom = undefined;
      this._local = undefined;
      return fromState;
    }
    return this._local ?? fromState;
  }

  /** Consigne posée par l'utilisateur, à tenir jusqu'à confirmation. */
  public commit(value: number, fromState: number): void {
    if (!Number.isFinite(value)) return;
    this._local = value;
    this._pendingFrom = fromState;
    this._pendingSince = now();
    if (this._host) {
      const previous = this._seq;
      (this._host as unknown as Record<string, unknown>)[TICK] = ++this._seq;
      this._host.requestUpdate(TICK, previous);
    }
  }

  /** Au démontage, ce que dit l'entité fait autorité. */
  public reset(): void {
    this._pendingFrom = undefined;
    this._local = undefined;
  }
}
