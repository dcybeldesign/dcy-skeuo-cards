/** Déclaration des cartes auprès du sélecteur de Home Assistant. */

import { isFrench } from "./localize";

/** Texte du sélecteur, dans les deux langues du pack. */
export interface LocalisedText {
  fr: string;
  en: string;
}

export interface CustomCardEntry {
  type: string;
  name: LocalisedText;
  description?: LocalisedText;
  preview?: boolean;
}

/** Ce que Home Assistant lit réellement : des chaînes déjà résolues. */
interface ResolvedCardEntry {
  type: string;
  name: string;
  description?: string;
  preview?: boolean;
  documentationURL?: string;
}

declare global {
  interface Window {
    customCards?: ResolvedCardEntry[];
  }
}

const DOCS = "https://github.com/dcybeldesign/dcy-skeuo-cards";

/**
 * Le sélecteur de cartes est peuplé au chargement du module, bien avant que
 * `hass` n'existe : la langue se déduit donc du navigateur, comme le fait déjà
 * l'éditeur de carte. Sans ça, un utilisateur anglophone ouvre le sélecteur et
 * tombe sur quatorze intitulés en français.
 */
export const registerCard = (entry: CustomCardEntry): void => {
  window.customCards = window.customCards ?? [];
  if (window.customCards.some((c) => c.type === entry.type)) return;
  const fr = isFrench();
  window.customCards.push({
    documentationURL: DOCS,
    type: entry.type,
    preview: entry.preview,
    name: fr ? entry.name.fr : entry.name.en,
    description: entry.description ? (fr ? entry.description.fr : entry.description.en) : undefined,
  });
};

/**
 * Champs communs à toutes les cartes du pack, repris tels quels dans chaque
 * getConfigForm(). Les sélecteurs sont ceux des blueprints, donc l'éditeur a
 * exactement l'aspect des cartes natives.
 */
/**
 * Libellés de l'éditeur de carte.
 *
 * Sans eux, Home Assistant cherche une traduction native pour chaque clé et
 * n'en trouve pas pour celles qui nous sont propres : l'utilisateur se retrouve
 * devant des champs nommés « subtitle » ou « texture ». L'éditeur n'ayant pas
 * accès à `hass`, la langue est déduite du navigateur.
 */
const LABELS_FR: Record<string, string> = {
  entity: "Entité",
  name: "Titre",
  subtitle: "Sous-titre",
  material: "Matière",
  accent: "Couleur d'accent",
  screws: "Vis d'angle",
  texture: "Densité du grain",
  tap_action: "Appui",
  hold_action: "Appui long",
  double_tap_action: "Double appui",
  show_color_temp: "Fader de teinte",
  show_color: "Fader de couleur",
  modes: "Modes affichés",
  min: "Minimum de l'échelle",
  max: "Maximum de l'échelle",
  warn: "Seuil orange",
  danger: "Seuil rouge",
  power_entity: "Entité de puissance",
  days: "Jours affichés",
  refresh: "Rafraîchissement",
  record_filename: "Fichier d'enregistrement",
  record_duration: "Durée d'enregistrement",
  energy_entity: "Entité d'énergie",
};

const LABELS_EN: Record<string, string> = {
  entity: "Entity",
  name: "Title",
  subtitle: "Subtitle",
  material: "Material",
  accent: "Accent colour",
  screws: "Corner screws",
  texture: "Grain density",
  tap_action: "Tap",
  hold_action: "Hold",
  double_tap_action: "Double tap",
  show_color_temp: "Warmth fader",
  show_color: "Colour fader",
  modes: "Displayed modes",
  min: "Scale minimum",
  max: "Scale maximum",
  warn: "Amber threshold",
  danger: "Red threshold",
  power_entity: "Power entity",
  days: "Days shown",
  refresh: "Refresh",
  record_filename: "Recording file",
  record_duration: "Recording length",
  energy_entity: "Energy entity",
};

const HELPERS_FR: Record<string, string> = {
  accent: "Couleur des écrans et des arcs, en hexadécimal",
  texture: "100 % = réglage d'origine. Sans effet sur le graphite, qui n'a pas de grain.",
  warn: "Fraction de l'échelle, entre 0 et 1",
  danger: "Fraction de l'échelle, entre 0 et 1",
  power_entity: "Capteur de puissance instantanée de la prise, optionnel",
  energy_entity: "Compteur d'énergie de la prise, optionnel",
  modes: "Vide = les modes que l'entité déclare elle-même",
  days: "De 3 à 7. La carte s'adapte au nombre de jours réellement reçus.",
  refresh: "Intervalle entre deux images. 0 fige l'aperçu.",
  record_filename: "Chemin complet attendu par le service `camera.record`. Sans lui, le bouton reste inerte.",
};

const HELPERS_EN: Record<string, string> = {
  accent: "Colour of the screens and arcs, in hexadecimal",
  texture: "100% is the original setting. No effect on graphite, which has no grain.",
  warn: "Fraction of the scale, between 0 and 1",
  danger: "Fraction of the scale, between 0 and 1",
  power_entity: "Instant power sensor for the plug, optional",
  energy_entity: "Energy meter for the plug, optional",
  modes: "Empty means the modes the entity declares itself",
  days: "From 3 to 7. The card adapts to the number of days actually received.",
  refresh: "Delay between two frames. 0 freezes the preview.",
  record_filename: "Full path expected by the `camera.record` service. Without it the button stays inert.",
};

export const computeLabel = (schema: { name: string }): string | undefined =>
  (isFrench() ? LABELS_FR : LABELS_EN)[schema.name];

export const computeHelper = (schema: { name: string }): string | undefined =>
  (isFrench() ? HELPERS_FR : HELPERS_EN)[schema.name];

export const baseSchema = () => [
  { name: "entity", required: true, selector: { entity: {} } },
  {
    type: "grid",
    name: "",
    schema: [
      { name: "name", selector: { text: {} } },
      { name: "subtitle", selector: { text: {} } },
    ],
  },
  {
    type: "grid",
    name: "",
    schema: [
      {
        name: "material",
        selector: {
          select: {
            mode: "dropdown",
            options: isFrench()
              ? [
                  { value: "carbon", label: "Carbone" },
                  { value: "graphite", label: "Graphite" },
                  { value: "brushed", label: "Métal brossé" },
                ]
              : [
                  { value: "carbon", label: "Carbon fibre" },
                  { value: "graphite", label: "Graphite" },
                  { value: "brushed", label: "Brushed metal" },
                ],
          },
        },
      },
      { name: "accent", selector: { text: {} } },
      { name: "screws", selector: { boolean: {} } },
    ],
  },
  {
    type: "grid",
    name: "",
    schema: [
      {
        name: "texture",
        selector: {
          number: { min: 0, max: 150, step: 10, mode: "slider", unit_of_measurement: "%" },
        },
      },
    ],
  },
  {
    type: "expandable",
    name: "",
    title: "Actions",
    schema: [
      { name: "tap_action", selector: { ui_action: {} } },
      { name: "hold_action", selector: { ui_action: {} } },
      { name: "double_tap_action", selector: { ui_action: {} } },
    ],
  },
];
