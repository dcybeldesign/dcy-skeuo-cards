import { html, css, nothing, type TemplateResult, type CSSResultGroup } from "lit";
import { customElement } from "lit/decorators.js";

import { DEFAULT_TEXTURE, SkeuoBaseCard, type SkeuoBaseConfig } from "../core/base-card";
import {
  type HassEntity,
  computeDomain,
  computeEntityName,
  isUnavailable,
  numericState,
} from "../core/ha";
import { fitValueSize, trimNumber } from "../core/format";
import { formatState, t, tHa } from "../core/localize";
import { baseSchema, computeHelper, computeLabel, registerCard } from "../core/register";

import "../components/screen";
import "../components/toggle";

interface SwitchCardConfig extends SkeuoBaseConfig {
  /** Capteur de puissance instantanée associé à la prise. */
  power_entity?: string;
  /** Compteur d'énergie associé à la prise. */
  energy_entity?: string;
}

@customElement("skeuo-switch-card")
export class SkeuoSwitchCard extends SkeuoBaseCard<SwitchCardConfig> {
  protected override validateConfig(config: SwitchCardConfig): void {
    this.expectDomain(config, "switch", "input_boolean", "light", "fan");
  }

  protected override isOff(stateObj: HassEntity): boolean {
    return stateObj.state === "off";
  }

  /**
   * Les deux capteurs comptent autant que l'interrupteur pour le filtre de
   * rendu : sans eux, la puissance affichée resterait figée entre deux
   * changements d'état de la prise elle-même.
   */
  protected override entityIds(): string[] {
    return [this._config?.entity, this._config?.power_entity, this._config?.energy_entity].filter(
      (id): id is string => !!id
    );
  }

  public static getConfigForm() {
    return {
      schema: [
        ...baseSchema(),
        {
          type: "grid",
          name: "",
          schema: [
            { name: "power_entity", selector: { entity: { domain: "sensor" } } },
            { name: "energy_entity", selector: { entity: { domain: "sensor" } } },
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
  ): Partial<SwitchCardConfig> {
    const pick =
      entities.find((e) => e.startsWith("switch.")) ??
      entitiesFallback.find((e) => e.startsWith("switch.")) ??
      "switch.outlet";
    return { entity: pick, texture: DEFAULT_TEXTURE };
  }

  /* ------------------------------------------------------------- lecture */

  /**
   * Relevé d'un capteur associé, avec son unité.
   *
   * L'unité est toujours celle de l'entité : c'est ce qui permet à la même
   * carte d'afficher des watts ici et des kilowatts ailleurs sans que rien ne
   * soit écrit en dur, donc sans traduction à maintenir.
   */
  private _reading(entityId?: string): string | undefined {
    if (!entityId || !this.hass) return undefined;
    const stateObj = this.hass.states[entityId];
    if (!stateObj || isUnavailable(stateObj)) return undefined;
    const value = numericState(stateObj.state);
    if (value === undefined) return undefined;
    const unit = (stateObj.attributes.unit_of_measurement as string | undefined) ?? "";
    return `${trimNumber(value)}${unit}`;
  }

  private _onToggle(stateObj: HassEntity): void {
    const domain = computeDomain(stateObj.entity_id);
    this.callService(domain, stateObj.state === "on" ? "turn_off" : "turn_on");
  }

  /* --------------------------------------------------------------- rendu */

  private _meter(entityId: string, label: string, dimmed: boolean): TemplateResult {
    const reading = this._reading(entityId);
    return html`
      <skeuo-screen
        .value=${reading ?? "—"}
        .label=${label}
        .valueSize=${fitValueSize(reading ?? "—")}
        .color=${dimmed || reading === undefined ? "#6b5a44" : this.accent}
      ></skeuo-screen>
    `;
  }

  protected renderContent(stateObj: HassEntity): TemplateResult {
    const dead = isUnavailable(stateObj);
    const on = stateObj.state === "on";

    // Toutes les prises ne mesurent pas leur consommation, et rien n'oblige à
    // relier les capteurs. Sans eux, deux écrans à tiret occuperaient la moitié
    // de la carte pour ne rien dire : on en garde un seul, sur l'état.
    const measured = !!(this._config?.power_entity || this._config?.energy_entity);
    const state = formatState(this.hass, stateObj);

    return html`
      <skeuo-toggle
        .checked=${on}
        .disabled=${dead}
        .caption=${t(this.hass, "power")}
        .label=${tHa(this.hass, "ui.card.common.turn_on", "power")}
        .color=${this.accent}
        @toggle=${() => this._onToggle(stateObj)}
      ></skeuo-toggle>

      ${measured
        ? html`
            ${this._config?.power_entity
              ? this._meter(this._config.power_entity, t(this.hass, "power_draw"), dead || !on)
              : nothing}
            ${this._config?.energy_entity
              ? this._meter(this._config.energy_entity, t(this.hass, "today"), dead)
              : nothing}
          `
        : html`
            <skeuo-screen
              .value=${state}
              .label=${computeEntityName(stateObj)}
              .valueSize=${fitValueSize(state)}
              .color=${dead || !on ? "#6b5a44" : this.accent}
            ></skeuo-screen>
          `}
    `;
  }

  static override styles: CSSResultGroup = [
    SkeuoBaseCard.styles,
    css`
      .body {
        gap: 10px;
        padding: 0 12px;
      }
    `,
  ];
}

registerCard({
  type: "skeuo-switch-card",
  name: { fr: "Skeuo · Prise connectée", en: "Skeuo · Smart plug" },
  description: {
    fr: "Interrupteur à bascule, écran de puissance et écran d'énergie.",
    en: "Rocker switch, power screen and energy screen.",
  },
  preview: true,
});

declare global {
  interface HTMLElementTagNameMap {
    "skeuo-switch-card": SkeuoSwitchCard;
  }
}
