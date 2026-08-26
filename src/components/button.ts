import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

export type ButtonVariant = "default" | "secure" | "alert";

/**
 * Bouton poussoir à capuchon et LED témoin.
 *
 * Un vrai <button> porte le comportement : focus clavier, Enter / Espace,
 * rôle exposé aux lecteurs d'écran. Le relief est purement décoratif par-dessus.
 */
@customElement("skeuo-button")
export class SkeuoButton extends LitElement {
  @property({ type: Boolean, reflect: true }) public active = false;
  @property({ type: Boolean, reflect: true }) public disabled = false;
  @property({ type: Boolean }) public primary = false;
  @property({ type: String }) public variant: ButtonVariant = "default";
  @property({ type: String }) public caption = "";
  @property({ type: String }) public label = "";

  protected override render() {
    return html`
      <div class="stack">
        <div class=${classMap({ wrap: true, primary: this.primary })}>
          <button
            class=${classMap({
              cap: true,
              on: this.active,
              [this.variant]: true,
            })}
            ?disabled=${this.disabled}
            aria-pressed=${this.active ? "true" : "false"}
            aria-label=${this.label || this.caption}
            @click=${this._onClick}
          >
            <span class="icon"><slot></slot></span>
            <span class="led"></span>
          </button>
        </div>
        ${this.caption
          ? html`<div class="caption-slot"><p class="caption">${this.caption}</p></div>`
          : nothing}
      </div>
    `;
  }

  private _onClick(): void {
    if (this.disabled) return;
    this.dispatchEvent(new CustomEvent("press", { bubbles: true, composed: true }));
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
      gap: 4px;
    }

    /* Logement creusé dans la façade : sombre en haut-gauche, reflet en bas-droite. */
    .wrap {
      position: relative;
      width: 48px;
      height: 48px;
      border-radius: 10px;
      background: #141414;
      padding: 4px;
      box-sizing: border-box;
      box-shadow:
        inset 2px 2px 5px rgba(0, 0, 0, 0.85),
        inset -1px -1px 2px rgba(255, 255, 255, 0.05);
    }
    .wrap.primary {
      width: 58px;
      height: 58px;
    }

    .cap {
      position: relative;
      width: 100%;
      height: 100%;
      border: none;
      border-radius: 6px;
      padding: 0;
      cursor: pointer;
      display: block;
      font: inherit;
      color: inherit;
      -webkit-tap-highlight-color: transparent;
      background: linear-gradient(to bottom, #cfcfcf 0%, #b0b0b0 45%, #999999 65%, #868686 100%);
      box-shadow:
        0 3px 5px rgba(0, 0, 0, 0.5),
        inset 0 1px 1px rgba(255, 255, 255, 0.45),
        inset 0 -2px 3px rgba(0, 0, 0, 0.25),
        inset 0 0 0 1px rgba(0, 0, 0, 0.18);
      transition: background 0.1s ease-out, box-shadow 0.1s ease-out;
    }
    .cap:focus-visible {
      outline: 2px solid var(--skeuo-accent, #e2a659);
      outline-offset: 2px;
    }

    /* Enfoncé : le capuchon plonge, la lumière ne l'atteint plus. */
    .cap:active {
      background: linear-gradient(to bottom, #3c3c3c 0%, #2a2a2a 45%, #1f1f1f 65%, #161616 100%);
      box-shadow:
        inset 0 2px 5px rgba(0, 0, 0, 0.85),
        inset 0 -1px 1px rgba(255, 255, 255, 0.06),
        inset 0 0 0 1px rgba(0, 0, 0, 0.3);
    }
    .cap.on {
      background: linear-gradient(to bottom, #4a2c2c 0%, #341c1c 45%, #241313 65%, #180d0d 100%);
      box-shadow:
        inset 0 2px 5px rgba(0, 0, 0, 0.85),
        inset 0 -1px 1px rgba(255, 255, 255, 0.05),
        inset 0 0 0 1px rgba(0, 0, 0, 0.3);
    }
    .cap.on.secure {
      background: linear-gradient(to bottom, #2c4a30 0%, #1c341f 45%, #132412 65%, #0d180e 100%);
    }
    .cap.on.alert {
      background: linear-gradient(to bottom, #4a3a2c 0%, #34281c 45%, #241a13 65%, #18110d 100%);
    }

    .icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: block;
      line-height: 0;
    }
    /* Les icônes sont des SVG passés en slot. On pilote color : les tracés
       pleins héritent via fill: currentColor, les tracés au trait via leur
       stroke="currentColor". Une seule variable pour les deux, l'état actif
       n'a donc pas à être répercuté dans chaque carte. */
    .icon ::slotted(svg) {
      display: block;
      color: #3a3a3a;
      fill: currentColor;
      transition: color 0.1s;
    }
    .cap:active .icon ::slotted(svg) {
      color: #cfcfcf;
    }
    .cap.on .icon ::slotted(svg) {
      color: #e8d4d4;
    }
    .cap.on.secure .icon ::slotted(svg) {
      color: #d4e8d4;
    }

    .led {
      position: absolute;
      top: 6px;
      right: 6px;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #8f8f8f;
      box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.4);
    }
    .cap:active .led {
      background: #e8b23b;
      box-shadow: 0 0 5px #e8b23b, 0 0 2px #ffdb99;
    }
    .cap.on .led {
      background: #ff4d4d;
      box-shadow: 0 0 6px #ff4d4d, 0 0 3px #ff9d9d;
    }
    .cap.on.secure .led {
      background: #4dff6a;
      box-shadow: 0 0 6px #4dff6a, 0 0 3px #9dff9d;
    }
    .cap.on.alert .led {
      background: #ff6b5c;
      box-shadow: 0 0 6px #ff6b5c, 0 0 3px #ffb0a6;
    }

    /* Même principe que sur l'interrupteur : la légende est souvent plus large
       que le bouton, et une carte qui la ferait changer en cours de route
       ferait varier la largeur du composant, donc glisser tout le contenu
       autour. Le conteneur garde la largeur du bouton et la hauteur de la
       ligne, le texte déborde symétriquement par-dessus. */
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
      text-align: center;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "skeuo-button": SkeuoButton;
  }
}
