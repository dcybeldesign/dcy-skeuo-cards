import {
  html,
  css,
  nothing,
  type PropertyValues,
  type TemplateResult,
  type CSSResultGroup,
} from "lit";
import { customElement } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";

import { SkeuoBaseCard, DEFAULT_TEXTURE, type SkeuoBaseConfig } from "../core/base-card";
import { computeEntityName, fireEvent, isActive, isUnavailable } from "../core/ha";
import { formatState, isFrench, t } from "../core/localize";
import { baseSchema, computeHelper, computeLabel, registerCard } from "../core/register";

/**
 * Panneau d'état pour capteurs binaires.
 *
 * Deuxième carte du pack sans entité unique : elle en suit une liste. C'est
 * elle qui justifie le drapeau `requiresEntity` ajouté au socle, et elle
 * redéfinit `entityIds()` pour que le filtre de rendu continue de ne repeindre
 * que sur un changement d'état d'un des capteurs suivis.
 *
 * Rien à voir avec la carte capteur, qui traite le domaine `sensor` et ses
 * valeurs. Ici l'entité n'a que deux états, il n'y a rien à mesurer : une
 * aiguille resterait collée à une extrémité.
 */

export type BinaryStyle = "annunciator" | "lamp" | "flap";

const STYLES: BinaryStyle[] = ["annunciator", "lamp", "flap"];

type Teinte = "red" | "amber";

interface BinaryEntry {
  entity: string;
  /** Force la teinte au lieu de la déduire de la device_class. */
  color?: Teinte;
  /**
   * Allume le voyant sur `off` au lieu de `on`. Sert aux classes dont l'état
   * inquiétant est l'absence : une liaison `connectivity` alerte quand elle
   * tombe, pas quand elle tient.
   */
  invert?: boolean;
}

interface BinaryCardConfig extends SkeuoBaseConfig {
  entities: (string | BinaryEntry)[];
  style?: BinaryStyle;
}

/**
 * Classes qui méritent le rouge. Le reste prend l'ambre du pack.
 *
 * La liste est volontairement courte : un rouge distribué largement ne veut
 * plus rien dire. Si une fenêtre ouverte et un début d'incendie portent la même
 * couleur, le panneau crie en permanence et on cesse de le regarder.
 */
/**
 * Domaines proposés dans l'éditeur.
 *
 * La carte n'agit sur rien, elle affiche un état : rien ne justifie de la
 * limiter aux capteurs binaires. Un annonciateur d'atelier montre indifféremment
 * une porte, une pompe et un éclairage. Seule condition, que le domaine ait une
 * lecture à deux états ; `isActive` sait déjà les départager.
 */
const DOMAINES = [
  "binary_sensor",
  "light",
  "switch",
  "input_boolean",
  "fan",
  "lock",
  "cover",
  "person",
  "device_tracker",
  "automation",
  "media_player",
  "sun",
];

const ALARMES = [
  "smoke",
  "gas",
  "carbon_monoxide",
  "safety",
  "tamper",
  "problem",
  "moisture",
  "heat",
];

const TEINTES: Record<Teinte, { haut: string; bas: string; halo: string }> = {
  red: { haut: "#ff8a6a", bas: "#c62d16", halo: "rgba(230,70,35,.75)" },
  amber: { haut: "#ffd9a3", bas: "#d78a28", halo: "rgba(226,166,89,.75)" },
};

/**
 * Au repos, la lentille garde sa teinte en sourdine au lieu de virer au gris :
 * sur un tableau industriel, un voyant éteint reste rouge ou ambre, c'est ce
 * qui permet de savoir ce qu'il signale avant qu'il ne s'allume.
 */
const SOURDINE: Record<Teinte, { haut: string; bas: string; halo: string }> = {
  red: { haut: "#6b3229", bas: "#2b1310", halo: "rgba(0,0,0,0)" },
  amber: { haut: "#6a512e", bas: "#2a2013", halo: "rgba(0,0,0,0)" },
};

/** Un capteur prêt à dessiner, quel que soit le style. */
interface Voyant {
  entity: string;
  nom: string;
  etat: string;
  allume: boolean;
  teinte: Teinte;
  injoignable: boolean;
}

@customElement("skeuo-binary-card")
export class SkeuoBinaryCard extends SkeuoBaseCard<BinaryCardConfig> {
  protected static override requiresEntity = false;

  /**
   * Mots affichés au rendu précédent, et mots sortants pendant une bascule.
   * Le style volet doit montrer le changement, pas seulement l'état d'après :
   * c'est le mouvement qui attire l'œil quand une porte s'ouvre.
   *
   * Comme sur la carte horloge, c'est une liste explicite vidée par une
   * minuterie qui décide de l'animation, et non une comparaison d'horodatage
   * évaluée pendant le rendu : celle-ci laisse la classe collée dès qu'un
   * rendu n'arrive pas à l'instant prévu.
   */
  private _mots: string[] = [];
  private _avant: string[] = [];
  private _reveil?: number;

  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._reveil !== undefined) {
      window.clearTimeout(this._reveil);
      this._reveil = undefined;
    }
  }

  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    if (this._style !== "flap" || !this.hass) return;

    const mots = this._voyants().map((v) => v.etat);
    // Premier rendu ou liste modifiée : on prend l'état sans animer.
    if (this._mots.length !== mots.length) {
      this._mots = mots;
      this._avant = [];
      return;
    }
    if (!mots.some((m, i) => m !== this._mots[i])) return;

    this._avant = this._mots;
    this._mots = mots;
    if (this._reveil !== undefined) window.clearTimeout(this._reveil);
    this._reveil = window.setTimeout(() => {
      this._reveil = undefined;
      const sortants = this._avant;
      this._avant = [];
      this.requestUpdate("_avant", sortants);
    }, 580);
  }

  protected override validateConfig(config: BinaryCardConfig): void {
    const liste = config.entities;
    if (!Array.isArray(liste) || liste.length === 0) {
      throw new Error(
        isFrench(this.hass)
          ? "`entities` doit contenir au moins une entité."
          : "`entities` must contain at least one entity."
      );
    }
    if (config.style && !STYLES.includes(config.style)) {
      throw new Error(
        isFrench(this.hass)
          ? `\`style\` doit valoir ${STYLES.join(", ")}`
          : `\`style\` must be one of ${STYLES.join(", ")}`
      );
    }
  }

  /**
   * Avec un seul capteur, le titre prend son nom, comme sur les quatorze autres
   * cartes du pack : sinon la carte répète la même chose deux fois, une en
   * bandeau et une sous le voyant.
   */
  protected override defaultTitle(): string {
    const seul = this._entrees;
    if (seul.length === 1) {
      const stateObj = this.hass?.states[seul[0].entity];
      if (stateObj) return computeEntityName(stateObj);
    }
    return t(this.hass, "status_panel");
  }

  /**
   * Registre d'affichage. Un capteur unique sur un plan de 615 sur 310 laisse
   * une carte quasiment vide si on garde la mise en page de panneau : aucune
   * autre carte du pack ne fait ça, elles remplissent toutes leur façade. En
   * dessous de trois, les indicateurs grossissent au lieu de flotter.
   */
  private _registre(n: number): "solo" | "duo" | "panneau" {
    if (n === 1) return "solo";
    if (n === 2) return "duo";
    return "panneau";
  }

  /** La liste accepte une chaîne ou un objet, comme les cartes natives. */
  private get _entrees(): BinaryEntry[] {
    return (this._config?.entities ?? []).map((e) =>
      typeof e === "string" ? { entity: e } : e
    );
  }

  protected override entityIds(): string[] {
    return this._entrees.map((e) => e.entity);
  }

  private get _style(): BinaryStyle {
    return this._config?.style ?? "annunciator";
  }

  public static getConfigForm() {
    const fr = isFrench();
    return {
      schema: [
        ...baseSchema({ entity: false }),
        {
          name: "entities",
          required: true,
          selector: {
            entity: { multiple: true, filter: { domain: DOMAINES } },
          },
        },
        {
          name: "style",
          selector: {
            select: {
              mode: "dropdown",
              options: fr
                ? [
                    { value: "annunciator", label: "Annonciateur rétroéclairé" },
                    { value: "lamp", label: "Voyants à lentille" },
                    { value: "flap", label: "Volets mécaniques" },
                  ]
                : [
                    { value: "annunciator", label: "Backlit annunciator" },
                    { value: "lamp", label: "Indicator lamps" },
                    { value: "flap", label: "Split-flap" },
                  ],
            },
          },
        },
      ],
      computeLabel,
      computeHelper,
    };
  }

  public static getStubConfig(
    _hass: unknown,
    entities: string[],
    entitiesFallback: string[]
  ): Partial<BinaryCardConfig> {
    const dispo = [...entities, ...entitiesFallback].filter((e) =>
      e.startsWith("binary_sensor.")
    );
    return {
      entities: dispo.length ? dispo.slice(0, 4) : ["binary_sensor.porte"],
      style: "annunciator",
      texture: DEFAULT_TEXTURE,
    };
  }

  /* ------------------------------------------------------------ lecture */

  /**
   * Allumage d'un voyant. `isActive` couvre la plupart des domaines, un volet
   * `open`, une serrure `unlocked`, un lecteur `playing`, mais il tient pour
   * actif tout état qui n'est pas un arrêt. Une personne absente dit pourtant
   * `not_home` ou le nom d'une zone, et le soleil couché `below_horizon` : leur
   * voyant s'allumerait. Ces domaines ont donc leur propre règle, posée ici et
   * non dans `isActive`, que les autres cartes du pack partagent.
   */
  private _actif(stateObj: Parameters<typeof isActive>[0]): boolean {
    if (!stateObj) return false;
    switch (stateObj.entity_id.split(".")[0]) {
      case "person":
      case "device_tracker":
        return stateObj.state === "home";
      case "sun":
        return stateObj.state === "above_horizon";
      default:
        return isActive(stateObj);
    }
  }

  private _voyants(): Voyant[] {
    return this._entrees.map((e) => {
      const stateObj = this.hass?.states[e.entity];
      const injoignable = isUnavailable(stateObj);
      const classe = stateObj?.attributes.device_class as string | undefined;
      const teinte: Teinte =
        e.color ?? (classe && ALARMES.includes(classe) ? "red" : "amber");
      return {
        entity: e.entity,
        nom: stateObj ? computeEntityName(stateObj) : e.entity,
        etat: injoignable ? t(this.hass, "unavailable") : formatState(this.hass, stateObj),
        // Pas une comparaison à `on` : la carte accepte tous les domaines à
        // deux états, et ils ne les nomment pas pareil. L'inversion ne touche
        // que l'allumage, le libellé reste celui que Home Assistant donne pour
        // l'état réel.
        allume: !injoignable && this._actif(stateObj) !== !!e.invert,
        teinte,
        injoignable,
      };
    });
  }

  private _ouvrir(entity: string): void {
    if (this.preview) return;
    fireEvent(this, "hass-more-info", { entityId: entity });
  }

  private _touche(ev: KeyboardEvent, entity: string): void {
    if (ev.key !== "Enter" && ev.key !== " ") return;
    ev.preventDefault();
    this._ouvrir(entity);
  }

  /* -------------------------------------------------------------- rendu */

  protected renderContent(): TemplateResult {
    const voyants = this._voyants();
    switch (this._style) {
      case "lamp":
        return this._lampes(voyants);
      case "flap":
        return this._volets(voyants);
      default:
        return this._annonciateur(voyants);
    }
  }

  private _annonciateur(voyants: Voyant[]): TemplateResult {
    const n = voyants.length;
    const registre = this._registre(n);
    // Le nombre de colonnes suit le nombre réel de capteurs au lieu de sauter
    // par seuils : sans ça, un panneau de trois laissait un quatrième
    // emplacement vide, visible comme un trou noir dans le cadre.
    // Trois capteurs tiennent sur une rangée, quatre se lisent mieux en carré.
    const cols = registre !== "panneau" ? 1 : n === 3 ? 3 : n <= 4 ? 2 : n <= 6 ? 3 : 4;
    const largeur =
      registre === "panneau" ? Math.round((512 - (cols - 1) * 12) / cols) : 508;
    const police = registre === "solo" ? 34 : registre === "duo" ? 22 : cols === 2 ? 17 : cols === 3 ? 14 : 12;

    return html`
      <div
        class=${classMap({ annonciateur: true, solo: registre === "solo", duo: registre === "duo" })}
        style=${styleMap({
          "--cols": String(cols),
          "--case": `${largeur}px`,
          "--police": `${police}px`,
        })}
      >
        ${voyants.map((v) => {
          const teinte = v.allume ? TEINTES[v.teinte] : undefined;
          return html`
            <div
              class=${classMap({ case: true, on: v.allume, morte: v.injoignable })}
              style=${styleMap(
                teinte
                  ? { "--haut": teinte.haut, "--bas": teinte.bas, "--halo": teinte.halo }
                  : {}
              )}
              role="button"
              tabindex="0"
              title=${`${v.nom} : ${v.etat}`}
              @click=${() => this._ouvrir(v.entity)}
              @keydown=${(ev: KeyboardEvent) => this._touche(ev, v.entity)}
            >
              ${registre === "solo" ? nothing : html`<b>${v.nom}</b>`}
              <i>${v.etat}</i>
            </div>
          `;
        })}
      </div>
    `;
  }

  private _lampes(voyants: Voyant[]): TemplateResult {
    const n = voyants.length;
    const registre = this._registre(n);
    // Au-delà de quatre, l'étiquette ne porte plus que la fonction : c'est la
    // lampe qui donne l'état, comme sur un vrai tableau. Garder les deux lignes
    // faisait déborder la carte, mesuré sur la maquette.
    const large = n <= 4;
    const cols = registre === "solo" ? 1 : large ? n : Math.ceil(n / 2);
    const lentille =
      registre === "solo" ? 160 : registre === "duo" ? 116 : large ? 84 : n <= 6 ? 58 : 54;
    const col =
      registre === "solo" ? 160 : registre === "duo" ? 190 : large ? 108 : n <= 6 ? 96 : 92;
    const gx = registre === "duo" ? 60 : large ? 30 : n <= 6 ? 24 : 16;

    return html`
      <div
        class=${classMap({ voyants: true, solo: registre === "solo", duo: registre === "duo" })}
        style=${styleMap({
          "--cols": String(cols),
          "--col": `${col}px`,
          "--lentille": `${lentille}px`,
          "--gx": `${gx}px`,
          "--gy": large ? "0px" : "10px",
        })}
      >
        ${voyants.map((v) => {
          const teinte = (v.allume ? TEINTES : SOURDINE)[v.teinte];
          return html`
            <div
              class=${classMap({ voyant: true, on: v.allume, morte: v.injoignable })}
              style=${styleMap({
                "--haut": teinte.haut,
                "--bas": teinte.bas,
                "--halo": teinte.halo,
              })}
              role="button"
              tabindex="0"
              title=${`${v.nom} : ${v.etat}`}
              @click=${() => this._ouvrir(v.entity)}
              @keydown=${(ev: KeyboardEvent) => this._touche(ev, v.entity)}
            >
              <div class="lunette"><i class="lentille"></i></div>
              <div class="etiquette">
                ${registre === "solo" ? nothing : html`<span class="nom">${v.nom}</span>`}
                ${large ? html`<span class="etat">${v.etat}</span>` : nothing}
              </div>
            </div>
          `;
        })}
      </div>
    `;
  }

  private _volets(voyants: Voyant[]): TemplateResult {
    const n = voyants.length;
    const registre = this._registre(n);
    const cols = registre === "solo" ? 1 : n <= 4 ? n : Math.ceil(n / 2);
    const hauteur = registre === "solo" ? 104 : registre === "duo" ? 84 : n <= 4 ? 62 : 52;
    const colonne = registre === "solo" ? 340 : registre === "duo" ? 240 : 118;
    const police = registre === "solo" ? 40 : registre === "duo" ? 28 : 21;

    return html`
      <div
        class=${classMap({ volets: true, solo: registre === "solo", duo: registre === "duo" })}
        style=${styleMap({
          "--cols": String(cols),
          "--hvolet": `${hauteur}px`,
          "--colonne": `${colonne}px`,
          "--police": `${police}px`,
        })}
      >
        ${voyants.map((v, i) => {
          const accent = v.allume ? TEINTES[v.teinte].haut : "#edeae2";
          const sortant = this._avant.length === voyants.length ? this._avant[i] : v.etat;
          const anime = sortant !== v.etat;
          return html`
            <div
              class=${classMap({ colonne: true, morte: v.injoignable })}
              role="button"
              tabindex="0"
              title=${`${v.nom} : ${v.etat}`}
              @click=${() => this._ouvrir(v.entity)}
              @keydown=${(ev: KeyboardEvent) => this._touche(ev, v.entity)}
            >
              ${registre === "solo" ? nothing : html`<div class="titre-col">${v.nom}</div>`}
              <div
                class=${classMap({ volet: true, actif: v.allume, bascule: anime })}
                style=${styleMap({ "--accent-volet": accent })}
              >
                <div class="moitie haut"><span>${v.etat}</span></div>
                <div class="moitie bas"><span>${anime ? sortant : v.etat}</span></div>
                <div class="rabat h"><span>${sortant}</span></div>
                <div class="rabat b"><span>${v.etat}</span></div>
                <div class="charniere"></div>
                <i class="axe g"></i><i class="axe d"></i>
              </div>
            </div>
          `;
        })}
      </div>
    `;
  }

  static override styles: CSSResultGroup = [
    SkeuoBaseCard.styles,
    css`
      [role="button"] {
        cursor: pointer;
        outline: none;
      }
      [role="button"]:focus-visible {
        box-shadow: 0 0 0 2px var(--skeuo-accent);
        border-radius: 6px;
      }
      /* Capteur injoignable : la case se désature sur place plutôt que de
         disparaître, sinon le panneau change de forme dès qu'une pile meurt. */
      .morte {
        filter: grayscale(1) brightness(0.7);
      }

      /* ------------------------------------------------- 1. annonciateur */

      /* Flux et non grille : avec un nombre impair de capteurs, une grille
         laisse un emplacement vide en fin de tableau, visible comme un trou
         noir dans le cadre. Un flux qui revient à la ligne centre sa dernière
         rangée et le cas disparaît, quel que soit le nombre. */
      .annonciateur {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        width: calc(var(--cols) * var(--case) + (var(--cols) - 1) * 12px);
        gap: 12px;
        padding: 14px;
        border-radius: 8px;
        background: linear-gradient(160deg, #202327 0%, #131518 60%, #191c1f 100%);
        box-shadow:
          inset 3px 3px 8px rgba(0, 0, 0, 0.85),
          inset -2px -2px 4px rgba(255, 255, 255, 0.05),
          0 0 0 2px #0a0b0c,
          6px 8px 14px rgba(0, 0, 0, 0.6);
      }
      /* Fenêtre à texte gravé, éclairée par l'arrière. Éteinte, la case reste
         lisible en creux : c'est ce qui fait un annonciateur et non un
         afficheur, on sait ce que la carte surveille même au repos. */
      .case {
        position: relative;
        flex: none;
        width: var(--case);
        height: 74px;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: linear-gradient(180deg, #2c3034 0%, #1d2124 55%, #16191c 100%);
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          inset 0 -2px 4px rgba(0, 0, 0, 0.6),
          2px 3px 6px rgba(0, 0, 0, 0.55);
        overflow: hidden;
      }
      /* Les noms d'entité réels dépassent souvent trente caractères. Sans
         limite de lignes, ils poussent l'état hors de la case ou font déborder
         la carte : mesuré sur une installation réelle, six noms sur huit
         étaient rognés. On coupe à deux lignes avec des points de suspension,
         le nom complet restant dans l'infobulle et dans la fiche de l'entité. */
      .case b {
        font-size: var(--police);
        letter-spacing: 2.4px;
        text-transform: uppercase;
        font-weight: 500;
        padding: 0 6px;
        text-align: center;
        line-height: 1.15;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        color: #4e545a;
        text-shadow: -1px -1px 0 rgba(0, 0, 0, 0.9), 1px 1px 0 rgba(255, 255, 255, 0.06);
      }
      .case i {
        font-style: normal;
        margin-top: 5px;
        font-size: 13px;
        letter-spacing: 2px;
        text-transform: uppercase;
        color: #3d4247;
      }
      .case.on {
        background: radial-gradient(ellipse at 50% 120%, var(--haut) 0%, var(--bas) 58%, #1a1416 100%);
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.22),
          inset 0 -2px 6px rgba(0, 0, 0, 0.45),
          2px 3px 6px rgba(0, 0, 0, 0.55),
          0 0 16px var(--halo);
      }
      .case.on b {
        color: #17120d;
        text-shadow: 0 1px 0 rgba(255, 255, 255, 0.28);
      }
      .case.on i {
        color: rgba(23, 18, 13, 0.72);
      }
      /* Un ou deux capteurs : la case prend toute la largeur et grossit, au
         lieu de laisser la moitié du cadre vide. Le nom disparaît en solo, le
         bandeau de la carte le porte déjà. */
      .annonciateur.solo .case {
        height: 150px;
      }
      .annonciateur.solo .case i {
        margin-top: 0;
        font-size: var(--police);
        letter-spacing: 4px;
      }
      .annonciateur.duo .case {
        height: 84px;
      }
      .annonciateur.duo .case i {
        font-size: 16px;
      }

      /* ------------------------------------------------------ 2. voyants */

      .voyants {
        display: flex;
        flex-wrap: wrap;
        width: calc(var(--cols) * var(--col) + (var(--cols) - 1) * var(--gx));
        gap: var(--gy) var(--gx);
        justify-content: center;
        align-items: start;
      }
      .voyant {
        flex: none;
      }
      .voyant {
        width: var(--col);
        text-align: center;
      }
      /* Lunette moletée, même vocabulaire que les molettes du pack. La lumière
         vient du haut-gauche, le haut de l'anneau capte et le bas retombe. */
      .lunette {
        position: relative;
        width: var(--lentille);
        height: var(--lentille);
        margin: 0 auto;
        border-radius: 50%;
        background:
          repeating-conic-gradient(
            from 0deg,
            rgba(255, 255, 255, 0.1) 0deg 2deg,
            rgba(0, 0, 0, 0.16) 2deg 4deg
          ),
          linear-gradient(150deg, #9aa0a6 0%, #5b6167 38%, #2c3135 68%, #767c82 100%);
        box-shadow:
          inset 0 2px 2px rgba(255, 255, 255, 0.35),
          inset 0 -2px 3px rgba(0, 0, 0, 0.7),
          4px 6px 11px rgba(0, 0, 0, 0.65);
      }
      /* Verre bombé à facettes : c'est la facette qui distingue un voyant
         industriel d'une pastille de couleur. */
      .lentille {
        position: absolute;
        inset: 11px;
        border-radius: 50%;
        background:
          repeating-conic-gradient(
            from 12deg,
            rgba(255, 255, 255, 0.09) 0deg 9deg,
            rgba(0, 0, 0, 0.1) 9deg 18deg
          ),
          radial-gradient(circle at 38% 30%, var(--haut) 0%, var(--bas) 62%, #0b0d0e 100%);
        box-shadow:
          inset 3px 3px 6px rgba(0, 0, 0, 0.55),
          inset -2px -3px 5px rgba(255, 255, 255, 0.1),
          0 0 0 1.5px #14171a;
      }
      .lentille::after {
        content: "";
        position: absolute;
        left: 16%;
        top: 10%;
        width: 40%;
        height: 30%;
        border-radius: 50%;
        background: linear-gradient(160deg, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0) 70%);
        filter: blur(1px);
      }
      .voyant.on .lunette {
        box-shadow:
          inset 0 2px 2px rgba(255, 255, 255, 0.35),
          inset 0 -2px 3px rgba(0, 0, 0, 0.7),
          4px 6px 11px rgba(0, 0, 0, 0.65),
          0 0 22px var(--halo);
      }
      .etiquette {
        margin-top: 12px;
        font-size: 13px;
        letter-spacing: 1.6px;
        text-transform: uppercase;
        color: #9ca0a4;
        line-height: 1.25;
        /* Gravure : creux sombre en haut-gauche, arête claire en bas-droite. */
        text-shadow: -1px -1px 0 rgba(0, 0, 0, 0.85), 1px 1px 0 rgba(255, 255, 255, 0.07);
      }
      /* Hauteur figée sur deux lignes : c'est elle qui aligne les rangées et
         qui empêche un nom à rallonge de pousser la seconde rangée hors de la
         carte. */
      .etiquette .nom {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        height: 33px;
      }
      .etiquette .etat {
        display: block;
      }
      .voyant.on .etiquette {
        color: #d7dbdf;
      }
      /* En solo l'étiquette passe à côté de la lampe plutôt qu'en dessous : une
         grosse lentille avec un mot minuscule sous elle déséquilibre la façade. */
      .voyants.solo {
        display: flex;
        align-items: center;
        gap: 34px;
      }
      .voyants.solo .voyant {
        display: flex;
        align-items: center;
        gap: 34px;
        width: auto;
      }
      .voyants.solo .etiquette {
        margin-top: 0;
        font-size: 26px;
        letter-spacing: 3px;
        text-align: left;
      }
      .voyants.duo .etiquette {
        font-size: 15px;
      }
      .voyants.duo .etiquette .nom {
        height: 38px;
      }

      /* ------------------------------------------------------- 3. volets */

      .volets {
        display: flex;
        flex-wrap: wrap;
        width: calc(var(--cols) * var(--colonne) + (var(--cols) - 1) * 22px);
        gap: 14px 22px;
        justify-content: center;
        align-items: start;
      }
      .colonne {
        flex: none;
        width: var(--colonne);
        text-align: center;
      }
      /* Hauteur figée sur deux lignes : sans elle, une étiquette qui passe à la
         ligne décale son volet et la rangée n'est plus alignée. */
      .titre-col {
        font-size: 12px;
        letter-spacing: 1.6px;
        text-transform: uppercase;
        color: #8d9093;
        margin-bottom: 9px;
        line-height: 1.2;
        height: 29px;
        text-align: center;
        text-shadow: -1px -1px 0 rgba(0, 0, 0, 0.85);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .volet {
        position: relative;
        height: var(--hvolet);
        border-radius: 5px;
        font-size: var(--police);
        line-height: var(--hvolet);
        letter-spacing: 1.6px;
        font-weight: 500;
        color: #edeae2;
        text-align: center;
        box-shadow: 4px 5px 9px rgba(0, 0, 0, 0.6);
      }
      .volet {
        perspective: 340px;
      }
      .volet .moitie,
      .volet .rabat {
        position: absolute;
        left: 0;
        right: 0;
        height: calc(var(--hvolet) / 2);
        overflow: hidden;
      }
      .volet .haut,
      .volet .rabat.h {
        top: 0;
        border-radius: 5px 5px 0 0;
        background: linear-gradient(180deg, #3a3d41 0%, #2a2d31 100%);
      }
      .volet .bas,
      .volet .rabat.b {
        bottom: 0;
        border-radius: 0 0 5px 5px;
        background: linear-gradient(180deg, #202327 0%, #16181b 100%);
      }
      .volet .bas span,
      .volet .rabat.b span {
        display: block;
        margin-top: calc(var(--hvolet) / -2);
      }
      /* Le rabat tombe, puis le suivant se relève : en deux temps, comme sur un
         vrai panneau. Les deux faces sont masquées de dos pour ne pas laisser
         voir le texte à l'envers pendant la rotation. */
      .volet .rabat {
        z-index: 3;
        backface-visibility: hidden;
      }
      .volet .rabat.h {
        transform-origin: bottom;
      }
      .volet .rabat.b {
        transform-origin: top;
        transform: rotateX(90deg);
      }
      .volet.bascule .rabat.h {
        animation: sk-bin-tombe 0.26s cubic-bezier(0.5, 0, 0.9, 0.6) forwards;
      }
      .volet.bascule .rabat.b {
        animation: sk-bin-monte 0.26s cubic-bezier(0.1, 0.4, 0.5, 1) 0.26s forwards;
      }
      @keyframes sk-bin-tombe {
        to {
          transform: rotateX(-90deg);
        }
      }
      @keyframes sk-bin-monte {
        to {
          transform: rotateX(0deg);
        }
      }
      .volet .charniere {
        position: absolute;
        left: 0;
        right: 0;
        top: calc(var(--hvolet) / 2 - 1px);
        height: 1.5px;
        background: #0a0b0c;
        z-index: 3;
      }
      .volet .axe {
        position: absolute;
        top: calc(var(--hvolet) / 2 - 5px);
        width: 8px;
        height: 8px;
        border-radius: 50%;
        z-index: 4;
        background: radial-gradient(circle at 35% 30%, #aeb5bb 0%, #61676d 55%, #24282c 100%);
        box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.4), 1px 2px 3px rgba(0, 0, 0, 0.75);
      }
      .volet .axe.g {
        left: -4px;
      }
      .volet .axe.d {
        right: -4px;
      }
      .volet.actif span {
        color: var(--accent-volet);
        text-shadow: 0 0 10px var(--accent-volet);
      }
    `,
  ];
}

registerCard({
  type: "skeuo-binary-card",
  name: { fr: "Skeuo · Panneau d'états", en: "Skeuo · Status panel" },
  description: {
    fr: "États de plusieurs entités sur une seule carte, en annonciateur, voyants ou volets. Portes, fenêtres, mouvement, lumières, prises, présence.",
    en: "Several entity states on one card, as an annunciator, lamps or split-flaps. Doors, windows, motion, lights, plugs, presence.",
  },
  preview: true,
});

declare global {
  interface HTMLElementTagNameMap {
    "skeuo-binary-card": SkeuoBinaryCard;
  }
}
