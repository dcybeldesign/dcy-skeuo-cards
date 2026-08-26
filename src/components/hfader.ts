import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";

export type HFaderGradient = "level" | "position" | "warmth";

/**
 * Fader horizontal à rail creusé et curseur ivoire.
 *
 * Même mécanique que le fader vertical, sans la rotation : le curseur y est
 * simplement plus haut que large, et le trait gravé sur son capuchon court en
 * travers au lieu de courir le long. La bande sémantique passe donc en dégradé
 * vers la droite, valeur forte en fin de course.
 */
@customElement("skeuo-hfader")
export class SkeuoHFader extends LitElement {
  @property({ type: Number }) public value = 0;
  @property({ type: Number }) public min = 0;
  @property({ type: Number }) public max = 100;
  @property({ type: Number }) public step = 1;
  @property({ type: Number }) public width = 244;
  @property({ type: String }) public caption = "";
  @property({ type: String }) public gradient: HFaderGradient = "level";
  @property({ type: Boolean, reflect: true }) public disabled = false;
  @property({ type: Boolean, reflect: true }) public inactive = false;
  @property({ type: String, attribute: "aria-label" }) public ariaLabelText = "";

  /** Valeur affichée pendant le glissement, avant confirmation. */
  @state() private _dragging?: number;

  private get _shown(): number {
    return this._dragging ?? this.value;
  }

  protected override render() {
    return html`
      <div class="col" style=${styleMap({ width: `${this.width}px` })}>
        <div class=${classMap({ strip: true, [this.gradient]: true })}></div>
        <div class="wrap">
          <input
            type="range"
            class="fader"
            .min=${String(this.min)}
            .max=${String(this.max)}
            .step=${String(this.step)}
            .value=${String(this._shown)}
            ?disabled=${this.disabled}
            aria-label=${this.ariaLabelText || this.caption}
            @input=${this._onInput}
            @change=${this._onChange}
          />
        </div>
        ${this.caption ? html`<p class="caption">${this.caption}</p>` : nothing}
      </div>
    `;
  }

  /** Retour visuel immédiat, sans appel de service. */
  private _onInput(ev: Event): void {
    this._dragging = Number((ev.target as HTMLInputElement).value);
    this.dispatchEvent(
      new CustomEvent("fader-input", {
        detail: { value: this._dragging },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Un seul appel de service, au relâchement. Piloter le volume à chaque pixel
   * de glissement noierait le bus d'événements et ferait hoqueter le son.
   */
  private _onChange(ev: Event): void {
    const value = Number((ev.target as HTMLInputElement).value);
    this._dragging = undefined;
    this.dispatchEvent(
      new CustomEvent("fader-change", { detail: { value }, bubbles: true, composed: true })
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
    :host([inactive]) .strip {
      filter: grayscale(1) brightness(0.75);
    }
    :host([inactive]) .caption {
      color: #5f6265;
    }
    .strip,
    .caption {
      transition: filter 0.25s ease, color 0.25s ease;
    }

    .col {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 5px;
    }

    .strip {
      width: 100%;
      height: 6px;
      border-radius: 3px;
      flex: none;
      box-shadow:
        inset 1px 1px 1px rgba(0, 0, 0, 0.3),
        inset -1px -1px 1px rgba(255, 255, 255, 0.15),
        1px 1px 2px rgba(0, 0, 0, 0.5);
    }
    .level {
      background: linear-gradient(to right, #3a3d41 0%, #6b6f74 45%, #b9bfc5 75%, #eef1f4 100%);
    }
    .position {
      background: linear-gradient(to right, #3a3d41 0%, #5c6a75 35%, #9db8c9 70%, #cfe6f0 100%);
    }
    .warmth {
      background: linear-gradient(to right, #a9d4ff 0%, #eef6ff 35%, #ffe9c7 55%, #ff9d42 100%);
    }

    .wrap {
      position: relative;
      width: 100%;
      height: 34px;
    }

    input[type="range"].fader {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 34px;
      background: transparent;
      margin: 0;
      display: block;
      touch-action: none;
    }
    input[type="range"].fader:focus {
      outline: none;
    }
    input[type="range"].fader:focus-visible::-webkit-slider-thumb {
      box-shadow:
        -4px 4px 8px rgba(0, 0, 0, 0.6),
        0 0 0 2px var(--skeuo-accent, #e2a659);
    }

    input[type="range"].fader::-webkit-slider-runnable-track {
      width: 100%;
      height: 10px;
      cursor: ew-resize;
      background: #0a0a0a;
      border-radius: 5px;
      border: 1px solid #111;
      box-shadow:
        inset 2px 2px 4px rgba(0, 0, 0, 0.9),
        inset -1px -1px 1px rgba(255, 255, 255, 0.1);
    }
    /* Le capuchon est plus haut que large, et son trait gravé court en travers
       de la course : c'est ce qui distingue à l'oeil un fader horizontal d'un
       fader vertical couché. */
    input[type="range"].fader::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 30px;
      width: 18px;
      border-radius: 3px;
      cursor: ew-resize;
      margin-top: -10px;
      border: 1px solid #c4bc9f;
      background:
        linear-gradient(to bottom, transparent 46%, #111 46%, #111 54%, transparent 54%),
        linear-gradient(to right, #fdfbf7 0%, #e8e3d2 10%, #f5f0e1 50%, #dcd6c0 90%, #b8b096 100%);
      box-shadow:
        -4px 4px 8px rgba(0, 0, 0, 0.6),
        inset 0 2px 3px rgba(255, 255, 255, 0.9),
        inset 2px 0 3px rgba(255, 255, 255, 0.6),
        inset -2px 0 3px rgba(0, 0, 0, 0.1),
        inset 0 -3px 4px rgba(0, 0, 0, 0.3);
    }

    input[type="range"].fader::-moz-range-track {
      width: 100%;
      height: 10px;
      cursor: ew-resize;
      background: #0a0a0a;
      border-radius: 5px;
      box-shadow:
        inset 2px 2px 4px rgba(0, 0, 0, 0.9),
        inset -1px -1px 1px rgba(255, 255, 255, 0.1);
    }
    input[type="range"].fader::-moz-range-thumb {
      height: 30px;
      width: 18px;
      border-radius: 3px;
      cursor: ew-resize;
      border: 1px solid #c4bc9f;
      background:
        linear-gradient(to bottom, transparent 46%, #111 46%, #111 54%, transparent 54%),
        linear-gradient(to right, #fdfbf7 0%, #e8e3d2 10%, #f5f0e1 50%, #dcd6c0 90%, #b8b096 100%);
      box-shadow:
        -4px 4px 8px rgba(0, 0, 0, 0.6),
        inset 0 2px 3px rgba(255, 255, 255, 0.9),
        inset 0 -3px 4px rgba(0, 0, 0, 0.3);
    }

    .caption {
      margin: 0;
      font-size: 14px;
      line-height: 17px;
      letter-spacing: 2.1px;
      color: var(--skeuo-label, #85888b);
      text-transform: uppercase;
      white-space: nowrap;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "skeuo-hfader": SkeuoHFader;
  }
}
