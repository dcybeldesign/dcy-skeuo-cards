import {
  html,
  css,
  nothing,
  type PropertyValues,
  type TemplateResult,
  type CSSResultGroup,
} from "lit";
import { customElement, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

import { DEFAULT_TEXTURE, SkeuoBaseCard, type SkeuoBaseConfig } from "../core/base-card";
import { type HassEntity, isUnavailable, numericState } from "../core/ha";
import { trimNumber } from "../core/format";
import { ForecastController, type ForecastItem } from "../core/forecast";
import { domainRequired, isFrench, t } from "../core/localize";
import { baseSchema, computeHelper, computeLabel, registerCard } from "../core/register";
import { isNight } from "../core/sun";

import "../components/screen";
import { weatherIconName } from "../components/weather-icon";

interface ForecastCardConfig extends SkeuoBaseConfig {
  /** Nombre de jours affichés, de 3 à 7. */
  days?: number;
}

/** Marge interne du corps, de chaque côté, en unités de design. */
const BODY_PADDING = 22;
/** Au-delà, une colonne isolée s'étalerait au lieu de rester une vignette. */
const MAX_COLUMN = 130;
const MAX_SCREEN = 118;

const clamp = (value: number, low: number, high: number): number =>
  Math.min(high, Math.max(low, value));

/**
 * Géométrie d'une colonne pour un nombre de jours et une largeur de plan.
 *
 * La largeur du plan n'est pas fixe : elle vaut 615 dans une cellule standard
 * et s'étire jusqu'à 1000 dans une section large. Calculer les colonnes sur une
 * constante donnerait une rangée trop large pour la cellule étroite, qui
 * passerait sous les vis d'angle.
 */
const layout = (count: number, stageWidth: number) => {
  const gap = count > 5 ? 10 : 16;
  const available = stageWidth - 2 * BODY_PADDING;
  const column = Math.min(MAX_COLUMN, (available - (count - 1) * gap) / count);
  const screen = Math.min(MAX_SCREEN, column);
  return {
    gap,
    column,
    screen,
    screenHeight: Math.min(112, column * 1.25),
    icon: screen * 0.46,
    // La ligne de températures est ce qui sature une colonne étroite en
    // premier : elle ne se coupe pas, elle rétrécit.
    tempSize: clamp(column * 0.17, 12, 19),
    tempGap: clamp(column * 0.08, 5, 9),
  };
};

@customElement("skeuo-forecast-card")
export class SkeuoForecastCard extends SkeuoBaseCard<ForecastCardConfig> {
  @state() private _forecast?: ForecastItem[];

  private _subscription = new ForecastController(this, (items) => {
    this._forecast = items;
  });

  protected override validateConfig(config: ForecastCardConfig): void {
    this.expectDomain(config, "weather");
  }

  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate?.(changed);
    this._subscription.sync(this.hass, this.stateObj);
  }

  /**
   * Le soleil n'est suivi que si la carte peut en avoir besoin. Sur des
   * prévisions quotidiennes, l'icône ne change pas avec l'heure et suivre
   * `sun.sun` ne ferait que redessiner la carte deux fois par jour pour rien.
   */
  protected override entityIds(): string[] {
    const ids = super.entityIds();
    const daily = this._subscription.type === undefined || this._subscription.type === "daily";
    return !daily && this.hass?.states["sun.sun"] ? [...ids, "sun.sun"] : ids;
  }

  public static getConfigForm() {
    return {
      schema: [
        ...baseSchema(),
        {
          type: "grid",
          name: "",
          schema: [
            { name: "days", selector: { number: { min: 3, max: 7, step: 1, mode: "slider" } } },
          ],
        },
      ],
      computeLabel,
      computeHelper,
      assertConfig: (config: ForecastCardConfig) => {
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
  ): Partial<ForecastCardConfig> {
    const pick =
      entities.find((e) => e.startsWith("weather.")) ??
      entitiesFallback.find((e) => e.startsWith("weather.")) ??
      "weather.home";
    return { entity: pick, days: 5, texture: DEFAULT_TEXTURE };
  }

  /* ------------------------------------------------------------- lecture */

  private get _days(): number {
    const asked = this._config?.days;
    if (asked === undefined || !Number.isFinite(asked)) return 5;
    return Math.min(7, Math.max(3, Math.round(asked)));
  }

  private _unit(stateObj: HassEntity): string {
    return (
      (stateObj.attributes.temperature_unit as string | undefined) ??
      this.hass?.config?.unit_system?.temperature ??
      "°C"
    );
  }

  /**
   * Unité raccourcie au seul degré.
   *
   * Une colonne de prévision porte deux nombres côte à côte : garder le C ou le
   * F sur chacun ferait quatre caractères de plus par jour, et sur sept jours
   * la rangée ne tient plus. Le degré seul est la convention de tous les
   * bulletins, et l'échelle complète reste lisible sur la carte météo. Une
   * unité qui ne commencerait pas par un degré est laissée intacte, faute de
   * savoir quoi en retirer.
   */
  private _shortUnit(stateObj: HassEntity): string {
    const unit = this._unit(stateObj);
    return unit.startsWith("°") ? "°" : unit;
  }

  private get _language(): string {
    return isFrench(this.hass) ? "fr-FR" : this.hass?.locale?.language || "en-GB";
  }

  /**
   * Cet élément de prévision tombe-t-il de nuit ?
   *
   * Une prévision quotidienne couvre le jour entier, la question ne se pose
   * pas. Le découpage bi-quotidien porte la réponse dans `is_daytime`. Pour
   * l'horaire, elle se déduit du soleil, en tenant compte des levers et
   * couchers à venir et non du seul moment présent.
   */
  private _isNight(item: ForecastItem): boolean {
    if (this._subscription.type === undefined || this._subscription.type === "daily") return false;
    if (item.is_daytime !== undefined) return !item.is_daytime;
    const at = new Date(item.datetime);
    if (Number.isNaN(at.getTime())) return false;
    return isNight(this.hass, at) ?? false;
  }

  /**
   * Étiquette de colonne.
   *
   * Sur des prévisions horaires, le nom du jour ne distingue rien : les sept
   * colonnes tombent presque toujours dans la même journée et affichent sept
   * fois la même abréviation. C'est l'heure qui porte l'information à ce
   * découpage.
   *
   * Le point final que certaines langues ajoutent au nom du jour est retiré :
   * l'étiquette est déjà en capitales et déjà comprise comme une abréviation,
   * le point ne fait qu'ajouter du bruit sous une vignette de moins de cent
   * pixels.
   */
  private _dayLabel(item: ForecastItem): string {
    const date = new Date(item.datetime);
    if (Number.isNaN(date.getTime())) return "";
    if (this._subscription.type === "hourly") {
      return date.toLocaleTimeString(this._language, { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString(this._language, { weekday: "short" }).replace(/\.$/, "");
  }

  /* --------------------------------------------------------------- rendu */

  protected renderContent(stateObj: HassEntity): TemplateResult {
    const dead = isUnavailable(stateObj);
    const items = (this._forecast ?? []).slice(0, this._days);

    if (dead || items.length === 0) {
      return html`
        <p class="empty">
          ${dead ? t(this.hass, "unavailable") : t(this.hass, "forecast_unavailable")}
        </p>
      `;
    }

    // La vignette se calcule sur le nombre réel de jours reçus, pas sur le
    // nombre demandé : une station qui n'en renvoie que trois doit remplir la
    // carte, pas laisser deux colonnes vides à droite.
    const geo = layout(items.length, this._scaler.stageWidth);
    const unit = this._shortUnit(stateObj);

    return html`
      <div class="row" style=${styleMap({ gap: `${geo.gap}px` })}>
        ${items.map((item) => this._renderDay(item, geo, unit))}
      </div>
    `;
  }

  private _renderDay(
    item: ForecastItem,
    geo: ReturnType<typeof layout>,
    unit: string
  ): TemplateResult {
    const high = numericState(item.temperature);
    const low = numericState(item.templow);

    return html`
      <div class="day" style=${styleMap({ width: `${geo.column}px` })}>
        <p class="label">${this._dayLabel(item)}</p>
        <skeuo-screen bare .width=${geo.screen} .height=${geo.screenHeight}>
          <skeuo-weather-icon
            .condition=${weatherIconName(item.condition ?? "exceptional", this._isNight(item))}
            .size=${geo.icon}
            .glow=${false}
          ></skeuo-weather-icon>
        </skeuo-screen>
        <p
          class="temps"
          style=${styleMap({ fontSize: `${geo.tempSize}px`, gap: `${geo.tempGap}px` })}
        >
          <span class="hi">${high !== undefined ? `${trimNumber(high)}${unit}` : "—"}</span>
          ${low !== undefined ? html`<span class="lo">${trimNumber(low)}${unit}</span>` : nothing}
        </p>
      </div>
    `;
  }

  static override styles: CSSResultGroup = [
    SkeuoBaseCard.styles,
    css`
      .body {
        padding: 0 22px;
      }

      .row {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .day {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 7px;
      }

      .label {
        margin: 0;
        font-size: 14px;
        line-height: 17px;
        letter-spacing: 2.1px;
        color: var(--skeuo-label, #85888b);
        text-transform: uppercase;
        white-space: nowrap;
      }

      /* Le maximum en ambre, le minimum en gris : la hiérarchie se lit d'un
         coup d'œil sans avoir à décoder deux chiffres de même poids. */
      /* La taille et l'écart sont posés à l'unité près par le rendu, qui est le
         seul à connaître la largeur de colonne du moment. */
      .temps {
        margin: 0;
        display: flex;
        font-family: var(--skeuo-font-lcd);
        line-height: 1.2;
        white-space: nowrap;
      }
      .hi {
        color: var(--skeuo-accent, #e2a659);
        text-shadow: 0 0 7px currentColor;
      }
      /* Le minimum reste en retrait du maximum, mais pas au point de disparaître
         sur la façade : le gris du mockup passait sous le seuil de lecture une
         fois ramené à la taille réelle d'une colonne. */
      .lo {
        color: #8d9093;
      }

      .empty {
        margin: 0;
        font-family: var(--skeuo-font-lcd);
        font-size: 20px;
        letter-spacing: 1px;
        color: #6b5a44;
      }
    `,
  ];
}

registerCard({
  type: "skeuo-forecast-card",
  name: { fr: "Skeuo · Prévisions", en: "Skeuo · Forecast" },
  description: {
    fr: "Trois à sept jours, chacun avec son icône sur écran et ses températures.",
    en: "Three to seven days, each with its icon on screen and its temperatures.",
  },
  preview: true,
});

declare global {
  interface HTMLElementTagNameMap {
    "skeuo-forecast-card": SkeuoForecastCard;
  }
}
