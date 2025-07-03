import { getRandomId, lookupMapValue, toSnakeCase } from "../../utils.js";
import { EventProxyManager } from "./event-proxy-manager.js";
import { NonDelegableEventHandler } from "./non-delegable-event-handler.js";

/**
 * Constant representing the name of the method used to add event listeners
 * in the EventEmitter proxy.
 *
 * @type {"on"}
 */
export const PROXY_ON_CALL_NAME = "on";

/**
 * Constant representing the name of the method used to remove event listeners
 * in the EventEmitter proxy.
 *
 * @type {"off"}
 */
export const PROXY_OFF_CALL_NAME = "off";

/**
 * Prefix used in `on-` attributes to identify listeners
 * associated with an element.
 *
 * @type {"on-"}
 */
const EVENT_PREFIX = "on-";

/**
 * Prefix used in `data-` attributes to mark listeners
 * associated with an element.
 *
 * @type {"data-"}
 */
const DATA_PREFIX = "data-";

/**
 * Full prefix used in delegated event attributes,
 * e.g., `data-on-<id>`, to identify listeners bound via query delegation.
 *
 * @type {"data-on-"}
 */
const FULL_PREFIX = `${DATA_PREFIX}${EVENT_PREFIX}`;

export default class EventEmitter {
  /**
   * Singleton instance of EventEmitter.
   * This ensures that only one instance of EventEmitter exists throughout the application.
   * It is used to manage delegated and non-delegated events across the application.
   *
   * @type {EventEmitter}
   */
  static #instance = null;

  /**
   * Map that stores all delegated events.
   * The keys are event types (e.g., "click", "mouseover"), and the values are Maps
   * where the keys are queries (e.g., ".my-element", "#myElement") and the values are Sets of listeners.
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

  /**
   * Proxy manager for handling delegated events and non-delegable events.
   * This manager is responsible for adding and removing event listeners
   * to elements or delegating events to queries.
   *
   * @type {EventProxyManager}
   */
  #eventProxyManager = new EventProxyManager(this);

  /**
   * Non-delegable event handler that manages events that cannot be delegated
   * through queries, such as `mouseenter` and `mouseleave`.
   * This handler provides a way to handle these events by attaching
   * additional listeners to the target element.
   *
   * @type {NonDelegableEventHandler}
   */
  #nonDelegableEventHandler = new NonDelegableEventHandler(this);

  constructor() {
    if (EventEmitter.#instance) {
      throw new Error(
        "EventEmitter: EventEmitter is a singleton and cannot be instantiated multiple times."
      );
    }
  }

  /**
   * Returns the singleton instance of EventEmitter.
   *
   * @static
   * @returns {EventEmitter} The singleton instance of EventEmitter.
   *
   * @example
   * EventEmitter.shared.on(document, "click", () => console.log("Clicked!"));
   */
  static get shared() {
    if (!EventEmitter.#instance) {
      EventEmitter.#instance = new EventEmitter();
    }

    return EventEmitter.#instance;
  }

  /**
   * Returns a proxy for adding delegated event listeners.
   * This proxy allows for adding event listeners to elements or delegating events to queries.
   *
   * @returns {ProxyEventBinder} A proxy object with an `on` method for adding event listeners.
   */
  get on() {
    return this.#eventProxyManager.on;
  }

  /**
   * Returns a proxy for removing delegated event listeners.
   * This proxy allows for removing event listeners from elements or queries.
   *
   * @returns {ProxyEventBinder} A proxy object with an `off` method for removing event listeners.
   */
  get off() {
    return this.#eventProxyManager.off;
  }

  /**
   * Returns the event proxy manager, which is responsible for managing delegated events.
   * This manager provides methods for attaching and detaching event listeners
   * to elements or delegating events to queries.
   *
   * @returns {EventProxyManager} The event proxy manager instance.
   *
   * @example
   * const proxy = EventEmitter.shared.proxy;
   * proxy.attach(document, "click", () => console.log("Clicked!"));
   */
  get proxy() {
    return this.#eventProxyManager;
  }

  /**
   * Adds a delegated event listener to a target or query.
   * If the target is an Element, it will delegate the event to a query
   * by assigning a data attribute with a specific id.
   * If the target is a Window, it will add the event listener directly.
   *
   * @param {Window | Document | Element | string} targetOrQuery - The target element or query
   * @param {keyof DocumentEventMap} eventType - The type of event to listen for
   * @param {((event: DocumentEventMap[keyof DocumentEventMap]) => void)} listener - The function to execute when the event is triggered
   * @param {boolean | AddEventListenerOptions} [options] - Options for the event listener
   * @returns {void}
   *
   * @example
   * EventEmitter.shared.addDelegatedEvent(
   *   document.querySelector(".my-element"),
   *   "click",
   *   (event) => console.log("Element clicked!", event),
   *   { once: true }
   * );
   */
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

  /**
   * Removes a delegated event listener from a target or query.
   * If the target is an Element, it will remove the event listener from a query
   * by removing the data attribute with the specific id.
   * If the target is a Window, it will remove the event listener directly.
   *
   * @param {Window | Document | Element | string} targetOrQuery - The target element or query
   * @param {keyof DocumentEventMap} [eventType] - The type of event to stop listening for
   * @param {((event: DocumentEventMap[keyof DocumentEventMap]) => void)} [listener] - The function to remove from the event listener
   * @returns {boolean} Returns true if the listener was removed, false otherwise
   *
   * @example
   * EventEmitter.shared.removeDelegatedEvent(
   *   document.querySelector(".my-element"),
   *   "click",
   *   (event) => console.log("Element clicked!", event)
   * );
   */
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
   * Retrieves the listeners associated with a specific event type and query.
   *
   * @param {keyof DocumentEventMap} eventType - The type of event to retrieve listeners for
   * @param {string} query - The CSS query to filter the listeners
   * @returns {Set<((event: DocumentEventMap[keyof DocumentEventMap]) => void)> | undefined} - A set of listeners for the specified event type and query, or undefined if no listeners are found
   */
  getListeners(eventType, query) {
    return this.#eventsMap.get(eventType)?.get(query);
  }

  #eventDispatcher = (event) => {
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
    document.addEventListener(eventType, this.#eventDispatcher, options);
  }

  #removeListenerFromDocument(eventType) {
    document.removeEventListener(eventType, this.#eventDispatcher);
  }

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

  #cleanupEventType(eventType, eventQueryMap) {
    if (eventQueryMap && eventQueryMap.size === 0) {
      this.#removeListenerFromDocument(eventType);
      this.#eventsMap.delete(eventType);
    }
  }
}
