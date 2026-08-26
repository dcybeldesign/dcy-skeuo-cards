import { html, css, type TemplateResult, type CSSResultGroup } from "lit";
import { customElement } from "lit/decorators.js";

import { DEFAULT_TEXTURE, SkeuoBaseCard, type SkeuoBaseConfig } from "../core/base-card";
import { type HassEntity, computeEntityName, isUnavailable, numericState } from "../core/ha";
import { fitValueSize } from "../core/format";
import { domainRequired, formatState, t, tHa } from "../core/localize";
import { baseSchema, computeHelper, computeLabel, registerCard } from "../core/register";
import { iconDock, iconPause, iconPlay } from "../components/icons";

import "../components/screen";
import "../components/button";

/** Bits de supported_features du domaine vacuum. */
const SUPPORT_PAUSE = 4;
const SUPPORT_RETURN_HOME = 16;
const SUPPORT_BATTERY = 64;
const SUPPORT_START = 8192;

/** Le robot est en train de faire quelque chose, l'écran passe au bleu. */
const BUSY_STATES = ["cleaning", "returning"];

@customElement("skeuo-vacuum-card")
export class SkeuoVacuumCard extends SkeuoBaseCard {
  protected override validateConfig(config: SkeuoBaseConfig): void {
    this.expectDomain(config, "vacuum");
  }

  public static getConfigForm() {
    return {
      schema: baseSchema(),
      computeLabel,
      computeHelper,
      assertConfig: (config: SkeuoBaseConfig) => {
        if (config.entity && !config.entity.startsWith("vacuum.")) {
          throw new Error(domainRequired("vacuum"));
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
      entities.find((e) => e.startsWith("vacuum.")) ??
      entitiesFallback.find((e) => e.startsWith("vacuum.")) ??
      "vacuum.robot";
    return { entity: pick, texture: DEFAULT_TEXTURE };
  }

  /* ------------------------------------------------------------- lecture */

  private _supports(stateObj: HassEntity, bit: number): boolean {
    const features = numericState(stateObj.attributes.supported_features) ?? 0;
    return (features & bit) !== 0;
  }

  /* ------------------------------------------------------------- actions */

  /**
   * Un seul bouton pour lancer et suspendre : c'est le geste attendu sur ce
   * genre d'appareil, et il évite un troisième poussoir dans une carte qui n'a
   * la place que pour deux.
   */
  private _toggleRun(stateObj: HassEntity): void {
    if (stateObj.state === "cleaning") {
      this.callService("vacuum", this._supports(stateObj, SUPPORT_PAUSE) ? "pause" : "stop");
    } else {
      this.callService("vacuum", "start");
    }
  }

  /* --------------------------------------------------------------- rendu */

  protected renderContent(stateObj: HassEntity): TemplateResult {
    const dead = isUnavailable(stateObj);
    const cleaning = stateObj.state === "cleaning";
    const docked = stateObj.state === "docked";
    const busy = BUSY_STATES.includes(stateObj.state);
    const error = stateObj.state === "error";

    // Le niveau de batterie est passé aux entités dédiées sur les intégrations
    // récentes : quand le robot ne le porte plus, l'écran montre son état, qui
    // est de toute façon l'information la plus utile.
    const battery = this._supports(stateObj, SUPPORT_BATTERY)
      ? numericState(stateObj.attributes.battery_level)
      : undefined;
    const text = battery !== undefined ? `${Math.round(battery)}%` : formatState(this.hass, stateObj);

    return html`
      <div class="slot">
        <skeuo-button
          primary
          .active=${cleaning}
          .disabled=${dead || (!cleaning && !this._supports(stateObj, SUPPORT_START))}
          .caption=${t(this.hass, "clean")}
          .label=${tHa(this.hass, cleaning ? "ui.card.vacuum.pause" : "ui.card.vacuum.start", "clean")}
          @press=${() => this._toggleRun(stateObj)}
          >${cleaning ? iconPause() : iconPlay()}</skeuo-button
        >
      </div>

      <skeuo-screen
        .value=${text}
        .label=${battery !== undefined ? t(this.hass, "battery") : computeEntityName(stateObj)}
        .valueSize=${fitValueSize(text)}
        .color=${dead ? "#6b5a44" : error ? "#ff6b5c" : busy ? "#9db8c9" : this.accent}
      ></skeuo-screen>

      <div class="slot">
        <skeuo-button
          .active=${stateObj.state === "returning"}
          .disabled=${dead || docked || !this._supports(stateObj, SUPPORT_RETURN_HOME)}
          .caption=${t(this.hass, "dock")}
          .label=${tHa(this.hass, "ui.card.vacuum.return_to_base", "dock")}
          @press=${() => this.callService("vacuum", "return_to_base")}
          >${iconDock()}</skeuo-button
        >
      </div>
    `;
  }

  static override styles: CSSResultGroup = [
    SkeuoBaseCard.styles,
    css`
      /* Hauteur commune aux deux colonnes de boutons : le gros bouton de
         nettoyage et le petit retour base se centrent ainsi sur la même ligne
         plutôt que chacun sur sa propre hauteur. */
      .slot {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 142px;
      }
      .body {
        padding: 0 24px;
      }
    `,
  ];
}

registerCard({
  type: "skeuo-vacuum-card",
  name: { fr: "Skeuo · Aspirateur robot", en: "Skeuo · Robot vacuum" },
  description: {
    fr: "Bouton nettoyage et pause, écran de batterie et retour à la base.",
    en: "Clean and pause button, battery screen and return to base.",
  },
  preview: true,
});

declare global {
  interface HTMLElementTagNameMap {
    "skeuo-vacuum-card": SkeuoVacuumCard;
  }
}
