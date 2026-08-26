import { svg, type SVGTemplateResult } from "lit";

/**
 * Icônes des boutons.
 *
 * Écrites en SVG inline plutôt qu'en <ha-icon icon="mdi:..."> : ha-icon
 * déclenche une requête réseau vers le pack d'icônes, alors qu'ici le tracé est
 * déjà dans le bundle. Elles héritent du fill posé par skeuo-button, ce qui
 * leur donne l'état actif sans code supplémentaire.
 *
 * Attention aux arcs (A rx ry ...) : si le rayon demandé est plus petit que
 * la moitié de la distance entre les deux points d'ancrage, le moteur SVG le
 * remonte silencieusement, et deux arcs censés délimiter un croissant peuvent
 * finir superposés, donnant une aire de remplissage nulle et une icône
 * invisible sans la moindre erreur console.
 */

const box = (inner: SVGTemplateResult, size = 16) =>
  svg`<svg width=${size} height=${size} viewBox="0 0 16 16">${inner}</svg>`;

export const iconPower = () =>
  box(svg`
    <path fill="none" stroke="currentColor" d="M11.44 4.08 A6 6 0 1 1 4.56 4.08" stroke-width="1.6" stroke-linecap="round"/>
    <line stroke="currentColor" x1="8" y1="1" x2="8" y2="7" stroke-width="1.6" stroke-linecap="round"/>
  `);

export const iconPlus = () =>
  box(svg`<rect x="3" y="7" width="10" height="2"/><rect x="7" y="3" width="2" height="10"/>`);

export const iconMinus = () => box(svg`<rect x="3" y="7" width="10" height="2"/>`);

export const iconUp = () => box(svg`<polygon points="8,3 13,11 3,11"/>`);

export const iconDown = () => box(svg`<polygon points="3,5 13,5 8,13"/>`);

export const iconStop = () => box(svg`<rect x="3" y="3" width="10" height="10" rx="1"/>`, 14);

export const iconFlame = () =>
  box(svg`
    <path d="M8 2 C6 4 4.5 6.5 4.5 9 C4.5 11.5 6 13.5 8 13.5 C10 13.5 11.5 11.5 11.5 9
             C11.5 7.5 10.8 6.5 10 6 C10.2 7 9.5 7.5 9 7 C9.3 5 8.5 3.5 8 2 Z"/>
  `);

export const iconSnowflake = () =>
  box(svg`
    <line fill="none" stroke="currentColor" x1="8" y1="2" x2="8" y2="14" stroke-width="1.4" stroke-linecap="round"/>
    <line fill="none" stroke="currentColor" x1="2.8" y1="5" x2="13.2" y2="11" stroke-width="1.4" stroke-linecap="round"/>
    <line fill="none" stroke="currentColor" x1="13.2" y1="5" x2="2.8" y2="11" stroke-width="1.4" stroke-linecap="round"/>
  `);

export const iconFan = () =>
  box(svg`
    <ellipse cx="8" cy="4.3" rx="1.6" ry="3"/>
    <ellipse cx="8" cy="4.3" rx="1.6" ry="3" transform="rotate(120 8 8)"/>
    <ellipse cx="8" cy="4.3" rx="1.6" ry="3" transform="rotate(240 8 8)"/>
    <circle cx="8" cy="8" r="1.3"/>
  `);

export const iconAuto = () =>
  box(svg`<text x="8" y="12" font-size="11" font-weight="700" text-anchor="middle">A</text>`);

export const iconDroplet = () =>
  box(svg`<ellipse cx="8" cy="8" rx="3" ry="6" transform="rotate(45 8 8)"/>`);

/* ------------------------------------------------- serrure et sécurité */

export const iconLock = () =>
  box(svg`
    <rect x="4" y="8" width="8" height="6" rx="1"/>
    <path fill="none" stroke="currentColor" d="M6 8 V6 a2 2 0 0 1 4 0 V8" stroke-width="1.6"/>
  `);

export const iconUnlock = () =>
  box(svg`
    <rect x="4" y="8" width="8" height="6" rx="1"/>
    <path fill="none" stroke="currentColor" d="M6 8 V6 a2 2 0 0 1 4 0" stroke-width="1.6"/>
  `);

/** Loquet : la porte vue de face, sa poignée côté ouvrant. */
export const iconLatch = () =>
  box(svg`
    <rect fill="none" stroke="currentColor" x="3" y="2" width="9" height="12" rx="1" stroke-width="1.3"/>
    <circle cx="10" cy="8" r="1"/>
  `);

export const iconHome = () =>
  box(svg`<path d="M8 2 L14 7 L14 13 L10 13 L10 9 L6 9 L6 13 L2 13 L2 7 Z"/>`);

export const iconAway = () =>
  box(svg`
    <rect fill="none" stroke="currentColor" x="2" y="3" width="8" height="10" rx="1" stroke-width="1.3"/>
    <path fill="none" stroke="currentColor" d="M10 8 H14 M14 8 L11.5 5.5 M14 8 L11.5 10.5" stroke-width="1.3" stroke-linecap="round"/>
  `);

/**
 * Croissant de lune. Les deux arcs doivent garder des rayons différents,
 * sinon ils se superposent et l'aire de remplissage devient nulle.
 */
export const iconMoon = () =>
  box(svg`<path d="M14 8.53 A6 6 0 1 1 7.47 2 A4.67 4.67 0 0 0 14 8.53 Z"/>`);

export const iconShieldOff = () =>
  box(svg`
    <path fill="none" stroke="currentColor" d="M8 2 L13 4 V8 C13 11 10.5 13 8 14 C5.5 13 3 11 3 8 V4 Z" stroke-width="1.3"/>
    <path fill="none" stroke="currentColor" d="M4 4 L12 12" stroke-width="1.3" stroke-linecap="round"/>
  `);

/* --------------------------------------------------- ventilation, robot */

/** Oscillation : le balayage de gauche à droite, flèches aux deux bouts. */
export const iconOscillate = () =>
  box(svg`
    <path fill="none" stroke="currentColor" d="M3 8 H13 M3 8 L6 5 M3 8 L6 11 M13 8 L10 5 M13 8 L10 11"
          stroke-width="1.4" stroke-linecap="round"/>
  `);

/** Sens de rotation : arc ouvert et pointe de flèche. */
export const iconRotate = () =>
  box(svg`
    <path fill="none" stroke="currentColor" d="M12.5 8 A4.5 4.5 0 1 1 8 3.5" stroke-width="1.4"/>
    <polygon points="8,1.5 8,5.5 11,3.5"/>
  `);

export const iconPlay = () => box(svg`<polygon points="4.5,2.5 13.5,8 4.5,13.5"/>`);

export const iconPause = () =>
  box(svg`<rect x="4" y="3" width="3.2" height="10"/><rect x="8.8" y="3" width="3.2" height="10"/>`);

/** Base de recharge : la cible sur laquelle le robot revient se poser. */
export const iconDock = () =>
  box(svg`
    <circle fill="none" stroke="currentColor" cx="8" cy="8" r="5" stroke-width="1.3"/>
    <circle cx="8" cy="8" r="1.5"/>
  `);

/* ------------------------------------------------------ transport média */

export const iconPrev = () =>
  box(svg`<polygon points="14,2 5,8 14,14"/><rect x="2" y="2" width="2.4" height="12" rx="0.6"/>`);

export const iconNext = () =>
  box(svg`<polygon points="2,2 11,8 2,14"/><rect x="11.6" y="2" width="2.4" height="12" rx="0.6"/>`);

/* -------------------------------------------------------------- caméra */

export const iconCamera = () =>
  box(svg`
    <rect fill="none" stroke="currentColor" x="2" y="5" width="12" height="8" rx="1.5" stroke-width="1.3"/>
    <rect fill="none" stroke="currentColor" x="5.5" y="3" width="5" height="2.5" rx="0.5" stroke-width="1.3"/>
    <circle fill="none" stroke="currentColor" cx="8" cy="9" r="2.3" stroke-width="1.3"/>
  `);

/** Détection : l'oeil ouvert, signe consacré de la surveillance. */
export const iconMotion = () =>
  box(svg`
    <path fill="none" stroke="currentColor" stroke-width="1.3"
          d="M1.5 8 C3 4.5 6 3 8 3 C10 3 13 4.5 14.5 8 C13 11.5 10 13 8 13 C6 13 3 11.5 1.5 8 Z"/>
    <circle cx="8" cy="8" r="2"/>
  `);

export const iconRecord = () =>
  box(svg`
    <circle fill="none" stroke="currentColor" cx="8" cy="8" r="6" stroke-width="1.3"/>
    <circle cx="8" cy="8" r="3"/>
  `);
