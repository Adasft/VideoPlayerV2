import { ProxyEventBinder } from "./proxy-event-binder.js";
import { PROXY_ON_CALL_NAME, PROXY_OFF_CALL_NAME } from "./event-emitter.js";

export class EventProxyManager {
  #onHandler = new ProxyEventBinder({
    callName: PROXY_ON_CALL_NAME,
    delegateHandler: (target, eventType, listener, options, delegate) =>
      this.attach(target, eventType, listener, options, delegate),
    nonDelegateHandler: (target, eventType, listener, options) => {
      this.attach(target, eventType, listener, options, false);
    },
  });

  #offHandler = new ProxyEventBinder({
    callName: PROXY_OFF_CALL_NAME,
    delegateHandler: (target, eventType, listener, delegate) =>
      this.detach(target, eventType, listener, delegate),
    nonDelegateHandler: (target, eventType, listener) => {
      this.detach(target, eventType, listener, false);
    },
  });

  #eventDelegator;

  constructor(eventDelegator) {
    this.#eventDelegator = eventDelegator;
  }

  get on() {
    return this.#onHandler;
  }

  get off() {
    return this.#offHandler;
  }

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
