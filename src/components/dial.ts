import { LitElement, html, css, svg, type SVGTemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

const START = -135;
const SWEEP = 270;
// La piste grise suit exactement la course de l'aiguille au lieu d'être un
// cercle complet : ça libère les 90 degrés du bas, seul endroit du cadran assez
// dégagé pour poser les bornes min et max sans qu'elles passent derrière
// l'écran central ou sous les graduations.
const R_TRACK = 100;
const R_TICK_IN = 108;
const R_TICK_OUT = 118;
const R_EDGE = 100;
const EDGE_ANGLE = 158;
const VIEW = 260;

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

const polar = (deg: number, r: number): [number, number] => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [VIEW / 2 + Math.cos(rad) * r, VIEW / 2 + Math.sin(rad) * r];
};

/**
 * Cadran gradué à arc lumineux, avec un écran circulaire au centre.
 *
 * Le contenu central passe par un slot : la carte climatisation y met la
 * température ambiante, une autre y mettrait autre chose, sans dupliquer le
 * cadran.
 */
@customElement("skeuo-dial")
export class SkeuoDial extends LitElement {
  @property({ type: Number }) public value = 0;
  @property({ type: Number }) public min = 7;
  @property({ type: Number }) public max = 35;
  @property({ type: Number }) public size = 200;
  @property({ type: String }) public color?: string;
  @property({ type: Boolean }) public dimmed = false;

  private get _fraction(): number {
    const span = this.max - this.min;
    if (span === 0) return 0;
    return clamp((this.value - this.min) / span, 0, 1);
  }

  protected override render() {
    const accent = this.color ?? "var(--skeuo-accent, #e2a659)";
    const deg = START + this._fraction * SWEEP;
    const [px, py] = polar(deg, R_TRACK);
    const [sx, sy] = polar(START, R_TRACK);
    const large = this._fraction * SWEEP > 180 ? 1 : 0;
    const arc = `M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${R_TRACK} ${R_TRACK} 0 ${large} 1 ${px.toFixed(2)} ${py.toFixed(2)}`;

    const [minX, minY] = polar(-EDGE_ANGLE, R_EDGE);
    const [maxX, maxY] = polar(EDGE_ANGLE, R_EDGE);
    const track = `M ${polar(START, R_TRACK)[0].toFixed(2)} ${polar(START, R_TRACK)[1].toFixed(2)} A ${R_TRACK} ${R_TRACK} 0 1 1 ${polar(START + SWEEP, R_TRACK)[0].toFixed(2)} ${polar(START + SWEEP, R_TRACK)[1].toFixed(2)}`;

    return html`
      <div
        class="wrap"
        style=${styleMap({
          width: `${this.size}px`,
          height: `${this.size}px`,
          filter: this.dimmed ? "grayscale(1)" : "none",
        })}
      >
        <svg viewBox="0 0 ${VIEW} ${VIEW}" aria-hidden="true">
          <path d=${track} fill="none" stroke="#4a4d52" stroke-width="10" stroke-linecap="round" />
          ${this._renderTicks()}
          ${this._fraction > 0.001
            ? svg`<path d=${arc} fill="none" stroke=${accent} stroke-width="6" stroke-linecap="round"
                        style="filter: drop-shadow(0 0 5px ${accent})"/>`
            : null}
          <circle
            cx=${px.toFixed(2)}
            cy=${py.toFixed(2)}
            r="5"
            fill=${accent}
            style="filter: drop-shadow(0 0 4px ${accent})"
          />
          <text x=${minX.toFixed(1)} y=${(minY + 4).toFixed(1)} text-anchor="middle" class="edge">
            ${Math.round(this.min)}°
          </text>
          <text x=${maxX.toFixed(1)} y=${(maxY + 4).toFixed(1)} text-anchor="middle" class="edge">
            ${Math.round(this.max)}°
          </text>
        </svg>
        <div class="lcd"><slot></slot></div>
      </div>
    `;
  }

  private _renderTicks(): SVGTemplateResult[] {
    const out: SVGTemplateResult[] = [];
    const count = 23;
    for (let i = 0; i < count; i++) {
      const f = i / (count - 1);
      const deg = START + f * SWEEP;
      const major = i % 11 === 0;
      const [x1, y1] = polar(deg, R_TICK_OUT);
      const [x2, y2] = polar(deg, major ? R_TICK_IN : R_TICK_IN + 5);
      out.push(svg`<line
        x1=${x1.toFixed(2)} y1=${y1.toFixed(2)} x2=${x2.toFixed(2)} y2=${y2.toFixed(2)}
        stroke="#8b8e91" stroke-width=${major ? 2.6 : 1.6} stroke-linecap="round" opacity="0.7"
      />`);
    }
    return out;
  }

  static override styles = css`
    :host {
      display: block;
      flex: none;
    }
    .wrap {
      position: relative;
      transition: filter 0.2s;
    }
    svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }
    .edge {
      font-family: var(--skeuo-font-lcd);
      font-size: 13px;
      fill: #8b8e91;
    }

    /* Écran circulaire encastré : creux sombre en haut-gauche, reflet en
       bas-droite, ombre portée vers le bas-droite. */
    .lcd {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 58%;
      height: 58%;
      border-radius: 50%;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: radial-gradient(ellipse at 50% 35%, #241a10, #140d07 75%);
      box-shadow:
        inset 4.5px 4.5px 3.4px rgba(0, 0, 0, 0.9),
        inset 3.4px 3.4px 7.9px rgba(0, 0, 0, 0.85),
        inset -1.7px -1.7px 1.7px rgba(255, 255, 255, 0.05),
        0 0 0 3.4px #100b06,
        3.4px 3.4px 6.7px rgba(0, 0, 0, 0.55);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "skeuo-dial": SkeuoDial;
  }
}
