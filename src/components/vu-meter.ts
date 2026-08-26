import { LitElement, html, css, svg, type PropertyValues, type SVGTemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

import { SmoothValue } from "../core/smooth";

const PIVOT_X = 150;
const PIVOT_Y = 156;
const HALF_SWEEP = 56;
const R_SCALE = 120;
const R_TICK_IN_MAJOR = 104;
const R_TICK_IN_MINOR = 112;
const R_LABEL = 92;
const NEEDLE_LEN = 112;

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

const polar = (deg: number, r: number): [number, number] => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [PIVOT_X + Math.cos(rad) * r, PIVOT_Y + Math.sin(rad) * r];
};

const arcPath = (fromDeg: number, toDeg: number, r: number): string => {
  const [x1, y1] = polar(fromDeg, r);
  const [x2, y2] = polar(toDeg, r);
  const large = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0;
  // Le rayon doit rester supérieur à la demi-corde, sinon le moteur SVG le
  // corrige silencieusement et l'arc ne ressemble plus à ce qui était demandé.
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
};

/**
 * Cadran à aiguille façon VU-mètre.
 *
 * Les seuils vert / jaune / rouge sont exprimés en fraction de l'échelle et
 * pilotés par la carte, pour qu'un capteur d'humidité et un capteur de CO2
 * puissent partager le même composant.
 */
@customElement("skeuo-vu-meter")
export class SkeuoVuMeter extends LitElement {
  @property({ type: Number }) public value = 0;
  @property({ type: Number }) public min = 0;
  @property({ type: Number }) public max = 100;
  @property({ type: String }) public unit = "";
  /** Fin de zone verte, en fraction de l'échelle. */
  @property({ type: Number }) public warn = 0.6;
  /** Fin de zone jaune, en fraction de l'échelle. */
  @property({ type: Number }) public danger = 0.85;
  @property({ type: Number }) public width = 225;
  @property({ type: Number }) public height = 142.5;
  @property({ type: String }) public label = "";

  /**
   * Position de l'aiguille, lissée.
   *
   * Une aiguille de galvanomètre a une inertie mécanique : elle ne se téléporte
   * pas d'une graduation à l'autre. L'afficheur numérique à côté, lui, est
   * numérique et change d'un coup ; c'est ce contraste qui rend l'instrument
   * crédible, donc le lissage s'arrête à l'aiguille.
   *
   * La durée se calcule sur la fraction d'échelle parcourue et non sur les
   * unités brutes, sinon un capteur de CO2 et un capteur d'humidité auraient
   * des vitesses d'aiguille sans rapport.
   */
  private _needle = new SmoothValue(this, {
    epsilon: 0,
    duration: (delta) => {
      const span = Math.abs(this.max - this.min) || 1;
      return clamp((delta / span) * 760, 160, 760);
    },
  });

  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate?.(changed);
    this._needle.set(this.value);
  }

  private get _fraction(): number {
    const span = this.max - this.min;
    if (span === 0) return 0;
    return clamp((this._needle.value - this.min) / span, 0, 1);
  }

  private _deg(fraction: number): number {
    return -HALF_SWEEP + fraction * HALF_SWEEP * 2;
  }

  protected override render() {
    const needleDeg = this._deg(this._fraction);
    const [nx, ny] = polar(needleDeg, NEEDLE_LEN);

    return html`
      <div
        class="face"
        style=${styleMap({ width: `${this.width}px`, height: `${this.height}px` })}
        role="img"
        aria-label=${this.label || `${this.value}${this.unit}`}
      >
        <svg viewBox="0 0 300 190" aria-hidden="true">
          <path
            d=${arcPath(this._deg(0), this._deg(this.warn), R_SCALE)}
            fill="none"
            stroke="#5f9e5a"
            stroke-width="4"
            opacity="0.75"
          />
          <path
            d=${arcPath(this._deg(this.warn), this._deg(this.danger), R_SCALE)}
            fill="none"
            stroke="#c9a23a"
            stroke-width="4"
            opacity="0.8"
          />
          <path
            d=${arcPath(this._deg(this.danger), this._deg(1), R_SCALE)}
            fill="none"
            stroke="#b5473a"
            stroke-width="4"
            opacity="0.85"
          />
          ${this._renderTicks()} ${this._renderLabels()}

          <!-- Aiguille : un trait sombre épais doublé d'un filet rouge, comme
               sur un galvanomètre réel où l'aiguille laquée capte la lumière. -->
          <line
            x1=${PIVOT_X}
            y1=${PIVOT_Y}
            x2=${nx.toFixed(2)}
            y2=${ny.toFixed(2)}
            stroke="#2b2419"
            stroke-width="4"
            stroke-linecap="round"
          />
          <line
            x1=${PIVOT_X}
            y1=${PIVOT_Y}
            x2=${nx.toFixed(2)}
            y2=${ny.toFixed(2)}
            stroke="#a4392e"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <circle cx=${PIVOT_X} cy=${PIVOT_Y} r="7" fill="#3c342a" stroke="#0f0d09" stroke-width="1.5" />

          ${this.unit
            ? svg`<text x="150" y="186" text-anchor="middle" class="unit">${this.unit}</text>`
            : null}
        </svg>
        <div class="glass"></div>
      </div>
    `;
  }

  private _renderTicks(): SVGTemplateResult[] {
    const out: SVGTemplateResult[] = [];
    for (let i = 0; i <= 20; i++) {
      const f = i / 20;
      const deg = this._deg(f);
      const major = i % 4 === 0;
      const [x1, y1] = polar(deg, major ? R_TICK_IN_MAJOR : R_TICK_IN_MINOR);
      const [x2, y2] = polar(deg, R_SCALE - 6);
      out.push(svg`<line
        x1=${x1.toFixed(2)} y1=${y1.toFixed(2)}
        x2=${x2.toFixed(2)} y2=${y2.toFixed(2)}
        stroke="#2e2717" stroke-width=${major ? 2.4 : 1.2}
        stroke-linecap="round" opacity="0.75"
      />`);
    }
    return out;
  }

  private _renderLabels(): SVGTemplateResult[] {
    const out: SVGTemplateResult[] = [];
    for (let i = 0; i <= 4; i++) {
      const f = i / 4;
      const [x, y] = polar(this._deg(f), R_LABEL);
      const value = Math.round(this.min + f * (this.max - this.min));
      out.push(
        svg`<text x=${x.toFixed(1)} y=${(y + 4).toFixed(1)} text-anchor="middle" class="grad">${value}</text>`
      );
    }
    return out;
  }

  static override styles = css`
    :host {
      display: block;
      flex: none;
    }

    .face {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      box-sizing: border-box;
      background: radial-gradient(circle at 40% 28%, #f5ecd8, #e6d7b3 55%, #c7b487 100%);
      box-shadow:
        inset 3px 3px 3px rgba(0, 0, 0, 0.9),
        inset -1px -1px 1px rgba(255, 255, 255, 0.06),
        0 0 0 1px rgba(0, 0, 0, 0.6);
    }

    svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }

    .grad {
      font-family: var(--skeuo-font-lcd);
      font-size: 13px;
      fill: #3c3220;
    }
    .unit {
      font-family: var(--skeuo-font-lcd);
      font-size: 17px;
      font-weight: 700;
      letter-spacing: 0.5px;
      fill: #3c3220;
      opacity: 0.85;
    }

    /* Reflet du verre bombé, cohérent avec la lumière en haut-gauche. */
    .glass {
      position: absolute;
      inset: 0;
      pointer-events: none;
      mix-blend-mode: screen;
      background: linear-gradient(
        115deg,
        rgba(255, 255, 255, 0.22) 0%,
        rgba(255, 255, 255, 0.06) 28%,
        rgba(255, 255, 255, 0) 46%
      );
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "skeuo-vu-meter": SkeuoVuMeter;
  }
}
