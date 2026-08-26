/**
 * Jour ou nuit, d'après l'entité `sun.sun`.
 *
 * Le domaine weather ne dit rien de l'heure : `partlycloudy` est le même état à
 * trois heures du matin qu'à midi. Home Assistant tranche la question avec le
 * soleil, pas avec la météo, et c'est la même source qui est lue ici.
 */

import type { HomeAssistant } from "./ha";

const DAY = 86_400_000;
/**
 * Au-delà, on ne prolonge plus le cycle. Sous les latitudes polaires le soleil
 * peut rester des semaines du même côté de l'horizon : répéter le lever et le
 * coucher de vingt-quatre heures en vingt-quatre heures y donnerait une
 * alternance imaginaire.
 */
const HORIZON = 26 * 3600_000;

/**
 * Fait-il nuit, maintenant ou à un instant donné ?
 *
 * Renvoie undefined quand `sun.sun` est absent, ce qui arrive sur une
 * installation où l'intégration soleil a été retirée : les cartes gardent alors
 * leur icône de jour plutôt que de deviner.
 */
export const isNight = (hass: HomeAssistant | undefined, when?: Date): boolean | undefined => {
  const sun = hass?.states["sun.sun"];
  if (!sun) return undefined;

  const now = sun.state === "below_horizon";
  if (!when) return now;

  const rising = Date.parse(sun.attributes.next_rising as string);
  const setting = Date.parse(sun.attributes.next_setting as string);
  if (!Number.isFinite(rising) || !Number.isFinite(setting)) return now;

  const target = when.getTime();
  const reference = Math.min(rising, setting);
  if (target <= reference) return now;
  if (rising - reference > HORIZON || setting - reference > HORIZON) return now;

  // Les deux transitions se répètent d'un jour sur l'autre. On les parcourt
  // dans l'ordre jusqu'à la cible, chacune renversant l'état.
  const events: Array<[number, boolean]> = [];
  for (let k = 0; k * DAY <= target - reference + DAY; k++) {
    if (k > 10) break;
    events.push([rising + k * DAY, false], [setting + k * DAY, true]);
  }
  events.sort((a, b) => a[0] - b[0]);

  let night = now;
  for (const [at, nightAfter] of events) {
    if (at > target) break;
    night = nightAfter;
  }
  return night;
};
