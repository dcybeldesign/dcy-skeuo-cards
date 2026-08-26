import { LitElement, html, css, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

const START_ANGLE = -135;
const SWEEP = 270;
const TICK_COUNT = 25;

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

/**
 * Molette métal brossé graduée.
 *
 * La matière est entièrement procédurale : un repeating-conic-gradient donne
 * le brossage radial, deux radial-gradient posent le spéculaire en
 * haut-gauche et l'ombre en bas-droite. Aucune photo n'est embarquée, ce qui
 * évite 108 ko de bundle et surtout garde la molette nette à n'importe quelle
 * taille de carte, alors qu'un bitmap se déliterait dès qu'on agrandit.
 */
@customElement("skeuo-knob")
export class SkeuoKnob extends LitElement {
  @property({ type: Number }) public value = 0;
  @property({ type: Number }) public min = 0;
  @property({ type: Number }) public max = 100;
  @property({ type: Number }) public size = 200;
  @property({ type: Boolean, reflect: true }) public disabled = false;
  @property({ type: String }) public label = "";

  @state() private _dragging?: number;

  private get _shown(): number {
    return clamp(this._dragging ?? this.value, this.min, this.max);
  }

  private get _fraction(): number {
    const span = this.max - this.min;
    return span === 0 ? 0 : (this._shown - this.min) / span;
  }

  protected override render() {
    const size = this.size;
    const angle = START_ANGLE + this._fraction * SWEEP;

    return html`
      <div
        class="wrap"
        style=${styleMap({ width: `${size}px`, height: `${size}px` })}
        role="slider"
        tabindex=${this.disabled ? "-1" : "0"}
        aria-valuemin=${this.min}
        aria-valuemax=${this.max}
        aria-valuenow=${Math.round(this._shown)}
        aria-label=${this.label}
        @pointerdown=${this._onPointerDown}
        @keydown=${this._onKeyDown}
      >
        <svg class="ticks" viewBox="0 0 200 200" aria-hidden="true">
          ${this._renderTicks()}
        </svg>
        <div class="disc" style=${styleMap({ transform: `rotate(${angle}deg)` })}>
          <span class="plate"></span>
          <span class="cap"></span>
          <span class="pointer"></span>
        </div>
      </div>
    `;
  }

  private _renderTicks() {
    const out = [];
    for (let i = 0; i < TICK_COUNT; i++) {
      const f = i / (TICK_COUNT - 1);
      const deg = START_ANGLE + f * SWEEP;
      const rad = ((deg - 90) * Math.PI) / 180;
      const major = i % 6 === 0;
      const r1 = major ? 84 : 88;
      const r2 = 96;
      const on = f <= this._fraction + 0.0001;
      out.push(svg`<line
        x1=${(100 + Math.cos(rad) * r1).toFixed(2)}
        y1=${(100 + Math.sin(rad) * r1).toFixed(2)}
        x2=${(100 + Math.cos(rad) * r2).toFixed(2)}
        y2=${(100 + Math.sin(rad) * r2).toFixed(2)}
        stroke=${on ? "var(--skeuo-accent, #e2a659)" : "#4a4d50"}
        stroke-width=${major ? 3 : 1.8}
        stroke-linecap="round"
        opacity=${on ? "1" : "0.75"}
      />`);
    }
    return out;
  }

  /* ------------------------------------------------------------ pilotage */

  private _onKeyDown(ev: KeyboardEvent): void {
    if (this.disabled) return;
    const step = ev.shiftKey ? 10 : 1;
    let next: number | undefined;
    if (ev.key === "ArrowUp" || ev.key === "ArrowRight") next = this._shown + step;
    else if (ev.key === "ArrowDown" || ev.key === "ArrowLeft") next = this._shown - step;
    else if (ev.key === "Home") next = this.min;
    else if (ev.key === "End") next = this.max;
    if (next === undefined) return;
    ev.preventDefault();
    this._commit(clamp(next, this.min, this.max));
  }

  private _onPointerDown(ev: PointerEvent): void {
    if (this.disabled || ev.button !== 0) return;
    const wrap = ev.currentTarget as HTMLElement;
    wrap.setPointerCapture(ev.pointerId);
    ev.preventDefault();

    const rect = wrap.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const toValue = (e: PointerEvent): number => {
      const deg = (Math.atan2(e.clientX - cx, cy - e.clientY) * 180) / Math.PI;
      const clamped = clamp(deg, START_ANGLE, START_ANGLE + SWEEP);
      const f = (clamped - START_ANGLE) / SWEEP;
      return this.min + f * (this.max - this.min);
    };

    const move = (e: PointerEvent) => {
      this._dragging = toValue(e);
      this.dispatchEvent(
        new CustomEvent("knob-input", {
          detail: { value: this._dragging },
          bubbles: true,
          composed: true,
        })
      );
    };

    const up = (e: PointerEvent) => {
      wrap.removeEventListener("pointermove", move);
      wrap.removeEventListener("pointerup", up);
      wrap.removeEventListener("pointercancel", up);
      const final = this._dragging ?? toValue(e);
      this._dragging = undefined;
      this._commit(final);
    };

    wrap.addEventListener("pointermove", move);
    wrap.addEventListener("pointerup", up);
    wrap.addEventListener("pointercancel", up);
  }

  /** Un seul appel de service, au relâchement. */
  private _commit(value: number): void {
    this.dispatchEvent(
      new CustomEvent("knob-change", {
        detail: { value: Math.round(value) },
        bubbles: true,
        composed: true,
      })
    );
  }

  static override styles = css`
    :host {
      display: block;
      flex: none;
    }
    :host([disabled]) {
      /* Désaturation, pas d'opacity : un contrôle translucide laisse voir la
         façade au travers, ce qui casse l'illusion de matière. */
      filter: grayscale(1);
      pointer-events: none;
    }

    .wrap {
      position: relative;
      touch-action: none;
      cursor: grab;
      border-radius: 50%;
      outline: none;
    }
    .wrap:active {
      cursor: grabbing;
    }
    .wrap:focus-visible {
      box-shadow: 0 0 0 2px var(--skeuo-accent, #e2a659);
    }

    .ticks {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }

    /* Jupe moletée. Le moletage est un dégradé conique : ses secteurs
       convergent forcément au centre et y produisent une étoile de moiré, d'où
       les deux couches posées par-dessus (plateau puis chapeau) qui masquent
       exactement cette zone, comme sur une molette usinée réelle. */
    .disc {
      position: absolute;
      inset: 12%;
      border-radius: 50%;
      background-image:
        radial-gradient(circle at 33% 26%, rgba(255, 255, 255, 0.34) 0%, rgba(255, 255, 255, 0) 46%),
        radial-gradient(circle at 74% 80%, rgba(0, 0, 0, 0.52) 0%, rgba(0, 0, 0, 0) 52%),
        repeating-conic-gradient(
          from 0deg,
          rgba(255, 255, 255, 0.14) 0deg 1.5deg,
          rgba(0, 0, 0, 0.16) 1.5deg 3deg
        ),
        radial-gradient(circle at 50% 50%, #8a8a8a 0%, #6f6f6f 62%, #4a4a4a 88%, #333333 100%);
      box-shadow:
        10px 10px 18px rgba(0, 0, 0, 0.6),
        3px 3px 6px rgba(0, 0, 0, 0.5),
        inset 0 2px 2px rgba(255, 255, 255, 0.35),
        inset 0 -3px 5px rgba(0, 0, 0, 0.6),
        inset 0 0 0 1px rgba(0, 0, 0, 0.4);
    }

    /* Plateau supérieur, en retrait de la jupe, brossé beaucoup plus finement. */
    .plate {
      position: absolute;
      inset: 13%;
      border-radius: 50%;
      background-image:
        radial-gradient(circle at 35% 27%, rgba(255, 255, 255, 0.26) 0%, rgba(255, 255, 255, 0) 55%),
        repeating-conic-gradient(
          from 0.35deg,
          rgba(255, 255, 255, 0.05) 0deg 0.7deg,
          rgba(0, 0, 0, 0.05) 0.7deg 1.4deg
        ),
        radial-gradient(circle at 50% 50%, #9b9b9b 0%, #838383 68%, #616161 100%);
      box-shadow:
        inset 1px 1px 2px rgba(0, 0, 0, 0.5),
        inset -1px -1px 2px rgba(255, 255, 255, 0.22);
    }

    /* Chapeau central : sa seule fonction est de couvrir le point de
       convergence des deux dégradés coniques. */
    .cap {
      position: absolute;
      inset: 34%;
      border-radius: 50%;
      background-image:
        radial-gradient(circle at 36% 29%, #b4b4b4 0%, #8f8f8f 52%, #6d6d6d 100%);
      box-shadow:
        inset 0 1px 1px rgba(255, 255, 255, 0.45),
        inset 0 -1px 2px rgba(0, 0, 0, 0.45),
        1px 1px 3px rgba(0, 0, 0, 0.45);
    }

    .pointer {
      position: absolute;
      z-index: 2;
      top: 7%;
      left: 50%;
      transform: translateX(-50%);
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 25%, #ff6b5c, #a8261a 75%);
      box-shadow:
        0 0 5px #ff4433,
        0 0 2px rgba(0, 0, 0, 0.5),
        inset -1px -1px 1px rgba(0, 0, 0, 0.35),
        inset 1px 1px 1px rgba(255, 255, 255, 0.35);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "skeuo-knob": SkeuoKnob;
  }
}
