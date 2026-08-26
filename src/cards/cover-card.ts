import { html, css, nothing, type PropertyValues, type TemplateResult, type CSSResultGroup } from "lit";
import { customElement } from "lit/decorators.js";

import { DEFAULT_TEXTURE, SkeuoBaseCard, type SkeuoBaseConfig } from "../core/base-card";
import { type HassEntity, isUnavailable, numericState } from "../core/ha";
import { domainRequired, formatState, t, tHa } from "../core/localize";
import { baseSchema, computeHelper, computeLabel, registerCard } from "../core/register";
import { SmoothValue } from "../core/smooth";
import { iconDown, iconStop, iconUp } from "../components/icons";

import "../components/screen";
import "../components/fader";
import "../components/button";

/** Bits de supported_features du domaine cover. */
const SUPPORT_OPEN = 1;
const SUPPORT_CLOSE = 2;
const SUPPORT_SET_POSITION = 4;
const SUPPORT_STOP = 8;

@customElement("skeuo-cover-card")
export class SkeuoCoverCard extends SkeuoBaseCard {
  /** Position affichée, lissée entre deux relevés de l'entité. */
  private _shown = new SmoothValue(this);

  protected override validateConfig(config: SkeuoBaseConfig): void {
    this.expectDomain(config, "cover");
  }

  /**
   * On vise la nouvelle position avant le rendu plutôt que pendant : déclencher
   * une animation depuis `render()` relancerait un rendu à chaque image, donc
   * une boucle.
   */
  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate?.(changed);
    const stateObj = this.stateObj;
    if (stateObj) this._shown.set(this._position(stateObj));
  }

  public static getConfigForm() {
    return {
      schema: baseSchema(),
      computeLabel,
      computeHelper,
      assertConfig: (config: SkeuoBaseConfig) => {
        if (config.entity && !config.entity.startsWith("cover.")) {
          throw new Error(domainRequired("cover"));
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
      entities.find((e) => e.startsWith("cover.")) ??
      entitiesFallback.find((e) => e.startsWith("cover.")) ??
      "cover.living_room";
    return { entity: pick, texture: DEFAULT_TEXTURE };
  }

  private _supports(stateObj: HassEntity, bit: number): boolean {
    const features = numericState(stateObj.attributes.supported_features) ?? 0;
    return (features & bit) !== 0;
  }

  /**
   * Le curseur suit déjà le doigt : on cale la valeur lissée dessus sans
   * animer, sinon il repartirait en arrière au relâchement pour re-glisser
   * jusqu'où l'utilisateur l'avait déjà amené.
   */
  private _onFaderChange(ev: CustomEvent): void {
    this._shown.set(ev.detail.value, true);
    this.callService("cover", "set_cover_position", { position: ev.detail.value });
  }

  /**
   * current_position peut manquer sur un volet qui ne sait pas se
   * positionner : on retombe alors sur l'état ouvert / fermé.
   */
  private _position(stateObj: HassEntity): number {
    const pos = numericState(stateObj.attributes.current_position);
    if (pos !== undefined) return Math.round(pos);
    return stateObj.state === "open" || stateObj.state === "opening" ? 100 : 0;
  }

  protected renderContent(stateObj: HassEntity): TemplateResult {
    const dead = isUnavailable(stateObj);
    const positionable = this._supports(stateObj, SUPPORT_SET_POSITION);
    const moving = stateObj.state === "opening" || stateObj.state === "closing";

    // Le curseur et l'écran lisent la même valeur lissée, sinon le chiffre
    // sauterait à l'arrivée pendant que le curseur serait encore en route.
    const shown = this._shown.value;

    return html`
      ${positionable
        ? html`
            <skeuo-fader
              gradient="position"
              .value=${shown}
              .caption=${t(this.hass, "position")}
              .disabled=${dead}
              .label=${tHa(this.hass, "ui.card.cover.position", "position")}
              @fader-change=${this._onFaderChange}
            ></skeuo-fader>
          `
        : nothing}

      <skeuo-screen
        .value=${positionable ? `${Math.round(shown)}%` : formatState(this.hass, stateObj)}
        .label=${positionable ? t(this.hass, "opening") : formatState(this.hass, stateObj)}
        .valueSize=${positionable ? 44.1 : 30}
        .color=${moving ? "#9db8c9" : this.accent}
      ></skeuo-screen>

      <div class="btn-col">
        <skeuo-button
          .disabled=${dead || !this._supports(stateObj, SUPPORT_OPEN)}
          .active=${stateObj.state === "opening"}
          .label=${tHa(this.hass, "ui.card.cover.open_cover", "open")}
          @press=${() => this.callService("cover", "open_cover")}
          >${iconUp()}</skeuo-button
        >
        <skeuo-button
          .disabled=${dead || !this._supports(stateObj, SUPPORT_STOP)}
          .label=${tHa(this.hass, "ui.card.cover.stop_cover", "stop")}
          @press=${() => this.callService("cover", "stop_cover")}
          >${iconStop()}</skeuo-button
        >
        <skeuo-button
          .disabled=${dead || !this._supports(stateObj, SUPPORT_CLOSE)}
          .active=${stateObj.state === "closing"}
          .label=${tHa(this.hass, "ui.card.cover.close_cover", "close")}
          @press=${() => this.callService("cover", "close_cover")}
          >${iconDown()}</skeuo-button
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
        gap: 14px;
      }
    `,
  ];
}

registerCard({
  type: "skeuo-cover-card",
  name: { fr: "Skeuo · Volet roulant", en: "Skeuo · Cover" },
  description: {
    fr: "Fader de position, écran d'ouverture et boutons ouvrir / stop / fermer.",
    en: "Position fader, opening screen and open / stop / close buttons.",
  },
  preview: true,
});

declare global {
  interface HTMLElementTagNameMap {
    "skeuo-cover-card": SkeuoCoverCard;
  }
}
