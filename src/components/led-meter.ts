import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

/**
 * Échelle à segments lumineux, à la manière d'un vu-mètre à LED.
 *
 * La couleur d'un segment tient à sa position sur l'échelle, jamais à la
 * valeur courante : sur un appareil réel, la diode du haut est rouge qu'elle
 * soit allumée ou éteinte. Piloter la couleur par la valeur donnerait une
 * échelle qui vire au rouge d'un bloc, ce qui n'existe sur aucun matériel.
 */
@customElement("skeuo-led-meter")
export class SkeuoLedMeter extends LitElement {
  @property({ type: Number }) public value = 0;
  @property({ type: Number }) public min = 0;
  @property({ type: Number }) public max = 100;
  @property({ type: Number }) public segments = 15;
  /** Fraction de l'échelle où la zone verte cède la place à l'ambre. */
  @property({ type: Number }) public warn = 0.6;
  /** Fraction où l'ambre cède au rouge. */
  @property({ type: Number }) public danger = 0.8;
  @property({ type: Number }) public segmentWidth = 26;
  @property({ type: Number }) public segmentHeight = 10.5;
  @property({ type: Number }) public gap = 2;
  @property({ type: String }) public label = "";

  private _colour(index: number): string {
    const position = (index + 1) / this.segments;
    if (position > this.danger) return "#e0503a";
    if (position > this.warn) return "#c9a23a";
    return "#3ddc73";
  }

  protected override render() {
    const span = this.max - this.min;
    const ratio = span > 0 ? (this.value - this.min) / span : 0;
    const lit = Math.round(Math.min(1, Math.max(0, ratio)) * this.segments);

    return html`
      <div
        class="ladder"
        role="meter"
        aria-valuenow=${this.value}
        aria-valuemin=${this.min}
        aria-valuemax=${this.max}
        aria-label=${this.label}
        style=${styleMap({ gap: `${this.gap}px` })}
      >
        ${Array.from({ length: this.segments }, (_, i) => {
          // Les segments sont émis du haut vers le bas, l'échelle se remplit
          // donc par le bas comme sur un appareil posé sur sa tranche.
          const index = this.segments - 1 - i;
          const on = index < lit;
          const colour = this._colour(index);
          return html`<i
            class="led"
            style=${styleMap({
              width: `${this.segmentWidth}px`,
              height: `${this.segmentHeight}px`,
              background: on ? colour : "#3a3d41",
              boxShadow: on
                ? `0 0 3px ${colour}, inset 0 1px 1px rgba(255, 255, 255, 0.35)`
                : "inset 1px 1px 2px rgba(0, 0, 0, 0.55)",
            })}
          ></i>`;
        })}
      </div>
    `;
  }

  static override styles = css`
    :host {
      display: block;
      flex: none;
    }
    :host([disabled]) {
      filter: grayscale(1);
    }

    .ladder {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .led {
      display: block;
      flex: none;
      border-radius: 3px;
      transition: background 0.12s linear, box-shadow 0.12s linear;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "skeuo-led-meter": SkeuoLedMeter;
  }
}
