import { html, css, type TemplateResult, type CSSResultGroup } from "lit";
import { customElement } from "lit/decorators.js";

import { DEFAULT_TEXTURE, SkeuoBaseCard, type SkeuoBaseConfig } from "../core/base-card";
import { type HassEntity, computeEntityName, isUnavailable, numericState } from "../core/ha";
import { formatState } from "../core/localize";
import { baseSchema, computeHelper, computeLabel, registerCard } from "../core/register";

import "../components/screen";
import "../components/vu-meter";

interface SensorCardConfig extends SkeuoBaseConfig {
  min?: number;
  max?: number;
  /** Fin de zone verte et fin de zone jaune, en fraction de l'échelle. */
  warn?: number;
  danger?: number;
}

/**
 * Échelles par défaut selon la device_class. Elles évitent à l'utilisateur de
 * saisir min et max à la main dans le cas courant, tout en restant écrasables
 * depuis la configuration.
 */
const RANGES: Record<string, { min: number; max: number; warn?: number; danger?: number }> = {
  humidity: { min: 0, max: 100, warn: 0.6, danger: 0.75 },
  temperature: { min: -10, max: 40, warn: 0.7, danger: 0.85 },
  pressure: { min: 950, max: 1050 },
  atmospheric_pressure: { min: 950, max: 1050 },
  battery: { min: 0, max: 100, warn: 0.3, danger: 0.15 },
  carbon_dioxide: { min: 400, max: 2000, warn: 0.35, danger: 0.6 },
  illuminance: { min: 0, max: 1000 },
  power: { min: 0, max: 3000, warn: 0.6, danger: 0.85 },
  pm25: { min: 0, max: 100, warn: 0.25, danger: 0.5 },
  volatile_organic_compounds: { min: 0, max: 1000, warn: 0.3, danger: 0.6 },
};

@customElement("skeuo-sensor-card")
export class SkeuoSensorCard extends SkeuoBaseCard<SensorCardConfig> {
  protected override validateConfig(config: SensorCardConfig): void {
    this.expectDomain(config, "sensor", "number", "input_number");
  }

  public static getConfigForm() {
    return {
      schema: [
        ...baseSchema(),
        {
          type: "grid",
          name: "",
          schema: [
            { name: "min", selector: { number: { mode: "box", step: "any" } } },
            { name: "max", selector: { number: { mode: "box", step: "any" } } },
          ],
        },
        {
          type: "grid",
          name: "",
          schema: [
            { name: "warn", selector: { number: { min: 0, max: 1, step: 0.05, mode: "box" } } },
            { name: "danger", selector: { number: { min: 0, max: 1, step: 0.05, mode: "box" } } },
          ],
        },
      ],
      computeLabel,
      computeHelper,
    };
  }

  public static getStubConfig(
    _hass: unknown,
    entities: string[],
    entitiesFallback: string[]
  ): Partial<SensorCardConfig> {
    const pick =
      entities.find((e) => e.startsWith("sensor.")) ??
      entitiesFallback.find((e) => e.startsWith("sensor.")) ??
      "sensor.humidity";
    return { entity: pick, texture: DEFAULT_TEXTURE };
  }

  private _range(stateObj: HassEntity) {
    const deviceClass = stateObj.attributes.device_class as string | undefined;
    const preset = (deviceClass ? RANGES[deviceClass] : undefined) ?? { min: 0, max: 100 };
    return {
      min: this._config?.min ?? preset.min,
      max: this._config?.max ?? preset.max,
      warn: this._config?.warn ?? preset.warn ?? 0.6,
      danger: this._config?.danger ?? preset.danger ?? 0.85,
    };
  }

  protected renderContent(stateObj: HassEntity): TemplateResult {
    const dead = isUnavailable(stateObj);
    const value = numericState(stateObj.state);
    const { min, max, warn, danger } = this._range(stateObj);

    // L'unité est toujours lue sur l'entité, jamais écrite en dur : elle suit
    // le système d'unités de l'utilisateur sans traduction de notre part.
    const unit = (stateObj.attributes.unit_of_measurement as string | undefined) ?? "";
    const name = computeEntityName(stateObj);

    return html`
      <skeuo-vu-meter
        .value=${value ?? min}
        .min=${min}
        .max=${max}
        .warn=${warn}
        .danger=${danger}
        .unit=${unit}
        .label=${`${name} : ${formatState(this.hass, stateObj)}`}
      ></skeuo-vu-meter>

      <skeuo-screen
        .value=${dead || value === undefined ? "—" : `${value}${unit}`}
        .label=${name}
        .valueSize=${this._valueSize(value, unit)}
        .color=${dead ? "#6b5a44" : this.accent}
      ></skeuo-screen>
    `;
  }

  /**
   * On réduit la taille plutôt que de laisser un long relevé déborder du
   * cadre : la règle du projet interdit toute troncature de texte.
   */
  private _valueSize(value: number | undefined, unit: string): number {
    const length = `${value ?? "—"}${unit}`.length;
    if (length <= 5) return 44.1;
    if (length <= 7) return 36;
    if (length <= 9) return 29;
    return 24;
  }

  static override styles: CSSResultGroup = [
    SkeuoBaseCard.styles,
    css`
      .body {
        gap: 12px;
      }
    `,
  ];
}

registerCard({
  type: "skeuo-sensor-card",
  name: { fr: "Skeuo · Capteur", en: "Skeuo · Sensor" },
  description: {
    fr: "Cadran à aiguille avec zones de seuil et écran de relevé.",
    en: "Needle dial with threshold zones and a reading screen.",
  },
  preview: true,
});

declare global {
  interface HTMLElementTagNameMap {
    "skeuo-sensor-card": SkeuoSensorCard;
  }
}
