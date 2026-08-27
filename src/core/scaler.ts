/**
 * Mise à l'échelle du plan de référence.
 *
 * Le design est dessiné à une hauteur de référence fixe (voir DESIGN), puis
 * ramené à la taille réelle de la carte par un transform: scale() uniforme.
 * C'est ce qui garantit que tout, texte compris, garde exactement les mêmes
 * proportions : aucune troncature possible, contrairement à des unités fluides
 * où le texte et les cadrans dérivent l'un par rapport à l'autre.
 *
 * La hauteur du plan est figée, sa largeur ne l'est pas. Home Assistant impose
 * la taille de la cellule, et une section large donnerait deux bandes vides de
 * chaque côté si on gardait une largeur fixe. On calcule donc le facteur sur la
 * hauteur et on laisse le plan s'élargir : les éléments gardent leur taille
 * exacte, l'espace supplémentaire passe dans les écarts entre eux.
 *
 * Quand la cellule est au contraire trop étroite pour la largeur nominale, on
 * repasse sur un facteur calculé sur la largeur : mieux vaut une bande vide en
 * haut et en bas qu'un contenu rogné.
 */

import type { ReactiveController, ReactiveControllerHost } from "lit";

/** Plan de référence commun à toutes les cartes du pack. */
export const DESIGN = { width: 615, height: 310 } as const;

/** Clé portée par la demande de rendu quand le facteur change. */
export const SCALE_PROPERTY = "skeuoScale";

/**
 * Calibre nominal des vis d'angle et leur retrait par rapport au bord, en
 * unités de design. Les vis sont posées dans l'espace de la carte et non dans
 * le plan, pour rester accrochées aux quatre coins quel que soit le format de
 * la cellule ; le facteur leur est donc appliqué explicitement.
 */
export const SCREW_SIZE = 16;
export const SCREW_INSET = 10;

/** Au-delà, les éléments s'éloigneraient trop les uns des autres. */
const MAX_STAGE_WIDTH = 1000;

/** Géométrie de la grille Sections du frontend. */
const GRID_ROW_HEIGHT = 56;
const GRID_ROW_GAP = 8;

/**
 * ReactiveControllerHost ne déclare qu'un requestUpdate() sans argument, alors
 * que LitElement accepte le nom de la propriété à l'origine de la demande.
 * C'est ce nom qui permet aux cartes de distinguer un changement d'échelle
 * d'un rendu sans cause, on l'expose donc explicitement.
 */
type ScaleHost = ReactiveControllerHost &
  HTMLElement & {
    requestUpdate(name?: PropertyKey, oldValue?: unknown): void;
  };

export class ScaleController implements ReactiveController {
  private _host: ScaleHost;
  private _observer?: ResizeObserver;
  private _frame?: number;

  /** Facteur courant, 1 tant que rien n'a été mesuré. */
  public scale = 1;
  /** Largeur du plan en unités de design, variable selon la cellule. */
  public stageWidth: number = DESIGN.width;

  constructor(host: ScaleHost) {
    this._host = host;
    host.addController(this);
  }

  public hostConnected(): void {
    this._observer = new ResizeObserver(() => this._schedule());
    this._observer.observe(this._host);
    this._measure();
  }

  public hostDisconnected(): void {
    this._observer?.disconnect();
    this._observer = undefined;
    if (this._frame !== undefined) {
      cancelAnimationFrame(this._frame);
      this._frame = undefined;
    }
  }

  /**
   * Le ResizeObserver peut émettre plusieurs fois par frame pendant un
   * redimensionnement ; on ne recalcule qu'une fois par frame pour ne pas
   * déclencher une cascade de rendus.
   */
  private _schedule(): void {
    if (this._frame !== undefined) return;
    this._frame = requestAnimationFrame(() => {
      this._frame = undefined;
      this._measure();
    });
  }

  private _measure(): void {
    const rect = this._host.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const byHeight = rect.height / DESIGN.height;
    let scale: number;
    let stageWidth: number;

    if (rect.width / byHeight >= DESIGN.width) {
      scale = byHeight;
      stageWidth = Math.min(rect.width / byHeight, MAX_STAGE_WIDTH);
    } else {
      scale = rect.width / DESIGN.width;
      stageWidth = DESIGN.width;
    }

    // Un écart sous le demi-pixel ne se voit pas et ne justifie pas un rendu.
    if (Math.abs(scale - this.scale) < 0.001 && Math.abs(stageWidth - this.stageWidth) < 0.5) {
      return;
    }

    this.scale = scale;
    this.stageWidth = stageWidth;
    // La clé est indispensable : les cartes filtrent les rendus inutiles sur le
    // contenu de changedProperties, et un requestUpdate() sans argument arrive
    // avec une map vide, donc indistinguable d'un rendu sans raison. En nommant
    // la demande, le filtre la laisse passer et le facteur atteint le DOM.
    this._host.requestUpdate(SCALE_PROPERTY, scale);
  }
}

/**
 * Nombre de lignes de grille qui reproduit le mieux le ratio du plan de
 * référence pour une largeur donnée en colonnes.
 */
export const rowsForColumns = (columns: number, sectionWidth = 492): number => {
  const columnWidth = sectionWidth / 12;
  const width = columns * columnWidth;
  const height = (width * DESIGN.height) / DESIGN.width;
  return Math.max(1, Math.round((height + GRID_ROW_GAP) / (GRID_ROW_HEIGHT + GRID_ROW_GAP)));
};
