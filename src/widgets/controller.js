// import { Dom } from "../dom-utils/dom.js";

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

export class Controller {
  #eventBus = new EventBus();

  #component;
  set component(component) {
    if (this.#component) {
      return;
    }
    this.#component = component;
  }

  get component() {
    return this.#component;
  }

  constructor() {}

  destroy() {
    // console.log("destroy track", this.#component);
    // this.#component.parent.controller.off("trackChanged");
    // console.log("destroy track", this.#component.parent.controller.#eventBus);
    this.#eventBus.emit("destroy");
  }

  mount(parent) {
    this.#component?.mount(parent);
  }

  on(event, callback) {
    this.#eventBus.on(event, callback);
  }

  emit(event, ...args) {
    this.#eventBus.emit(event, ...args);
  }

  off(event, callback) {
    this.#eventBus.off(event, callback);
  }

  once(event, callback) {
    this.#eventBus.once(event, callback);
  }
}
