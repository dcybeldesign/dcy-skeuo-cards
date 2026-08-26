/**
 * Couche d'interface avec Home Assistant.
 *
 * Les types et helpers sont recopiés depuis le dépôt frontend plutôt
 * qu'importés de custom-card-helpers : le paquet tiers a passé cinq ans sans
 * mise à jour et l'écosystème a montré que dépendre de lui expose à des
 * ruptures qu'on ne contrôle pas. Mushroom fait le même choix.
 */

import { directive, Directive, type PartInfo, PartType } from "lit/directive.js";
import type { ElementPart, Part } from "lit";

/* ------------------------------------------------------------------ états */

export interface HassEntityAttributes {
  friendly_name?: string;
  unit_of_measurement?: string;
  icon?: string;
  device_class?: string;
  supported_features?: number;
  [key: string]: unknown;
}

export interface HassEntity {
  entity_id: string;
  state: string;
  last_changed: string;
  last_updated: string;
  attributes: HassEntityAttributes;
  context: { id: string; user_id: string | null; parent_id: string | null };
}

export interface HassServiceTarget {
  entity_id?: string | string[];
  device_id?: string | string[];
  area_id?: string | string[];
}

export interface HassTheme {
  darkMode: boolean;
  theme: string;
  [key: string]: unknown;
}

export interface FrontendLocaleData {
  language: string;
  number_format: string;
  time_format: string;
  [key: string]: unknown;
}

/**
 * Canal WebSocket du frontend.
 *
 * Optionnel : toutes les cartes du pack lisent l'état dans `states`, seule la
 * météo a besoin de s'abonner à un flux. Le déclarer facultatif évite que le
 * banc d'essai ou une version ancienne de Home Assistant fasse tomber le reste.
 */
export interface HassConnection {
  subscribeMessage<T>(
    callback: (message: T) => void,
    subscribeMessage: Record<string, unknown>
  ): Promise<() => Promise<void>>;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  connection?: HassConnection;
  themes: HassTheme;
  locale: FrontendLocaleData;
  language: string;
  connected: boolean;
  config: {
    state: string;
    unit_system: { temperature: string; length: string; mass: string };
    [key: string]: unknown;
  };
  callService(
    domain: string,
    service: string,
    serviceData?: Record<string, unknown>,
    target?: HassServiceTarget
  ): Promise<unknown>;
  localize(key: string, ...args: unknown[]): string;
  formatEntityState?(stateObj: HassEntity, state?: string): string;
  formatEntityAttributeValue?(stateObj: HassEntity, attribute: string): string;
}

/** HA n'a pas fini de démarrer : les entités peuvent manquer temporairement. */
export const STATE_NOT_RUNNING = "NOT_RUNNING";
export const UNAVAILABLE = "unavailable";
export const UNKNOWN = "unknown";
export const OFF = "off";
export const ON = "on";

export const UNAVAILABLE_STATES = [UNAVAILABLE, UNKNOWN];

export const isUnavailable = (stateObj?: HassEntity): boolean =>
  !stateObj || UNAVAILABLE_STATES.includes(stateObj.state);

export const isActive = (stateObj?: HassEntity): boolean => {
  if (!stateObj) return false;
  const s = stateObj.state;
  return s !== OFF && s !== UNAVAILABLE && s !== UNKNOWN && s !== "idle" && s !== "closed" && s !== "locked";
};

export const computeDomain = (entityId: string): string => entityId.substring(0, entityId.indexOf("."));

export const computeEntityName = (stateObj: HassEntity): string =>
  stateObj.attributes.friendly_name ?? stateObj.entity_id;

/** Nombre robuste : renvoie undefined plutôt que NaN sur un état non numérique. */
export const numericState = (value: unknown): number | undefined => {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

/* ------------------------------------------------------------ événements */

declare global {
  interface HASSDomEvents {
    "hass-more-info": { entityId: string | null };
    "config-changed": { config: unknown };
    "ll-custom": Record<string, unknown>;
    "ll-rebuild": Record<string, unknown>;
    "value-changed": { value: unknown };
    action: { action: string };
  }
}

export type ValidHassDomEvent = keyof HASSDomEvents;

export const fireEvent = <T extends ValidHassDomEvent>(
  node: HTMLElement | Window,
  type: T,
  detail?: HASSDomEvents[T],
  options?: { bubbles?: boolean; cancelable?: boolean; composed?: boolean }
): Event => {
  const event = new CustomEvent(type, {
    bubbles: options?.bubbles ?? true,
    cancelable: options?.cancelable ?? false,
    composed: options?.composed ?? true,
    detail,
  });
  node.dispatchEvent(event);
  return event;
};

/* ---------------------------------------------------------------- actions */

export interface ToggleActionConfig {
  action: "toggle";
  confirmation?: ConfirmationRestrictionConfig;
}
export interface MoreInfoActionConfig {
  action: "more-info";
  entity?: string;
  confirmation?: ConfirmationRestrictionConfig;
}
export interface NavigateActionConfig {
  action: "navigate";
  navigation_path: string;
  navigation_replace?: boolean;
  confirmation?: ConfirmationRestrictionConfig;
}
export interface UrlActionConfig {
  action: "url";
  url_path: string;
  confirmation?: ConfirmationRestrictionConfig;
}
export interface PerformActionConfig {
  action: "perform-action";
  perform_action: string;
  data?: Record<string, unknown>;
  target?: HassServiceTarget;
  confirmation?: ConfirmationRestrictionConfig;
}
export interface AssistActionConfig {
  action: "assist";
  pipeline_id?: string;
  start_listening?: boolean;
}
export interface CustomActionConfig {
  action: "fire-dom-event";
  [key: string]: unknown;
}
export interface NoActionConfig {
  action: "none";
}

export interface ConfirmationRestrictionConfig {
  text?: string;
  exemptions?: { user: string }[];
}

export type ActionConfig =
  | ToggleActionConfig
  | MoreInfoActionConfig
  | NavigateActionConfig
  | UrlActionConfig
  | PerformActionConfig
  | AssistActionConfig
  | CustomActionConfig
  | NoActionConfig;

export interface ActionConfigParams {
  entity?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

export interface ActionHandlerDetail {
  action: "tap" | "hold" | "double_tap";
}
export type ActionHandlerEvent = CustomEvent<ActionHandlerDetail>;

/**
 * more-info est le comportement par défaut quand rien n'est configuré, comme
 * dans le frontend. Renvoie false uniquement sur une config absente ou none.
 */
export const hasAction = (config?: ActionConfig): boolean =>
  config !== undefined && config.action !== "none";

export const handleAction = async (
  node: HTMLElement,
  hass: HomeAssistant,
  config: ActionConfigParams,
  action: string
): Promise<void> => {
  let actionConfig: ActionConfig | undefined;

  if (action === "double_tap") actionConfig = config.double_tap_action;
  else if (action === "hold") actionConfig = config.hold_action;
  else if (action === "tap") actionConfig = config.tap_action;

  if (!actionConfig) {
    actionConfig = { action: "more-info" };
  }

  const confirmation = (actionConfig as { confirmation?: ConfirmationRestrictionConfig })
    .confirmation;
  if (confirmation && !confirmation.exemptions) {
    const what =
      "perform_action" in actionConfig ? actionConfig.perform_action : actionConfig.action;
    if (!confirm(confirmation.text ?? `Confirmer « ${what} » ?`)) return;
  }

  switch (actionConfig.action) {
    case "none":
      break;

    case "more-info": {
      const entityId = actionConfig.entity ?? config.entity;
      if (entityId) fireEvent(node, "hass-more-info", { entityId });
      break;
    }

    case "navigate":
      if (actionConfig.navigation_path) {
        if (actionConfig.navigation_replace) {
          history.replaceState(null, "", actionConfig.navigation_path);
        } else {
          history.pushState(null, "", actionConfig.navigation_path);
        }
        window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
      }
      break;

    case "url":
      if (actionConfig.url_path) window.open(actionConfig.url_path, "_blank", "noreferrer=true");
      break;

    case "toggle":
      if (config.entity) {
        await hass.callService("homeassistant", "toggle", { entity_id: config.entity });
      }
      break;

    case "perform-action": {
      if (!actionConfig.perform_action) break;
      const [domain, service] = actionConfig.perform_action.split(".", 2);
      if (!domain || !service) break;
      await hass.callService(domain, service, actionConfig.data, actionConfig.target);
      break;
    }

    case "assist":
      fireEvent(node, "ll-custom", {
        action: "assist",
        pipeline_id: actionConfig.pipeline_id,
        start_listening: actionConfig.start_listening,
      } as Record<string, unknown>);
      break;

    case "fire-dom-event":
      fireEvent(node, "ll-custom", actionConfig as unknown as Record<string, unknown>);
      break;
  }
};

/* ---------------------------------------------- directive action-handler */

interface ActionHandlerOptions {
  hasHold?: boolean;
  hasDoubleClick?: boolean;
  disabled?: boolean;
}

const HOLD_DELAY = 500;
const DOUBLE_TAP_DELAY = 250;

/**
 * Gestion tap / hold / double-tap.
 *
 * Le frontend n'exporte pas sa propre directive aux cartes custom, celle-ci la
 * reproduit sur des Pointer Events (un seul jeu d'événements pour souris,
 * tactile et stylet, pas de double déclenchement souris+touch à gérer).
 */
class ActionHandlerDirective extends Directive {
  private _element?: HTMLElement;
  private _options: ActionHandlerOptions = {};
  private _holdTimer?: number;
  private _tapTimer?: number;
  private _held = false;
  private _bound = false;

  constructor(partInfo: PartInfo) {
    super(partInfo);
    if (partInfo.type !== PartType.ELEMENT) {
      throw new Error("actionHandler can only be attached to an element");
    }
  }

  public override update(part: Part, props: unknown[]): unknown {
    this._options = (props[0] as ActionHandlerOptions) ?? {};
    const element = (part as ElementPart).element as HTMLElement;
    if (this._element !== element) {
      this._detach();
      this._element = element;
      this._attach();
    }
    return this.render(this._options);
  }

  public render(_options?: ActionHandlerOptions): void {
    /* la directive n'écrit rien dans le DOM, elle branche des écouteurs */
  }

  private _attach() {
    const el = this._element;
    if (!el || this._bound) return;
    el.addEventListener("pointerdown", this._onDown);
    el.addEventListener("pointerup", this._onUp);
    el.addEventListener("pointercancel", this._cancel);
    el.addEventListener("keydown", this._onKeyDown);
    el.style.touchAction = el.style.touchAction || "manipulation";
    this._bound = true;
  }

  private _detach() {
    const el = this._element;
    if (!el || !this._bound) return;
    el.removeEventListener("pointerdown", this._onDown);
    el.removeEventListener("pointerup", this._onUp);
    el.removeEventListener("pointercancel", this._cancel);
    el.removeEventListener("keydown", this._onKeyDown);
    this._bound = false;
  }

  private _onKeyDown = (ev: KeyboardEvent) => {
    if (this._options.disabled) return;
    if (ev.key !== "Enter" && ev.key !== " ") return;
    ev.preventDefault();
    this._fire("tap");
  };

  private _onDown = (ev: PointerEvent) => {
    if (this._options.disabled || ev.button !== 0) return;
    this._held = false;
    if (this._options.hasHold) {
      this._holdTimer = window.setTimeout(() => {
        this._held = true;
        this._fire("hold");
      }, HOLD_DELAY);
    }
  };

  private _onUp = (ev: PointerEvent) => {
    if (this._options.disabled || ev.button !== 0) return;
    this._clearHold();
    if (this._held) return;

    if (this._options.hasDoubleClick) {
      if (this._tapTimer !== undefined) {
        window.clearTimeout(this._tapTimer);
        this._tapTimer = undefined;
        this._fire("double_tap");
        return;
      }
      this._tapTimer = window.setTimeout(() => {
        this._tapTimer = undefined;
        this._fire("tap");
      }, DOUBLE_TAP_DELAY);
      return;
    }
    this._fire("tap");
  };

  private _cancel = () => {
    this._clearHold();
    this._held = false;
  };

  private _clearHold() {
    if (this._holdTimer !== undefined) {
      window.clearTimeout(this._holdTimer);
      this._holdTimer = undefined;
    }
  }

  private _fire(action: ActionHandlerDetail["action"]) {
    this._element?.dispatchEvent(
      new CustomEvent("action", { bubbles: true, composed: true, detail: { action } })
    );
  }
}

export const actionHandler = directive(ActionHandlerDirective);

/* -------------------------------------------------- composants HA lazy */

/**
 * ha-form et ha-entity-picker sont chargés à la demande par le frontend :
 * dans un éditeur monté tôt, ils peuvent ne pas encore exister dans la registry.
 * Les faire instancier par des cartes natives force leur chargement.
 */
export const loadHaComponents = (): void => {
  if (!customElements.get("ha-form")) {
    (customElements.get("hui-tile-card") as { getConfigElement?: () => unknown })?.getConfigElement?.();
  }
  if (!customElements.get("ha-entity-picker")) {
    (customElements.get("hui-entities-card") as { getConfigElement?: () => unknown })?.getConfigElement?.();
  }
};
