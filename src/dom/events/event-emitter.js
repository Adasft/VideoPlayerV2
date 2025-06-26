import { getRandomId, lookupMapValue, toSnakeCase } from "../../utils.js";
import { EventProxyManager } from "./event-proxy-manager.js";
import { NonDelegableEventHandler } from "./non-delegable-event-handler.js";

export const PROXY_ON_CALL_NAME = "on";
export const PROXY_OFF_CALL_NAME = "off";

/**
 * Prefijo que se agrega al atributo on- para identificar los listeners
 * asociados a un elemento
 *
 * @type {"on-"}
 */
const EVENT_PREFIX = "on-";
/**
 * Prefijo que se agrega al atributo data- para identificar los listeners
 * asociados a un elemento
 *
 * @type {"data-"}
 */
const DATA_PREFIX = "data-";
/**
 * Prefijo que se agrega al atributo data-on-<id> para identificar el listener
 * que se delega a través de un query
 *
 * @type {"data-on-"}
 */
const FULL_PREFIX = `${DATA_PREFIX}${EVENT_PREFIX}`;

export default class EventEmitter {
  static #instance = null;

  /**
   * Mapa de eventos que contiene un mapa de querys y un conjunto de listeners
   *
   * @type {Map<keyof DocumentEventMap, Map<string, Set<((event: DocumentEventMap[keyof DocumentEventMap]) => void)>>>}
   *
   * @example
   *
   * new Map([
   *   ["click", new Map([
   *     [".my-element", new Set([listener1, listener2])],
   *     ["#myElement", new Set([listener3])]
   *   ])]
   * ])
   *
   */
  #eventsMap = new Map();
  #eventProxyManager = new EventProxyManager(this);
  #nonDelegableEventHandler = new NonDelegableEventHandler(this);

  constructor() {
    if (EventEmitter.#instance) {
      throw new Error(
        "EventEmitter: EventEmitter is a singleton and cannot be instantiated multiple times."
      );
    }
  }

  static get shared() {
    if (!EventEmitter.#instance) {
      EventEmitter.#instance = new EventEmitter();
    }

    return EventEmitter.#instance;
  }

  /**
   * Agrega un listener a un elemento o delega un evento a un query
   *
   * @param {Document | HTMLElement | string} targetOrQuery - Elemento al que se le agregará el listener o query para delegación de eventos
   * @param {keyof DocumentEventMap} eventType - Tipo de evento
   * @param {((event: DocumentEventMap[keyof DocumentEventMap]) => void)} listener - Función que se ejecutará al dispararse el evento
   * @param {boolean | AddEventListenerOptions} options - Opciones del evento
   *
   * @example
   *
   * // Agregar un listener a un elemento
   * Dom.on(document.getElementById("myElement"), "click", () => console.log("Element clicked"));
   *
   * // Delegar un evento a un query
   * Dom.on(".my-element", "click", () => console.log("Element clicked"));
   *
   */
  get on() {
    return this.#eventProxyManager.on;
  }

  /**
   * Elimina un listener a un elemento o delega un evento a un query.
   *
   * @param {Document | HTMLElement | string} targetOrQuery - Elemento al que se le eliminará el listener o query.
   * @param {keyof DocumentEventMap} [eventType] - Tipo de evento.
   * @param {((event: DocumentEventMap[keyof DocumentEventMap]) => void)} [listener] - Función asociada al listener.
   *
   * @returns {boolean} Retorna true si se eliminó el listener y false si no.
   */
  get off() {
    return this.#eventProxyManager.off;
  }

  get proxy() {
    return this.#eventProxyManager;
  }

  addDelegatedEvent(targetOrQuery, eventType, listener, options) {
    if (targetOrQuery instanceof Window) {
      targetOrQuery.addEventListener(eventType, listener, options);
      return;
    }

    if (targetOrQuery instanceof Document) {
      targetOrQuery = targetOrQuery.documentElement;
    }
    // si el targetOrQuery es un Element, se delega el evento a través de un query
    // se asigna un data attribute al elemento con un id específico para delegar el evento
    if (targetOrQuery instanceof Element) {
      // Si el elemento ya tiene un evento click registrado con un id específico, lo extraemos para agregar el listener.
      // Si no tiene un evento click registrado, creamos un nuevo id y lo asignamos al elemento.
      const [matchingEvent, id] = this.#extractEventId(
        targetOrQuery,
        eventType
      );

      // Si no se encontró un evento coincidente, se asigna un nuevo id al elemento
      // para que se pueda delegar el evento a través de un query, esto se hace para evitar
      // la duplicación de eventos en el mismo elemento
      if (!matchingEvent) {
        targetOrQuery.setAttribute(`${FULL_PREFIX}${id}`, "");
      }

      targetOrQuery = `[${FULL_PREFIX}${id}]`;
    }

    if (this.#nonDelegableEventHandler.has(eventType)) {
      [listener, eventType] = this.#nonDelegableEventHandler.handle(
        targetOrQuery,
        eventType,
        listener
      );
    }

    if (!this.#eventsMap.has(eventType)) {
      this.#addListenerToDocument(eventType, options);
    }

    const eventQueryMap = lookupMapValue(this.#eventsMap, eventType, new Map());
    const listenerSet = lookupMapValue(eventQueryMap, targetOrQuery, new Set());

    if (!listenerSet.has(listener)) {
      listenerSet.add(listener);
    }
  }

  removeDelegatedEvent(targetOrQuery, eventType, listener) {
    if (targetOrQuery instanceof Window) {
      targetOrQuery.removeEventListener(eventType, listener);
      return;
    }

    if (targetOrQuery instanceof Document) {
      targetOrQuery = targetOrQuery.documentElement;
    }

    // Eliminar listeners para un query específico
    if (!eventType) {
      return typeof targetOrQuery === "string"
        ? this.#removeEventByQuery(targetOrQuery)
        : this.#removeEventByDataMap(targetOrQuery);
    }

    if (targetOrQuery instanceof Element) {
      const [matchingEvent, id] = this.#extractEventId(
        targetOrQuery,
        eventType
      );
      if (!matchingEvent) return false;

      targetOrQuery.removeAttribute(`${FULL_PREFIX}${id}`);
      targetOrQuery = `[${FULL_PREFIX}${id}]`;
    }

    return this.#removeEventListener(targetOrQuery, eventType, listener);
  }

  /**
   * Retorna el Set de listeners para un tipo de evento y un query específicos.
   * Este método sirve como una interfaz segura para clases colaboradoras.
   * @public
   * @param {keyof DocumentEventMap} eventType - El tipo de evento.
   * @param {string} query - El selector o query.
   * @returns {Set<Function> | undefined} El conjunto de listeners o undefined si no existe.
   */
  getListeners(eventType, query) {
    return this.#eventsMap.get(eventType)?.get(query);
  }

  #handler = (event) => {
    const target =
      event.target instanceof Document
        ? event.target.documentElement
        : event.target;
    const eventType = event.type;
    const eventQueryMap = this.#eventsMap.get(eventType);

    if (!eventQueryMap) return;

    for (const [query, listenerSet] of eventQueryMap.entries()) {
      // Aquí estamos buscando el elemento más cercano que coincida con la consulta.
      // Si se encuentra un elemento coincidente, se ejecutan todos los listeners asociados a esa consulta.
      if (target?.closest(query)) {
        listenerSet.forEach((listener) => listener(event));
      }
    }
  };

  #addListenerToDocument(eventType, options) {
    document.addEventListener(eventType, this.#handler, options);
  }

  #removeListenerFromDocument(eventType) {
    document.removeEventListener(eventType, this.#handler);
  }

  /**
   * Extrae el id de un evento de un elemento
   *
   * @param {HTMLElement} target - Elemento del que se extraerá el id del evento
   * @param {keyof DocumentEventMap} eventType - Tipo de evento
   *
   * @returns {[boolean, string]} - Un arreglo con un booleano que indica si se encontró un evento coincidente y el id del evento
   */
  #extractEventId(target, eventType) {
    const eventKey = this.#findEventDatasetKey(target, eventType);

    if (eventKey) {
      const id = toSnakeCase(eventKey, true).slice(EVENT_PREFIX.length);
      return [true, id];
    }

    const generatedId = `${eventType}-${getRandomId()}`;
    return [false, generatedId];
  }

  #findEventDatasetKey(target, eventType) {
    const eventPrefix = `${EVENT_PREFIX}${eventType}`;

    return Object.keys(target.dataset).find((key) => {
      return toSnakeCase(key, true).startsWith(eventPrefix);
    });
  }

  /**
   * Elimina listeners asociados a un query.
   *
   * @private
   * @param {string} query - Query CSS para identificar los listeners.
   * @returns {boolean} Retorna true si se eliminó algún listener.
   */
  #removeEventByQuery(query) {
    let removed = false;
    for (const [eventType, eventQueryMap] of this.#eventsMap.entries()) {
      if (eventQueryMap.has(query)) {
        removed = eventQueryMap.delete(query);
      }

      this.#cleanupEventType(eventType, eventQueryMap);
    }

    return removed;
  }

  /**
   * Elimina listeners basados en el atributo dataset de un elemento.
   *
   * @private
   * @param {HTMLElement} element - Elemento HTML del cual se eliminarán listeners.
   * @returns {boolean} Retorna true si se eliminó algún listener.
   */
  #removeEventByDataMap(element) {
    let removed = false;
    for (const [key] of Object.entries(element.dataset)) {
      const eventName = toSnakeCase(key, true);
      if (eventName.startsWith(EVENT_PREFIX)) {
        const eventType = eventName.slice(
          EVENT_PREFIX.length,
          eventName.lastIndexOf("-")
        );
        const deleteEventType =
          this.#nonDelegableEventHandler.get(eventType) ?? eventType;
        const eventQueryMap = this.#eventsMap.get(deleteEventType);
        removed =
          eventQueryMap?.delete(`[${DATA_PREFIX}${eventName}]`) || removed;

        this.#cleanupEventType(deleteEventType, eventQueryMap);
      }
    }
    return removed;
  }

  /**
   * Elimina el listener específico del mapa de eventos.
   *
   * @private
   * @param {string} query - Query CSS para identificar los listeners.
   * @param {keyof DocumentEventMap} eventType - Tipo de evento.
   * @param {((event: DocumentEventMap[keyof DocumentEventMap]) => void)} [listener] - Función asociada al listener.
   * @returns {boolean} Retorna true si se eliminó el listener.
   */
  #removeEventListener(query, eventType, listener) {
    const eventQueryMap = this.#eventsMap.get(eventType);
    const listenerSet = eventQueryMap?.get(query);

    if (!eventQueryMap || !listenerSet) return false;

    const removed = listener
      ? listenerSet.delete(listener)
      : !listenerSet.clear();

    if (listenerSet.size === 0) {
      eventQueryMap.delete(query);
    }

    this.#cleanupEventType(eventType, eventQueryMap);
    return removed;
  }

  /**
   * Elimina el tipo de evento del mapa si ya no hay más listeners asociados.
   *
   * @private
   * @param {keyof DocumentEventMap} eventType - Tipo de evento.
   * @param {Map} eventQueryMap - Mapa de queries asociados al evento.
   */
  #cleanupEventType(eventType, eventQueryMap) {
    if (eventQueryMap && eventQueryMap.size === 0) {
      this.#removeListenerFromDocument(eventType);
      this.#eventsMap.delete(eventType);
    }
  }
}
