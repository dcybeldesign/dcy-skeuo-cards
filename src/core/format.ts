/**
 * Mise en forme des valeurs d'écran.
 *
 * La règle du projet interdit toute troncature : quand un relevé est trop long
 * pour l'écran, c'est la taille du texte qui cède, jamais le texte lui-même.
 */

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
