import { html, svg, css, nothing, type TemplateResult, type CSSResultGroup } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";

import { SkeuoBaseCard, DEFAULT_TEXTURE, type SkeuoBaseConfig } from "../core/base-card";
import { isFrench, t } from "../core/localize";
import { baseSchema, computeHelper, computeLabel, registerCard } from "../core/register";

/**
 * Horloge.
 *
 * Seule carte du pack sans entité : l'heure est lue sur le navigateur, pas sur
 * Home Assistant. Ce n'est pas un raccourci mais le bon choix ici. Une entité
 * d'horodatage change d'état toutes les minutes, et chaque changement d'état
 * traverse le filtre de rendu de toutes les cartes qui la suivent ; sur une
 * tablette murale, c'est exactement le genre de réveil périodique qu'on essaie
 * d'éviter. Et sur un écran mural, l'heure qui compte est celle de l'écran.
 *
 * Cinq styles, une seule carte. Cinq entrées dans le sélecteur pour la même
 * fonction obligeraient l'utilisateur à choisir avant d'avoir vu.
 */

export type ClockStyle = "lcd" | "analog" | "nixie" | "flap" | "words";

const STYLES: ClockStyle[] = ["lcd", "analog", "nixie", "flap", "words"];

interface ClockCardConfig extends SkeuoBaseConfig {
  style?: ClockStyle;
  /** Le séparateur bat la seconde. Faux par défaut. */
  blink?: boolean;
}

/* ------------------------------------------------------------ matrices */

/**
 * Grilles des horloges à mots, 11 colonnes sur 10 lignes, calculées pour
 * qu'aucun mot ne soit coupé en fin de ligne. Les lettres restantes sont du
 * remplissage : sur une vraie horloge, elles restent éteintes.
 */
const GRILLE_FR = [
  "ILNESTODEUX",
  "QUATRETROIS",
  "NEUFUNESEPT",
  "HUITSIXCINQ",
  "MIDIXMINUIT",
  "ONZERHEURES",
  "MOINSOLEDIX",
  "ETRQUARTPMD",
  "VINGTSCINQU",
  "ETSDEMIEPAR",
];

const GRILLE_EN = [
  "ITLISASAMPM",
  "ACQUARTERDC",
  "TWENTYFIVEX",
  "HALFSTENFTO",
  "PASTERUNINE",
  "ONESIXTHREE",
  "FOURFIVETWO",
  "EIGHTELEVEN",
  "SEVENTWELVE",
  "TENSEOCLOCK",
];

/** Segment allumé : ligne, colonne de départ, longueur. */
type Segment = readonly [number, number, number];

const FR = {
  ilest: [[0, 0, 2], [0, 3, 3]] as Segment[],
  heure: [[5, 5, 5]] as Segment[],
  heures: [[5, 5, 6]] as Segment[],
  moins: [[6, 0, 5]] as Segment[],
  le: [[6, 6, 2]] as Segment[],
  dix: [[6, 8, 3]] as Segment[],
  et: [[7, 0, 2]] as Segment[],
  quart: [[7, 3, 5]] as Segment[],
  vingt: [[8, 0, 5]] as Segment[],
  cinq: [[8, 6, 4]] as Segment[],
  etDemie: [[9, 0, 2], [9, 3, 5]] as Segment[],
  heures12: {
    1: [[2, 4, 3]], 2: [[0, 7, 4]], 3: [[1, 6, 5]], 4: [[1, 0, 6]], 5: [[3, 7, 4]],
    6: [[3, 4, 3]], 7: [[2, 7, 4]], 8: [[3, 0, 4]], 9: [[2, 0, 4]], 10: [[4, 2, 3]],
    11: [[5, 0, 4]],
  } as Record<number, Segment[]>,
  midi: [[4, 0, 4]] as Segment[],
  minuit: [[4, 5, 6]] as Segment[],
};

const EN = {
  itis: [[0, 0, 2], [0, 3, 2]] as Segment[],
  a: [[1, 0, 1]] as Segment[],
  quarter: [[1, 2, 7]] as Segment[],
  twenty: [[2, 0, 6]] as Segment[],
  five: [[2, 6, 4]] as Segment[],
  half: [[3, 0, 4]] as Segment[],
  ten: [[3, 5, 3]] as Segment[],
  to: [[3, 9, 2]] as Segment[],
  past: [[4, 0, 4]] as Segment[],
  oclock: [[9, 5, 6]] as Segment[],
  heures12: {
    1: [[5, 0, 3]], 2: [[6, 8, 3]], 3: [[5, 6, 5]], 4: [[6, 0, 4]], 5: [[6, 4, 4]],
    6: [[5, 3, 3]], 7: [[8, 0, 5]], 8: [[7, 0, 5]], 9: [[4, 7, 4]], 10: [[9, 0, 3]],
    11: [[7, 5, 6]], 12: [[8, 5, 6]],
  } as Record<number, Segment[]>,
};

/**
 * Usage français, qui n'est pas symétrique : « et » ne s'emploie que pour le
 * quart et la demie, jamais pour cinq, dix, vingt ou vingt-cinq. Au-delà de la
 * demie on passe à l'heure suivante avec « moins », et le quart devient
 * « moins le quart ». Midi et minuit ne prennent pas le mot heure.
 */
const motsFr = (h: number, m: number): Segment[] => {
  let pas = Math.round(m / 5) * 5;
  let ref = h;
  if (pas > 30) ref = (h + 1) % 24;
  if (pas === 60) pas = 0;

  let seg: Segment[] = [...FR.ilest];
  const h12 = ref % 12;

  if (ref === 12) seg = seg.concat(FR.midi);
  else if (ref === 0) seg = seg.concat(FR.minuit);
  else seg = seg.concat(FR.heures12[h12], h12 === 1 ? FR.heure : FR.heures);

  const reste = pas > 30 ? 60 - pas : pas;
  if (reste !== 0) {
    if (pas > 30) seg = seg.concat(FR.moins);
    if (reste === 5) seg = seg.concat(FR.cinq);
    else if (reste === 10) seg = seg.concat(FR.dix);
    else if (reste === 15) seg = seg.concat(pas > 30 ? FR.le : FR.et, FR.quart);
    else if (reste === 20) seg = seg.concat(FR.vingt);
    else if (reste === 25) seg = seg.concat(FR.vingt, FR.cinq);
    else if (reste === 30) seg = seg.concat(FR.etDemie);
  }
  return seg;
};

/**
 * Usage anglais : « past » avant la demie, « to » après, et « o'clock »
 * seulement à l'heure pile. Le quart prend l'article, « a quarter past ».
 */
const motsEn = (h: number, m: number): Segment[] => {
  let pas = Math.round(m / 5) * 5;
  let ref = h;
  if (pas > 30) ref = (h + 1) % 24;
  if (pas === 60) pas = 0;

  let seg: Segment[] = [...EN.itis];
  const reste = pas > 30 ? 60 - pas : pas;

  if (reste !== 0) {
    if (reste === 5) seg = seg.concat(EN.five);
    else if (reste === 10) seg = seg.concat(EN.ten);
    else if (reste === 15) seg = seg.concat(EN.a, EN.quarter);
    else if (reste === 20) seg = seg.concat(EN.twenty);
    else if (reste === 25) seg = seg.concat(EN.twenty, EN.five);
    else if (reste === 30) seg = seg.concat(EN.half);
    seg = seg.concat(pas > 30 ? EN.to : EN.past);
  }

  const h12 = ref % 12 === 0 ? 12 : ref % 12;
  seg = seg.concat(EN.heures12[h12]);
  if (reste === 0) seg = seg.concat(EN.oclock);
  return seg;
};

/* ------------------------------------------------------------ la carte */

const deux = (n: number): string => String(n).padStart(2, "0");

@customElement("skeuo-clock-card")
export class SkeuoClockCard extends SkeuoBaseCard<ClockCardConfig> {
  protected static override requiresEntity = false;

  /** Horodatage à la seconde. Ne bouge que quand l'affichage change. */
  @state() private _t = Math.floor(Date.now() / 1000);

  private _timer?: number;
  /**
   * Chiffres sortants pendant une bascule de volet, vide le reste du temps.
   * C'est cette liste, et non une comparaison d'horodatage au moment du rendu,
   * qui décide si un module s'anime : une condition temporelle évaluée pendant
   * le rendu laisse la classe d'animation collée dès que le rendu suivant
   * n'arrive pas à l'instant prévu, et la bascule d'après ne repart plus.
   */
  private _avant: string[] = [];
  private _reveil?: number;

  public override connectedCallback(): void {
    super.connectedCallback();
    this._demarre();
  }

  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._arrete();
  }

  private _demarre(): void {
    this._arrete();
    // Aligné sur la seconde : sans ça la trotteuse avance à contretemps du
    // reste du système et l'écart se voit sur une horloge posée à côté.
    const versLaSeconde = 1000 - (Date.now() % 1000);
    this._timer = window.setTimeout(() => {
      this._bat();
      this._timer = window.setInterval(() => this._bat(), 1000);
    }, versLaSeconde);
  }

  private _arrete(): void {
    if (this._timer !== undefined) {
      window.clearTimeout(this._timer);
      window.clearInterval(this._timer);
      this._timer = undefined;
    }
    if (this._reveil !== undefined) {
      window.clearTimeout(this._reveil);
      this._reveil = undefined;
    }
  }

  /**
   * Le battement ne provoque un rendu que si l'image change réellement. Une
   * horloge LCD sans clignotement n'a rien de neuf à montrer pendant
   * cinquante-neuf secondes sur soixante, et le tableau de bord n'a aucune
   * raison de repeindre pendant ce temps.
   */
  private _bat(): void {
    const t = Math.floor(Date.now() / 1000);
    if (t === this._t) return;

    const style = this._style;
    const parSeconde = style === "analog" || this._config?.blink === true;
    if (!parSeconde && Math.floor(t / 60) === Math.floor(this._t / 60)) return;

    if (style === "flap") this._prepareBascule(t);
    this._t = t;
  }

  /** Mémorise les chiffres sortants et programme la fin de l'animation. */
  private _prepareBascule(t: number): void {
    const avant = this._chiffres(new Date(this._t * 1000));
    const apres = this._chiffres(new Date(t * 1000));
    if (avant.join("") === apres.join("")) return;

    this._avant = avant;
    if (this._reveil !== undefined) window.clearTimeout(this._reveil);
    // Un rendu de plus à la fin de la chute, pour vider la liste et retirer la
    // classe d'animation : sans lui, la bascule suivante ne repartirait pas.
    this._reveil = window.setTimeout(() => {
      this._reveil = undefined;
      const sortants = this._avant;
      this._avant = [];
      this.requestUpdate("_avant", sortants);
    }, 580);
  }

  /* ------------------------------------------------------------- config */

  protected override validateConfig(config: ClockCardConfig): void {
    if (config.style && !STYLES.includes(config.style)) {
      throw new Error(
        isFrench(this.hass)
          ? `\`style\` doit valoir ${STYLES.join(", ")}`
          : `\`style\` must be one of ${STYLES.join(", ")}`
      );
    }
  }

  protected override defaultTitle(): string {
    return t(this.hass, "clock");
  }

  private get _style(): ClockStyle {
    return this._config?.style ?? "lcd";
  }

  public static getConfigForm() {
    const fr = isFrench();
    return {
      schema: [
        ...baseSchema({ entity: false }),
        {
          type: "grid",
          name: "",
          schema: [
            {
              name: "style",
              selector: {
                select: {
                  mode: "dropdown",
                  options: fr
                    ? [
                        { value: "lcd", label: "Écran LCD ambré" },
                        { value: "analog", label: "Aiguilles" },
                        { value: "nixie", label: "Tubes Nixie" },
                        { value: "flap", label: "Volets basculants" },
                        { value: "words", label: "Matrice de mots" },
                      ]
                    : [
                        { value: "lcd", label: "Amber LCD screen" },
                        { value: "analog", label: "Hands" },
                        { value: "nixie", label: "Nixie tubes" },
                        { value: "flap", label: "Split-flap" },
                        { value: "words", label: "Word matrix" },
                      ],
                },
              },
            },
            { name: "blink", selector: { boolean: {} } },
          ],
        },
      ],
      computeLabel,
      computeHelper,
    };
  }

  public static getStubConfig(): Partial<ClockCardConfig> {
    return { style: "lcd", texture: DEFAULT_TEXTURE };
  }

  /* --------------------------------------------------------------- date */

  private _langue(): string {
    return (
      this.hass?.locale?.language ?? this.hass?.language ?? navigator.language ?? "en"
    );
  }

  /**
   * Jour et mois passent par Intl plutôt que par un dictionnaire maison : le
   * pack ne parle que deux langues, le navigateur les parle toutes.
   */
  private _texteDate(d: Date, options: Intl.DateTimeFormatOptions): string {
    try {
      return new Intl.DateTimeFormat(this._langue(), options).format(d).toUpperCase();
    } catch {
      return new Intl.DateTimeFormat("en", options).format(d).toUpperCase();
    }
  }

  private _chiffres(d: Date): string[] {
    return [...deux(d.getHours()), ...deux(d.getMinutes())];
  }

  /** Le séparateur est-il visible à cet instant ? */
  private _pointVisible(): boolean {
    return this._config?.blink !== true || this._t % 2 === 0;
  }

  /* -------------------------------------------------------------- rendu */

  protected renderContent(): TemplateResult {
    const d = new Date(this._t * 1000);
    switch (this._style) {
      case "analog":
        return this._aiguilles(d);
      case "nixie":
        return this._nixie(d);
      case "flap":
        return this._volets(d);
      case "words":
        return this._mots(d);
      default:
        return this._lcd(d);
    }
  }

  /** Module d'écran ambré, commun au style LCD et aux modules de date. */
  private _ecran(
    largeur: number,
    hauteur: number,
    valeur: string,
    taille: number,
    lignes: string[]
  ): TemplateResult {
    return html`
      <div class="ecran" style=${styleMap({ width: `${largeur}px`, height: `${hauteur}px` })}>
        <div class="vitre" style=${styleMap({ height: `${taille * 1.28}px` })}>
          <!-- Segments éteints : sur un vrai afficheur à cristaux liquides ils
               restent visibles en fond, c'est ce qui le distingue d'un écran
               lumineux.

               Les deux lignes qui suivent tiennent d'un seul tenant, sans
               retour ni indentation autour de l'expression. La règle
               white-space: pre garde l'espace du séparateur quand il s'efface,
               mais elle garderait aussi les blancs du gabarit, et l'heure
               partirait sur trois lignes décalées de douze espaces. -->
          <div class="fantome" style=${styleMap({ fontSize: `${taille}px` })}>${valeur.replace(/\d/g, "8")}</div>
          <div class="valeur" style=${styleMap({ fontSize: `${taille}px`, color: this.accent })}>${valeur}</div>
        </div>
        ${lignes.map((l) => html`<p class="ligne">${l}</p>`)}
      </div>
    `;
  }

  private _dateEcran(d: Date): TemplateResult {
    return this._ecran(196, 150, deux(d.getDate()), 42, [
      this._texteDate(d, { month: "long" }),
      this._texteDate(d, { weekday: "long" }),
    ]);
  }

  private _lcd(d: Date): TemplateResult {
    const sep = this._pointVisible() ? ":" : " ";
    const heure = `${deux(d.getHours())}${sep}${deux(d.getMinutes())}`;
    return html`
      <div class="face lcd">
        ${this._ecran(430, 194, heure, 86, [
          this._texteDate(d, { weekday: "long", day: "numeric", month: "long" }),
        ])}
      </div>
    `;
  }

  private _aiguilles(d: Date): TemplateResult {
    const s = d.getSeconds();
    const m = d.getMinutes() + s / 60;
    const h = (d.getHours() % 12) + m / 60;

    // Gabarit `svg` et non `html` : un fragment interpolé dans un SVG doit être
    // créé dans l'espace de noms SVG, sinon Lit produit des éléments HTML du
    // même nom. Ils existent dans le DOM, `querySelector('line')` les trouve,
    // mais le navigateur ne dessine rien.
    const index = [];
    for (let i = 0; i < 60; i++) {
      const gros = i % 5 === 0;
      const a = (i * 6 * Math.PI) / 180;
      const r1 = gros ? 74 : 80;
      index.push(svg`
        <line
          x1=${108 + r1 * Math.sin(a)}
          y1=${108 - r1 * Math.cos(a)}
          x2=${108 + 86 * Math.sin(a)}
          y2=${108 - 86 * Math.cos(a)}
          stroke=${gros ? "#d6d2c9" : "#5c6064"}
          stroke-width=${gros ? 3.4 : 1.2}
          stroke-linecap="round"
        />
      `);
    }

    return html`
      <div class="face analog">
        <svg class="cadran" width="212" height="212" viewBox="0 0 216 216" aria-hidden="true">
          <defs>
            <linearGradient id="sk-lunette" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#8b8f94" />
              <stop offset="35%" stop-color="#4a4d51" />
              <stop offset="65%" stop-color="#2b2e31" />
              <stop offset="100%" stop-color="#6a6e73" />
            </linearGradient>
            <radialGradient id="sk-face" cx="38%" cy="30%">
              <stop offset="0%" stop-color="#26292d" />
              <stop offset="60%" stop-color="#141619" />
              <stop offset="100%" stop-color="#0c0d0f" />
            </radialGradient>
            <!-- userSpaceOnUse est obligatoire : une aiguille est un segment de
                 largeur nulle, sa boîte englobante est dégénérée et un dégradé
                 en unités de boîte ne peint rien du tout. Les coordonnées fixes
                 gardent en prime le reflet cohérent quand l'aiguille tourne, la
                 source de lumière ne bougeant pas. -->
            <linearGradient
              id="sk-aiguille"
              gradientUnits="userSpaceOnUse"
              x1="50"
              y1="34"
              x2="166"
              y2="182"
            >
              <stop offset="0%" stop-color="#f1f3f5" />
              <stop offset="45%" stop-color="#b9bdc2" />
              <stop offset="75%" stop-color="#8b8f94" />
              <stop offset="100%" stop-color="#5e6267" />
            </linearGradient>
          </defs>
          <circle cx="108" cy="108" r="106" fill="url(#sk-lunette)" />
          <circle cx="108" cy="108" r="97" fill="#0e1012" />
          <circle cx="108" cy="108" r="93" fill="url(#sk-face)" />
          <g stroke="rgba(255,255,255,.035)" fill="none">
            <circle cx="108" cy="108" r="80" />
            <circle cx="108" cy="108" r="68" />
            <circle cx="108" cy="108" r="56" />
            <circle cx="108" cy="108" r="44" />
            <circle cx="108" cy="108" r="32" />
          </g>
          ${index}
          <g transform=${`rotate(${h * 30} 108 108)`}>
            <line x1="108" y1="118" x2="108" y2="56" stroke="#0a0b0c" stroke-width="9.5"
              stroke-linecap="round" opacity=".55" />
            <line x1="108" y1="118" x2="108" y2="56" stroke="url(#sk-aiguille)" stroke-width="7"
              stroke-linecap="round" />
          </g>
          <g transform=${`rotate(${m * 6} 108 108)`}>
            <line x1="108" y1="122" x2="108" y2="32" stroke="#0a0b0c" stroke-width="7"
              stroke-linecap="round" opacity=".55" />
            <line x1="108" y1="122" x2="108" y2="32" stroke="url(#sk-aiguille)" stroke-width="4.5"
              stroke-linecap="round" />
          </g>
          <line x1="108" y1="120" x2="108" y2="30" stroke=${this.accent} stroke-width="1.8"
            stroke-linecap="round" transform=${`rotate(${s * 6} 108 108)`} />
          <circle cx="108" cy="108" r="6" fill="#3a3d41" stroke="#6f7378" stroke-width="1" />
          <circle cx="108" cy="108" r="2.4" fill=${this.accent} />
        </svg>
        ${this._dateEcran(d)}
      </div>
    `;
  }

  private _nixie(d: Date): TemplateResult {
    const c = this._chiffres(d);
    const tube = (chiffre: string) => html`
      <div class="tube">
        <div class="verre"></div>
        <div class="eteint">8</div>
        <div class="allume">${chiffre}</div>
        <div class="maille"></div>
        <div class="culot"></div>
        <i class="reflet"></i>
      </div>
    `;
    const neon = (haut: boolean) => html`
      <div class=${classMap({ neon: true, haut, bas: !haut })}>
        <i class="ampoule"></i>
        <i class="plasma" style=${styleMap({ opacity: this._pointVisible() ? "1" : "0.14" })}></i>
        <i class="pattes"></i>
      </div>
    `;

    return html`
      <div class="face nixie">
        <div class="bloc">
          <div class="socle"><i class="plateau"></i><i class="chrome"></i></div>
          <div class="rangee">
            ${tube(c[0])}${tube(c[1])}
            <div class="neons">${neon(true)}${neon(false)}</div>
            ${tube(c[2])}${tube(c[3])}
          </div>
        </div>
      </div>
    `;
  }

  private _volets(d: Date): TemplateResult {
    const c = this._chiffres(d);
    const avant = this._avant.length === 4 ? this._avant : c;

    const module = (i: number) => {
      const anime = avant[i] !== c[i];
      return html`
        <div class=${classMap({ volet: true, bascule: anime })}>
          <div class="moitie haut"><span>${c[i]}</span></div>
          <div class="moitie bas"><span>${anime ? avant[i] : c[i]}</span></div>
          <div class="rabat h"><span>${avant[i]}</span></div>
          <div class="rabat b"><span>${c[i]}</span></div>
          <div class="charniere"></div>
          <i class="axe g"></i><i class="axe d"></i>
        </div>
      `;
    };

    // Deux-points : quand il clignote, ses deux mini-modules basculent à chaque
    // seconde comme les chiffres, au lieu de s'allumer et s'éteindre sur place.
    // L'état alterne à chaque battement et chaque état a son propre nom
    // d'animation : c'est ce changement de nom qui relance la bascule, sans le
    // rendu supplémentaire qu'il faut aux chiffres pour retirer leur classe.
    const visible = this._pointVisible();
    const bat = this._config?.blink === true;
    const avantPoint = bat ? !visible : visible;
    const point = (plein: boolean) => (plein ? "plein" : "");
    const mini = () => html`
      <div class=${classMap({ mini: true, tic: bat && visible, tac: bat && !visible })}>
        <div class="m h"><span class=${point(visible)}></span></div>
        <div class="m b"><span class=${point(avantPoint)}></span></div>
        <div class="r h"><span class=${point(avantPoint)}></span></div>
        <div class="r b"><span class=${point(visible)}></span></div>
        <div class="ch"></div>
      </div>
    `;

    const date = this._texteDate(d, { day: "2-digit", month: "short" }).replace(/\./g, "");

    return html`
      <div class="face flap">
        <div class="cadre">
          <i class="tige"></i>
          <div class="rangee">
            ${module(0)}${module(1)}
            <div class="deux-points">${mini()}${mini()}</div>
            ${module(2)}${module(3)}
          </div>
          <div class="bandeau">
            ${[...date].map((l) =>
              l === " " ? html`<b class="vide">&nbsp;</b>` : html`<b>${l}</b>`
            )}
          </div>
          <i class="flasque g"></i><i class="flasque d"></i>
        </div>
      </div>
    `;
  }

  private _mots(d: Date): TemplateResult {
    const fr = isFrench(this.hass);
    const grille = fr ? GRILLE_FR : GRILLE_EN;
    const segments = fr
      ? motsFr(d.getHours(), d.getMinutes())
      : motsEn(d.getHours(), d.getMinutes());

    const allumees = new Set<string>();
    for (const [ligne, depart, longueur] of segments) {
      for (let i = 0; i < longueur; i++) allumees.add(`${ligne}:${depart + i}`);
    }

    return html`
      <div class="face words">
        <div class="matrice">
          ${grille.map((ligne, y) =>
            [...ligne].map(
              (lettre, x) =>
                html`<b class=${allumees.has(`${y}:${x}`) ? "on" : nothing}>${lettre}</b>`
            )
          )}
        </div>
        ${this._dateEcran(d)}
      </div>
    `;
  }

  static override styles: CSSResultGroup = [
    SkeuoBaseCard.styles,
    css`
      .face {
        display: flex;
        align-items: center;
        justify-content: space-evenly;
        width: 100%;
        height: 100%;
      }

      /* ------------------------------------------------------------ écran */

      .ecran {
        position: relative;
        box-sizing: border-box;
        flex: none;
        border-radius: 14px;
        padding: 14px 16px 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        /* Creux : zone sombre en haut-gauche, reflet en bas-droite. */
        background: radial-gradient(ellipse at 50% 30%, #241a10, #140d07 75%);
        box-shadow:
          inset 5px 5px 3px rgba(0, 0, 0, 0.9),
          inset 3px 3px 9px rgba(0, 0, 0, 0.85),
          inset -2px -2px 2px rgba(255, 255, 255, 0.05),
          0 0 0 3.4px #100b06,
          5px 5px 9px rgba(0, 0, 0, 0.55);
      }
      .vitre {
        position: relative;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .fantome,
      .valeur {
        font-family: var(--skeuo-font-lcd);
        font-weight: 700;
        line-height: 1;
        letter-spacing: 2px;
        white-space: pre;
      }
      .fantome {
        color: rgba(226, 166, 89, 0.07);
      }
      .valeur {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        text-shadow: 0 0 12px currentColor;
      }
      .ligne {
        flex: none;
        margin: 8px 0 0;
        font-family: var(--skeuo-font-lcd);
        font-size: 14px;
        letter-spacing: 0.9px;
        text-transform: uppercase;
        color: #cf9a5c;
        text-align: center;
        line-height: 1.3;
      }

      /* --------------------------------------------------------- aiguilles */

      .cadran {
        flex: none;
        filter: drop-shadow(5px 6px 10px rgba(0, 0, 0, 0.6));
      }

      /* ------------------------------------------------------------- nixie */

      .nixie .bloc {
        position: relative;
        padding-bottom: 50px;
      }
      .nixie .rangee {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      /* Socle chromé. Le chrome ne se reconnaît pas à son brillant mais à sa
         ligne d'horizon : une bascule nette entre le ciel réfléchi en haut et
         le sol en bas, presque sans transition. */
      .socle {
        position: absolute;
        left: -14px;
        right: -14px;
        bottom: 0;
        height: 42px;
      }
      .socle .plateau {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        height: 8px;
        border-radius: 4px 4px 0 0;
        background:
          linear-gradient(
            105deg,
            rgba(255, 255, 255, 0.34) 0%,
            rgba(255, 255, 255, 0.1) 24%,
            rgba(255, 255, 255, 0) 50%,
            rgba(0, 0, 0, 0.22) 100%
          ),
          linear-gradient(180deg, #b7bec4 0%, #7d848a 45%, #4a5055 100%);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55);
      }
      .socle .chrome {
        position: absolute;
        left: 0;
        right: 0;
        top: 8px;
        bottom: 0;
        border-radius: 0 0 5px 5px;
        background:
          linear-gradient(
            102deg,
            rgba(255, 255, 255, 0.26) 0%,
            rgba(255, 255, 255, 0.05) 18%,
            rgba(255, 255, 255, 0) 42%,
            rgba(0, 0, 0, 0.26) 100%
          ),
          linear-gradient(
            180deg,
            #f7f9fa 0%,
            #dee4e9 7%,
            #a9b1b7 18%,
            #6e757b 29%,
            #2a2f33 39%,
            #16191c 45%,
            #16191c 55%,
            #3b4247 59%,
            #7e858b 67%,
            #bbc2c8 77%,
            #e8ecef 86%,
            #f6f8fa 92%,
            #a8afb5 97%,
            #6a7177 100%
          );
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.5),
          inset -1px 0 0 rgba(0, 0, 0, 0.4),
          5px 7px 12px rgba(0, 0, 0, 0.65);
      }
      .tube {
        position: relative;
        width: 84px;
        height: 168px;
        flex: none;
      }
      .tube .verre {
        position: absolute;
        inset: 0;
        border-radius: 42px 42px 16px 16px;
        background:
          linear-gradient(
            112deg,
            rgba(255, 255, 255, 0.3) 0%,
            rgba(255, 255, 255, 0.1) 16%,
            rgba(255, 255, 255, 0.02) 38%,
            rgba(255, 255, 255, 0) 58%,
            rgba(0, 0, 0, 0.3) 100%
          ),
          radial-gradient(
            ellipse at 50% 60%,
            rgba(255, 150, 40, 0.26) 0%,
            rgba(255, 120, 20, 0.08) 46%,
            rgba(0, 0, 0, 0) 74%
          ),
          linear-gradient(180deg, #1d2026 0%, #0f1114 55%, #1b1e23 100%);
        box-shadow:
          inset 4px 4px 10px rgba(0, 0, 0, 0.85),
          inset -3px -3px 7px rgba(255, 255, 255, 0.1),
          0 0 0 2px #08090b,
          0 0 18px rgba(255, 120, 20, 0.14),
          6px 7px 14px rgba(0, 0, 0, 0.65);
      }
      .tube .verre::after {
        content: "";
        position: absolute;
        left: 9px;
        top: 16px;
        width: 7px;
        bottom: 30px;
        border-radius: 4px;
        background: linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.3),
          rgba(255, 255, 255, 0.05) 55%,
          rgba(255, 255, 255, 0)
        );
        filter: blur(1.2px);
      }
      .tube .maille {
        position: absolute;
        left: 12px;
        right: 12px;
        top: 26px;
        bottom: 40px;
        border-radius: 6px;
        background-image:
          repeating-linear-gradient(0deg, rgba(190, 200, 210, 0.15) 0 1px, transparent 1px 5px),
          repeating-linear-gradient(90deg, rgba(190, 200, 210, 0.12) 0 1px, transparent 1px 5px);
      }
      .tube .eteint,
      .tube .allume {
        position: absolute;
        left: 0;
        right: 0;
        top: 24px;
        text-align: center;
        font-size: 96px;
        line-height: 1;
        font-weight: 400;
      }
      .tube .eteint {
        color: rgba(150, 120, 90, 0.1);
      }
      .tube .allume {
        color: #ff9a37;
        text-shadow:
          0 0 6px #ff8c2a,
          0 0 18px rgba(255, 120, 20, 0.75),
          0 0 42px rgba(255, 90, 0, 0.45);
      }
      /* Culot bakélite, plus étroit que le verre : c'est le collier de
         fixation, il pose le tube sur la plaque au lieu de l'étaler dessus. */
      .tube .culot {
        position: absolute;
        left: 16px;
        right: 16px;
        bottom: -8px;
        height: 24px;
        border-radius: 3px 3px 2px 2px;
        background:
          linear-gradient(
            105deg,
            rgba(255, 255, 255, 0.12) 0%,
            rgba(255, 255, 255, 0.02) 30%,
            rgba(0, 0, 0, 0.18) 100%
          ),
          linear-gradient(180deg, #3a3c34 0%, #24261d 50%, #101106 100%);
        box-shadow:
          inset 0 1px 1px rgba(255, 255, 255, 0.14),
          inset 0 -2px 3px rgba(0, 0, 0, 0.7),
          3px 5px 8px rgba(0, 0, 0, 0.7);
      }
      /* Le chrome réfléchit verticalement : la lueur du tube s'y étire en
         traînée descendante, pas en flaque ronde. */
      .tube .reflet {
        position: absolute;
        left: 24px;
        right: 24px;
        bottom: -46px;
        height: 26px;
        background: linear-gradient(
          180deg,
          rgba(255, 150, 55, 0.22) 0%,
          rgba(255, 130, 25, 0.1) 34%,
          rgba(255, 110, 10, 0.03) 66%,
          rgba(255, 110, 10, 0) 100%
        );
        filter: blur(5px);
      }
      /* Séparateur : deux ampoules néon montées sur la platine, comme les INS-1
         des vrais montages, et non deux pastilles suspendues. */
      .neons {
        position: relative;
        width: 26px;
        height: 168px;
        flex: none;
      }
      .neon {
        position: absolute;
        left: 3px;
        width: 20px;
        height: 34px;
      }
      .neon.haut {
        top: 40px;
        --patte: 102px;
      }
      .neon.bas {
        top: 92px;
        --patte: 50px;
      }
      .neon .ampoule {
        position: absolute;
        inset: 0;
        border-radius: 10px 10px 5px 5px;
        background:
          linear-gradient(
            108deg,
            rgba(255, 255, 255, 0.28) 0%,
            rgba(255, 255, 255, 0.06) 30%,
            rgba(255, 255, 255, 0) 56%,
            rgba(0, 0, 0, 0.25) 100%
          ),
          linear-gradient(180deg, #1b1e22 0%, #101316 60%, #1a1d21 100%);
        box-shadow:
          inset 2px 2px 5px rgba(0, 0, 0, 0.8),
          inset -1px -1px 3px rgba(255, 255, 255, 0.1),
          0 0 0 1px #0a0b0d,
          3px 4px 7px rgba(0, 0, 0, 0.6);
      }
      /* Le plasma n'occupe pas toute l'ampoule : c'est une petite décharge sur
         l'électrode, plus rouge que l'orange des chiffres nixie. */
      .neon .plasma {
        position: absolute;
        left: 50%;
        top: 10px;
        width: 9px;
        height: 13px;
        margin-left: -4.5px;
        border-radius: 4px;
        background: radial-gradient(
          ellipse at 45% 35%,
          #ffd6a6 0%,
          #ff7a24 40%,
          #e0400a 76%,
          rgba(224, 64, 10, 0) 100%
        );
        box-shadow:
          0 0 7px rgba(255, 90, 20, 0.95),
          0 0 17px rgba(255, 60, 0, 0.55);
      }
      .neon .pattes {
        position: absolute;
        left: 5px;
        right: 5px;
        top: 34px;
        height: var(--patte);
      }
      .neon .pattes::before,
      .neon .pattes::after {
        content: "";
        position: absolute;
        top: 0;
        width: 1.4px;
        height: 100%;
        background: linear-gradient(180deg, #9aa0a6 0%, #6b7176 45%, #43484d 100%);
      }
      .neon .pattes::before {
        left: 1px;
      }
      .neon .pattes::after {
        right: 1px;
      }

      /* ------------------------------------------------------------ volets */

      /* Les modules ne sont pas posés côte à côte, ils sont enfilés sur un axe
         unique tenu par deux joues, et l'ensemble est encastré dans un bâti.
         C'est ce qui distingue un panneau Solari d'une rangée de cartes. */
      .cadre {
        position: relative;
        padding: 14px 26px 16px;
        border-radius: 9px;
        background:
          linear-gradient(160deg, rgba(255, 255, 255, 0.045) 0%, rgba(0, 0, 0, 0.32) 68%),
          linear-gradient(180deg, #1b1d20 0%, #0f1114 60%, #15171a 100%);
        box-shadow:
          inset 3px 3px 9px rgba(0, 0, 0, 0.88),
          inset -2px -2px 4px rgba(255, 255, 255, 0.05),
          0 0 0 2px #0a0b0c,
          6px 8px 15px rgba(0, 0, 0, 0.6);
      }
      .cadre .tige {
        position: absolute;
        left: 12px;
        right: 12px;
        top: 73px;
        height: 6px;
        border-radius: 3px;
        background: linear-gradient(
          180deg,
          #e4e9ed 0%,
          #a6adb3 24%,
          #4d5359 50%,
          #7d848a 70%,
          #2c3135 100%
        );
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.75);
      }
      .cadre .flasque {
        position: absolute;
        top: 8px;
        width: 12px;
        height: 136px;
        border-radius: 3px;
        background:
          linear-gradient(
            102deg,
            rgba(255, 255, 255, 0.14) 0%,
            rgba(255, 255, 255, 0.02) 38%,
            rgba(0, 0, 0, 0.32) 100%
          ),
          linear-gradient(180deg, #40464b 0%, #262b2f 48%, #14171a 100%);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22), 3px 5px 8px rgba(0, 0, 0, 0.62);
      }
      .cadre .flasque.g {
        left: 7px;
      }
      .cadre .flasque.d {
        right: 7px;
      }
      .cadre .flasque::after {
        content: "";
        position: absolute;
        left: 50%;
        top: 62px;
        width: 12px;
        height: 12px;
        margin-left: -6px;
        border-radius: 50%;
        background: radial-gradient(circle at 36% 32%, #bcc3c9 0%, #6d7379 55%, #2a2f33 100%);
        box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.45), 1px 2px 3px rgba(0, 0, 0, 0.7);
      }
      /* Jeu volontairement large : c'est par là qu'on voit l'axe, et c'est ce
         qui fait comprendre que les modules sont enfilés dessus. */
      .flap .rangee {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
      }
      .volet {
        position: relative;
        width: 84px;
        height: 124px;
        flex: none;
        border-radius: 7px;
        font-size: 82px;
        line-height: 124px;
        font-weight: 500;
        color: #edeae2;
        text-align: center;
        perspective: 340px;
        box-shadow: 5px 6px 12px rgba(0, 0, 0, 0.6);
      }
      .volet .moitie,
      .volet .rabat {
        position: absolute;
        left: 0;
        right: 0;
        height: 62px;
        overflow: hidden;
      }
      .volet .haut,
      .volet .rabat.h {
        top: 0;
        border-radius: 7px 7px 0 0;
        background: linear-gradient(180deg, #3a3d41 0%, #2a2d31 100%);
      }
      .volet .bas,
      .volet .rabat.b {
        bottom: 0;
        border-radius: 0 0 7px 7px;
        background: linear-gradient(180deg, #202327 0%, #16181b 100%);
      }
      .volet .bas span,
      .volet .rabat.b span {
        display: block;
        margin-top: -62px;
      }
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
        animation: sk-tombe 0.26s cubic-bezier(0.5, 0, 0.9, 0.6) forwards;
      }
      .volet.bascule .rabat.b {
        animation: sk-monte 0.26s cubic-bezier(0.1, 0.4, 0.5, 1) 0.26s forwards;
      }
      @keyframes sk-tombe {
        to {
          transform: rotateX(-90deg);
        }
      }
      @keyframes sk-monte {
        to {
          transform: rotateX(0deg);
        }
      }
      .volet .charniere {
        position: absolute;
        left: 0;
        right: 0;
        top: 61px;
        height: 2px;
        background: #0a0b0c;
        z-index: 4;
      }
      /* Moyeu : le point où l'axe traverse le module, aligné sur la charnière. */
      .volet .axe {
        position: absolute;
        top: 57px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        z-index: 5;
        background: radial-gradient(circle at 35% 30%, #aeb5bb 0%, #61676d 55%, #24282c 100%);
        box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.4), 1px 2px 3px rgba(0, 0, 0, 0.75);
      }
      .volet .axe.g {
        left: -5px;
      }
      .volet .axe.d {
        right: -5px;
      }
      /* Deux-points : deux mini-modules à volet, pas des pastilles. */
      .deux-points {
        display: flex;
        flex-direction: column;
        gap: 22px;
        flex: none;
      }
      .mini {
        position: relative;
        width: 26px;
        height: 32px;
        box-shadow: 2px 3px 5px rgba(0, 0, 0, 0.6);
      }
      .mini .m {
        position: absolute;
        left: 0;
        right: 0;
        height: 16px;
        overflow: hidden;
      }
      .mini .m.h {
        top: 0;
        border-radius: 3px 3px 0 0;
        background: linear-gradient(180deg, #3a3d41 0%, #2a2d31 100%);
      }
      .mini .m.b {
        bottom: 0;
        border-radius: 0 0 3px 3px;
        background: linear-gradient(180deg, #202327 0%, #16181b 100%);
      }
      .mini span {
        display: block;
        width: 26px;
        height: 32px;
      }
      .mini .m.b span {
        margin-top: -16px;
      }
      .mini span.plein {
        background: radial-gradient(
          circle at 13px 16px,
          #e9e6de 0 5.4px,
          rgba(233, 230, 222, 0) 6.1px
        );
      }
      .mini .ch {
        position: absolute;
        left: 0;
        right: 0;
        top: 15px;
        height: 1.5px;
        background: #0a0b0c;
        z-index: 4;
      }
      /* Rabats du deux-points, sur le modèle des chiffres et avec leurs durées.
         Deux jeux d'images clés identiques, tic et tac : l'état alterne à chaque
         seconde, et c'est le changement de nom d'animation qui relance la
         bascule. Hors clignotement, le rabat du bas reste replié et invisible. */
      .mini {
        perspective: 120px;
      }
      .mini .r {
        position: absolute;
        left: 0;
        right: 0;
        height: 16px;
        overflow: hidden;
        z-index: 3;
        backface-visibility: hidden;
      }
      .mini .r.h {
        top: 0;
        border-radius: 3px 3px 0 0;
        background: linear-gradient(180deg, #3a3d41 0%, #2a2d31 100%);
        transform-origin: bottom;
      }
      .mini .r.b {
        bottom: 0;
        border-radius: 0 0 3px 3px;
        background: linear-gradient(180deg, #202327 0%, #16181b 100%);
        transform-origin: top;
        transform: rotateX(90deg);
      }
      .mini .r.b span {
        margin-top: -16px;
      }
      .mini.tic .r.h {
        animation: sk-tombe-tic 0.26s cubic-bezier(0.5, 0, 0.9, 0.6) forwards;
      }
      .mini.tic .r.b {
        animation: sk-monte-tic 0.26s cubic-bezier(0.1, 0.4, 0.5, 1) 0.26s forwards;
      }
      .mini.tac .r.h {
        animation: sk-tombe-tac 0.26s cubic-bezier(0.5, 0, 0.9, 0.6) forwards;
      }
      .mini.tac .r.b {
        animation: sk-monte-tac 0.26s cubic-bezier(0.1, 0.4, 0.5, 1) 0.26s forwards;
      }
      @keyframes sk-tombe-tic {
        to {
          transform: rotateX(-90deg);
        }
      }
      @keyframes sk-tombe-tac {
        to {
          transform: rotateX(-90deg);
        }
      }
      @keyframes sk-monte-tic {
        to {
          transform: rotateX(0deg);
        }
      }
      @keyframes sk-monte-tac {
        to {
          transform: rotateX(0deg);
        }
      }
      .bandeau {
        margin-top: 10px;
        display: flex;
        gap: 4px;
        justify-content: center;
      }
      .bandeau b {
        position: relative;
        display: block;
        width: 25px;
        height: 33px;
        border-radius: 3px;
        font-size: 20px;
        line-height: 33px;
        font-weight: 500;
        text-align: center;
        color: #d9d5cc;
        background: linear-gradient(180deg, #34373b 0%, #292c30 49%, #1b1d20 51%, #17191c 100%);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 2px 3px 5px rgba(0, 0, 0, 0.55);
      }
      /* Sans ce trait, la date se lit comme des étiquettes et non des volets. */
      .bandeau b:not(.vide)::after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        top: 16px;
        height: 1.2px;
        background: #0a0b0c;
      }
      .bandeau b.vide {
        background: none;
        box-shadow: none;
        width: 10px;
      }

      /* -------------------------------------------------------------- mots */

      .matrice {
        display: grid;
        grid-template-columns: repeat(11, 20px);
        gap: 2px;
        flex: none;
        padding: 13px 15px;
        border-radius: 12px;
        background: radial-gradient(ellipse at 40% 25%, #1b1d20, #0e0f11 75%);
        box-shadow:
          inset 4px 4px 8px rgba(0, 0, 0, 0.85),
          inset -2px -2px 3px rgba(255, 255, 255, 0.05),
          0 0 0 3px #0b0c0d,
          5px 6px 11px rgba(0, 0, 0, 0.55);
      }
      .matrice b {
        font-weight: 400;
        font-size: 14px;
        line-height: 18px;
        text-align: center;
        color: #2f3236;
      }
      .matrice b.on {
        color: var(--skeuo-accent);
        text-shadow: 0 0 9px rgba(226, 166, 89, 0.85);
      }
    `,
  ];
}

registerCard({
  type: "skeuo-clock-card",
  name: { fr: "Skeuo · Horloge", en: "Skeuo · Clock" },
  description: {
    fr: "Horloge en cinq styles : écran LCD, aiguilles, tubes Nixie, volets basculants, matrice de mots.",
    en: "Clock in five styles: LCD screen, hands, Nixie tubes, split-flap, word matrix.",
  },
  preview: true,
});

declare global {
  interface HTMLElementTagNameMap {
    "skeuo-clock-card": SkeuoClockCard;
  }
}
