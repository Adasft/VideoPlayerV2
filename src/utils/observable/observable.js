export class Subscriber {
  /**
   * Subscriber class that handles the next method for an observer.
   * It can apply a transformation to the value before passing it to the observer.
   *
   * @type {Subscriber | { next: (value: any) => void } }
   */
  #observer;

  /**
   * Optional transformation function to apply to the value before notifying the observer.
   * @type {(value: any) => any}
   */
  #transform;

  /**
   * Creates a new Subscriber instance.
   * @param {Subscriber | { next: (value: any) => void }} observer - The observer to notify.
   * @param {(value: any) => any} [transform] - Optional transformation function to apply to the value.
   */
  constructor(observer, transform) {
    this.#observer = observer;
    this.#transform = transform;
  }

  /**
   * Passes the value to the observer's next method.
   * If a transformation function is provided, it applies the transformation before notifying.
   * @param {any} value - The value to notify the observer with.
   */
  next(value) {
    if (this.#transform) {
      this.#observer.next(this.#transform(value));
    } else {
      this.#observer.next(value);
    }
  }
}

export class Observable {
  /**
   * Callback to be called when a new subscriber is added.
   * This can be used to set up any necessary resources or side effects.
   *
   * @type {(observer: Subscriber) => void | undefined}
   */
  #onSubscribe;

  /**
   * Callback to be called when the observable is destroyed.
   * This can be used to clean up resources or unsubscribe from other observables.
   * @type {() => void | undefined}
   */
  #onDestroy;

  /**
   * Set of subscribers to this observable.
   * Each subscriber is an instance of the Subscriber class.
   *
   * @type {Set<Subscriber>}
   */
  #subscribers;

  /**
   * Creates a new Observable instance.
   * @param {{
   *  onSubscribe?: (observer: Subscriber) => void,
   *  onDestroy?: () => void
   * }} callbacks - An object containing the onSubscribe and onDestroy callbacks.
   */
  constructor({ onSubscribe, onDestroy }) {
    this.#onSubscribe = onSubscribe;
    this.#onDestroy = onDestroy;
    this.#subscribers = new Set();
  }

  /**
   * Subscribes a callback to this observable.
   * If the callback is an instance of Subscriber, it is added directly.
   * Otherwise, a new Subscriber is created with the provided callback.
   *
   * @param {(value: any) => void | Subscriber} callback - The callback to subscribe.
   * @returns {Subscriber} The subscriber instance.
   */
  subscribe(callback) {
    const subscriber =
      callback instanceof Subscriber
        ? callback
        : new Subscriber({ next: callback });
    this.#subscribers.add(subscriber);
    // Pass the subscriber to the onSubcribe callback for custom handling
    // if provided. This allows for additional setup or side effects when a
    // new subscriber is added.
    this.#onSubscribe?.(subscriber);
    return subscriber;
  }

  destroy() {
    this.#subscribers.clear();
    this.#onDestroy?.();
  }

  /**
   * Operates on the observable by applying a series of operators.
   * Each operator is a function that takes the observable and returns a new observable.
   * @param {...(source: Observable) => Observable} operators - The operators to apply.
   * @returns {Observable} A new observable with the applied operators.
   */
  pipe(...operators) {
    return operators.reduce((obs, op) => op(obs), this);
  }

  /**
   * Notifies all subscribers with a new value.
   * Each subscriber's next method is called with the provided value.
   * @param {any} value - The value to notify subscribers with.
   */
  notify(value) {
    this.#subscribers.forEach((sub) => sub.next(value));
  }
}
