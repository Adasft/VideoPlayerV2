class Signal {
  #value;
  #subscribers = new Set();

  constructor(value) {
    this.#value = value;
  }

  set value(newValue) {
    if (newValue === this.#value) {
      return;
    }

    this.#value = newValue;
    this.#notify();
  }

  get value() {
    return this.#value;
  }

  subscribe(callback) {
    this.#subscribers ??= new Set();
    this.#subscribers.add(callback);
  }

  #notify() {
    if (!Boolean(this.#subscribers?.size)) {
      return;
    }

    for (const subscriber of this.#subscribers) {
      subscriber(this.#value);
    }
  }
}

export function createSignal(value) {
  return new Signal(value);
}
