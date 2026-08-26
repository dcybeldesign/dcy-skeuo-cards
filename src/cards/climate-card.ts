import {
  html,
  css,
  nothing,
  type PropertyValues,
  type TemplateResult,
  type CSSResultGroup,
} from "lit";
import { customElement } from "lit/decorators.js";

import { DEFAULT_TEXTURE, SkeuoBaseCard, type SkeuoBaseConfig } from "../core/base-card";
import { type HassEntity, isUnavailable, numericState } from "../core/ha";
import { domainRequired, t, tHa } from "../core/localize";
import { baseSchema, computeHelper, computeLabel, registerCard } from "../core/register";
import { SmoothValue } from "../core/smooth";
import {
  iconAuto,
  iconDroplet,
  iconFan,
  iconFlame,
  iconMinus,
  iconPlus,
  iconPower,
  iconSnowflake,
} from "../components/icons";

import "../components/screen";
import "../components/button";
import "../components/dial";

interface ClimateCardConfig extends SkeuoBaseConfig {
  /** Modes affichés en boutons. Par défaut, ceux que l'entité déclare. */
  modes?: string[];
}

const MODE_ICONS: Record<string, () => unknown> = {
  heat: iconFlame,
  cool: iconSnowflake,
  fan_only: iconFan,
  auto: iconAuto,
  heat_cool: iconAuto,
  dry: iconDroplet,
};

/** Couleur d'ambiance selon ce que la machine est en train de faire. */
const ACTION_COLORS: Record<string, string> = {
  heating: "#e2762f",
  cooling: "#4aa8e0",
  drying: "#c9a23a",
  fan: "#7fb98a",
};

@customElement("skeuo-climate-card")
export class SkeuoClimateCard extends SkeuoBaseCard<ClimateCardConfig> {
  /**
   * Consigne affichée, lissée.
   *
   * Les degrés se comptent par pas de 0.5, pas par centaines comme un
   * pourcentage : le seuil sous lequel on ne prend pas la peine d'animer et la
   * vitesse de parcours sont donc réglés sur cette échelle. Sans ça, un appui
   * sur « Augmenter » passerait sous le seuil et l'arc sauterait.
   */
  private _setpoint = new SmoothValue(this, {
    epsilon: 0.02,
    minDuration: 260,
    maxDuration: 700,
    msPerUnit: 26,
  });

  protected override validateConfig(config: ClimateCardConfig): void {
    this.expectDomain(config, "climate");
  }

  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate?.(changed);
    const stateObj = this.stateObj;
    const target = stateObj ? this._target(stateObj) : undefined;
    if (target !== undefined) this._setpoint.set(target);
  }

  protected override isOff(stateObj: HassEntity): boolean {
    return stateObj.state === "off";
  }

  public static getConfigForm() {
    return {
      schema: baseSchema(),
      computeLabel,
      computeHelper,
      assertConfig: (config: ClimateCardConfig) => {
        if (config.entity && !config.entity.startsWith("climate.")) {
          throw new Error(domainRequired("climate"));
        }
      },
    };
  }

  public static getStubConfig(
    _hass: unknown,
    entities: string[],
    entitiesFallback: string[]
  ): Partial<ClimateCardConfig> {
    const pick =
      entities.find((e) => e.startsWith("climate.")) ??
      entitiesFallback.find((e) => e.startsWith("climate.")) ??
      "climate.thermostat";
    return { entity: pick, texture: DEFAULT_TEXTURE };
  }

  /* ------------------------------------------------------------ valeurs */

  private _modes(stateObj: HassEntity): string[] {
    const declared = this._config?.modes;
    const available = (stateObj.attributes.hvac_modes as string[] | undefined) ?? [];
    const list = declared ?? available.filter((m) => m !== "off");
    // Quatre boutons est ce que la rangée peut porter sans réduire le texte
    // sous le plancher typographique du projet.
    return list.slice(0, 4);
  }

  private _step(stateObj: HassEntity): number {
    return numericState(stateObj.attributes.target_temp_step) ?? 0.5;
  }

  private _target(stateObj: HassEntity): number | undefined {
    return numericState(stateObj.attributes.temperature);
  }

  private get _unit(): string {
    return this.hass?.config?.unit_system?.temperature ?? "°C";
  }

  /**
   * On garde la précision d'affichage de l'entité pendant le glissement : une
   * consigne au demi-degré ne doit pas se mettre à afficher des décimales
   * parasites en cours de route.
   */
  private _formatSetpoint(): string {
    const step = this._step(this.stateObj!);
    const decimals = step < 1 ? 1 : 0;
    return this._setpoint.value.toFixed(decimals);
  }

  private _actionColor(stateObj: HassEntity): string {
    const action = stateObj.attributes.hvac_action as string | undefined;
    return (action && ACTION_COLORS[action]) ?? this.accent;
  }

  /* ------------------------------------------------------------- actions */

  private _setMode(mode: string): void {
    this.callService("climate", "set_hvac_mode", { hvac_mode: mode });
  }

  private _togglePower(stateObj: HassEntity): void {
    if (stateObj.state === "off") {
      const fallback = this._modes(stateObj)[0] ?? "auto";
      this.callService("climate", "set_hvac_mode", { hvac_mode: fallback });
    } else {
      this.callService("climate", "set_hvac_mode", { hvac_mode: "off" });
    }
  }

  private _nudge(stateObj: HassEntity, direction: 1 | -1): void {
    const current = this._target(stateObj);
    if (current === undefined) return;
    const min = numericState(stateObj.attributes.min_temp) ?? 7;
    const max = numericState(stateObj.attributes.max_temp) ?? 35;
    const next = Math.min(max, Math.max(min, current + direction * this._step(stateObj)));
    this.callService("climate", "set_temperature", { temperature: Number(next.toFixed(1)) });
  }

  /* --------------------------------------------------------------- rendu */

  protected renderContent(stateObj: HassEntity): TemplateResult {
    const dead = isUnavailable(stateObj);
    const isOff = stateObj.state === "off";
    const target = this._target(stateObj);
    const current = numericState(stateObj.attributes.current_temperature);
    const color = isOff ? "#6b5a44" : this._actionColor(stateObj);

    const action = stateObj.attributes.hvac_action as string | undefined;
    const stateLabel = tHa(
      this.hass,
      `component.climate.entity_component._.state.${stateObj.state}`,
      stateObj.state
    );
    const actionLabel = action
      ? tHa(this.hass, `component.climate.entity_component._.state_attributes.hvac_action.state.${action}`, action)
      : undefined;

    return html`
      <div class="col left">
        <div class="modes">
          ${this._modes(stateObj).map((mode) => {
            const icon = MODE_ICONS[mode] ?? iconAuto;
            return html`
              <skeuo-button
                .active=${stateObj.state === mode}
                .disabled=${dead}
                .caption=${t(this.hass, mode)}
                .label=${tHa(this.hass, `component.climate.entity_component._.state.${mode}`, mode)}
                @press=${() => this._setMode(mode)}
                >${icon()}</skeuo-button
              >
            `;
          })}
        </div>
        <skeuo-screen
          .width=${222}
          .height=${112}
          .valueSize=${26}
          .value=${target !== undefined ? `${this._formatSetpoint()}${this._unit}` : "—"}
          .label=${`${t(this.hass, "setpoint")} · ${actionLabel ?? stateLabel}`}
          .color=${color}
        ></skeuo-screen>
      </div>

      <skeuo-dial
        .size=${202}
        .value=${target !== undefined ? this._setpoint.value : 0}
        .min=${numericState(stateObj.attributes.min_temp) ?? 7}
        .max=${numericState(stateObj.attributes.max_temp) ?? 35}
        .color=${color}
        .dimmed=${isOff || dead}
      >
        <p class="dial-value" style="color:${color}">
          ${current !== undefined ? `${Math.round(current)}°` : "—"}
        </p>
        <p class="dial-label">${t(this.hass, "current")}</p>
      </skeuo-dial>

      <div class="col right">
        <skeuo-button
          .active=${!isOff}
          .disabled=${dead}
          .caption=${t(this.hass, "power")}
          @press=${() => this._togglePower(stateObj)}
          >${iconPower()}</skeuo-button
        >
        <skeuo-button
          .disabled=${dead || isOff || target === undefined}
          .caption=${t(this.hass, "increase")}
          @press=${() => this._nudge(stateObj, 1)}
          >${iconPlus()}</skeuo-button
        >
        <skeuo-button
          .disabled=${dead || isOff || target === undefined}
          .caption=${t(this.hass, "decrease")}
          @press=${() => this._nudge(stateObj, -1)}
          >${iconMinus()}</skeuo-button
        >
      </div>
      ${nothing}
    `;
  }

  static override styles: CSSResultGroup = [
    SkeuoBaseCard.styles,
    css`
      .col {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .left {
        gap: 8px;
      }
      /* Le corps déborde volontairement des marges du module pour occuper toute
         la largeur ; on lui rend une marge symétrique ici. Elle sert à deux
         choses : garder la légende « Diminuer » à l'écart de la vis d'angle
         bas-droite, et surtout laisser la répartition jouer sur des couloirs de
         la largeur réelle des boutons. Élargir le seul couloir de droite, comme
         je l'avais fait, ajoute un vide invisible à sa gauche : les écarts
         optiques de part et d'autre du cadran cessent d'être égaux et le cadran
         paraît décalé. */
      .body {
        padding: 0 24px;
      }
      .right {
        gap: 2px;
      }
      .modes {
        display: flex;
        gap: 10px;
      }

      .dial-value {
        margin: 0;
        font-family: var(--skeuo-font-lcd);
        font-size: 36px;
        font-weight: 700;
        line-height: 1;
        letter-spacing: 0.5px;
        text-shadow: 0 0 8px currentColor;
      }
      .dial-label {
        margin: 7px 0 0;
        font-family: var(--skeuo-font-lcd);
        font-size: 14px;
        color: #cf9a5c;
        letter-spacing: 0.9px;
        text-transform: uppercase;
      }
    `,
  ];
}

registerCard({
  type: "skeuo-climate-card",
  name: { fr: "Skeuo · Climatisation", en: "Skeuo · Climate" },
  description: {
    fr: "Thermostat à cadran gradué, écran de consigne et boutons de mode.",
    en: "Graduated dial thermostat, setpoint screen and mode buttons.",
  },
  preview: true,
});

declare global {
  interface HTMLElementTagNameMap {
    "skeuo-climate-card": SkeuoClimateCard;
  }
}
