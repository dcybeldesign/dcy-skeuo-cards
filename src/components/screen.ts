import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

/**
 * Écran LCD ambre.
 *
 * Taille de référence 190 × 142.5, commune à toutes les cartes du pack pour
 * que les modules restent alignés entre eux. width / height permettent de
 * s'en écarter quand la mise en page l'exige.
 */
@customElement("skeuo-screen")
export class SkeuoScreen extends LitElement {
  @property({ type: String }) public value = "";
  @property({ type: String }) public label = "";
  @property({ type: String }) public color?: string;
  @property({ type: Number }) public width = 190;
  @property({ type: Number }) public height = 142.5;
  /** Taille de la valeur. Réduite quand le texte est long plutôt que tronqué. */
  @property({ type: Number, attribute: "value-size" }) public valueSize = 44.1;
  /**
   * Écran sans ligne de valeur : le contenu passé en slot occupe toute la
   * vitre. Sert à la météo, qui y pose une icône au lieu d'un relevé. Faux par
   * défaut, donc sans effet sur les écrans déjà en place.
   */
  @property({ type: Boolean }) public bare = false;

  protected override render() {
    return html`
      <div
        class="screen"
        style=${styleMap({ width: `${this.width}px`, height: `${this.height}px` })}
      >
        ${this.bare
          ? nothing
          : html`
              <p
                class="value"
                style=${styleMap({
                  color: this.color ?? "var(--skeuo-accent, #e2a659)",
                  fontSize: `${this.valueSize}px`,
                })}
              >
                ${this.value}
              </p>
            `}
        ${this.label ? html`<p class="label">${this.label}</p>` : nothing}
        <slot class=${this.bare ? "fill" : ""}></slot>
      </div>
    `;
  }

  static override styles = css`
    :host {
      display: block;
      flex: none;
    }

    .screen {
      position: relative;
      box-sizing: border-box;
      border-radius: 13.6px;
      padding: 13.6px 10.2px;
      display: flex;
      flex-direction: column;
      align-items: center;
      /* Creux : zone sombre en haut-gauche, léger reflet en bas-droite,
         ombre portée vers le bas-droite. */
      background: radial-gradient(ellipse at 50% 30%, #241a10, #140d07 75%);
      box-shadow:
        inset 5.1px 5.1px 3.4px rgba(0, 0, 0, 0.9),
        inset 3.4px 3.4px 8.5px rgba(0, 0, 0, 0.85),
        inset -1.7px -1.7px 1.7px rgba(255, 255, 255, 0.05),
        0 0 0 3.4px #100b06,
        5.1px 5.1px 8.5px rgba(0, 0, 0, 0.55);
    }

    .value {
      flex: 1;
      width: 100%;
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--skeuo-font-lcd);
      font-weight: 700;
      line-height: 1;
      text-align: center;
      text-shadow: 0 0 11.9px currentColor;
      overflow: hidden;
    }

    /* En mode nu, le slot prend la place que la ligne de valeur occupait,
       et centre son contenu dans la vitre. */
    slot.fill {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 0;
    }

    .label {
      flex: none;
      margin: 0;
      font-family: var(--skeuo-font-lcd);
      font-size: 14px;
      color: #cf9a5c;
      letter-spacing: 0.88px;
      text-transform: uppercase;
      text-align: center;
      line-height: 1.3;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "skeuo-screen": SkeuoScreen;
  }
}
