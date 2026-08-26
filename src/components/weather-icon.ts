import { LitElement, html, svg, css, nothing, type SVGTemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

/**
 * Icône météo lumineuse.
 *
 * Le mockup d'origine posait un jeu d'icônes animées extérieur, encodé en
 * base64 et appliqué en masque CSS. Sa licence ne pose pas de problème, c'est
 * le pack caule-themes-pack-1 sous licence MIT. Ce qui l'écarte est sa
 * couverture : six conditions seulement, alors que le domaine weather en
 * déclare quinze. Une carte qui montrerait un dessin étranger pour six
 * conditions et le nôtre pour les neuf autres serait bancale. Les quinze sont
 * donc redessinées ici, dans le même trait que le reste du pack.
 *
 * Le tracé est monochrome et hérite de currentColor, ce qui remplace le
 * masque : la lueur vient de drop-shadow, pas d'un calque supplémentaire.
 */

export type WeatherCondition =
  | "clear-night"
  | "cloudy"
  | "exceptional"
  | "fog"
  | "hail"
  | "lightning"
  | "lightning-rainy"
  | "partlycloudy"
  | "pouring"
  | "rainy"
  | "snowy"
  | "snowy-rainy"
  | "sunny"
  | "windy"
  | "windy-variant";

/**
 * Nom d'icône réellement dessinée.
 *
 * Une seule condition a besoin d'une variante de nuit : partlycloudy est la
 * seule qui contienne un soleil et qui puisse se produire après le coucher.
 * sunny n'arrive jamais de nuit, les intégrations remontent clear-night à sa
 * place. Home Assistant fait exactement la même distinction dans son propre
 * frontend.
 */
export type WeatherIconName = WeatherCondition | "partlycloudy-night";

/** Substitue la variante de nuit quand elle existe. */
export const weatherIconName = (condition: string, night: boolean | undefined): string =>
  night && condition === "partlycloudy" ? "partlycloudy-night" : condition;

/**
 * Nuage bâti en disques plutôt qu'en un seul chemin à arcs.
 *
 * Un arc SVG dont le rayon demandé est plus petit que la moitié de la distance
 * entre ses ancres est corrigé en silence par le moteur, ce qui peut aplatir
 * une silhouette sans lever la moindre erreur. Des disques et un rectangle
 * arrondi donnent la même forme sans ce piège.
 */
const cloud = (cx: number, cy: number, k: number) => svg`
  <circle cx=${cx - 8 * k} cy=${cy + 2 * k} r=${10 * k}/>
  <circle cx=${cx + 4 * k} cy=${cy - 2 * k} r=${13 * k}/>
  <circle cx=${cx + 13 * k} cy=${cy + 5 * k} r=${8 * k}/>
  <rect x=${cx - 8 * k} y=${cy + 5 * k} width=${21 * k} height=${8 * k} rx=${4 * k}/>
`;

/**
 * Croissant de lune, tracé comme la lunule entre deux cercles.
 *
 * Deux disques superposés en fill-rule evenodd ne conviennent pas : la règle
 * remplit la différence symétrique, donc la portion du disque retiré qui
 * dépasse de la lune se remplit elle aussi, et le croissant se referme en
 * masse informe. Le contour est donc décrit explicitement, un arc du grand
 * cercle et un arc du petit entre leurs deux points d'intersection.
 *
 * Ces points sont calculés une fois pour un rayon unité, avec un disque retiré
 * de même rayon décalé de 0.42 vers le haut-droite, ce qui laisse un croissant
 * d'une épaisseur de 0.42 R. La demi-corde vaut 0.978, donc sous les deux
 * rayons : aucun arc ne se fait corriger en silence.
 */
const CRESCENT_P1 = [0.8398, 0.5428] as const;
const CRESCENT_P2 = [-0.5428, -0.8398] as const;

/**
 * `up` place l'ouverture du croissant vers le haut-droite, donc sa masse en
 * bas-gauche. `down` fait l'inverse. L'orientation compte dès qu'un autre
 * élément partage l'icône : accolée au nuage, la masse de la lune se fond dans
 * sa silhouette et les deux ne forment plus qu'une tache.
 *
 * Le miroir inverse le sens de parcours des deux arcs, d'où les drapeaux de
 * balayage échangés.
 */
const crescent = (cx: number, cy: number, r: number, opening: "up" | "down" = "up") => {
  const sign = opening === "up" ? 1 : -1;
  const x1 = cx + CRESCENT_P1[0] * r;
  const y1 = cy + CRESCENT_P1[1] * r * sign;
  const x2 = cx + CRESCENT_P2[0] * r;
  const y2 = cy + CRESCENT_P2[1] * r * sign;
  const [outer, inner] = opening === "up" ? [1, 0] : [0, 1];
  return svg`
    <path d=${`M${x1} ${y1} A${r} ${r} 0 1 ${outer} ${x2} ${y2} A${r} ${r} 0 0 ${inner} ${x1} ${y1} Z`}/>
  `;
};

/** Rayons du soleil, huit branches réparties sur le tour. */
const rays = (cx: number, cy: number, inner: number, outer: number) => svg`
  <g class="spin" style=${`transform-origin:${cx}px ${cy}px`}>
    ${[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
      const a = (deg * Math.PI) / 180;
      return svg`<line
        x1=${cx + Math.cos(a) * inner} y1=${cy + Math.sin(a) * inner}
        x2=${cx + Math.cos(a) * outer} y2=${cy + Math.sin(a) * outer}
        stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/>`;
    })}
  </g>
`;

/** Traits de pluie, décalés dans le temps pour ne pas tomber en rang. */
const drops = (xs: number[], y: number, length: number) => svg`
  ${xs.map(
    (x, i) => svg`<line class="fall" style=${`animation-delay:${i * 0.22}s`}
      x1=${x} y1=${y} x2=${x - length * 0.35} y2=${y + length}
      stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>`
  )}
`;

/** Flocon à six branches. */
const flake = (cx: number, cy: number, r: number, delay: number) => svg`
  <g class="twinkle" style=${`animation-delay:${delay}s`}>
    ${[0, 60, 120].map((deg) => {
      const a = (deg * Math.PI) / 180;
      return svg`<line
        x1=${cx - Math.cos(a) * r} y1=${cy - Math.sin(a) * r}
        x2=${cx + Math.cos(a) * r} y2=${cy + Math.sin(a) * r}
        stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`;
    })}
  </g>
`;

/** Bourrasque : la boucle d'air et son filet de retour. */
const gust = (x: number, y: number, k: number, delay: number) => svg`
  <path class="sway" style=${`animation-delay:${delay}s`} fill="none" stroke="currentColor"
        stroke-width=${3.2 * k} stroke-linecap="round"
        d=${`M${x + 12 * k} ${y - 9 * k} A${5 * k} ${5 * k} 0 1 1 ${x + 16 * k} ${y} L${x - 18 * k} ${y}`}/>
`;

const bolt = () => svg`
  <polygon class="flash" points="33,34 24,50 31,50 27,60 41,43 33,43 37,34"/>
`;

/** Filets d'air, utilisés par le brouillard et par le vent. */
const streaks = (ys: number[], x1: number, x2: number) => svg`
  ${ys.map(
    (y, i) => svg`<line class="sway" style=${`animation-delay:${i * 0.35}s`}
      x1=${x1 + (i % 2) * 5} y1=${y} x2=${x2 - (i % 2) * 6} y2=${y}
      stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>`
  )}
`;

const SHAPES: Record<WeatherIconName, () => SVGTemplateResult> = {
  sunny: () => svg`
    ${rays(32, 32, 16, 26)}
    <circle cx="32" cy="32" r="11"/>
  `,

  "clear-night": () => svg`
    ${crescent(30, 34, 16)}
    ${flake(50, 15, 3.4, 0)}
    ${flake(14, 14, 2.6, 0.7)}
  `,

  cloudy: () => svg`<g class="drift">${cloud(30, 30, 1.15)}</g>`,

  partlycloudy: () => svg`
    ${rays(24, 24, 11, 19)}
    <circle cx="24" cy="24" r="8"/>
    <g class="drift">${cloud(34, 38, 1)}</g>
  `,

  /** Même composition que le jour, la lune à la place du soleil. */
  "partlycloudy-night": () => svg`
    ${crescent(24, 23, 12, "down")}
    <g class="drift">${cloud(34, 38, 1)}</g>
  `,

  rainy: () => svg`
    <g class="drift">${cloud(30, 24, 1)}</g>
    ${drops([22, 32, 42], 42, 12)}
  `,

  pouring: () => svg`
    <g class="drift">${cloud(30, 22, 1)}</g>
    ${drops([18, 27, 36, 45], 40, 16)}
  `,

  snowy: () => svg`
    <g class="drift">${cloud(30, 24, 1)}</g>
    ${flake(21, 47, 4.6, 0)}
    ${flake(32, 52, 4.6, 0.5)}
    ${flake(43, 47, 4.6, 1)}
  `,

  /**
   * Pluie et neige mêlées. Les deux signes sont posés côte à côte : superposés,
   * les branches du flocon et les traits de pluie se croisent et la vignette ne
   * ressemble plus qu'à un gribouillis une fois réduite.
   */
  "snowy-rainy": () => svg`
    <g class="drift">${cloud(30, 24, 1)}</g>
    ${drops([24], 42, 13)}
    ${flake(41, 48, 5, 0.3)}
  `,

  hail: () => svg`
    <g class="drift">${cloud(30, 24, 1)}</g>
    <circle class="fall" cx="22" cy="45" r="3.2"/>
    <circle class="fall" style="animation-delay:.25s" cx="32" cy="45" r="3.2"/>
    <circle class="fall" style="animation-delay:.5s" cx="42" cy="45" r="3.2"/>
  `,

  lightning: () => svg`
    <g class="drift">${cloud(30, 24, 1)}</g>
    ${bolt()}
  `,

  "lightning-rainy": () => svg`
    <g class="drift">${cloud(30, 22, 1)}</g>
    ${bolt()}
    ${drops([20, 45], 40, 13)}
  `,

  fog: () => svg`
    <g class="drift">${cloud(30, 22, 0.95)}</g>
    ${streaks([44, 52], 15, 49)}
  `,

  /**
   * Vent. Deux filets seulement : un troisième au milieu tomberait exactement
   * sur le retour de la bourrasque, et les deux tracés confondus formaient un
   * pâté au centre de l'icône.
   */
  windy: () => svg`
    ${streaks([23, 43], 12, 44)}
    ${gust(32, 33, 1, 0.15)}
  `,

  /**
   * Vent avec nuage. La bourrasque plutôt que des filets droits : avec des
   * filets, l'icône était le sosie du brouillard, qui est justement le contraire
   * d'un temps venté.
   */
  "windy-variant": () => svg`
    <g class="drift">${cloud(28, 23, 0.95)}</g>
    ${gust(30, 48, 0.9, 0.2)}
  `,

  /**
   * Conditions extrêmes. Le triangle d'avertissement est un signe universel,
   * là où une icône de temps n'aurait aucun sens pour un état qui recouvre
   * aussi bien une tempête qu'une alerte de l'organisme météo.
   */
  exceptional: () => svg`
    <path d="M32 12 L54 50 A3.5 3.5 0 0 1 51 55.5 L13 55.5 A3.5 3.5 0 0 1 10 50 Z"/>
    <rect x="29.4" y="27" width="5.2" height="15" rx="2.6" fill="#0d0906"/>
    <circle cx="32" cy="48" r="3" fill="#0d0906"/>
  `,
};

@customElement("skeuo-weather-icon")
export class SkeuoWeatherIcon extends LitElement {
  @property({ type: String }) public condition: string = "sunny";
  @property({ type: Number }) public size = 105;
  /** Halo diffus derrière le tracé. Coupé sur les petites tailles. */
  @property({ type: Boolean }) public glow = true;
  @property({ type: String }) public label = "";

  protected override render() {
    const shape = SHAPES[this.condition as WeatherIconName] ?? SHAPES.exceptional;
    return html`
      <div
        class="slot"
        style=${styleMap({
          width: `${this.size}px`,
          height: `${this.size}px`,
          // La lueur est proportionnelle au tracé. Une valeur fixe convient à
          // une seule taille : la même diffusion de dix pixels qui nimbe une
          // icône de cent pixels noie complètement une vignette de trente.
          "--halo-blur": `${this.size * 0.15}px`,
          "--art-glow": `${this.size * 0.055}px`,
        })}
      >
        ${this.glow
          ? html`<div
              class="halo"
              style=${styleMap({ width: `${this.size * 0.55}px`, height: `${this.size * 0.55}px` })}
            ></div>`
          : nothing}
        <svg
          class="art"
          viewBox="0 0 64 64"
          role=${this.label ? "img" : "presentation"}
          aria-label=${this.label || nothing}
        >
          ${shape()}
        </svg>
      </div>
    `;
  }

  static override styles = css`
    :host {
      display: block;
      flex: none;
      color: var(--skeuo-accent, #e2a659);
    }

    .slot {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Halo posé derrière le tracé, comme la diffusion d'un rétroéclairage dans
       la vitre de l'écran. */
    .halo {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      background: currentColor;
      filter: blur(var(--halo-blur, 16px));
      opacity: 0.3;
      z-index: 0;
    }

    .art {
      position: relative;
      z-index: 1;
      width: 100%;
      height: 100%;
      fill: currentColor;
      filter: drop-shadow(0 0 var(--art-glow, 5px) currentColor);
    }

    /* Les groupes animés ont besoin d'une boîte de référence explicite : sans
       transform-box, une rotation se calcule sur le repère du SVG entier et
       fait décrire un arc à l'élément au lieu de le faire tourner sur lui-même.
       Le soleil pose son propre transform-origin en coordonnées du dessin, il
       est donc exclu de cette règle. */
    .drift,
    .fall,
    .flash,
    .sway,
    .twinkle {
      transform-box: fill-box;
      transform-origin: center;
    }

    .spin {
      animation: spin 24s linear infinite;
    }
    .drift {
      animation: drift 7s ease-in-out infinite alternate;
    }
    .fall {
      animation: fall 1.5s ease-in infinite;
    }
    .flash {
      animation: flash 3.2s ease-in-out infinite;
    }
    .sway {
      animation: sway 4.5s ease-in-out infinite alternate;
    }
    .twinkle {
      animation: twinkle 4s ease-in-out infinite alternate;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    @keyframes drift {
      from {
        transform: translateX(-1.6px);
      }
      to {
        transform: translateX(1.6px);
      }
    }
    @keyframes fall {
      0% {
        transform: translateY(-5px);
        opacity: 0;
      }
      25% {
        opacity: 1;
      }
      100% {
        transform: translateY(7px);
        opacity: 0;
      }
    }
    @keyframes flash {
      0%,
      62%,
      70%,
      100% {
        opacity: 1;
      }
      66% {
        opacity: 0.25;
      }
    }
    @keyframes sway {
      from {
        transform: translateX(-2.4px);
      }
      to {
        transform: translateX(2.4px);
      }
    }
    @keyframes twinkle {
      from {
        opacity: 0.45;
        transform: rotate(-12deg);
      }
      to {
        opacity: 1;
        transform: rotate(12deg);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .spin,
      .drift,
      .fall,
      .flash,
      .sway,
      .twinkle {
        animation: none;
      }
      .fall {
        opacity: 1;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "skeuo-weather-icon": SkeuoWeatherIcon;
  }
}
