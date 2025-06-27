import { ProxyEventBinder } from "./proxy-event-binder.js";
import EventEmitter, {
  PROXY_ON_CALL_NAME,
  PROXY_OFF_CALL_NAME,
} from "./event-emitter.js";

export class EventProxyManager {
  /**
   * This handles the delegation of events to a specific target or query.
   * It uses a ProxyEventBinder to manage the delegation and non-delegation
   * of events based on the provided parameters.
   *
   * @type {ProxyEventBinder}
   */
  #onHandler = new ProxyEventBinder({
    callName: PROXY_ON_CALL_NAME,
    delegateHandler: (target, eventType, listener, options, delegate) => {
      this.attach(target, eventType, listener, options, delegate);
    },
    nonDelegateHandler: (target, eventType, listener, options) => {
      this.attach(target, eventType, listener, options, false);
    },
  });

  /**
   * This handles the removal of delegated events from a specific target or query.
   * It uses a ProxyEventBinder to manage the detachment of events based on the
   * provided parameters.
   *
   * @type {ProxyEventBinder}
   */
  #offHandler = new ProxyEventBinder({
    callName: PROXY_OFF_CALL_NAME,
    delegateHandler: (target, eventType, listener, delegate) =>
      this.detach(target, eventType, listener, delegate),
    nonDelegateHandler: (target, eventType, listener) => {
      this.detach(target, eventType, listener, false);
    },
  });

  /**
   * @typedef {Object} EventDelegator
   *
   * Adds a delegated event listener.
   * @property {(targetOrQuery: Document | HTMLElement | string, eventType: keyof DocumentEventMap, listener: (event: Event) => void, options?: boolean | AddEventListenerOptions) => void} addDelegatedEvent
   *
   * Removes a previously registered delegated event listener.
   * @property {(targetOrQuery: Document | HTMLElement | string, eventType?: keyof DocumentEventMap, listener?: (event: Event) => void) => boolean} removeDelegatedEvent
   *
   * Retrieves the set of listeners for a specific event type and CSS selector query.
   * @property {(eventType: keyof DocumentEventMap, query: string) => Set<Function> | undefined} getListeners
   */
  /** @type {EventDelegator} */
  #eventDelegator;

  constructor(eventDelegator = EventEmitter.shared) {
    this.#eventDelegator = eventDelegator;
  }

  get on() {
    return this.#onHandler;
  }

  get off() {
    return this.#offHandler;
  }

  /**
   * Attaches an event listener to a target or query.
   * @param {Document | HTMLElement | string} targetOrQuery - The target element or query selector.
   * @param {keyof DocumentEventMap} eventType - The type of event to listen for.
   * @param {(event: Event) => void} listener - The event listener function.
   * @param {boolean | AddEventListenerOptions} [options] - Optional parameters for the event listener.
   * @param {boolean} delegate - Whether to delegate the event handling.
   */
  attach(targetOrQuery, eventType, listener, options, delegate) {
    if (delegate) {
      this.#eventDelegator.addDelegatedEvent(
        targetOrQuery,
        eventType,
        listener,
        options
      );
    } else {
      targetOrQuery.addEventListener(eventType, listener, options);
    }
  }

  /**
   * Detaches an event listener from a target or query.
   *
   * @param {Document | HTMLElement | string} targetOrQuery - The target element or query selector.
   * @param {keyof DocumentEventMap} eventType - The type of event to stop listening for.
   * @param {(event: Event) => void} listener - The event listener function to remove.
   * @param {boolean} delegate - Whether the event handling is delegated.
   * @returns {void}
   */
  detach(targetOrQuery, eventType, listener, delegate) {
    if (delegate) {
      this.#eventDelegator.removeDelegatedEvent(
        targetOrQuery,
        eventType,
        listener
      );
    } else {
      targetOrQuery.removeEventListener(eventType, listener);
    }
  }
}
