import {
  LitElement,
  html,
  css,
  nothing,
  type CSSResultGroup,
  type PropertyValues,
  type TemplateResult,
} from "lit";
import { property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { classMap } from "lit/directives/class-map.js";

import {
  type ActionConfig,
  type ActionConfigParams,
  type ActionHandlerEvent,
  type HassEntity,
  type HomeAssistant,
  STATE_NOT_RUNNING,
  actionHandler,
  computeEntityName,
  handleAction,
  hasAction,
  isUnavailable,
} from "./ha";
import { t, wrongDomain } from "./localize";
import { DESIGN, SCREW_INSET, SCREW_SIZE, ScaleController, rowsForColumns } from "./scaler";
import { chromeStyles } from "../styles/chrome";

export type MaterialName = "carbon" | "graphite" | "brushed";

export interface SkeuoBaseConfig extends ActionConfigParams {
  type: string;
  entity: string;
  name?: string;
  subtitle?: string;
  material?: MaterialName;
  accent?: string;
  screws?: boolean;
  /**
   * Densité du grain de la matière, en pourcentage. 100 = réglage d'origine.
   * Sans effet sur le graphite, qui n'a pas de grain.
   */
  texture?: number;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

export interface LovelaceGridOptions {
  columns?: number | "full";
  rows?: number;
  min_columns?: number;
  max_columns?: number;
  min_rows?: number;
  max_rows?: number;
}

/** Ambre des écrans LCD, identité visuelle du pack. */
export const DEFAULT_ACCENT = "#e2a659";

/** Densité de grain par défaut, en pourcentage : le croisement se lit,
 *  sans que le tissage prenne le pas sur les contrôles qu'il porte. */
export const DEFAULT_TEXTURE = 60;

export abstract class SkeuoBaseCard<
  TConfig extends SkeuoBaseConfig = SkeuoBaseConfig,
> extends LitElement {
  /** attribute: false est obligatoire : hass est un objet volumineux et non sérialisable. */
  @property({ attribute: false }) public hass?: HomeAssistant;

  /** Posé par hui-card : vignette du picker ou aperçu de l'éditeur. */
  @property({ type: Boolean }) public preview = false;

  @property({ reflect: true, type: String }) public layout?: string;

  @state() protected _config?: TConfig;

  protected _scaler = new ScaleController(this);

  /** Colonnes de grille visées par défaut, redéfini par les cartes larges. */
  protected static gridColumns = 12;

  /* -------------------------------------------------------------- config */

  public setConfig(config: TConfig): void {
    if (!config) {
      throw new Error(t(this.hass, "no_entity"));
    }
    if (!config.entity) {
      throw new Error(t(this.hass, "no_entity"));
    }
    this.validateConfig(config);
    this._config = { screws: true, material: "carbon", ...config };
  }

  /** Surcharge côté carte pour vérifier le domaine attendu. */
  protected validateConfig(_config: TConfig): void {
    /* rien par défaut */
  }

  /**
   * L'appareil est-il à l'arrêt ? La carte passe alors en gris.
   *
   * Faux par défaut : tous les domaines n'ont pas d'état « éteint ». Un volet
   * fermé ou un capteur bas sont des états de fonctionnement normaux, pas un
   * appareil hors service.
   */
  protected isOff(_stateObj: HassEntity): boolean {
    return false;
  }

  protected expectDomain(config: TConfig, ...domains: string[]): void {
    const domain = config.entity.split(".")[0];
    if (!domains.includes(domain)) {
      throw new Error(wrongDomain(config.entity, domains, this.hass));
    }
  }

  /* ------------------------------------------------------------- sizing */

  public getCardSize(): number {
    // Unité masonry = 50px. Le plan de référence fait 310px de haut.
    return Math.ceil(DESIGN.height / 50);
  }

  public getGridOptions(): LovelaceGridOptions {
    const columns = (this.constructor as typeof SkeuoBaseCard).gridColumns;
    return {
      columns,
      rows: rowsForColumns(columns),
      min_columns: 6,
      min_rows: 2,
    };
  }

  /* ------------------------------------------------------------ réactivité */

  /**
   * hass est réassigné à chaque changement d'état de n'importe quelle entité
   * du système, soit plusieurs fois par seconde sur une installation moyenne.
   * Sans ce filtre, toutes les cartes du dashboard rendraient à chaque tick :
   * c'est la première cause de dashboards injouables sur petit matériel.
   *
   * Les objets d'état étant immuables, la comparaison de référence suffit.
   */
  protected override shouldUpdate(changedProps: PropertyValues): boolean {
    if (!this._config) return false;
    if (!changedProps.has("hass")) return changedProps.size > 0;

    const oldHass = changedProps.get("hass") as HomeAssistant | undefined;
    if (!oldHass || !this.hass) return true;

    // Thème, langue et perte de connexion doivent repasser malgré le filtre.
    if (
      oldHass.themes !== this.hass.themes ||
      oldHass.locale !== this.hass.locale ||
      oldHass.connected !== this.hass.connected ||
      oldHass.config?.state !== this.hass.config?.state
    ) {
      return true;
    }

    return this.entityIds().some((id) => oldHass.states[id] !== this.hass!.states[id]);
  }

  /** Entités suivies par la carte. Redéfini si la carte en lit plusieurs. */
  protected entityIds(): string[] {
    return this._config?.entity ? [this._config.entity] : [];
  }

  protected get stateObj(): HassEntity | undefined {
    if (!this.hass || !this._config?.entity) return undefined;
    return this.hass.states[this._config.entity];
  }

  protected get accent(): string {
    return this._config?.accent ?? DEFAULT_ACCENT;
  }

  /**
   * Facteur de grain, borné à l'intervalle 0 à 1.5.
   *
   * 0 retire complètement le motif et laisse la couleur de fond nue, ce qui est
   * un rendu valable en soi. Entre 0 et 0.4 en revanche, la matière se dégrade :
   * les rayures du métal brossé passent sous le pixel et moirent, et le lustre
   * de chaque mèche du tissage n'a plus assez de pixels pour se déployer. Ces
   * valeurs restent accessibles, c'est un choix d'affichage, pas une erreur.
   */
  protected get textureScale(): number {
    const pct = this._config?.texture;
    if (pct === undefined || !Number.isFinite(pct)) return DEFAULT_TEXTURE / 100;
    return Math.min(1.5, Math.max(0, pct / 100));
  }

  /* -------------------------------------------------------------- services */

  /**
   * En preview (vignette du picker, aperçu de l'éditeur), la carte est rendue
   * plusieurs fois simultanément et ne doit surtout pas piloter d'appareil.
   */
  protected callService(
    domain: string,
    service: string,
    data: Record<string, unknown> = {}
  ): void {
    if (this.preview || !this.hass || !this._config?.entity) return;
    this.hass.callService(domain, service, { entity_id: this._config.entity, ...data });
  }

  /* --------------------------------------------------------------- rendu */

  protected override render() {
    if (!this._config) return nothing;

    if (!this.hass) return this._renderShell(this._renderSkeleton());

    const stateObj = this.stateObj;
    if (!stateObj) {
      const message =
        this.hass.config?.state !== STATE_NOT_RUNNING
          ? t(this.hass, "entity_not_found")
          : t(this.hass, "starting");
      return this._renderShell(this._renderNotice(message, this._config.entity));
    }

    return this._renderShell(this.renderContent(stateObj), stateObj);
  }

  protected abstract renderContent(stateObj: HassEntity): TemplateResult;

  /**
   * Chrome commun : matière, vis d'angle, titre, sous-titre, et le plan de
   * référence mis à l'échelle. Seul le contenu diffère d'une carte à l'autre.
   */
  private _renderShell(content: TemplateResult, stateObj?: HassEntity): TemplateResult {
    const config = this._config!;
    // Sans configuration, un appui sur le bandeau ouvre la fiche de l'entité :
    // c'est le comportement par défaut de Home Assistant, et le seul moyen
    // d'atteindre l'historique et les réglages depuis la carte. On ne le retire
    // que si l'utilisateur a explicitement demandé `none`.
    const interactive = config.tap_action?.action !== "none";

    const title = config.name ?? (stateObj ? computeEntityName(stateObj) : config.entity);

    return html`
      <div
        class=${classMap({
          module: true,
          [`mat-${config.material ?? "carbon"}`]: true,
          unavailable: isUnavailable(stateObj),
          off: !!stateObj && !isUnavailable(stateObj) && this.isOff(stateObj),
        })}
        style=${styleMap({
          "--skeuo-accent": this.accent,
          "--skeuo-texture": String(this.textureScale),
          // Les vis vivent dans l'espace de la carte pour rester accrochées à
          // ses coins, elles ne bénéficient donc pas du scale() du plan. On
          // leur applique le facteur à la main, sur le calibre nominal de 16 px
          // et son retrait de 10 px.
          "--skeuo-screw": `${SCREW_SIZE * this._scaler.scale}px`,
          "--skeuo-screw-inset": `${SCREW_INSET * this._scaler.scale}px`,
        })}
      >
        ${config.screws !== false ? this._renderScrews() : nothing}
        <div
          class="stage"
          style=${styleMap({
            width: `${this._scaler.stageWidth}px`,
            height: `${DESIGN.height}px`,
            transform: `scale(${this._scaler.scale}) translate(-50%, -50%)`,
          })}
        >
          <div
            class=${classMap({ head: true, interactive })}
            role=${interactive ? "button" : "presentation"}
            tabindex=${interactive ? "0" : "-1"}
            @action=${this._handleAction}
            ${actionHandler({
              hasHold: hasAction(config.hold_action),
              hasDoubleClick: hasAction(config.double_tap_action),
              disabled: !interactive,
            })}
          >
            <p class="title">${title}</p>
            ${config.subtitle ? html`<p class="subtitle">${config.subtitle}</p>` : nothing}
          </div>
          <div class="body">${content}</div>
        </div>
      </div>
    `;
  }

  private _renderScrews(): TemplateResult {
    return html`
      <i class="screw tl"></i><i class="screw tr"></i>
      <i class="screw bl"></i><i class="screw br"></i>
    `;
  }

  private _renderSkeleton(): TemplateResult {
    // Un squelette aux bonnes dimensions plutôt que `nothing` : sinon la grille
    // saute au moment où `hass` arrive.
    return html`<div class="skeleton"></div>`;
  }

  private _renderNotice(message: string, entityId: string): TemplateResult {
    return html`
      <div class="notice">
        <p class="notice-message">${message}</p>
        <p class="notice-entity">${entityId}</p>
      </div>
    `;
  }

  private _handleAction(ev: ActionHandlerEvent): void {
    if (!this.hass || !this._config || !ev.detail?.action) return;
    handleAction(this, this.hass, this._config, ev.detail.action);
  }

  static override styles: CSSResultGroup = [
    chromeStyles,
    css`
      :host {
        display: block;
        height: 100%;
      }
    `,
  ];
}
