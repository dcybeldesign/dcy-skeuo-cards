import {
  html,
  css,
  type PropertyValues,
  type TemplateResult,
  type CSSResultGroup,
} from "lit";
import { customElement } from "lit/decorators.js";

import { DEFAULT_TEXTURE, SkeuoBaseCard, type SkeuoBaseConfig } from "../core/base-card";
import { type HassEntity, isUnavailable, numericState } from "../core/ha";
import { fitValueSize } from "../core/format";
import { domainRequired, t, tHa } from "../core/localize";
import { baseSchema, computeHelper, computeLabel, registerCard } from "../core/register";
import { SmoothValue } from "../core/smooth";
import { iconDroplet, iconFlame, iconPower } from "../components/icons";

import "../components/screen";
import "../components/fader";
import "../components/button";

interface WaterHeaterCardConfig extends SkeuoBaseConfig {
  /** Modes affichés en boutons. Par défaut, ceux que l'entité déclare. */
  modes?: string[];
}

/**
 * Icônes des modes de fonctionnement.
 *
 * Les intégrations ne nomment pas leurs modes de la même façon : eco et
 * performance sont les deux seuls noms normalisés du domaine, le reste dépend
 * du fabricant. Tout ce qui n'est pas reconnu prend la flamme, qui reste juste
 * pour un mode de chauffe quelconque.
 */
const MODE_ICONS: Record<string, () => unknown> = {
  eco: iconDroplet,
  off: iconPower,
};

const MODE_KEYS: Record<string, string> = {
  eco: "eco",
  performance: "performance",
  high_demand: "performance",
  off: "off",
};

@customElement("skeuo-water-heater-card")
export class SkeuoWaterHeaterCard extends SkeuoBaseCard<WaterHeaterCardConfig> {
  /**
   * Consigne affichée, lissée. Même échelle que le thermostat, des degrés et
   * non des pourcentages, d'où le seuil et la vitesse repris de cette carte.
   */
  private _setpoint = new SmoothValue(this, {
    epsilon: 0.02,
    minDuration: 260,
    maxDuration: 700,
    msPerUnit: 26,
  });

  protected override validateConfig(config: WaterHeaterCardConfig): void {
    this.expectDomain(config, "water_heater");
  }

  protected override isOff(stateObj: HassEntity): boolean {
    return stateObj.state === "off";
  }

  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate?.(changed);
    const stateObj = this.stateObj;
    const target = stateObj ? numericState(stateObj.attributes.temperature) : undefined;
    if (target !== undefined) this._setpoint.set(target);
  }

  public static getConfigForm() {
    return {
      schema: baseSchema(),
      computeLabel,
      computeHelper,
      assertConfig: (config: WaterHeaterCardConfig) => {
        if (config.entity && !config.entity.startsWith("water_heater.")) {
          throw new Error(domainRequired("water_heater"));
        }
      },
    };
  }

  public static getStubConfig(
    _hass: unknown,
    entities: string[],
    entitiesFallback: string[]
  ): Partial<WaterHeaterCardConfig> {
    const pick =
      entities.find((e) => e.startsWith("water_heater.")) ??
      entitiesFallback.find((e) => e.startsWith("water_heater.")) ??
      "water_heater.tank";
    return { entity: pick, texture: DEFAULT_TEXTURE };
  }

  /* ------------------------------------------------------------- lecture */

  private get _unit(): string {
    return this.hass?.config?.unit_system?.temperature ?? "°C";
  }

  private _bounds(stateObj: HassEntity) {
    return {
      min: numericState(stateObj.attributes.min_temp) ?? 30,
      max: numericState(stateObj.attributes.max_temp) ?? 65,
      step: numericState(stateObj.attributes.target_temp_step) ?? 1,
    };
  }

  /**
   * Trois boutons est ce que la colonne peut porter. On garde les deux
   * premiers modes de chauffe et on réserve la dernière place à l'arrêt, qui
   * doit rester atteignable quelle que soit la longueur de la liste.
   */
  private _modes(stateObj: HassEntity): string[] {
    const declared = this._config?.modes;
    if (declared) return declared.slice(0, 3);

    const list = (stateObj.attributes.operation_list as string[] | undefined) ?? [];
    const heating = list.filter((m) => m !== "off").slice(0, 2);
    return list.includes("off") ? [...heating, "off"] : heating.slice(0, 3);
  }

  private _modeLabel(mode: string): string {
    const key = MODE_KEYS[mode];
    if (key) return t(this.hass, key);
    return tHa(this.hass, `component.water_heater.entity_component._.state.${mode}`, mode);
  }

  /* ------------------------------------------------------------- actions */

  private _onFaderChange(ev: CustomEvent): void {
    this._setpoint.set(ev.detail.value, true);
    this.callService("water_heater", "set_temperature", { temperature: ev.detail.value });
  }

  private _setMode(mode: string): void {
    this.callService("water_heater", "set_operation_mode", { operation_mode: mode });
  }

  /* --------------------------------------------------------------- rendu */

  protected renderContent(stateObj: HassEntity): TemplateResult {
    const dead = isUnavailable(stateObj);
    const isOff = stateObj.state === "off";
    const { min, max, step } = this._bounds(stateObj);
    const target = numericState(stateObj.attributes.temperature);
    const current = numericState(stateObj.attributes.current_temperature);

    // L'écran montre la température réelle du ballon quand l'appareil la
    // remonte. Beaucoup de chauffe-eau ne la publient pas : la consigne prend
    // alors sa place, avec sa propre légende. Elle fait doublon avec le fader,
    // mais un fader se lit à quelques degrés près et un écran au demi-degré,
    // ce qui est exactement la répartition d'un panneau de commande réel.
    const showsCurrent = current !== undefined;
    const shown = showsCurrent ? current : this._setpoint.value;
    const decimals = step < 1 ? 1 : 0;
    const text = target === undefined && !showsCurrent ? "—" : `${shown.toFixed(decimals)}${this._unit}`;

    return html`
      <skeuo-fader
        gradient="warmth"
        .value=${this._setpoint.value}
        .min=${min}
        .max=${max}
        .step=${step}
        .disabled=${dead || target === undefined}
        .inactive=${isOff}
        .caption=${t(this.hass, "setpoint")}
        .label=${t(this.hass, "setpoint")}
        @fader-change=${this._onFaderChange}
      ></skeuo-fader>

      <skeuo-screen
        .value=${text}
        .label=${showsCurrent ? t(this.hass, "water") : t(this.hass, "setpoint")}
        .valueSize=${fitValueSize(text)}
        .color=${dead || isOff ? "#6b5a44" : this.accent}
      ></skeuo-screen>

      <div class="btn-col">
        ${this._modes(stateObj).map((mode) => {
          const icon = MODE_ICONS[mode] ?? iconFlame;
          return html`
            <skeuo-button
              .active=${stateObj.state === mode}
              .disabled=${dead}
              .caption=${this._modeLabel(mode)}
              @press=${() => this._setMode(mode)}
              >${icon()}</skeuo-button
            >
          `;
        })}
      </div>
    `;
  }

  static override styles: CSSResultGroup = [
    SkeuoBaseCard.styles,
    css`
      .btn-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
      }
      .body {
        padding: 0 24px;
      }
    `,
  ];
}

registerCard({
  type: "skeuo-water-heater-card",
  name: { fr: "Skeuo · Chauffe-eau", en: "Skeuo · Water heater" },
  description: {
    fr: "Fader de consigne, écran de température et boutons de mode de chauffe.",
    en: "Setpoint fader, temperature screen and heating mode buttons.",
  },
  preview: true,
});

declare global {
  interface HTMLElementTagNameMap {
    "skeuo-water-heater-card": SkeuoWaterHeaterCard;
  }
}
