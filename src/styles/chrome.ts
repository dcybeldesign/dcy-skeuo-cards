import { css, unsafeCSS } from "lit";

import { DESIGN } from "../core/scaler";

/**
 * Chrome commun à toutes les cartes : matière, vis d'angle, titre, plan de
 * référence mis à l'échelle.
 *
 * Cohérence lumineuse du projet : la source est toujours en haut à gauche. Les
 * ombres portées externes vont vers le bas-droite ; dans les creux et les
 * biseaux, la zone sombre est en haut-gauche et le reflet en bas-droite.
 *
 * Toutes les textures sont procédurales (motif SVG répété, dégradés CSS).
 * Aucune image bitmap n'est embarquée : le bundle reste léger, et surtout le
 * rendu reste net à n'importe quel facteur d'échelle, ce qu'une photo ne
 * permettrait pas sur une grande tablette.
 */

const CARBON_TILE = unsafeCSS(
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cdefs%3E%3ClinearGradient id='gc' x1='0' y1='0' x2='1' y2='0'%3E%3Cstop offset='0%25' stop-color='%23070707'/%3E%3Cstop offset='8%25' stop-color='%23141414'/%3E%3Cstop offset='30%25' stop-color='%23282828'/%3E%3Cstop offset='44%25' stop-color='%23333333'/%3E%3Cstop offset='66%25' stop-color='%231d1d1d'/%3E%3Cstop offset='92%25' stop-color='%230c0c0c'/%3E%3Cstop offset='100%25' stop-color='%23070707'/%3E%3C/linearGradient%3E%3ClinearGradient id='gt' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0%25' stop-color='%230b0b0b'/%3E%3Cstop offset='8%25' stop-color='%231e1e1e'/%3E%3Cstop offset='30%25' stop-color='%233d3d3d'/%3E%3Cstop offset='44%25' stop-color='%234e4e4e'/%3E%3Cstop offset='66%25' stop-color='%232c2c2c'/%3E%3Cstop offset='92%25' stop-color='%23121212'/%3E%3Cstop offset='100%25' stop-color='%230a0a0a'/%3E%3C/linearGradient%3E%3CclipPath id='cp'%3E%3Crect width='20' height='20'/%3E%3C/clipPath%3E%3C/defs%3E%3Cg clip-path='url(%23cp)'%3E%3Crect width='20' height='20' fill='%23080808'/%3E%3Crect y='0' width='20' height='10' fill='url(%23gt)'/%3E%3Crect y='10' width='20' height='10' fill='url(%23gt)'/%3E%3Cg opacity='.55'%3E%3Crect y='1' height='.55' width='20' fill='%23fff' opacity='.05'/%3E%3Crect y='2' height='.55' width='20' fill='%23000' opacity='.09'/%3E%3Crect y='3' height='.55' width='20' fill='%23fff' opacity='.05'/%3E%3Crect y='4' height='.55' width='20' fill='%23000' opacity='.09'/%3E%3Crect y='5' height='.55' width='20' fill='%23fff' opacity='.05'/%3E%3Crect y='6' height='.55' width='20' fill='%23000' opacity='.09'/%3E%3Crect y='7' height='.55' width='20' fill='%23fff' opacity='.05'/%3E%3Crect y='8' height='.55' width='20' fill='%23000' opacity='.09'/%3E%3Crect y='9' height='.55' width='20' fill='%23fff' opacity='.05'/%3E%3Crect y='10' height='.55' width='20' fill='%23000' opacity='.09'/%3E%3C/g%3E%3Crect x='1.2' y='1.2' width='10' height='10' rx='0.8' fill='%23000' opacity='.5'/%3E%3Crect x='11.2' y='11.2' width='10' height='10' rx='0.8' fill='%23000' opacity='.5'/%3E%3Crect x='0' y='0' width='10' height='10' rx='0.8' fill='url(%23gc)'/%3E%3Crect x='10' y='10' width='10' height='10' rx='0.8' fill='url(%23gc)'/%3E%3Cg opacity='.55'%3E%3Crect x='1' width='.55' height='10' fill='%23fff' opacity='.05'/%3E%3Crect x='2' width='.55' height='10' fill='%23000' opacity='.09'/%3E%3Crect x='3' width='.55' height='10' fill='%23fff' opacity='.05'/%3E%3Crect x='4' width='.55' height='10' fill='%23000' opacity='.09'/%3E%3Crect x='5' width='.55' height='10' fill='%23fff' opacity='.05'/%3E%3Crect x='6' width='.55' height='10' fill='%23000' opacity='.09'/%3E%3Crect x='7' width='.55' height='10' fill='%23fff' opacity='.05'/%3E%3Crect x='8' width='.55' height='10' fill='%23000' opacity='.09'/%3E%3Crect x='9' width='.55' height='10' fill='%23fff' opacity='.05'/%3E%3Crect x='10' width='.55' height='10' fill='%23000' opacity='.09'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
);

export const chromeStyles = css`
  :host {
    /* Rayon et ombre suivent le thème actif quand il les définit. */
    --skeuo-radius: var(--ha-card-border-radius, 16px);
    --skeuo-accent: #e2a659;
    --skeuo-label: #85888b;
    --skeuo-title: #ece8df;

    /* Densité du grain de la matière. 0.6 est le réglage retenu : la tuile de
       carbone fait alors 12 px et la mèche 6 px, assez pour que le croisement
       en damier se lise sans que le tissage prenne le pas sur les contrôles.
       Un tissage de carbone à 1 donne des mèches d'environ 2 mm sur une dalle
       de tablette, soit un 3K, le tissage réel le plus courant. Au-dessus, on
       va vers un 12K, celui des habitacles, qui se reconnaît de plus loin. En
       dessous de 0.7 le lustre de chaque mèche n'a plus assez de pixels pour se
       déployer et la matière cesse de se lire comme du tissu. À 0, il ne reste
       que la couleur de fond.
       Le graphite n'a pas de grain, la variable ne l'affecte donc pas. */
    --skeuo-texture: 0.6;

    /* Aucune police n'est embarquée dans le bundle : ce serait 30 ko de WOFF2
       pour un gain discutable, et une requête réseau si on passait par Google
       Fonts. On s'appuie sur une pile condensée disponible partout, et ces deux
       variables restent redéfinissables par l'utilisateur via card-mod ou son
       thème s'il veut installer Oswald / JetBrains Mono lui-même. */
    --skeuo-font-display: "Oswald", "Roboto Condensed", "Arial Narrow",
      var(--ha-font-family-body, Roboto), sans-serif;
    --skeuo-font-lcd: "JetBrains Mono", ui-monospace, SFMono-Regular, "DejaVu Sans Mono", Menlo,
      Consolas, monospace;

    font-family: var(--skeuo-font-display);

    /* Les vues Sections imposent une hauteur à la cellule et le ratio est alors
       ignoré, comme le veut la spec. Les vues Masonry, elles, laissent la carte
       décider : sans ce ratio, la hauteur retombe sur le min-height du module
       et le plan se retrouve écrasé dans une bande de 96 px. */
    display: block;
    aspect-ratio: ${unsafeCSS(DESIGN.width)} / ${unsafeCSS(DESIGN.height)};
  }

  .module {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 96px;
    border-radius: var(--skeuo-radius);
    overflow: hidden;
    box-shadow:
      inset 3px 3px 7px rgba(0, 0, 0, 0.75),
      inset -1px -1px 2px rgba(255, 255, 255, 0.06),
      1px 1px 0 rgba(255, 255, 255, 0.05);
    /* Isole la peinture de la carte du reste du dashboard : sans ça, chaque
       re-render d'une carte invalide une zone plus large que nécessaire. */
    contain: paint;
  }

  .mat-carbon {
    background-color: #080808;
    /* Deux couches. Le vernis est un balayage unique étalé sur toute la carte,
       surtout pas inclus dans la tuile : il s'y répéterait à chaque mèche au
       lieu de traverser la surface une seule fois. Son orientation suit la
       règle de lumière du projet, clair en haut-gauche, sombre en bas-droite. */
    background-image:
      linear-gradient(
        118deg,
        rgba(255, 255, 255, 0.1) 0%,
        rgba(255, 255, 255, 0.03) 22%,
        rgba(255, 255, 255, 0) 46%,
        rgba(0, 0, 0, 0.12) 100%
      ),
      ${CARBON_TILE};
    background-size:
      auto,
      calc(20px * var(--skeuo-texture)) calc(20px * var(--skeuo-texture));
  }

  .mat-graphite {
    background-color: #16181a;
    background-image:
      linear-gradient(160deg, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.35) 60%),
      radial-gradient(ellipse at 20% 15%, #2b2f33 0%, #16181a 55%, #0d0e10 100%);
  }

  .mat-brushed {
    background-color: #2a2c2e;
    background-image:
      repeating-linear-gradient(
        92deg,
        rgba(255, 255, 255, 0.055) 0px,
        rgba(255, 255, 255, 0.055) calc(1px * var(--skeuo-texture)),
        rgba(0, 0, 0, 0.05) calc(2px * var(--skeuo-texture)),
        rgba(0, 0, 0, 0.05) calc(3px * var(--skeuo-texture))
      ),
      linear-gradient(150deg, #3c4043 0%, #26292b 55%, #171a1c 100%);
  }

  /* Appareil éteint ou injoignable : la façade se désature entièrement, écrans
     et voyants compris. Pas d'opacity ni de voile sombre par-dessus : une carte
     translucide laisse voir le fond du tableau de bord au travers et perd son
     aspect de matière, alors qu'une façade grise reste une façade. */
  .module.off {
    filter: grayscale(1);
  }
  /* Injoignable : même désaturation, plus un assombrissement qui la fait
     reculer derrière les cartes actives et la distingue d'un simple arrêt.
     C'est une baisse de luminosité, pas un voile translucide. */
  .module.unavailable {
    filter: grayscale(1) brightness(0.62);
  }

  /* ------------------------------------------------------------- vis */

  .screw {
    position: absolute;
    z-index: 3;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: radial-gradient(circle at 34% 30%, #7d7d7d 0%, #4a4a4a 38%, #2a2a2a 72%, #151515 100%);
    box-shadow:
      inset 0 1px 1px rgba(255, 255, 255, 0.22),
      inset 0 -1px 1px rgba(0, 0, 0, 0.65),
      1px 1px 3px rgba(0, 0, 0, 0.6);
  }
  /* Empreinte cruciforme, deux barres croisées légèrement décentrées pour
     rester cohérentes avec la lumière en haut-gauche. */
  .screw::before,
  .screw::after {
    content: "";
    position: absolute;
    inset: 0;
    margin: auto;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.75), rgba(255, 255, 255, 0.14));
    border-radius: 1px;
  }
  .screw::before {
    width: 62%;
    height: 2px;
  }
  .screw::after {
    width: 2px;
    height: 62%;
  }
  .screw.tl { top: 10px; left: 10px; }
  .screw.tr { top: 10px; right: 10px; }
  .screw.bl { bottom: 10px; left: 10px; }
  .screw.br { bottom: 10px; right: 10px; }

  /* --------------------------------------------------- plan de référence */

  .stage {
    position: absolute;
    /* Centrage par translation, pas par margin:auto : quand la boîte absolue
       est plus large que son conteneur (c'est le cas ici, le plan fait 615 px
       pour une carte souvent plus étroite), la spec impose margin-left:0 en
       LTR au lieu de répartir la marge négative, et le plan se retrouve décalé
       vers la droite.
       L'ordre scale() puis translate() est obligatoire : les pourcentages du
       translate se résolvent sur la boîte non transformée, il faut donc que le
       scale s'applique après pour que le décalage suive le facteur. */
    left: 50%;
    top: 50%;
    transform-origin: 0 0;
    display: flex;
    flex-direction: column;
    padding: 24px 26px 26px;
    box-sizing: border-box;
  }

  .head {
    flex: none;
    border-radius: 6px;
    outline: none;
  }
  .head.interactive {
    cursor: pointer;
  }
  .head.interactive:focus-visible {
    box-shadow: 0 0 0 2px var(--skeuo-accent);
  }

  .title {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--skeuo-title);
    text-shadow: -1px -1px 1px rgba(0, 0, 0, 0.7);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .subtitle {
    margin: 3px 0 0;
    font-size: 14px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #8d9093;
    text-shadow: -1px -1px 1px rgba(0, 0, 0, 0.7);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .body {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    margin: 12px -26px 0;
    min-height: 0;
  }

  /* --------------------------------------------------- états dégradés */

  .skeleton {
    width: 100%;
    height: 100%;
    border-radius: 12px;
    background: linear-gradient(100deg, #191919 30%, #202020 50%, #191919 70%);
    background-size: 200% 100%;
    animation: skeleton 1.4s ease-in-out infinite;
  }

  @keyframes skeleton {
    from { background-position: 150% 0; }
    to { background-position: -50% 0; }
  }

  .notice {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    text-align: center;
    padding: 0 26px;
  }
  .notice-message {
    margin: 0;
    font-size: 17px;
    letter-spacing: 1px;
    color: #d8985c;
  }
  .notice-entity {
    margin: 0;
    font-family: var(--skeuo-font-lcd);
    font-size: 14px;
    color: #7d8083;
    word-break: break-all;
  }

  /* Le frontend force cette durée à 1ms quand l'utilisateur a demandé moins
     d'animations ; on suit la même règle pour nos propres transitions. */
  @media (prefers-reduced-motion: reduce) {
    .skeleton {
      animation: none;
    }
    * {
      transition-duration: 1ms !important;
      animation-duration: 1ms !important;
    }
  }
`;
