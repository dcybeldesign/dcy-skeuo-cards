import { html, css, type TemplateResult, type CSSResultGroup } from "lit";
import { customElement } from "lit/decorators.js";

import { DEFAULT_TEXTURE, SkeuoBaseCard, type SkeuoBaseConfig } from "../core/base-card";
import { type HassEntity, isUnavailable, numericState } from "../core/ha";
import { fitValueSize, formatAttribute } from "../core/format";
import { domainRequired, formatState } from "../core/localize";
import { baseSchema, computeHelper, computeLabel, registerCard } from "../core/register";

import { isNight } from "../core/sun";

import "../components/screen";
import { weatherIconName } from "../components/weather-icon";

@customElement("skeuo-weather-card")
export class SkeuoWeatherCard extends SkeuoBaseCard {
  protected override validateConfig(config: SkeuoBaseConfig): void {
    this.expectDomain(config, "weather");
  }

  /**
   * Le soleil compte autant que la météo pour le filtre de rendu : sans lui,
   * l'icône garderait son soleil derrière le nuage jusqu'au prochain
   * changement de temps, plusieurs heures après le coucher.
   */
  protected override entityIds(): string[] {
    const ids = super.entityIds();
    return this.hass?.states["sun.sun"] ? [...ids, "sun.sun"] : ids;
  }

  public static getConfigForm() {
    return {
      schema: baseSchema(),
      computeLabel,
      computeHelper,
      assertConfig: (config: SkeuoBaseConfig) => {
        if (config.entity && !config.entity.startsWith("weather.")) {
          throw new Error(domainRequired("weather"));
        }
      },
    };
  }

  public static getStubConfig(
    _hass: unknown,
    entities: string[],
    entitiesFallback: string[]
  ): Partial<SkeuoBaseConfig> {
    const pick =
      entities.find((e) => e.startsWith("weather.")) ??
      entitiesFallback.find((e) => e.startsWith("weather.")) ??
      "weather.home";
    return { entity: pick, texture: DEFAULT_TEXTURE };
  }

  /**
   * Unité de température de l'entité et non du système : une station qui
   * publie en Fahrenheit garde son unité, exactement comme le fait la carte
   * météo native.
   */
  private _unit(stateObj: HassEntity): string {
    return (
      (stateObj.attributes.temperature_unit as string | undefined) ??
      this.hass?.config?.unit_system?.temperature ??
      "°C"
    );
  }

  protected renderContent(stateObj: HassEntity): TemplateResult {
    const dead = isUnavailable(stateObj);
    const temperature = numericState(stateObj.attributes.temperature);
    const condition = formatState(this.hass, stateObj);
    const text =
      dead || temperature === undefined
        ? "—"
        : formatAttribute(this.hass, stateObj, "temperature", this._unit(stateObj));

    return html`
      <skeuo-screen bare>
        <skeuo-weather-icon
          .condition=${dead ? "exceptional" : weatherIconName(stateObj.state, isNight(this.hass))}
          .size=${105}
          .label=${condition}
          style=${dead ? "color:#6b5a44" : ""}
        ></skeuo-weather-icon>
      </skeuo-screen>

      <skeuo-screen
        .value=${text}
        .label=${condition}
        .valueSize=${fitValueSize(text)}
        .color=${dead ? "#6b5a44" : this.accent}
      ></skeuo-screen>
    `;
  }

  static override styles: CSSResultGroup = [
    SkeuoBaseCard.styles,
    css`
      .body {
        gap: 16px;
      }
    `,
  ];
}

registerCard({
  type: "skeuo-weather-card",
  name: { fr: "Skeuo · Météo", en: "Skeuo · Weather" },
  description: {
    fr: "Icône animée sur écran LCD et relevé de température.",
    en: "Animated icon on an LCD screen and a temperature reading.",
  },
  preview: true,
});

declare global {
  interface HTMLElementTagNameMap {
    "skeuo-weather-card": SkeuoWeatherCard;
  }
}
