/**
 * Point d'entrée du pack.
 *
 * Un seul fichier est produit à la compilation : HACS enregistre une resource
 * unique, et un import() dynamique se retrouverait dans un chunk séparé que
 * le navigateur irait chercher à un chemin qui n'existe pas côté HACS.
 */

import "./cards/light-card";
import "./cards/climate-card";
import "./cards/cover-card";
import "./cards/sensor-card";
import "./cards/switch-card";
import "./cards/lock-card";
import "./cards/fan-card";
import "./cards/water-heater-card";
import "./cards/vacuum-card";
import "./cards/alarm-card";
import "./cards/weather-card";
import "./cards/forecast-card";
import "./cards/media-card";
import "./cards/camera-card";

declare const __CARD_VERSION__: string;

// Le numéro de version en console règle l'essentiel des tickets « ça ne marche
// plus depuis la mise à jour » : on sait immédiatement quelle build tourne.
console.info(
  `%c  SKEUO-CARDS  %c  v${__CARD_VERSION__}  `,
  "color:#141414; font-weight:700; background:#e2a659",
  "color:#e2a659; font-weight:700; background:#141414"
);

export { SkeuoLightCard } from "./cards/light-card";
export { SkeuoClimateCard } from "./cards/climate-card";
export { SkeuoCoverCard } from "./cards/cover-card";
export { SkeuoSensorCard } from "./cards/sensor-card";
export { SkeuoSwitchCard } from "./cards/switch-card";
export { SkeuoLockCard } from "./cards/lock-card";
export { SkeuoFanCard } from "./cards/fan-card";
export { SkeuoWaterHeaterCard } from "./cards/water-heater-card";
export { SkeuoVacuumCard } from "./cards/vacuum-card";
export { SkeuoAlarmCard } from "./cards/alarm-card";
export { SkeuoWeatherCard } from "./cards/weather-card";
export { SkeuoForecastCard } from "./cards/forecast-card";
export { SkeuoMediaCard } from "./cards/media-card";
export { SkeuoCameraCard } from "./cards/camera-card";
