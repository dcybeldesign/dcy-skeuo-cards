import { html, css, nothing, type TemplateResult, type CSSResultGroup } from "lit";
import { customElement } from "lit/decorators.js";

import { DEFAULT_TEXTURE, SkeuoBaseCard, type SkeuoBaseConfig } from "../core/base-card";
import {
  type HassEntity,
  computeEntityName,
  fireEvent,
  isUnavailable,
  numericState,
} from "../core/ha";
import { fitValueSize, shortTime } from "../core/format";
import { domainRequired, formatState, isFrench, t, tHa } from "../core/localize";
import { baseSchema, computeHelper, computeLabel, registerCard } from "../core/register";
import { iconLatch, iconLock, iconUnlock } from "../components/icons";

import "../components/screen";
import "../components/button";

/** Bit de supported_features du domaine lock : le pêne demi-tour. */
const SUPPORT_OPEN = 1;

/** Vert pour verrouillé, ambre pour ouvert, rouge quand le pêne est coincé. */
const STATE_COLORS: Record<string, string> = {
  locked: "#4dff6a",
  unlocked: "#e2a659",
  open: "#e2a659",
  jammed: "#ff6b5c",
};

@customElement("skeuo-lock-card")
export class SkeuoLockCard extends SkeuoBaseCard {
  protected override validateConfig(config: SkeuoBaseConfig): void {
    this.expectDomain(config, "lock");
  }

  public static getConfigForm() {
    return {
      schema: baseSchema(),
      computeLabel,
      computeHelper,
      assertConfig: (config: SkeuoBaseConfig) => {
        if (config.entity && !config.entity.startsWith("lock.")) {
          throw new Error(domainRequired("lock"));
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
      entities.find((e) => e.startsWith("lock.")) ??
      entitiesFallback.find((e) => e.startsWith("lock.")) ??
      "lock.front_door";
    return { entity: pick, texture: DEFAULT_TEXTURE };
  }

  /* ------------------------------------------------------------- lecture */

  private _supportsOpen(stateObj: HassEntity): boolean {
    const features = numericState(stateObj.attributes.supported_features) ?? 0;
    return (features & SUPPORT_OPEN) !== 0;
  }

  /**
   * Une serrure qui déclare un code_format attend un code à chaque manœuvre.
   * Le stocker dans la configuration du tableau de bord reviendrait à écrire
   * le code de la porte d'entrée en clair dans un fichier YAML sauvegardé et
   * synchronisé : on renvoie plutôt vers la fiche de l'entité, qui sait
   * demander le code au moment voulu.
   */
  private _needsCode(stateObj: HassEntity): boolean {
    return !!stateObj.attributes.code_format;
  }

  private _busy(stateObj: HassEntity): boolean {
    return stateObj.state === "locking" || stateObj.state === "unlocking" || stateObj.state === "opening";
  }

  /* ------------------------------------------------------------- actions */

  private _openMoreInfo(): void {
    fireEvent(this, "hass-more-info", { entityId: this._config?.entity ?? null });
  }

  private _toggleLock(stateObj: HassEntity): void {
    if (this._needsCode(stateObj)) {
      this._openMoreInfo();
      return;
    }
    this.callService("lock", stateObj.state === "locked" ? "unlock" : "lock");
  }

  private _openLatch(stateObj: HassEntity): void {
    if (this._needsCode(stateObj)) {
      this._openMoreInfo();
      return;
    }
    this.callService("lock", "open");
  }

  /* --------------------------------------------------------------- rendu */

  protected renderContent(stateObj: HassEntity): TemplateResult {
    const dead = isUnavailable(stateObj);
    const locked = stateObj.state === "locked";
    const busy = this._busy(stateObj);
    const label = formatState(this.hass, stateObj);
    const color = dead ? "#6b5a44" : busy ? "#9db8c9" : STATE_COLORS[stateObj.state] ?? this.accent;

    const time = shortTime(stateObj.last_changed, isFrench(this.hass) ? "fr-FR" : "en-GB");
    const by = stateObj.attributes.changed_by as string | undefined;
    const access = [t(this.hass, "last_access"), by, time].filter(Boolean).join(" · ");

    return html`
      <div class="slot">
        <skeuo-button
          primary
          variant="secure"
          .active=${locked}
          .disabled=${dead || busy}
          .caption=${t(this.hass, "lock")}
          .label=${tHa(this.hass, locked ? "ui.card.lock.unlock" : "ui.card.lock.lock", "lock")}
          @press=${() => this._toggleLock(stateObj)}
          >${locked ? iconLock() : iconUnlock()}</skeuo-button
        >
      </div>

      <div class="mid">
        <skeuo-screen
          .value=${label}
          .label=${computeEntityName(stateObj)}
          .valueSize=${fitValueSize(label)}
          .color=${color}
        ></skeuo-screen>
        ${time ? html`<p class="access">${access}</p>` : nothing}
      </div>

      <div class="slot">
        <skeuo-button
          .disabled=${dead || busy || !this._supportsOpen(stateObj)}
          .caption=${t(this.hass, "latch")}
          .label=${tHa(this.hass, "ui.card.lock.open", "latch")}
          @press=${() => this._openLatch(stateObj)}
          >${iconLatch()}</skeuo-button
        >
      </div>
    `;
  }

  static override styles: CSSResultGroup = [
    SkeuoBaseCard.styles,
    css`
      /* Les deux boutons sont calés sur la hauteur de la colonne centrale, pas
         sur la leur : sans ça, le grand bouton verrou et le petit loquet se
         centreraient chacun sur sa propre hauteur et ne seraient pas alignés
         entre eux. */
      .slot {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 180px;
      }
      .mid {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 9px;
      }
      .access {
        margin: 0;
        font-family: var(--skeuo-font-lcd);
        font-size: 13px;
        letter-spacing: 0.6px;
        color: var(--skeuo-label, #85888b);
        white-space: nowrap;
      }
      .body {
        padding: 0 20px;
      }
    `,
  ];
}

registerCard({
  type: "skeuo-lock-card",
  name: { fr: "Skeuo · Serrure", en: "Skeuo · Lock" },
  description: {
    fr: "Bouton de verrouillage, écran d'état, dernier accès et bouton de loquet.",
    en: "Locking button, state screen, last access and latch button.",
  },
  preview: true,
});

declare global {
  interface HTMLElementTagNameMap {
    "skeuo-lock-card": SkeuoLockCard;
  }
}
