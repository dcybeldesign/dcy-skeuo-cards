/**
 * Abonnement aux prévisions météo.
 *
 * Depuis Home Assistant 2023.9, l'attribut `forecast` a disparu des entités du
 * domaine weather : les prévisions passent par un abonnement WebSocket, ce qui
 * évite de recopier plusieurs kilo-octets de tableau dans chaque changement
 * d'état de l'entité. Une carte qui lirait encore l'attribut afficherait un
 * cadre vide sur toute installation récente.
 *
 * L'attribut reste lu en repli : certaines intégrations tierces le publient
 * encore, et le banc d'essai s'en sert pour travailler sans WebSocket.
 */

import type { ReactiveController, ReactiveControllerHost } from "lit";

import type { HassEntity, HomeAssistant } from "./ha";

export interface ForecastItem {
  datetime: string;
  condition?: string;
  /** Maximum de la journée en prévision quotidienne. */
  temperature?: number;
  /** Minimum de la journée. Absent des prévisions horaires. */
  templow?: number;
  precipitation?: number;
  precipitation_probability?: number;
  /** Présent sur les prévisions bi-quotidiennes seulement. */
  is_daytime?: boolean;
}

export type ForecastType = "daily" | "hourly" | "twice_daily";

/** Bits de supported_features du domaine weather. */
export const SUPPORT_FORECAST_DAILY = 1;
export const SUPPORT_FORECAST_HOURLY = 2;
export const SUPPORT_FORECAST_TWICE_DAILY = 4;

/** Type de prévision réellement disponible sur l'entité, le quotidien d'abord. */
export const bestForecastType = (stateObj: HassEntity): ForecastType | undefined => {
  const features = Number(stateObj.attributes.supported_features) || 0;
  if (features & SUPPORT_FORECAST_DAILY) return "daily";
  if (features & SUPPORT_FORECAST_TWICE_DAILY) return "twice_daily";
  if (features & SUPPORT_FORECAST_HOURLY) return "hourly";
  return undefined;
};

interface ForecastEvent {
  type?: string;
  forecast?: ForecastItem[];
}

export class ForecastController implements ReactiveController {
  private _onData: (items: ForecastItem[] | undefined) => void;

  /** Identifie l'abonnement en cours, pour ne pas le refaire à chaque rendu. */
  private _key?: string;
  private _unsub?: () => Promise<void>;
  /**
   * Jeton de génération. Un abonnement met un aller-retour réseau à s'établir,
   * et la carte peut changer d'entité entre temps : sans ce jeton, la réponse
   * de l'abonnement périmé se brancherait par-dessus le nouveau.
   */
  private _token = 0;
  private _connected = false;
  /**
   * Abonnement demandé mais pas encore confirmé.
   *
   * Home Assistant envoie souvent la première prévision avant l'accusé de
   * réception de l'abonnement. Sans ce drapeau, ce premier message déclenche un
   * rendu, le rendu rappelle sync(), sync() ne voit pas encore d'abonnement
   * établi, coupe et recommence : la carte se réabonne en boucle sans que rien
   * ne le signale, à part un trafic WebSocket qui ne retombe jamais.
   */
  private _pending = false;
  /**
   * Dernier contexte reçu, gardé pour pouvoir se réabonner au remontage sans
   * attendre un rendu. Un tableau de bord détache et remonte ses cartes à
   * chaque changement de vue.
   */
  private _hass?: HomeAssistant;
  private _stateObj?: HassEntity;
  private _type?: ForecastType;

  /**
   * Découpage retenu pour l'abonnement en cours. Une prévision quotidienne
   * couvre la journée entière : lui appliquer une icône de nuit n'aurait pas
   * de sens, d'où le besoin pour la carte de savoir sur quoi elle est branchée.
   */
  public get type(): ForecastType | undefined {
    return this._type;
  }

  /**
   * onData doit provoquer une mise à jour de l'hôte. Sur les cartes du pack,
   * l'écriture dans une propriété @state s'en charge ; le contrôleur ne
   * demande pas le rendu lui-même, un requestUpdate() sans argument étant de
   * toute façon rejeté par leur filtre de rendu.
   */
  constructor(host: ReactiveControllerHost, onData: (items: ForecastItem[] | undefined) => void) {
    this._onData = onData;
    host.addController(this);
  }

  /**
   * Au remontage, l'abonnement coupé au détachement doit être rétabli tout de
   * suite. Attendre le prochain rendu ne marcherait pas : rien n'a changé du
   * point de vue de Lit, donc rien ne le déclenche, et la carte resterait
   * indéfiniment sur les prévisions figées d'avant le détachement.
   */
  public hostConnected(): void {
    this._connected = true;
    this._key = undefined;
    if (this._hass && this._stateObj) this.sync(this._hass, this._stateObj);
  }

  public hostDisconnected(): void {
    this._connected = false;
    this._stop();
    this._key = undefined;
  }

  /**
   * À appeler avant chaque rendu. Ne fait rien tant que l'entité, le type de
   * prévision et la connexion n'ont pas changé.
   */
  public sync(hass: HomeAssistant | undefined, stateObj: HassEntity | undefined): void {
    this._hass = hass;
    this._stateObj = stateObj;

    if (!hass || !stateObj) {
      this._stop();
      this._key = undefined;
      return;
    }

    const type = bestForecastType(stateObj);
    const connection = hass.connection;

    if (!type || !connection?.subscribeMessage) {
      // Repli sur l'attribut historique, encore publié par quelques
      // intégrations et par le banc d'essai.
      // L'attribut historique n'a jamais porté que du quotidien.
      this._type = "daily";
      const legacy = stateObj.attributes.forecast as ForecastItem[] | undefined;
      const key = `legacy:${stateObj.entity_id}:${legacy?.length ?? 0}:${legacy?.[0]?.datetime ?? ""}`;
      if (key !== this._key) {
        this._stop();
        this._key = key;
        this._onData(legacy);
      }
      return;
    }

    const key = `${stateObj.entity_id}:${type}`;
    if (key === this._key && (this._unsub || this._pending)) return;

    this._stop();
    this._key = key;
    this._type = type;
    this._pending = true;
    const token = ++this._token;

    connection
      .subscribeMessage<ForecastEvent>(
        (event) => {
          if (token !== this._token) return;
          this._onData(event?.forecast);
        },
        { type: "weather/subscribe_forecast", forecast_type: type, entity_id: stateObj.entity_id }
      )
      .then((unsub) => {
        // La carte a pu être retirée du tableau de bord pendant l'aller-retour.
        if (token !== this._token || !this._connected) {
          void unsub();
          return;
        }
        this._pending = false;
        this._unsub = unsub;
      })
      .catch(() => {
        if (token !== this._token) return;
        this._pending = false;
        this._key = undefined;
        this._onData(undefined);
      });
  }

  private _stop(): void {
    this._token++;
    this._pending = false;
    const unsub = this._unsub;
    this._unsub = undefined;
    if (unsub) void unsub().catch(() => undefined);
  }
}
