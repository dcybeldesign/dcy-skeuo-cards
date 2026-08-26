import { html, css, type TemplateResult, type CSSResultGroup } from "lit";
import { customElement } from "lit/decorators.js";

import { DEFAULT_TEXTURE, SkeuoBaseCard, type SkeuoBaseConfig } from "../core/base-card";
import { type HassEntity, computeEntityName, fireEvent, isUnavailable, numericState } from "../core/ha";
import { fitValueSize } from "../core/format";
import { domainRequired, formatState, t, tHa } from "../core/localize";
import { baseSchema, computeHelper, computeLabel, registerCard } from "../core/register";
import { iconAway, iconHome, iconMoon, iconShieldOff } from "../components/icons";

import "../components/screen";
import "../components/button";

/** Bits de supported_features du domaine alarm_control_panel. */
const SUPPORT_ARM_HOME = 1;
const SUPPORT_ARM_AWAY = 2;
const SUPPORT_ARM_NIGHT = 4;

interface Mode {
  /** Clé de notre dictionnaire et de l'icône. */
  key: string;
  /** Service à appeler sur le domaine. */
  service: string;
  /** État de l'entité qui correspond à ce mode. */
  state: string;
  /** Bit à vérifier dans supported_features, absent pour le désarmement. */
  bit?: number;
  icon: () => unknown;
  /** Clé de traduction native du frontend, si elle existe. */
  haKey: string;
}

const MODES: Mode[] = [
  {
    key: "arm_home",
    service: "alarm_arm_home",
    state: "armed_home",
    bit: SUPPORT_ARM_HOME,
    icon: iconHome,
    haKey: "ui.card.alarm_control_panel.arm_home",
  },
  {
    key: "arm_away",
    service: "alarm_arm_away",
    state: "armed_away",
    bit: SUPPORT_ARM_AWAY,
    icon: iconAway,
    haKey: "ui.card.alarm_control_panel.arm_away",
  },
  {
    key: "arm_night",
    service: "alarm_arm_night",
    state: "armed_night",
    bit: SUPPORT_ARM_NIGHT,
    icon: iconMoon,
    haKey: "ui.card.alarm_control_panel.arm_night",
  },
  {
    key: "disarm",
    service: "alarm_disarm",
    state: "disarmed",
    icon: iconShieldOff,
    haKey: "ui.card.alarm_control_panel.disarm",
  },
];

/** Vert au repos, ambre pendant les temporisations, rouge dès que c'est armé. */
const STATE_COLORS: Record<string, string> = {
  disarmed: "#4dff6a",
  arming: "#e2a659",
  pending: "#e2a659",
  armed_home: "#ff6b5c",
  armed_away: "#ff6b5c",
  armed_night: "#ff6b5c",
  armed_vacation: "#ff6b5c",
  armed_custom_bypass: "#ff6b5c",
  triggered: "#ff6b5c",
};

@customElement("skeuo-alarm-card")
export class SkeuoAlarmCard extends SkeuoBaseCard {
  protected override validateConfig(config: SkeuoBaseConfig): void {
    this.expectDomain(config, "alarm_control_panel");
  }

  public static getConfigForm() {
    return {
      schema: baseSchema(),
      computeLabel,
      computeHelper,
      assertConfig: (config: SkeuoBaseConfig) => {
        if (config.entity && !config.entity.startsWith("alarm_control_panel.")) {
          throw new Error(domainRequired("alarm_control_panel"));
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
      entities.find((e) => e.startsWith("alarm_control_panel.")) ??
      entitiesFallback.find((e) => e.startsWith("alarm_control_panel.")) ??
      "alarm_control_panel.house";
    return { entity: pick, texture: DEFAULT_TEXTURE };
  }

  /* ------------------------------------------------------------- lecture */

  private _modes(stateObj: HassEntity): Mode[] {
    const features = numericState(stateObj.attributes.supported_features) ?? 0;
    // Sans supported_features déclaré, on montre tout : mieux vaut un bouton
    // qui échoue et le dit qu'une carte amputée sur une intégration bavarde.
    if (!features) return MODES;
    return MODES.filter((mode) => mode.bit === undefined || (features & mode.bit) !== 0);
  }

  /**
   * Une centrale qui déclare un code_format en attend un à chaque manœuvre.
   * Le mettre dans la configuration du tableau de bord reviendrait à écrire le
   * code de l'alarme en clair dans un fichier YAML : on ouvre la fiche de
   * l'entité, qui sait présenter le pavé numérique.
   */
  private _needsCode(stateObj: HassEntity, mode: Mode): boolean {
    if (!stateObj.attributes.code_format) return false;
    if (mode.key === "disarm") return true;
    return stateObj.attributes.code_arm_required !== false;
  }

  /* ------------------------------------------------------------- actions */

  private _press(stateObj: HassEntity, mode: Mode): void {
    if (this._needsCode(stateObj, mode)) {
      fireEvent(this, "hass-more-info", { entityId: this._config?.entity ?? null });
      return;
    }
    this.callService("alarm_control_panel", mode.service);
  }

  /* --------------------------------------------------------------- rendu */

  protected renderContent(stateObj: HassEntity): TemplateResult {
    const dead = isUnavailable(stateObj);
    const label = formatState(this.hass, stateObj);
    const color = dead ? "#6b5a44" : STATE_COLORS[stateObj.state] ?? this.accent;
    const coded = !!stateObj.attributes.code_format;

    return html`
      <div class="modes">
        ${this._modes(stateObj).map(
          (mode) => html`
            <skeuo-button
              variant=${mode.key === "disarm" ? "secure" : "alert"}
              .active=${stateObj.state === mode.state}
              .disabled=${dead}
              .caption=${t(this.hass, mode.key)}
              .label=${tHa(this.hass, mode.haKey, mode.key)}
              @press=${() => this._press(stateObj, mode)}
            >
              ${mode.icon()}
            </skeuo-button>
          `
        )}
      </div>

      <skeuo-screen
        .value=${label}
        .label=${coded ? t(this.hass, "code_required") : computeEntityName(stateObj)}
        .valueSize=${fitValueSize(label)}
        .color=${color}
      ></skeuo-screen>
    `;
  }

  static override styles: CSSResultGroup = [
    SkeuoBaseCard.styles,
    css`
      /* L'écart est calé sur les légendes, pas sur les boutons : « Absence »
         et « Disarmed » sont nettement plus larges que le poussoir de 48 px
         qu'elles nomment, et un écart réglé sur le poussoir les ferait se
         toucher deux à deux. */
      .modes {
        display: flex;
        gap: 30px;
      }
      .body {
        padding: 0 22px;
      }
    `,
  ];
}

registerCard({
  type: "skeuo-alarm-card",
  name: { fr: "Skeuo · Alarme", en: "Skeuo · Alarm" },
  description: {
    fr: "Quatre modes d'armement et écran d'état de la centrale.",
    en: "Four arming modes and a panel state screen.",
  },
  preview: true,
});

declare global {
  interface HTMLElementTagNameMap {
    "skeuo-alarm-card": SkeuoAlarmCard;
  }
}
