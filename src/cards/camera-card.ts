import { html, css, nothing, type TemplateResult, type CSSResultGroup } from "lit";
import { customElement, state } from "lit/decorators.js";

import { DEFAULT_TEXTURE, SkeuoBaseCard, type SkeuoBaseConfig } from "../core/base-card";
import { type HassEntity, fireEvent, isUnavailable } from "../core/ha";
import { domainRequired, isFrench, t } from "../core/localize";
import { baseSchema, computeHelper, computeLabel, registerCard } from "../core/register";
import { iconCamera, iconMotion, iconRecord } from "../components/icons";

import "../components/button";

interface CameraCardConfig extends SkeuoBaseConfig {
  /** Intervalle de rafraîchissement de l'image, en secondes. 0 fige l'image. */
  refresh?: number;
  /** Chemin de destination passé à `camera.record`. */
  record_filename?: string;
  /** Durée d'enregistrement en secondes. */
  record_duration?: number;
}

const DEFAULT_REFRESH = 10;

@customElement("skeuo-camera-card")
export class SkeuoCameraCard extends SkeuoBaseCard<CameraCardConfig> {
  /** Horodatage de la dernière image demandée, sert aussi d'anti-cache. */
  @state() private _frame = 0;
  /** L'aperçu tourne-t-il ? Piloté par le bouton, pas par l'entité. */
  @state() private _live = true;

  private _timer?: number;

  protected override validateConfig(config: CameraCardConfig): void {
    this.expectDomain(config, "camera");
  }

  /* ------------------------------------------------------- cycle de vie */

  public override connectedCallback(): void {
    super.connectedCallback();
    this._schedule();
  }

  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._stop();
  }

  public static getConfigForm() {
    return {
      schema: [
        ...baseSchema(),
        {
          type: "grid",
          name: "",
          schema: [
            {
              name: "refresh",
              selector: { number: { min: 0, max: 60, step: 1, mode: "slider", unit_of_measurement: "s" } },
            },
          ],
        },
        {
          type: "grid",
          name: "",
          schema: [
            { name: "record_filename", selector: { text: {} } },
            {
              name: "record_duration",
              selector: { number: { min: 5, max: 300, step: 5, mode: "box", unit_of_measurement: "s" } },
            },
          ],
        },
      ],
      computeLabel,
      computeHelper,
      assertConfig: (config: CameraCardConfig) => {
        if (config.entity && !config.entity.startsWith("camera.")) {
          throw new Error(domainRequired("camera"));
        }
      },
    };
  }

  public static getStubConfig(
    _hass: unknown,
    entities: string[],
    entitiesFallback: string[]
  ): Partial<CameraCardConfig> {
    const pick =
      entities.find((e) => e.startsWith("camera.")) ??
      entitiesFallback.find((e) => e.startsWith("camera.")) ??
      "camera.front_door";
    return { entity: pick, refresh: DEFAULT_REFRESH, texture: DEFAULT_TEXTURE };
  }

  /* ------------------------------------------------------ rafraîchissement */

  private get _interval(): number {
    const asked = this._config?.refresh;
    if (asked === undefined || !Number.isFinite(asked)) return DEFAULT_REFRESH;
    return Math.min(60, Math.max(0, Math.round(asked)));
  }

  /**
   * Une minuterie plutôt qu'un flux vidéo.
   *
   * Le direct passe par HLS ou WebRTC, que le frontend gère avec ses propres
   * éléments et que rien ne permet de piloter proprement depuis une carte
   * externe. La carte affiche donc l'instantané que Home Assistant publie déjà
   * sur `entity_picture`, redemandé à intervalle réglable, et le bouton Direct
   * ouvre la fiche de l'entité, où le vrai flux est joué.
   *
   * Rien n'est demandé en aperçu de configuration ni dans la vignette du
   * sélecteur : la carte y est instanciée plusieurs fois d'affilée, et autant
   * de minuteries taperaient sur la caméra pour rien.
   */
  private _schedule(): void {
    this._stop();
    if (this.preview || !this._live || this._interval === 0) return;
    this._timer = window.setInterval(() => {
      this._frame = Date.now();
    }, this._interval * 1000);
  }

  private _stop(): void {
    if (this._timer !== undefined) {
      window.clearInterval(this._timer);
      this._timer = undefined;
    }
  }

  /* ------------------------------------------------------------- lecture */

  /**
   * `entity_picture` porte déjà un jeton signé et donc une chaîne de requête.
   * Le paramètre anti-cache s'y ajoute, sans quoi le navigateur resservirait
   * la même image à chaque tour de minuterie.
   */
  private _frameUrl(stateObj: HassEntity): string | undefined {
    const base = stateObj.attributes.entity_picture as string | undefined;
    if (!base) return undefined;
    if (this._frame === 0 || this._interval === 0) return base;
    return `${base}${base.includes("?") ? "&" : "?"}skeuo=${this._frame}`;
  }

  private get _clock(): string {
    const at = this._frame === 0 ? new Date() : new Date(this._frame);
    return at.toLocaleTimeString(isFrench(this.hass) ? "fr-FR" : "en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  private get _canRecord(): boolean {
    return !!this._config?.record_filename;
  }

  /* ------------------------------------------------------------- actions */

  private _togglePreview(): void {
    this._live = !this._live;
    if (this._live) this._frame = Date.now();
    this._schedule();
  }

  private _toggleMotion(stateObj: HassEntity): void {
    const on = stateObj.attributes.motion_detection === true;
    this.callService("camera", on ? "disable_motion_detection" : "enable_motion_detection");
  }

  private _record(): void {
    if (!this._canRecord) return;
    this.callService("camera", "record", {
      filename: this._config!.record_filename,
      duration: this._config?.record_duration ?? 30,
    });
  }

  private _openStream(): void {
    fireEvent(this, "hass-more-info", { entityId: this._config?.entity ?? null });
  }

  /* --------------------------------------------------------------- rendu */

  protected renderContent(stateObj: HassEntity): TemplateResult {
    const dead = isUnavailable(stateObj);
    const off = stateObj.state === "off" || stateObj.state === "unavailable";
    const url = this._frameUrl(stateObj);
    const motion = stateObj.attributes.motion_detection;
    const streaming = this._live && this._interval > 0 && !off && !dead;

    return html`
      <div class="btn-col">
        <skeuo-button
          .active=${streaming}
          .disabled=${dead}
          .caption=${t(this.hass, "preview")}
          .label=${t(this.hass, "preview")}
          @press=${this._togglePreview}
          >${iconCamera()}</skeuo-button
        >
        <skeuo-button
          .active=${motion === true}
          .disabled=${dead || motion === undefined}
          .caption=${t(this.hass, "motion")}
          .label=${t(this.hass, "motion")}
          @press=${() => this._toggleMotion(stateObj)}
          >${iconMotion()}</skeuo-button
        >
        <skeuo-button
          variant="alert"
          .disabled=${dead || !this._canRecord}
          .caption=${t(this.hass, "record")}
          .label=${t(this.hass, "record")}
          @press=${this._record}
          >${iconRecord()}</skeuo-button
        >
      </div>

      <div
        class="viewport"
        role="button"
        tabindex="0"
        aria-label=${t(this.hass, "open_stream")}
        @click=${this._openStream}
        @keydown=${(ev: KeyboardEvent) => {
          if (ev.key === "Enter" || ev.key === " ") {
            ev.preventDefault();
            this._openStream();
          }
        }}
      >
        ${url && !off
          ? html`<img class="frame" src=${url} alt=${t(this.hass, "preview")} />`
          : html`<div class="blank">${iconCamera()}</div>`}

        <div class=${streaming ? "badge on" : "badge"}>
          <i class="dot"></i>
          <p class="badge-text">
            ${streaming ? t(this.hass, "live") : t(this.hass, "paused_preview")}
          </p>
        </div>
        ${url && !off ? html`<p class="clock">${this._clock}</p>` : nothing}
      </div>
    `;
  }

  static override styles: CSSResultGroup = [
    SkeuoBaseCard.styles,
    css`
      .body {
        justify-content: flex-start;
        align-items: center;
        gap: 30px;
        padding: 0 26px;
      }

      /* Trois boutons et leurs légendes font 207 unités pour 202 de corps
         disponible : l'écart entre eux passe à zéro, et la colonne se décale
         vers l'intérieur. Sans ce décalage, la légende du bas se superpose à la
         vis d'angle, que la colonne dépasse forcément en hauteur. Le décalage
         est porté par la colonne et non par la marge du corps, qui doit rester
         symétrique pour que l'écran garde son inclusion habituelle. */
      .btn-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0;
        margin-left: 14px;
        flex: none;
      }

      /* Vitre du moniteur : creusée comme les écrans LCD du pack, mais neutre,
         l'ambre teinterait l'image de la caméra. */
      /* Le moniteur court sur presque toute la largeur : sans cette marge, son
         angle bas-droite passerait sous la vis du même coin. */
      .viewport {
        position: relative;
        flex: 1;
        min-width: 0;
        margin-right: 16px;
        height: 196px;
        border-radius: 10px;
        overflow: hidden;
        cursor: pointer;
        background: radial-gradient(ellipse at 50% 35%, #1b1b1d, #0c0c0d 78%);
        box-shadow:
          inset 5px 5px 4px rgba(0, 0, 0, 0.9),
          inset 3px 3px 9px rgba(0, 0, 0, 0.85),
          inset -2px -2px 2px rgba(255, 255, 255, 0.05),
          0 0 0 3px #100b06,
          5px 5px 9px rgba(0, 0, 0, 0.55);
      }
      .viewport:focus-visible {
        outline: 2px solid var(--skeuo-accent, #e2a659);
        outline-offset: 3px;
      }

      /* contain et non cover : l'écran fait 2,32 pour 1 alors qu'une caméra
         donne du 16/9 ou du 4/3, donc remplir le cadre rognerait 23 % du champ
         de vision dans le premier cas et 43 % dans le second, sans que rien ne
         le signale. Les bandes laissées de part et d'autre montrent le fond de
         la vitre, ce que fait aussi un moniteur de vidéosurveillance devant une
         source qui ne remplit pas sa dalle. */
      .frame {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .blank {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #4a4d50;
      }
      .blank svg {
        width: 38px;
        height: 38px;
      }

      .badge {
        position: absolute;
        top: 10px;
        left: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: #5a5d60;
      }
      .badge.on .dot {
        background: #ff4d4d;
        box-shadow: 0 0 6px #ff4d4d, 0 0 3px #ff9d9d;
        animation: beat 2s ease-in-out infinite;
      }
      .badge-text {
        margin: 0;
        font-size: 14px;
        line-height: 17px;
        letter-spacing: 2.2px;
        font-weight: 700;
        text-transform: uppercase;
        color: #7f8285;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
      }
      .badge.on .badge-text {
        color: #ff8a8a;
      }

      .clock {
        position: absolute;
        bottom: 9px;
        right: 12px;
        margin: 0;
        font-family: var(--skeuo-font-lcd);
        font-size: 14px;
        letter-spacing: 0.9px;
        color: #b6b2a6;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
      }

      @keyframes beat {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.35;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .badge.on .dot {
          animation: none;
        }
      }
    `,
  ];
}

registerCard({
  type: "skeuo-camera-card",
  name: { fr: "Skeuo · Caméra", en: "Skeuo · Camera" },
  description: {
    fr: "Moniteur d'aperçu avec badge direct, détection de mouvement et enregistrement.",
    en: "Preview monitor with a live badge, motion detection and recording.",
  },
  preview: true,
});

declare global {
  interface HTMLElementTagNameMap {
    "skeuo-camera-card": SkeuoCameraCard;
  }
}
