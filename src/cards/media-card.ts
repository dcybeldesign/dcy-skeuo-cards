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
import { iconNext, iconPause, iconPlay, iconPrev, iconStop } from "../components/icons";

import "../components/hfader";
import "../components/led-meter";
import "../components/vinyl";
import "../components/button";

/**
 * Hauteur d'un segment de l'échelle.
 *
 * Quinze segments et quatorze intervalles de deux pixels doivent tenir dans la
 * hauteur du corps, qui vaut 199 unités quand la carte porte un sous-titre,
 * c'est-à-dire le cas le plus contraint. Une valeur plus généreuse ferait
 * déborder l'échelle par-dessus le bandeau de titre.
 */
const LED_SEGMENT = 11.4;

/** Bits de supported_features du domaine media_player. */
const SUPPORT_PAUSE = 1;
const SUPPORT_VOLUME_SET = 4;
const SUPPORT_PREVIOUS_TRACK = 16;
const SUPPORT_NEXT_TRACK = 32;
const SUPPORT_STOP = 4096;
const SUPPORT_PLAY = 16384;

@customElement("skeuo-media-card")
export class SkeuoMediaCard extends SkeuoBaseCard {
  /** Volume affiché, lissé entre deux relevés de l'entité. */
  private _volume = new SmoothValue(this);

  protected override validateConfig(config: SkeuoBaseConfig): void {
    this.expectDomain(config, "media_player");
  }

  protected override isOff(stateObj: HassEntity): boolean {
    return stateObj.state === "off" || stateObj.state === "standby";
  }

  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate?.(changed);
    const stateObj = this.stateObj;
    if (stateObj) this._volume.set(this._volumePercent(stateObj));
  }

  public static getConfigForm() {
    return {
      schema: baseSchema(),
      computeLabel,
      computeHelper,
      assertConfig: (config: SkeuoBaseConfig) => {
        if (config.entity && !config.entity.startsWith("media_player.")) {
          throw new Error(domainRequired("media_player"));
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
      entities.find((e) => e.startsWith("media_player.")) ??
      entitiesFallback.find((e) => e.startsWith("media_player.")) ??
      "media_player.living_room";
    return { entity: pick, texture: DEFAULT_TEXTURE };
  }

  /* ------------------------------------------------------------- lecture */

  private _supports(stateObj: HassEntity, bit: number): boolean {
    const features = numericState(stateObj.attributes.supported_features) ?? 0;
    return (features & bit) !== 0;
  }

  /** volume_level est une fraction de 0 à 1 côté Home Assistant. */
  private _volumePercent(stateObj: HassEntity): number {
    const level = numericState(stateObj.attributes.volume_level);
    return level === undefined ? 0 : Math.round(level * 100);
  }

  private _playing(stateObj: HassEntity): boolean {
    return stateObj.state === "playing";
  }

  /**
   * Ce qui passe, en une ligne.
   *
   * Les intégrations ne remplissent pas les mêmes champs : une radio n'a
   * souvent qu'un `media_title`, une série remonte `media_series_title`, et
   * certaines applications ne donnent que leur nom. On descend la liste
   * jusqu'à trouver quelque chose plutôt que d'afficher une ligne vide.
   */
  private _title(stateObj: HassEntity): string {
    const a = stateObj.attributes;
    return (
      (a.media_title as string | undefined) ??
      (a.media_series_title as string | undefined) ??
      (a.app_name as string | undefined) ??
      (a.source as string | undefined) ??
      ""
    );
  }

  private _subtitle(stateObj: HassEntity): string {
    const a = stateObj.attributes;
    return (
      (a.media_artist as string | undefined) ??
      (a.media_album_name as string | undefined) ??
      (a.app_name as string | undefined) ??
      ""
    );
  }

  /* ------------------------------------------------------------- actions */

  private _onVolume(ev: CustomEvent): void {
    this._volume.set(ev.detail.value, true);
    this.callService("media_player", "volume_set", { volume_level: ev.detail.value / 100 });
  }

  /**
   * Un seul appel pour les deux sens : `media_play_pause` bascule selon l'état
   * réel de l'appareil, ce qui évite de le déduire d'un état qui peut avoir
   * changé entre le rendu et l'appui.
   */
  private _togglePlay(): void {
    this.callService("media_player", "media_play_pause");
  }

  /* --------------------------------------------------------------- rendu */

  protected renderContent(stateObj: HassEntity): TemplateResult {
    const dead = isUnavailable(stateObj);
    const playing = this._playing(stateObj);
    const volume = Math.round(this._volume.value);
    const settable = this._supports(stateObj, SUPPORT_VOLUME_SET);

    const stateLabel = tHa(
      this.hass,
      `component.media_player.entity_component._.state.${stateObj.state}`,
      stateObj.state
    );
    const title = this._title(stateObj);
    const art = stateObj.attributes.entity_picture as string | undefined;

    return html`
      <div class="left">
        <div class="top">
          <skeuo-vinyl
          .size=${118}
          .spinning=${playing && !dead}
          .art=${art}
            .badge=${"33"}
            .label=${title || stateLabel}
          ></skeuo-vinyl>

          <div class="mid">
            <p class="plate state">${stateLabel}</p>
            <p class="plate title">${title || this._subtitle(stateObj)}</p>
            ${settable
              ? html`
                  <skeuo-hfader
                    gradient="level"
                    .value=${volume}
                    .width=${244}
                    .disabled=${dead}
                    .caption=${t(this.hass, "volume")}
                    .label=${t(this.hass, "volume")}
                    @fader-change=${this._onVolume}
                  ></skeuo-hfader>
                `
              : nothing}
          </div>
        </div>

        <div class="btn-row">
        <skeuo-button
          .disabled=${dead || !this._supports(stateObj, SUPPORT_PREVIOUS_TRACK)}
          .label=${tHa(this.hass, "ui.card.media_player.media_previous_track", "previous")}
          @press=${() => this.callService("media_player", "media_previous_track")}
          >${iconPrev()}</skeuo-button
        >
        <skeuo-button
          primary
          .active=${playing}
          .disabled=${dead ||
          !(this._supports(stateObj, SUPPORT_PLAY) || this._supports(stateObj, SUPPORT_PAUSE))}
          .label=${tHa(
            this.hass,
            playing ? "ui.card.media_player.media_pause" : "ui.card.media_player.media_play",
            playing ? "pause" : "play"
          )}
          @press=${this._togglePlay}
          >${playing ? iconPause() : iconPlay()}</skeuo-button
        >
        <skeuo-button
          .disabled=${dead || !this._supports(stateObj, SUPPORT_NEXT_TRACK)}
          .label=${tHa(this.hass, "ui.card.media_player.media_next_track", "next")}
          @press=${() => this.callService("media_player", "media_next_track")}
          >${iconNext()}</skeuo-button
        >
        <skeuo-button
          .disabled=${dead || !this._supports(stateObj, SUPPORT_STOP)}
          .label=${tHa(this.hass, "ui.card.media_player.media_stop", "stop")}
          @press=${() => this.callService("media_player", "media_stop")}
            >${iconStop()}</skeuo-button
          >
        </div>
      </div>

      <skeuo-led-meter
        class="ladder"
        .value=${settable ? volume : 0}
        .segments=${15}
        .segmentHeight=${LED_SEGMENT}
        .label=${t(this.hass, "volume")}
        ?disabled=${dead || !settable}
      ></skeuo-led-meter>
    `;
  }

  static override styles: CSSResultGroup = [
    SkeuoBaseCard.styles,
    css`
      /* L'échelle occupe toute la hauteur du corps, à côté d'une colonne qui
         porte elle-même deux étages, les indicateurs puis le transport. La
         mettre dans la rangée du haut la limiterait à la hauteur du vinyle et
         lui ferait perdre la moitié de ses segments. */
      .body {
        align-items: stretch;
        justify-content: flex-start;
        padding: 0 26px;
        gap: 20px;
      }

      /* Les vis occupent les quatre coins du module, de 13 à 33 unités du bord.
         Tout ce qui court sur toute la hauteur ou toute la largeur du corps
         passe donc dessous si on le laisse aller jusqu'aux marges : la marge de
         26 unités ne suffit pas, il faut dégager les couloirs des vis. */
      .left {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 10px;
        /* Remonte la rangée de transport au-dessus des vis du bas. */
        padding-bottom: 8px;
      }

      /* Écarte l'échelle du couloir des vis de droite. */
      .ladder {
        align-self: center;
        margin-right: 16px;
      }

      .top {
        display: flex;
        align-items: center;
        gap: 18px;
        min-height: 0;
      }

      .mid {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      /* Plaques gravées : le nom de ce qui passe est en clair, l'état au-dessus
         reste en retrait. Une seule ligne chacune, coupée proprement plutôt que
         de faire respirer la carte à chaque changement de titre. */
      .plate {
        margin: 0;
        font-family: var(--skeuo-font-lcd);
        font-size: 14px;
        line-height: 18px;
        letter-spacing: 0.6px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .state {
        color: #85888b;
        text-transform: uppercase;
        letter-spacing: 2.1px;
      }
      .title {
        color: #e4e0d4;
        margin-bottom: 6px;
      }

      .btn-row {
        display: flex;
        align-items: center;
        gap: 14px;
      }
    `,
  ];
}

registerCard({
  type: "skeuo-media-card",
  name: { fr: "Skeuo · Multimédia", en: "Skeuo · Media player" },
  description: {
    fr: "Vinyle, échelle à LED, fader de volume et transport complet.",
    en: "Vinyl record, LED ladder, volume fader and full transport.",
  },
  preview: true,
});

declare global {
  interface HTMLElementTagNameMap {
    "skeuo-media-card": SkeuoMediaCard;
  }
}
