class EventBus {
  #bus = new Map();

  on(event, callback) {
    if (!this.#bus.has(event)) {
      this.#bus.set(event, new Set());
    }
    this.#bus.get(event).add(callback);
  }

  emit(event, ...args) {
    if (this.#bus.has(event)) {
      this.#bus.get(event).forEach((callback) => callback(...args));
    }
  }

  off(event, callback) {
    if (this.#bus.has(event)) {
      if (callback) {
        const callbacks = this.#bus.get(event);
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.#bus.delete(event);
        }
      } else {
        this.#bus.delete(event);
      }
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
   * Añade un listener a un evento específico del widget.
   * Estos eventos se emiten cuando se realiza una acción específica en el widget y
   * se almacena en el eventBus, no en DOM.
   *
   * @param {string} event - El evento al que se le agregará el listener.
   * @param {(params: any) => void} callback - La función que se ejecutará cuando se emita el evento.
   */
  on(event, callback) {
    this.#eventBus.on(event, callback);
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
