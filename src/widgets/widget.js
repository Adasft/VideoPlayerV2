import { Observable } from "../utils/observable/observable.js";

class EventBus {
  /**
   * Bus of events that allows to register, emit, and remove event listeners.
   * It uses a Map to store events and their associated callbacks.
   * Each event can have multiple callbacks, which are stored in a Set.
   * This allows for efficient management of event listeners and ensures that
   * callbacks can be added, removed, and executed without conflicts.
   *
   * @type {Map<string, {observer: Observable | null, callbacks: Set<Function>}>}
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

    const eventData = this.#bus.get(event);

    if (eventData.observer) {
      if (eventData.observer !== observer)
        throw new Error(
          `Observer for event "${event}" is already set to a different observer.`
        );

      return;
    }

    eventData.observer = observer;
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
   * @param {Observable} [defaultObserver] - An optional observer that can be associated with the event.
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

    callbacks.forEach(callback => callback(...args));
    observer?.notify(args);
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

  /**
   * Observes a set of events and returns an Observable that emits when any of the events occur.
   * This method allows you to listen for multiple events and react to them collectively.
   *
   * @param {string[]} events - An array of event names to observe.
   * @returns {Observable} An Observable that emits when any of the specified events occur.
   */
  observeEvent(events) {
    if (events.length === 0) {
      return;
    }

    const primaryEvent = events[0];
    const observer =
      this.#eventBus.getObserverByEvent(primaryEvent) ??
      new Observable({
        onDestroy: () => {
          this.#eventBus.detachObserver(primaryEvent);
        },
      });

    // Attach the observer to all events
    for (const event of events) {
      this.#eventBus.attachObserver(event, observer);
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
