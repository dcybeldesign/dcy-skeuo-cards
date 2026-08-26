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
import { type HassEntity, computeEntityName, isUnavailable, numericState } from "../core/ha";
import { domainRequired, formatState, t, tHa } from "../core/localize";
import { baseSchema, computeHelper, computeLabel, registerCard } from "../core/register";
import { SmoothValue } from "../core/smooth";
import { iconOscillate, iconPower, iconRotate } from "../components/icons";

import "../components/screen";
import "../components/fader";
import "../components/button";

/** Bits de supported_features du domaine fan. */
const SUPPORT_SET_SPEED = 1;
const SUPPORT_OSCILLATE = 2;
const SUPPORT_DIRECTION = 4;

@customElement("skeuo-fan-card")
export class SkeuoFanCard extends SkeuoBaseCard {
  /** Vitesse affichée, lissée entre deux relevés de l'entité. */
  private _speed = new SmoothValue(this);

  protected override validateConfig(config: SkeuoBaseConfig): void {
    this.expectDomain(config, "fan");
  }

  protected override isOff(stateObj: HassEntity): boolean {
    return stateObj.state === "off";
  }

  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate?.(changed);
    const stateObj = this.stateObj;
    if (stateObj) this._speed.set(this._percentage(stateObj));
  }

  public static getConfigForm() {
    return {
      schema: baseSchema(),
      computeLabel,
      computeHelper,
      assertConfig: (config: SkeuoBaseConfig) => {
        if (config.entity && !config.entity.startsWith("fan.")) {
          throw new Error(domainRequired("fan"));
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
      entities.find((e) => e.startsWith("fan.")) ??
      entitiesFallback.find((e) => e.startsWith("fan.")) ??
      "fan.office";
    return { entity: pick, texture: DEFAULT_TEXTURE };
  }

  /* ------------------------------------------------------------- lecture */

  private _supports(stateObj: HassEntity, bit: number): boolean {
    const features = numericState(stateObj.attributes.supported_features) ?? 0;
    return (features & bit) !== 0;
  }

  /**
   * percentage est absent tant que le ventilateur est à l'arrêt sur certaines
   * intégrations : on retombe alors sur zéro plutôt que de laisser le curseur
   * à sa dernière position, qui ferait croire que l'appareil tourne encore.
   */
  private _percentage(stateObj: HassEntity): number {
    if (stateObj.state === "off") return 0;
    return Math.round(numericState(stateObj.attributes.percentage) ?? 0);
  }

  /**
   * Certains ventilateurs n'ont que trois ou quatre vitesses : le pas déclaré
   * par l'entité cale le curseur dessus au lieu de laisser choisir un
   * pourcentage que l'appareil arrondirait dans son coin.
   */
  private _step(stateObj: HassEntity): number {
    return numericState(stateObj.attributes.percentage_step) ?? 1;
  }

  /* ------------------------------------------------------------- actions */

  private _onFaderChange(ev: CustomEvent): void {
    this._speed.set(ev.detail.value, true);
    this.callService("fan", "set_percentage", { percentage: ev.detail.value });
  }

  private _togglePower(stateObj: HassEntity): void {
    this.callService("fan", stateObj.state === "off" ? "turn_on" : "turn_off");
  }

  private _toggleOscillation(stateObj: HassEntity): void {
    this.callService("fan", "oscillate", { oscillating: !stateObj.attributes.oscillating });
  }

  private _toggleDirection(stateObj: HassEntity): void {
    const reverse = stateObj.attributes.direction === "reverse";
    this.callService("fan", "set_direction", { direction: reverse ? "forward" : "reverse" });
  }

  /* --------------------------------------------------------------- rendu */

  protected renderContent(stateObj: HassEntity): TemplateResult {
    const dead = isUnavailable(stateObj);
    const on = stateObj.state !== "off";
    const speed = Math.round(this._speed.value);
    const settable = this._supports(stateObj, SUPPORT_SET_SPEED);

    return html`
      ${settable
        ? html`
            <skeuo-fader
              gradient="airflow"
              .value=${speed}
              .step=${this._step(stateObj)}
              .disabled=${dead}
              .inactive=${!on}
              .caption=${t(this.hass, "speed")}
              .label=${t(this.hass, "speed")}
              @fader-change=${this._onFaderChange}
            ></skeuo-fader>
          `
        : nothing}

      <skeuo-screen
        .value=${settable ? `${speed}%` : formatState(this.hass, stateObj)}
        .label=${settable ? t(this.hass, "speed") : computeEntityName(stateObj)}
        .valueSize=${settable ? 44.1 : 30}
        .color=${dead || !on ? "#6b5a44" : this.accent}
      ></skeuo-screen>

      <div class="btn-col">
        <skeuo-button
          .active=${on}
          .disabled=${dead}
          .caption=${t(this.hass, "power")}
          .label=${tHa(this.hass, "ui.card.common.turn_on", "power")}
          @press=${() => this._togglePower(stateObj)}
          >${iconPower()}</skeuo-button
        >
        <skeuo-button
          .active=${!!stateObj.attributes.oscillating}
          .disabled=${dead || !this._supports(stateObj, SUPPORT_OSCILLATE)}
          .caption=${t(this.hass, "oscillate")}
          @press=${() => this._toggleOscillation(stateObj)}
          >${iconOscillate()}</skeuo-button
        >
        <skeuo-button
          .active=${stateObj.attributes.direction === "reverse"}
          .disabled=${dead || !this._supports(stateObj, SUPPORT_DIRECTION)}
          .caption=${t(this.hass, "direction")}
          @press=${() => this._toggleDirection(stateObj)}
          >${iconRotate()}</skeuo-button
        >
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
      /* Marge symétrique : elle tient la légende la plus longue de la colonne
         de droite à l'écart de la vis d'angle, sans creuser un couloir plus
         large d'un côté que de l'autre. */
      .body {
        padding: 0 24px;
      }
    `,
  ];
}

registerCard({
  type: "skeuo-fan-card",
  name: { fr: "Skeuo · Ventilateur", en: "Skeuo · Fan" },
  description: {
    fr: "Fader de vitesse, écran et boutons marche, oscillation, sens de rotation.",
    en: "Speed fader, screen and power, oscillation and direction buttons.",
  },
  preview: true,
});

declare global {
  interface HTMLElementTagNameMap {
    "skeuo-fan-card": SkeuoFanCard;
  }
}
