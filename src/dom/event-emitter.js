import { getRandomId, toSnakeCase } from "../utils.js";

class ProxyEventBinder extends Function {
  constructor(manager, callName) {
    super();
    this.manager = manager;
    this.target = null;
    this.callName = callName;

    return new Proxy(this, {
      apply: (target, _, args) => {
        return target.execute(args);
      },
    });
  }

  #hasBindedTarget() {
    return this.target !== null;
  }

  #isOffCallWithoutArguments(args) {
    return (
      args.length === 0 &&
      this.callName === ProxyOffEventBinder.CALL_NAME &&
      this.#hasBindedTarget()
    );
  }

  #handleOffCallWithoutArguments() {
    let targetOrQuery;
    [targetOrQuery, this.target] = [this.target, null];
    return this.delegateMethod.call(
      this.manager,
      targetOrQuery,
      null,
      null,
      false
    );
  }

  #isEventListenerCall(args) {
    return typeof args[0] === "string" && args.length <= 4;
  }

  #handleEventListenerCall(args) {
    if (!this.#hasBindedTarget()) {
      throw new Error("ProxyEventBinder: target must be provided");
    }
    args = [this.target, ...args];
    return this.#invokeDelegateMethod(args);
  }

  #handleGeneralCall(args) {
    return this.#invokeDelegateMethod(args);
  }

  #invokeDelegateMethod(args) {
    const [targetOrQuery, eventType, listener, options = {}, delegate = true] =
      args;
    const method = delegate ? this.delegateMethod : this.nonDelegateMethod;
    if (this.callName === ProxyOffEventBinder.CALL_NAME) {
      return method.call(
        this.manager,
        targetOrQuery,
        eventType,
        listener,
        delegate
      );
    }
    return method.call(
      this.manager,
      targetOrQuery,
      eventType,
      listener,
      options,
      delegate
    );
  }

  /**
   * Esta función se invoca cuando se llama a un método de la clase `ProxyEventBinder`,
   * como `on`, `off` o `ignoreDelegation`, y se decide ejecutar el método correspondiente
   * en la instancia de `EventManager`. Se encarga de normalizar los argumentos y de
   * delegar la llamada al método adecuado en `EventManager`.
   *
   * Se ejecuta cuando se invocan los métodos `on` o `off` con la siguiente firma:
   * `on(target, eventType, listener, options)` o `off(target, eventType, listener)`.
   *
   * **Sobrecarga 1**: Si el primer argumento es un `Document` o `HTMLElement`, o incluso un selector en forma de `string`,
   * y el segundo argumento es el tipo de evento (`eventType`), el tercer argumento es el `listener`
   * y el cuarto es un objeto de opciones de tipo `boolean` o `AddEventListenerOptions`.
   *
   * **Sobrecarga 2**: Si no se pasa el primer argumento como un objeto del DOM, la llamada aún es válida
   * si el primer argumento es el tipo de evento (`eventType`), el segundo es el `listener`,
   * y el tercero es el objeto de opciones.
   *
   * @overload
   * @param {[Document | HTMLElement | string, keyof DocumentEventMap, (event: DocumentEventMap[keyof DocumentEventMap]) => void, boolean | AddEventListenerOptions, boolean]} args
   *   Los argumentos para configurar un delegado de eventos. El primer parámetro puede ser un elemento del DOM o un selector como cadena de texto.
   *   El segundo es el tipo de evento, el tercero es el `listener` (función del manejador de eventos),
   *   y el cuarto es el conjunto de opciones (puede ser un `boolean` o `AddEventListenerOptions`).
   * @returns {any} El resultado de la ejecución del método delegado correspondiente.
   *
   * @overload
   * @param {[keyof DocumentEventMap, (event: DocumentEventMap[keyof DocumentEventMap]) => void, boolean | AddEventListenerOptions, boolean]} args
   *   Los argumentos cuando el primer parámetro es un tipo de evento, el segundo es un `listener`,
   *   y el tercero es un conjunto de opciones (de tipo `boolean` o `AddEventListenerOptions`).
   * @returns {any} El resultado de la ejecución del método delegado correspondiente.
   */
  execute(args) {
    if (this.#isOffCallWithoutArguments(args)) {
      return this.#handleOffCallWithoutArguments();
    }

    if (this.#isEventListenerCall(args)) {
      return this.#handleEventListenerCall(args);
    }

    return this.#handleGeneralCall(args);
  }

  /**
   * Configura un delegado de eventos para un `target` específico.
   *
   * **Sobrecarga 1:**
   * Si el `target` es de tipo `string`, la función se utiliza para enlazar un tipo de evento
   * a un delegado. En este caso, el `target` almacena el tipo de evento y el `eventType`
   * toma el valor del listener, mientras que `listener` recibe el valor de las opciones.
   *
   *
   * **Sobrecarga 2:**
   * Si el `target` no es de tipo `string`, se utiliza para delegar eventos a un elemento
   * del DOM específico. En este caso, el `target` es un elemento del DOM, y el tipo de
   * evento es el valor del parámetro `eventType`.
   *
   * @overload
   * @param {keyof DocumentEventMap} eventType - Tipo de evento
   * @param {((event: DocumentEventMap[keyof DocumentEventMap]) => void)} listener - Función que se ejecutará al dispararse el evento
   * @param {boolean | AddEventListenerOptions} options - Opciones del evento
   * @return {void}
   *
   * @overload
   * @param {Document | HTMLElement} target - Elemento al que se le agregará el listener o query para delegación de eventos
   * @param {keyof DocumentEventMap} eventType - Tipo de evento
   * @param {((event: DocumentEventMap[keyof DocumentEventMap]) => void)} listener - Función que se ejecutará al dispararse el evento
   * @param {boolean | AddEventListenerOptions} options - Opciones del evento
   * @return {void}
   */
  ignoreDelegation = (target, eventType, listener, options) => {
    let args = [target, eventType, listener, options, false];
    /**
     * Si el `target` es de tipo `string`, esto indica que el `target` está enlazado a un evento específico.
     * En este caso, el `target` almacena el tipo de evento, mientras que `eventType` toma el valor del listener
     * y `listener` recibe el valor de `options`.
     *
     * @example
     * Este comportamiento se utiliza de la siguiente manera:
     * - ignoreDelegation("click", () => {}, { once: true });
     *
     * @example
     * Si el `target` no es de tipo `string`, entonces la función se usa de la siguiente manera:
     * - ignoreDelegation(document, "click", () => {}, { once: true });
     */
    if (typeof target === "string") {
      if (!this.#hasBindedTarget()) {
        throw new Error("ProxyEventBinder: target must be provided");
      }
      const eventType_$1 = target;
      const listener_$1 = eventType;
      const options_$1 = listener ?? {};
      const delegate = false;
      args = [this.target, eventType_$1, listener_$1, options_$1, delegate];
    }
    return this.execute(args);
  };

  bindTarget(target) {
    this.target = target;
    return this;
  }
}

class ProxyOnEventBinder extends ProxyEventBinder {
  static CALL_NAME = "on";

  constructor(manager) {
    super(manager, ProxyOnEventBinder.CALL_NAME);
    this.delegateMethod = this.manager.registerEvent;
    this.nonDelegateMethod = (target, eventType, listener, options) => {
      this.manager.registerEvent(target, eventType, listener, options, false);
    };
  }
}

class ProxyOffEventBinder extends ProxyEventBinder {
  static CALL_NAME = "off";

  /**
   *
   * @param {EventEmitter} manager
   */
  constructor(manager) {
    super(manager, ProxyOffEventBinder.CALL_NAME);
    this.delegateMethod = this.manager.unregisterEvent;
    this.nonDelegateMethod = (target, eventType, listener) => {
      this.manager.unregisterEvent(target, eventType, listener, false);
    };
  }
}

export default class EventEmitter {
  /**
   * Instancia de la clase
   *
   * @type EventEmitter
   */
  static #INSTANCE;

  /**
   * Prefijo que se agrega al atributo on- para identificar los listeners
   * asociados a un elemento
   *
   * @type {"on-"}
   */
  static EVENT_PREFIX = "on-";
  /**
   * Prefijo que se agrega al atributo data- para identificar los listeners
   * asociados a un elemento
   *
   * @type {"data-"}
   */
  static DATA_PREFIX = "data-";
  /**
   * Prefijo que se agrega al atributo data-on-<id> para identificar el listener
   * que se delega a través de un query
   *
   * @type {"data-on-"}
   */
  static FULL_PREFIX = `${EventEmitter.DATA_PREFIX}${EventEmitter.EVENT_PREFIX}`;

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

  /**
   * Lista de eventos que no se pueden delegar a través de un query y que
   * si son posibles de delegar implementando un listener adicional
   *
   * @type {{[key in keyof DocumentEventMap]?: string}}
   */
  #nonDelegableEvents = {
    // Para los eventos mouseenter y mouseleave, se registra un listener adicional
    // para el evento mouseover y mouseout esto debido a que los eventos mouseenter y
    // mouseleave no se propagan, por lo que no se puede delegar a través de un query.
    mouseenter: "mouseover",
    mouseleave: "mouseout",
  };

  /**
   * Handler que se ejecuta al dispararse un evento en el documento y que se encarga de
   * ejecutar los listeners asociados a un query específico en el mapa de eventos.
   * Se hace de esta manera para poder agregar y remover listeners de manera dinámica, ya que de esta
   * manera estamos creando una sola funcion hanlder bindeada a la instancia de EventListener.
   *
   * @type {((event: DocumentEventMap[keyof DocumentEventMap]) => void)}
   */
  #boundHandler = this.#handler.bind(this);

  #proxyOnEventBinder = new ProxyOnEventBinder(this);
  #proxyOffEventBinder = new ProxyOffEventBinder(this);

  /**
   * Crea una unica instancia de EventListener
   *
   * @singleton
   * @private
   * @returns {EventEmitter}
   */
  constructor() {}

  static getInstance() {
    if (!EventEmitter.#INSTANCE) {
      EventEmitter.#INSTANCE = new EventEmitter();
    }

    return EventEmitter.#INSTANCE;
  }

  #handlerNonDelegableEvents(targetOrQuery, eventType, originalListener) {
    let listener;
    if (eventType === "mouseenter") {
      listener = (event) => {
        const target = event.target.closest(targetOrQuery);
        if (!target) return;
        originalListener(event);
        // No se verifica si el mapa de eventos ya tiene el evento mouseover, debido a que si se ejecuta esta funcion
        // es porque el evento mouseenter se ha disparado, por lo que el evento mouseover ya debería estar registrado.
        // Por lo tanto esta listener jamas se ejecutará si no se ha registrado el evento mouseover.
        const listenerSet = this.#eventsMap.get("mouseover").get(targetOrQuery);

        listenerSet.delete(listener);

        const mouseLeaveListener = () => {
          listenerSet.add(listener);
          target.removeEventListener("mouseleave", mouseLeaveListener);
        };
        target.addEventListener("mouseleave", mouseLeaveListener);
      };
      eventType = "mouseover";
    } else if (eventType === "mouseleave") {
      listener = (event) => {
        const target = event.target.closest(targetOrQuery);
        if (
          !target ||
          target === event.relatedTarget ||
          target.contains(event.relatedTarget)
        )
          return;

        originalListener(event);
      };
      eventType = "mouseout";
    }

    return [listener, eventType];
  }

  #handler(event) {
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
  }

  #addListenerToDocument(eventType, options) {
    document.addEventListener(eventType, this.#boundHandler, options);
  }

  #removeListenerFromDocument(eventType) {
    document.removeEventListener(eventType, this.#boundHandler);
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
    // TODO: refactorizar
    const matchingEvent = Object.keys(target.dataset)
      .filter((key) => {
        return toSnakeCase(key, true).startsWith(
          `${EventEmitter.EVENT_PREFIX}${eventType}`
        );
      })
      .at(0);
    const id =
      toSnakeCase(matchingEvent, true)?.slice(
        EventEmitter.EVENT_PREFIX.length
      ) ?? `${eventType}-${getRandomId()}`;
    return [!!matchingEvent, id];
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
      if (eventName.startsWith(EventEmitter.EVENT_PREFIX)) {
        const eventType = eventName.slice(
          EventEmitter.EVENT_PREFIX.length,
          eventName.lastIndexOf("-")
        );
        const deleteEventType =
          this.#nonDelegableEvents[eventType] ?? eventType;
        const eventQueryMap = this.#eventsMap.get(deleteEventType);
        removed =
          eventQueryMap?.delete(`[${EventEmitter.DATA_PREFIX}${eventName}]`) ||
          removed;

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

  #addDelegatedEvent(targetOrQuery, eventType, listener, options) {
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
        targetOrQuery.setAttribute(`${EventEmitter.FULL_PREFIX}${id}`, "");
      }

      targetOrQuery = `[${EventEmitter.FULL_PREFIX}${id}]`;
    }

    if (this.#nonDelegableEvents.hasOwnProperty(eventType)) {
      [listener, eventType] = this.#handlerNonDelegableEvents(
        targetOrQuery,
        eventType,
        listener
      );
    }

    if (!this.#eventsMap.has(eventType)) {
      this.#addListenerToDocument(eventType, options);
    }

    const eventQueryMap =
      this.#eventsMap.get(eventType) ??
      this.#eventsMap.set(eventType, new Map()).get(eventType);
    const listenerSet =
      eventQueryMap.get(targetOrQuery) ??
      eventQueryMap.set(targetOrQuery, new Set()).get(targetOrQuery);

    if (!listenerSet.has(listener)) {
      listenerSet.add(listener);
    }
  }

  #removeDelegatedEvent(targetOrQuery, eventType, listener) {
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

      targetOrQuery.removeAttribute(`${EventEmitter.FULL_PREFIX}${id}`);
      targetOrQuery = `[${EventEmitter.FULL_PREFIX}${id}]`;
    }

    return this.#removeEventListener(targetOrQuery, eventType, listener);
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
    return this.#proxyOnEventBinder;
  }

  registerEvent(targetOrQuery, eventType, listener, options, delegate) {
    if (delegate) {
      this.#addDelegatedEvent(targetOrQuery, eventType, listener, options);
    } else {
      targetOrQuery.addEventListener(eventType, listener, options);
    }
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
    return this.#proxyOffEventBinder;
  }

  unregisterEvent(targetOrQuery, eventType, listener, delegate) {
    if (delegate) {
      this.#removeDelegatedEvent(targetOrQuery, eventType, listener);
    } else {
      targetOrQuery.removeEventListener(eventType, listener);
    }
  }
}
