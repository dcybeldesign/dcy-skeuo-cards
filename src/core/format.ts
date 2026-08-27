/**
 * Mise en forme des valeurs d'écran.
 *
 * La règle du projet interdit toute troncature : quand un relevé est trop long
 * pour l'écran, c'est la taille du texte qui cède, jamais le texte lui-même.
 *
 * Les nombres passent par Home Assistant chaque fois qu'il sait les mettre en
 * forme lui-même. Il connaît la précision d'affichage de chaque entité, réglée
 * à la main dans les options ou proposée par l'intégration selon la classe
 * d'appareil, ainsi que le séparateur décimal choisi par l'utilisateur. Écrire
 * notre propre table donnerait une carte qui affiche 21.3333 là où le reste du
 * tableau affiche 21,3.
 */

import type { HassEntity, HomeAssistant } from "./ha";

/** Le frontend sépare la valeur de son unité par une espace insécable. */
export const NBSP = " ";

/** Précision retenue par Home Assistant, réglage manuel prioritaire. */
const entityPrecision = (
  hass: HomeAssistant | undefined,
  stateObj: HassEntity
): number | undefined => {
  const set = hass?.entities?.[stateObj.entity_id]?.display_precision;
  if (typeof set === "number") return set;
  const suggested = stateObj.attributes.suggested_display_precision;
  return typeof suggested === "number" ? suggested : undefined;
};

/**
 * Repli quand le frontend n'expose pas ses helpers, sur une très vieille
 * version ou sur le banc de test. Couvre la langue mais pas le réglage de
 * format numérique, que seul Home Assistant connaît vraiment.
 */
const localNumber = (
  hass: HomeAssistant | undefined,
  value: number,
  precision?: number
): string => {
  const language = hass?.locale?.language ?? hass?.language;
  const options: Intl.NumberFormatOptions =
    precision === undefined
      ? { maximumFractionDigits: 2 }
      : { minimumFractionDigits: precision, maximumFractionDigits: precision };
  try {
    return new Intl.NumberFormat(language, options).format(value);
  } catch {
    return precision === undefined ? String(value) : value.toFixed(precision);
  }
};

/** Valeur d'attribut, même traitement que l'état. */
export const formatAttribute = (
  hass: HomeAssistant | undefined,
  stateObj: HassEntity,
  attribute: string,
  unit?: string
): string => {
  const done = hass?.formatEntityAttributeValue?.(stateObj, attribute);
  if (done) return done;
  const value = Number(stateObj.attributes[attribute]);
  if (!Number.isFinite(value)) return "";
  return withUnit(localNumber(hass, value, entityPrecision(hass, stateObj)), unit);
};

/**
 * Nombre qui n'appartient à aucune entité, typiquement une température de
 * prévision. Aucune précision n'est publiée pour ces valeurs, on garde donc la
 * règle d'écran du pack, une décimale au plus.
 */
export const formatLooseNumber = (
  hass: HomeAssistant | undefined,
  value: number,
  unit?: string
): string => {
  const rounded = Math.abs(value) >= 100 ? Math.round(value) : Math.round(value * 10) / 10;
  return withUnit(localNumber(hass, rounded), unit);
};

/**
 * Valeur locale en cours de réglage, à précision imposée. Une consigne que
 * l'utilisateur est en train de déplacer n'appartient pas encore à l'entité,
 * Home Assistant ne peut donc pas la mettre en forme. Le nombre de décimales
 * vient du pas de réglage, le séparateur reste celui de l'utilisateur.
 */
export const formatFixed = (
  hass: HomeAssistant | undefined,
  value: number,
  decimals: number,
  unit?: string
): string => withUnit(localNumber(hass, value, decimals), unit);

/** Colle l'unité à la valeur avec l'espace insécable du frontend. */
export const withUnit = (text: string, unit?: string): string =>
  unit ? `${text}${NBSP}${unit}` : text;

/** Taille de référence d'une valeur d'écran, en unités de design. */
export const VALUE_SIZE = 44.1;

/**
 * Taille qui laisse le texte tenir dans un écran de largeur standard.
 *
 * Les paliers sont mesurés sur la fonte LCD du pack, à 190 px de large moins
 * ses marges internes. Un palier plutôt qu'un calcul continu : trois relevés
 * voisins qui s'afficheraient à 41, 40 et 39 px donneraient un texte qui
 * respire à chaque rafraîchissement.
 */
export const fitValueSize = (text: string): number => {
  const length = text.length;
  if (length <= 5) return VALUE_SIZE;
  if (length <= 7) return 36;
  if (length <= 9) return 29;
  if (length <= 12) return 24;
  return 19;
};

/**
 * Nombre lisible sur un écran : au plus une décimale, et pas de décimale du
 * tout au-delà de la centaine, où elle n'apporte rien et vole de la place.
 */
export const trimNumber = (value: number): string => {
  const rounded = Math.abs(value) >= 100 ? Math.round(value) : Math.round(value * 10) / 10;
  return String(rounded);
};

/** Heure locale d'un horodatage d'entité, sans la date. */
export const shortTime = (iso: string | undefined, language: string): string => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString(language, { hour: "2-digit", minute: "2-digit" });
};
