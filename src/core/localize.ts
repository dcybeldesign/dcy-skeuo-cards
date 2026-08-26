/**
 * Traductions.
 *
 * Règle du projet : on ne duplique une traduction maison que pour les
 * formulations propres à ce design. Tout ce que Home Assistant sait déjà dire
 * passe par hass.localize, et les unités viennent toujours de
 * unit_of_measurement sur l'entité.
 *
 * hass.localize renvoie une chaîne vide quand la clé n'existe pas (ou la clé
 * elle-même selon les versions), d'où le repli systématique sur le dictionnaire
 * local : une clé HA renommée dégrade en texte correct au lieu d'afficher
 * ui.card.light.brightness à l'écran.
 */

import type { HomeAssistant } from "./ha";

type Dict = Record<string, string>;

const FR: Dict = {
  brightness: "Intensité",
  color_temp: "Teinte",
  color: "Couleur",
  on: "Allumé",
  off: "Éteint",
  position: "Position",
  opening: "Ouverture",
  open: "Ouvrir",
  close: "Fermer",
  stop: "Stop",
  closed: "Fermé",
  opened: "Ouvert",
  setpoint: "Consigne",
  current: "Actuelle",
  power: "Marche",
  increase: "Augmenter",
  decrease: "Diminuer",
  heat: "Chaud",
  cool: "Froid",
  fan_only: "Vent.",
  auto: "Auto",
  dry: "Sec",
  heat_cool: "Auto",
  unavailable: "Indisponible",
  unknown: "Inconnu",
  entity_not_found: "Entité introuvable",
  starting: "Démarrage de Home Assistant",
  no_entity: "Aucune entité configurée",
  speed: "Vitesse",
  oscillate: "Oscill.",
  direction: "Sens",
  lock: "Verrou",
  latch: "Loquet",
  last_access: "Dernier accès",
  clean: "Nettoyage",
  dock: "Retour base",
  battery: "Batterie",
  arm_home: "Maison",
  arm_away: "Absence",
  arm_night: "Nuit",
  disarm: "Désarmé",
  eco: "Éco",
  performance: "Perf.",
  water: "Eau chaude",
  today: "Aujourd'hui",
  power_draw: "Puissance",
  code_required: "Code requis",
  forecast_unavailable: "Prévisions indisponibles",
  volume: "Volume",
  previous: "Précédent",
  play: "Lecture",
  pause: "Pause",
  next: "Suivant",
  preview: "Aperçu",
  motion: "Détection",
  record: "Enreg.",
  live: "Direct",
  paused_preview: "Figé",
  open_stream: "Ouvrir le direct",
};

const EN: Dict = {
  brightness: "Brightness",
  color_temp: "Warmth",
  color: "Color",
  on: "On",
  off: "Off",
  position: "Position",
  opening: "Opening",
  open: "Open",
  close: "Close",
  stop: "Stop",
  closed: "Closed",
  opened: "Open",
  setpoint: "Target",
  current: "Current",
  power: "Power",
  increase: "Increase",
  decrease: "Decrease",
  heat: "Heat",
  cool: "Cool",
  fan_only: "Fan",
  auto: "Auto",
  dry: "Dry",
  heat_cool: "Auto",
  unavailable: "Unavailable",
  unknown: "Unknown",
  entity_not_found: "Entity not found",
  starting: "Home Assistant is starting",
  no_entity: "No entity configured",
  speed: "Speed",
  oscillate: "Swing",
  direction: "Direction",
  lock: "Lock",
  latch: "Latch",
  last_access: "Last access",
  clean: "Cleaning",
  dock: "Dock",
  battery: "Battery",
  arm_home: "Home",
  arm_away: "Away",
  arm_night: "Night",
  disarm: "Disarmed",
  eco: "Eco",
  performance: "Boost",
  water: "Hot water",
  today: "Today",
  power_draw: "Power",
  code_required: "Code required",
  forecast_unavailable: "Forecast unavailable",
  volume: "Volume",
  previous: "Previous",
  play: "Play",
  pause: "Pause",
  next: "Next",
  preview: "Preview",
  motion: "Motion",
  record: "Record",
  live: "Live",
  paused_preview: "Frozen",
  open_stream: "Open live view",
};

export const isFrench = (hass?: HomeAssistant): boolean => {
  const lang = hass?.locale?.language ?? hass?.language ?? navigator.language ?? "en";
  return lang.toLowerCase().startsWith("fr");
};

/** Libellé propre à ce design, sans équivalent dans Home Assistant. */
export const t = (hass: HomeAssistant | undefined, key: string): string => {
  const dict = isFrench(hass) ? FR : EN;
  return dict[key] ?? EN[key] ?? key;
};

/**
 * Libellé générique : on tente d'abord la traduction native de Home Assistant
 * (déjà disponible dans plus de soixante langues), on retombe sur le
 * dictionnaire local si la clé n'existe plus.
 */
export const tHa = (hass: HomeAssistant | undefined, haKey: string, fallbackKey: string): string => {
  if (hass?.localize) {
    const value = hass.localize(haKey);
    if (value && value !== haKey) return value;
  }
  return t(hass, fallbackKey);
};

/**
 * État d'entité affichable. formatEntityState est fourni par le frontend
 * depuis 2024 et gère les device_class, les unités et la locale.
 */
export const formatState = (
  hass: HomeAssistant | undefined,
  stateObj: { entity_id: string; state: string; attributes: Record<string, unknown> } | undefined
): string => {
  if (!hass || !stateObj) return "";
  if (hass.formatEntityState) {
    try {
      return hass.formatEntityState(stateObj as never);
    } catch {
      /* on retombe plus bas */
    }
  }
  const domain = stateObj.entity_id.split(".")[0];
  const key = `component.${domain}.entity_component._.state.${stateObj.state}`;
  const translated = hass.localize(key);
  return translated && translated !== key ? translated : stateObj.state;
};

/**
 * Messages d'erreur de configuration.
 *
 * Ils remontent tels quels dans l'éditeur de carte et dans le rendu d'erreur du
 * tableau de bord, donc ils se traduisent. Ceux qui partent d'un `assertConfig`
 * n'ont pas accès à `hass`, la langue vient alors du navigateur.
 */
export const domainRequired = (domain: string, hass?: HomeAssistant): string =>
  isFrench(hass)
    ? `\`entity\` doit être une entité du domaine \`${domain}\`.`
    : `\`entity\` must be an entity from the \`${domain}\` domain.`;

export const wrongDomain = (
  entityId: string,
  domains: string[],
  hass?: HomeAssistant
): string =>
  isFrench(hass)
    ? `\`${entityId}\` n'est pas utilisable ici (domaines acceptés : ${domains.join(", ")})`
    : `\`${entityId}\` cannot be used here (accepted domains: ${domains.join(", ")})`;
