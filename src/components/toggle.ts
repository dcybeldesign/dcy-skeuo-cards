import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

/**
 * Interrupteur à bascule.
 *
 * role="switch" plutôt qu'une case à cocher déguisée : c'est le rôle ARIA
 * exact pour un contrôle marche/arrêt, et il évite de sortir un libellé
 * « coché / décoché » aux lecteurs d'écran.
 */
@customElement("skeuo-toggle")
export class SkeuoToggle extends LitElement {
  @property({ type: Boolean, reflect: true }) public checked = false;
  @property({ type: Boolean, reflect: true }) public disabled = false;
  @property({ type: String }) public color?: string;
  @property({ type: String }) public caption = "";
  @property({ type: String }) public label = "";

  protected override render() {
    return html`
      <div class="stack" style=${styleMap({ "--tgl-color": this.color ?? "var(--skeuo-accent, #e2a659)" })}>
        <button
          class="frame"
          role="switch"
          aria-checked=${this.checked ? "true" : "false"}
          aria-label=${this.label || this.caption}
          ?disabled=${this.disabled}
          @click=${this._onClick}
        >
          <span class="rocker">
            <span class="sym on">I</span>
            <span class="sym off">O</span>
          </span>
        </button>
        ${this.caption
          ? html`<div class="caption-slot"><p class="caption">${this.caption}</p></div>`
          : nothing}
      </div>
    `;
  }

  private _onClick(): void {
    if (this.disabled) return;
    this.dispatchEvent(
      new CustomEvent("toggle", { detail: { checked: !this.checked }, bubbles: true, composed: true })
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

    .stack {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .frame {
      display: block;
      width: 46px;
      height: 78px;
      padding: 4px;
      border: none;
      border-radius: 6px;
      background: #111;
      cursor: pointer;
      box-sizing: border-box;
      perspective: 200px;
      box-shadow:
        inset 4px 4px 8px rgba(0, 0, 0, 0.8),
        inset -2px -2px 4px rgba(255, 255, 255, 0.1),
        2px 2px 2px rgba(255, 255, 255, 0.05);
      transition: box-shadow 0.2s;
    }
    .frame:focus-visible {
      outline: 2px solid var(--skeuo-accent, #e2a659);
      outline-offset: 2px;
    }

    .rocker {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      height: 100%;
      padding: 9px 0;
      box-sizing: border-box;
      border-radius: 3px;
      overflow: hidden;
      transform-origin: center;
      transform: rotateX(-15deg);
      background: linear-gradient(to bottom, #2a2a2a 0%, #151515 100%);
      box-shadow:
        0 -6px 4px -3px rgba(0, 0, 0, 0.9),
        inset 0 -1px 2px rgba(255, 255, 255, 0.1),
        inset 0 1px 1px rgba(0, 0, 0, 0.5);
      transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), background 0.2s;
    }

    .sym {
      position: relative;
      z-index: 2;
      font-size: 14px;
      font-weight: 700;
      color: #444;
      text-shadow: 0 1px 1px rgba(255, 255, 255, 0.1), 0 -1px 1px rgba(0, 0, 0, 0.8);
      transition: color 0.2s, text-shadow 0.2s;
    }

    /* Basculé : la palette s'inverse et la façade s'éclaire par en dessous. */
    :host([checked]) .rocker {
      transform: rotateX(15deg);
      background: linear-gradient(to bottom, #1a1a1a 0%, #2a2a2a 100%);
      box-shadow:
        0 6px 4px -3px rgba(0, 0, 0, 0.9),
        inset 0 1px 2px rgba(255, 255, 255, 0.1),
        inset 0 -1px 1px rgba(0, 0, 0, 0.5);
    }
    :host([checked]) .rocker::before {
      content: "";
      position: absolute;
      inset: 0;
      z-index: 1;
      background:
        radial-gradient(circle at 50% 30%, var(--tgl-color) 0%, transparent 60%),
        radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px);
      background-size: 100% 100%, 3px 3px;
      opacity: 0.85;
      mix-blend-mode: color-dodge;
    }
    :host([checked]) .frame {
      box-shadow:
        inset 4px 4px 8px rgba(0, 0, 0, 0.8),
        inset -2px -2px 4px rgba(255, 255, 255, 0.1),
        2px 2px 14px var(--tgl-color);
    }
    :host([checked]) .sym.on {
      color: #fff;
      text-shadow: 0 0 6px var(--tgl-color), 0 0 10px #fff;
    }

    /* La légende est plus large que l'interrupteur et change avec l'état
       (Allumé / Éteint). Laissée dans le flux, c'est elle qui fixerait la
       largeur du composant : au basculement, la largeur changeait et tout le
       contenu de la carte se décalait de quelques pixels. Le conteneur garde
       donc la largeur de l'interrupteur et la hauteur de la ligne, et le texte
       est centré par-dessus sans peser sur la mise en page. */
    .caption-slot {
      position: relative;
      width: 100%;
      height: 17px;
    }
    .caption {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
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
    "skeuo-toggle": SkeuoToggle;
  }
}
