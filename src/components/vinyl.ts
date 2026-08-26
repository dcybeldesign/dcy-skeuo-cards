import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

/**
 * Disque vinyle.
 *
 * Les sillons sont un dégradé radial répété, pas une image : ils restent nets
 * à n'importe quelle échelle et ne coûtent rien au bundle. La pochette, elle,
 * est une image réelle servie par Home Assistant, donc pas un bitmap embarqué
 * dans le pack mais bien un contenu de l'utilisateur.
 *
 * Le disque tourne pendant la lecture et s'arrête en pause plutôt que de
 * repartir de zéro : `animation-play-state` fige l'aiguille où elle en était,
 * ce qui est le comportement d'une platine et non celui d'une animation
 * relancée.
 */
@customElement("skeuo-vinyl")
export class SkeuoVinyl extends LitElement {
  @property({ type: Number }) public size = 118;
  @property({ type: Boolean, reflect: true }) public spinning = false;
  /** Pochette, en général `entity_picture` de l'entité média. */
  @property({ type: String }) public art?: string;
  /** Texte de la pastille centrale quand il n'y a pas de pochette. */
  @property({ type: String }) public badge = "";
  @property({ type: String }) public label = "";

  protected override render() {
    const size = this.size;
    return html`
      <div
        class="disc"
        role=${this.label ? "img" : "presentation"}
        aria-label=${this.label || nothing}
        style=${styleMap({ width: `${size}px`, height: `${size}px` })}
      >
        <div class="grooves"></div>
        <div
          class="centre"
          style=${styleMap({
            width: `${size * 0.42}px`,
            height: `${size * 0.42}px`,
            backgroundImage: this.art ? `url("${this.art}")` : "none",
          })}
        >
          ${this.art
            ? nothing
            : html`<span class="badge" style=${styleMap({ fontSize: `${size * 0.14}px` })}
                >${this.badge}</span
              >`}
        </div>
        <div class="spindle" style=${styleMap({ width: `${size * 0.038}px`, height: `${size * 0.038}px` })}></div>
      </div>
    `;
  }

  static override styles = css`
    :host {
      display: block;
      flex: none;
    }

    .disc {
      position: relative;
      border-radius: 50%;
      overflow: hidden;
      /* Reflet en bas-droite, ombre portée dans le même sens : la source de
         lumière du projet est en haut à gauche. */
      background:
        radial-gradient(circle at 68% 72%, rgba(255, 255, 255, 0.09), transparent 42%),
        radial-gradient(circle at 30% 26%, #2a2a2a, #0b0b0b 70%);
      box-shadow:
        4px 4px 9px rgba(0, 0, 0, 0.6),
        inset 2px 2px 4px rgba(0, 0, 0, 0.7),
        inset -2px -2px 3px rgba(255, 255, 255, 0.06);
    }

    /* Les sillons tournent, le corps du disque et son reflet restent fixes :
       un reflet qui tournerait avec le disque trahirait aussitôt le décor. */
    .grooves {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: repeating-radial-gradient(
        circle at 50% 50%,
        rgba(255, 255, 255, 0.055) 0 1px,
        rgba(0, 0, 0, 0.5) 1px 3px
      );
      animation: turn 3.4s linear infinite;
      animation-play-state: paused;
    }
    :host([spinning]) .grooves,
    :host([spinning]) .centre {
      animation-play-state: running;
    }

    .centre {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      /* Colonne, et non rangée : le texte doit descendre sous le trou central
         comme sur une étiquette de disque, et justify-content ne travaille sur
         la verticale qu'à cette condition. Centré, le texte se faisait
         traverser par l'axe. */
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      padding-bottom: 6%;
      box-sizing: border-box;
      background-color: var(--skeuo-accent, #e2a659);
      background-size: cover;
      background-position: center;
      box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.45);
      animation: turn 3.4s linear infinite;
      animation-play-state: paused;
      transform-origin: center;
    }

    /* La pastille suit le diamètre du disque : une taille fixe devient illisible
       dès que la carte est posée dans une cellule étroite, et le seul texte de
       l'étiquette se réduit alors à une tache. */
    .badge {
      font-family: var(--skeuo-font-lcd);
      font-weight: 700;
      line-height: 1;
      letter-spacing: 0.5px;
      color: #1a1207;
      text-transform: uppercase;
    }

    /* Trou d'axe : sept millimètres sur un disque de trente centimètres, soit
       un peu moins de quatre pour cent du diamètre. Plus large, il mordait sur
       le texte de l'étiquette. */
    .spindle {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      background: #0a0a0a;
      box-shadow: inset 1px 1px 2px rgba(0, 0, 0, 0.9);
    }

    @keyframes turn {
      to {
        transform: rotate(360deg);
      }
    }

    /* La pastille est déjà centrée par une translation : sa rotation doit s'y
       ajouter, sinon l'animation écrase la translation et la pastille saute en
       haut à gauche du disque. */
    @keyframes turn-centre {
      to {
        transform: translate(-50%, -50%) rotate(360deg);
      }
    }
    .centre {
      animation-name: turn-centre;
    }

    @media (prefers-reduced-motion: reduce) {
      .grooves,
      .centre {
        animation: none;
      }
      .centre {
        transform: translate(-50%, -50%);
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "skeuo-vinyl": SkeuoVinyl;
  }
}
