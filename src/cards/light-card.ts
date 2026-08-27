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
import { type HassEntity, isActive, isUnavailable, numericState } from "../core/ha";
import { domainRequired, t, tHa } from "../core/localize";
import { baseSchema, computeHelper, computeLabel, registerCard } from "../core/register";
import { formatFixed } from "../core/format";
import { HeldValue } from "../core/held";
import { SmoothValue } from "../core/smooth";

import "../components/screen";
import "../components/fader";
import "../components/toggle";
import "../components/knob";

interface LightCardConfig extends SkeuoBaseConfig {
  show_color_temp?: boolean;
  show_color?: boolean;
}

const COLOR_MODES = ["hs", "xy", "rgb", "rgbw", "rgbww"];

/** Quel réglage gouverne la lumière en ce moment. */
type ActiveMode = "color_temp" | "color" | "none";

const clamp255 = (v: number): number => Math.min(255, Math.max(0, Math.round(v)));

/**
 * Température de couleur vers RVB, approximation de Tanner Helland.
 *
 * Sert uniquement de repli : Home Assistant expose déjà `rgb_color` calculé
 * depuis la température quand la lampe est en mode blanc, mais toutes les
 * intégrations ne le remontent pas.
 */
const kelvinToRgb = (kelvin: number): [number, number, number] => {
  const k = Math.min(40000, Math.max(1000, kelvin)) / 100;
  let r: number;
  let g: number;
  let b: number;
  if (k <= 66) {
    r = 255;
    g = 99.4708025861 * Math.log(k) - 161.1195681661;
    b = k <= 19 ? 0 : 138.5177312231 * Math.log(k - 10) - 305.0447927307;
  } else {
    r = 329.698727446 * Math.pow(k - 60, -0.1332047592);
    g = 288.1221695283 * Math.pow(k - 60, -0.0755148492);
    b = 255;
  }
  return [clamp255(r), clamp255(g), clamp255(b)];
};

/** Teinte et saturation de Home Assistant (0-360, 0-100) vers RVB, valeur au maximum. */
const hsToRgb = (hue: number, saturation: number): [number, number, number] => {
  const h = ((hue % 360) + 360) % 360;
  const s = Math.min(100, Math.max(0, saturation)) / 100;
  const c = s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = 1 - c;
  const seg: [number, number, number] =
    h < 60 ? [c, x, 0]
    : h < 120 ? [x, c, 0]
    : h < 180 ? [0, c, x]
    : h < 240 ? [0, x, c]
    : h < 300 ? [x, 0, c]
    : [c, 0, x];
  return [clamp255((seg[0] + m) * 255), clamp255((seg[1] + m) * 255), clamp255((seg[2] + m) * 255)];
};

/**
 * Plancher du variateur, en pourcentage. La molette ne peut pas éteindre :
 * c'est le rôle de l'interrupteur de la carte, et un variateur qui coupe en
 * butée fait perdre le réglage qu'on venait de trouver.
 */
const MIN_BRIGHTNESS = 1;

@customElement("skeuo-light-card")
export class SkeuoLightCard extends SkeuoBaseCard<LightCardConfig> {
  /**
   * Intensité affichée, lissée.
   *
   * L'échelle est un pourcentage, comme la position du volet : les réglages par
   * défaut du contrôleur conviennent tels quels.
   */
  private _brightness = new SmoothValue(this);

  /**
   * Les deux faders ne sont pas lissés : on ne veut pas qu'un curseur que
   * l'utilisateur vient de poser reparte tout seul. Ils ont en revanche le
   * même besoin de tenir leur valeur le temps que la lampe confirme.
   */
  private _warmth = new HeldValue(this);
  private _hue = new HeldValue(this);

  protected override validateConfig(config: LightCardConfig): void {
    this.expectDomain(config, "light");
  }

  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate?.(changed);
    const stateObj = this.stateObj;
    if (stateObj) this._brightness.set(this._brightnessPct(stateObj));
  }

  protected override isOff(stateObj: HassEntity): boolean {
    return !isActive(stateObj);
  }

  public static getConfigForm() {
    return {
      schema: [
        ...baseSchema(),
        {
          type: "grid",
          name: "",
          schema: [
            { name: "show_color_temp", selector: { boolean: {} } },
            { name: "show_color", selector: { boolean: {} } },
          ],
        },
      ],
      computeLabel,
      computeHelper,
      assertConfig: (config: LightCardConfig) => {
        if (config.entity && !config.entity.startsWith("light.")) {
          throw new Error(domainRequired("light"));
        }
      },
    };
  }

  public static getStubConfig(
    _hass: unknown,
    entities: string[],
    entitiesFallback: string[]
  ): Partial<LightCardConfig> {
    const pick =
      entities.find((e) => e.startsWith("light.")) ??
      entitiesFallback.find((e) => e.startsWith("light.")) ??
      "light.living_room";
    return { entity: pick, texture: DEFAULT_TEXTURE };
  }

  /* --------------------------------------------------------- capacités */

  private _colorModes(stateObj: HassEntity): string[] {
    const modes = stateObj.attributes.supported_color_modes;
    return Array.isArray(modes) ? (modes as string[]) : [];
  }

  private _supportsBrightness(stateObj: HassEntity): boolean {
    return this._colorModes(stateObj).some((m) => m !== "onoff");
  }

  private _supportsColorTemp(stateObj: HassEntity): boolean {
    if (this._config?.show_color_temp === false) return false;
    return this._colorModes(stateObj).includes("color_temp");
  }

  private _supportsColor(stateObj: HassEntity): boolean {
    if (this._config?.show_color === false) return false;
    return this._colorModes(stateObj).some((m) => COLOR_MODES.includes(m));
  }

  /**
   * Réglage aux commandes en ce moment.
   *
   * Une lampe ne peut pas être à la fois sur une température de blanc et sur
   * une couleur : Home Assistant bascule `color_mode` dès qu'on lui envoie
   * l'un ou l'autre. On lit donc cet attribut au lieu de retenir nous-mêmes le
   * dernier fader touché, ce qui garderait aussi la carte juste quand la
   * lumière est pilotée d'ailleurs (scène, autre tablette, automatisation).
   */
  private _activeMode(stateObj: HassEntity): ActiveMode {
    const mode = stateObj.attributes.color_mode as string | undefined;
    if (mode === "color_temp") return "color_temp";
    if (mode && COLOR_MODES.includes(mode)) return "color";

    // Attribut absent : certaines intégrations ne le remontent pas. On déduit
    // alors du réglage présent, plutôt que de griser les deux faders en
    // permanence. Un `color_mode` explicitement inconnu, lui, reste inconnu :
    // dans ce cas aucun des deux ne peut se prétendre aux commandes.
    if (mode === undefined) {
      if (numericState(stateObj.attributes.color_temp_kelvin) !== undefined) return "color_temp";
      if (Array.isArray(stateObj.attributes.hs_color)) return "color";
    }
    return "none";
  }

  /* ------------------------------------------------------------ valeurs */

  private _brightnessPct(stateObj: HassEntity): number {
    const raw = numericState(stateObj.attributes.brightness);
    if (raw === undefined) return isActive(stateObj) ? 100 : 0;
    return Math.round((raw / 255) * 100);
  }

  private get _minKelvin(): number {
    return numericState(this.stateObj?.attributes.min_color_temp_kelvin) ?? 2000;
  }
  private get _maxKelvin(): number {
    return numericState(this.stateObj?.attributes.max_color_temp_kelvin) ?? 6500;
  }

  /**
   * Le fader a son maximum en haut et la bande de couleur y place le chaud.
   * Or un blanc chaud correspond à une température de couleur basse : la
   * conversion est donc inversée, sinon le curseur monte vers le bleu.
   */
  private _warmthFromKelvin(kelvin: number): number {
    const span = this._maxKelvin - this._minKelvin;
    if (span <= 0) return 50;
    return Math.round(((this._maxKelvin - kelvin) / span) * 100);
  }
  private _kelvinFromWarmth(warmth: number): number {
    const span = this._maxKelvin - this._minKelvin;
    return Math.round(this._maxKelvin - (warmth / 100) * span);
  }

  private _warmthFromState(stateObj: HassEntity): number {
    const k = numericState(stateObj.attributes.color_temp_kelvin);
    return k === undefined ? 50 : this._warmthFromKelvin(k);
  }

  private _currentWarmth(stateObj: HassEntity): number {
    return this._warmth.read(this._warmthFromState(stateObj));
  }

  private _hueFromState(stateObj: HassEntity): number {
    const hs = stateObj.attributes.hs_color;
    if (!Array.isArray(hs) || hs.length < 1) return 0;
    return Math.round(((hs[0] as number) / 360) * 100);
  }

  private _currentHue(stateObj: HassEntity): number {
    return this._hue.read(this._hueFromState(stateObj));
  }

  /**
   * Couleur émise par l'ampoule, pour la lueur et le symbole de l'interrupteur.
   *
   * Elle suit le réglage aux commandes : blanc chaud ou froid quand la lampe
   * est sur sa température de couleur, teinte choisie quand elle est sur une
   * couleur. `rgb_color` reflète déjà ce mode quand l'intégration le fournit ;
   * sinon on le reconstruit depuis la grandeur du mode actif.
   */
  private _lightColor(stateObj: HassEntity): string {
    const rgb = stateObj.attributes.rgb_color;
    if (Array.isArray(rgb) && rgb.length >= 3) {
      return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    }

    const mode = this._activeMode(stateObj);
    if (mode === "color_temp") {
      const kelvin = numericState(stateObj.attributes.color_temp_kelvin);
      if (kelvin !== undefined) {
        const [r, g, b] = kelvinToRgb(kelvin);
        return `rgb(${r}, ${g}, ${b})`;
      }
    }
    if (mode === "color") {
      const hs = stateObj.attributes.hs_color;
      if (Array.isArray(hs) && hs.length >= 2) {
        const [r, g, b] = hsToRgb(hs[0] as number, hs[1] as number);
        return `rgb(${r}, ${g}, ${b})`;
      }
    }
    return this.accent;
  }

  /* ------------------------------------------------------------- actions */

  /**
   * La molette est déjà sous le doigt à sa nouvelle position : on y cale la
   * valeur lissée sans animer, sinon elle reviendrait en arrière au
   * relâchement pour re-parcourir le trajet que l'utilisateur venait de faire.
   *
   * Elle ne descend jamais sous MIN_BRIGHTNESS : éteindre est le rôle de
   * l'interrupteur, pas celui du variateur. Sur un vrai panneau on ne coupe pas
   * une lampe en tournant le bouton à fond, et surtout un variateur qui éteint
   * en butée oblige à rallumer par un autre geste pour retrouver sa lumière.
   */
  private _setBrightness(pct: number): void {
    const cible = Math.max(MIN_BRIGHTNESS, pct);
    this._brightness.commit(cible);
    this.callService("light", "turn_on", { brightness_pct: cible });
  }

  private _setWarmth(warmth: number): void {
    const stateObj = this.stateObj;
    if (stateObj) this._warmth.commit(warmth, this._warmthFromState(stateObj));
    this.callService("light", "turn_on", { color_temp_kelvin: this._kelvinFromWarmth(warmth) });
  }

  private _setHue(value: number, stateObj: HassEntity): void {
    this._hue.commit(value, this._hueFromState(stateObj));
    const hs = stateObj.attributes.hs_color;
    const saturation = Array.isArray(hs) && hs.length > 1 ? (hs[1] as number) : 100;
    this.callService("light", "turn_on", { hs_color: [(value / 100) * 360, saturation] });
  }

  private _toggle(): void {
    this.callService("light", "toggle");
  }

  /* --------------------------------------------------------------- rendu */

  protected renderContent(stateObj: HassEntity): TemplateResult {
    const off = isUnavailable(stateObj);
    const on = isActive(stateObj);
    const dimmable = this._supportsBrightness(stateObj);
    const mode = this._activeMode(stateObj);

    // La molette et l'écran lisent la même valeur lissée, sinon le pourcentage
    // arriverait avant que le repère ait fini sa course.
    const brightness = this._brightness.value;

    return html`
      ${dimmable
        ? html`
            <skeuo-knob
              .value=${brightness}
              .min=${MIN_BRIGHTNESS}
              .size=${170}
              .disabled=${off}
              .label=${tHa(this.hass, "ui.card.light.brightness", "brightness")}
              @knob-change=${(e: CustomEvent) => this._setBrightness(e.detail.value)}
            ></skeuo-knob>
          `
        : nothing}
      ${this._supportsColorTemp(stateObj)
        ? html`
            <skeuo-fader
              gradient="warmth"
              .value=${this._currentWarmth(stateObj)}
              .caption=${t(this.hass, "color_temp")}
              .disabled=${off || !on}
              .inactive=${mode !== "color_temp"}
              @fader-change=${(e: CustomEvent) => this._setWarmth(e.detail.value)}
            ></skeuo-fader>
          `
        : nothing}
      ${this._supportsColor(stateObj)
        ? html`
            <skeuo-fader
              gradient="hue"
              .value=${this._currentHue(stateObj)}
              .caption=${t(this.hass, "color")}
              .disabled=${off || !on}
              .inactive=${mode !== "color"}
              @fader-change=${(e: CustomEvent) => this._setHue(e.detail.value, stateObj)}
            ></skeuo-fader>
          `
        : nothing}

      <skeuo-screen
        .value=${dimmable
          ? formatFixed(this.hass, Math.round(brightness), 0, "%")
          : on
            ? t(this.hass, "on")
            : t(this.hass, "off")}
        .label=${dimmable
          ? tHa(this.hass, "ui.card.light.brightness", "brightness")
          : (stateObj.attributes.friendly_name ?? "")}
        .color=${on ? this.accent : "#6b5a44"}
      ></skeuo-screen>

      <skeuo-toggle
        .checked=${on}
        .disabled=${off}
        .color=${this._lightColor(stateObj)}
        .caption=${on ? t(this.hass, "on") : t(this.hass, "off")}
        .label=${tHa(this.hass, "ui.card.common.turn_on", "on")}
        @toggle=${this._toggle}
      ></skeuo-toggle>
    `;
  }

  static override styles: CSSResultGroup = [
    SkeuoBaseCard.styles,
    css`
      .body {
        gap: 4px;
      }
    `,
  ];
}

registerCard({
  type: "skeuo-light-card",
  name: { fr: "Skeuo · Lumière", en: "Skeuo · Light" },
  description: {
    fr: "Variateur à molette métal, faders teinte et couleur, interrupteur à bascule.",
    en: "Machined metal dimmer knob, warmth and colour faders, rocker switch.",
  },
  preview: true,
});

declare global {
  interface HTMLElementTagNameMap {
    "skeuo-light-card": SkeuoLightCard;
  }
}
