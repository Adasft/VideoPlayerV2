class EventObserver {
  #destroyCallbacks = null;
  #derivatedObservers = new Set();

  map(transform) {
    if (typeof transform !== "function") {
      throw new Error("EventObserver.map: Transform must be a function");
    }

    const derivatedObserver = new EventObserverMapped({
      source: this,
      transformations: [transform],
    });
    this.#derivatedObservers.add(derivatedObserver);

    derivatedObserver.onDestroy(() => {
      this.#derivatedObservers.delete(derivatedObserver);
    });

    return derivatedObserver;
  }

  onDestroy(callback) {
    if (typeof callback !== "function") {
      throw new Error("EventObserver.onDestroy: Callback must be a function");
    }

    if (!this.#destroyCallbacks) {
      this.#destroyCallbacks = [];
    }

    this.#destroyCallbacks.push(callback);
  }

  destroy() {
    this.#destroyCallbacks?.forEach((callback) => callback());
    this.#destroyCallbacks = null;

    this.#derivatedObservers.forEach((observer) => observer.destroy());
    this.#derivatedObservers.clear();
  }

  update(data) {
    if (this.#derivatedObservers.size === 0) {
      return;
    }

    this.#derivatedObservers.forEach((observer) => observer.notify(data));
  }
}

class EventObserverMapped extends EventObserver {
  #transformations = [];
  #subscribers = new Set();

  constructor({ transformations }) {
    this.#transformations = transformations;
  }

  destroy() {
    super.destroy();
    this.#transformations = [];
    this.#subscribers.clear();
  }

  getFirstValue() {
    if (this.#transformations.length === 0) {
      throw new Error(
        "EventObserverMapped.getFirstValue: No transformations defined"
      );
    }

    return this.#transformations[0]();
  }

  map(transform) {
    if (typeof transform !== "function") {
      throw new Error("EventObserverMapped.map: Transform must be a function");
    }

    this.transformations = [...this.#transformations, transform];
    return this;
  }

  suscribe(callback) {
    if (typeof callback !== "function") {
      throw new Error(
        "EventObserverMapped.suscribe: Callback must be a function"
      );
    }

    this.#subscribers.add(callback);
    return this;
  }

  unsubscribe(callback) {
    this.#subscribers.delete(callback);
    return this;
  }

  notify(data) {
    if (this.#subscribers.size === 0) {
      return;
    }

    let transformedData = data;
    try {
      for (const transform of this.#transformations) {
        transformedData = transform(transformedData);
      }
      this.#subscribers.forEach((sub) => sub(transformedData, data));
    } catch (error) {
      console.error("Error in EventObserverMapped transformation:", error);
    }
  }
}

// observe(ob) -> ob.suscribe((data) => this.node.text(data))
// eventBus.attach(["sourceChange"], this)

// const observable = this.widget.observeEvent("sourceChange")
// const newObservable = observable.map(data => data.toLowerCase())
// newObservable.subscribe((data) => {
//   this.node.text(data)
// })
// ... More code
// eventBus.emit("sourceChange", "new data")

class EventBus {
  /**
   * Bus of events that allows to register, emit, and remove event listeners.
   * It uses a Map to store events and their associated callbacks.
   * Each event can have multiple callbacks, which are stored in a Set.
   * This allows for efficient management of event listeners and ensures that
   * callbacks can be added, removed, and executed without conflicts.
   *
   * @type {Map<string, {observer: EventObserver | null, callbacks: Set<Function>}>}
   */
  #bus = new Map();

  getObserverByEvent(event) {
    return this.#bus.get(event)?.observer;
  }

  attachObserver(event, observer) {
    if (!this.#bus.has(event)) {
      this.#bus.set(event, {
        observer,
        callbacks: new Set(),
      });
    }

    const { observer: currentObserver } = this.#bus.get(event);

    if (currentObserver !== observer) {
      throw new Error(
        `Observer for event "${event}" is already set to a different observer.`
      );
    }
  }

  detachObserver(event) {
    if (!this.#bus.has(event)) {
      return;
    }

    const eventData = this.#bus.get(event);

    eventData.observer = null;
    if (eventData.callbacks.size === 0) {
      this.#bus.delete(event);
    }
  }

  /**
   * Registers a callback for a specific event.
   * If the event does not exist, it creates a new entry in the bus.
   * If an observer is provided, it will be associated with the event.
   * @param {string} event - The event to register the callback for.
   * @param {Function} callback - The callback function to be executed when the event is emitted.
   * @param {EventObserver} [defaultObserver] - An optional observer that can be associated with the event.
   */
  on(event, callback, defaultObserver = null) {
    if (!this.#bus.has(event)) {
      this.#bus.set(event, { observer: null, callbacks: new Set() });
    }

    const eventData = this.#bus.get(event);
    const hasObserver = eventData.observer !== null;

    if (defaultObserver) {
      hasObserver &&
        console.warn(
          `Observer for event "${event}" is already set. Overwriting with new observer.`
        );

      eventData.observer = defaultObserver;
    }

    eventData.callbacks.add(callback);
  }

  emit(event, ...args) {
    if (!this.#bus.has(event)) {
      return;
    }

    const { observer, callbacks } = this.#bus.get(event);

    callbacks.forEach((callback) => callback(...args));
    observer?.update(args);
  }

  off(event, callback) {
    if (!this.#bus.has(event)) {
      return;
    }

    const { observer, callbacks } = this.#bus.get(event);

    callbacks.delete(callback);
    if (!callback || callbacks.size === 0) {
      observer?.destroy();
      this.#bus.delete(event);
    }
  }

  once(event, callback) {
    const onceCallback = (...args) => {
      this.off(event, onceCallback);
      callback(...args);
    };
    this.on(event, onceCallback);
  }
}

export class Widget {
  /**
   * EventBus que se utiliza para emitir y recibir eventos.
   *
   * @type {EventBus}
   */
  #eventBus = new EventBus();

  /**
   * Componente asociado al widget.
   *
   * @type {Component}
   */
  #component;

  #name;

  constructor(name = null) {
    const widgetName = name ?? this.constructor.name;
    this.#name = name
      ? name
      : widgetName.charAt().toLowerCase() + widgetName.slice(1);
  }

  set component(component) {
    if (this.#component) {
      return;
    }
    this.#component = component;
  }

  get component() {
    return this.#component;
  }

  get name() {
    return this.#name;
  }

  /**
   * Destruye el widget y su componente.
   */
  destroy() {
    this.#eventBus.emit("destroy");
    // this.#component = null;
  }

  /**
   * Monta el widget en un elemento padre.
   *
   * @param {Element} parent - El elemento padre en el que se montará el widget.
   */
  mount(parent) {
    this.#component?.mount(parent);
  }

  refresh(config) {
    this.onRefresh(config);
  }

  onRefresh() {}

  observeEvent(event) {
    let observer = this.#eventBus.getObserverByEvent(event);
    if (!observer) {
      observer = new EventObserver();
      this.#eventBus.attachObserver(event, observer);
      observer.onDestroy(() => this.#eventBus.detachObserver(event));
    }
    return observer;
  }

  unobserveEvent(event) {
    this.#eventBus.detachObserver(event);
  }

  /**
   * Register a listener for a specific widget event.
   * This method allows you to listen for events emitted by the widget.
   *
   * @param {string} event - The event to listen for.
   * @param {Function} callback - The function to be called when the event is emitted.
   * @param {EventObserver} [observer] - An optional observer that can be associated with the event.
   */
  on(event, callback, observer = null) {
    this.#eventBus.on(event, callback, observer);
  }

  /**
   * Emite un evento específico del widget.
   *
   * @param {string} event - El evento que se emitirá.
   * @param {any[]} args - Los argumentos que se pasarán al callback del evento.
   */
  emit(event, ...args) {
    this.#eventBus.emit(event, ...args);
  }

  /**
   * Elimina un listener de un evento específico del widget.
   *
   * @param {string} event - El evento del que se eliminará el listener.
   * @param {(params: any) => void} callback - La función que se eliminará del listener.
   */
  off(event, callback) {
    this.#eventBus.off(event, callback);
  }

  /**
   * Añade un listener que se ejecutará una sola vez al evento específico del widget.
   *
   * @param {string} event - El evento al que se le agregará el listener.
   * @param {(params: any) => void} callback - La función que se ejecutará cuando se emita el evento.
   */
  once(event, callback) {
    this.#eventBus.once(event, callback);
  }
}
