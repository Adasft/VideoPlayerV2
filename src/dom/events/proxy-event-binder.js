import { PROXY_OFF_CALL_NAME } from "./event-emitter.js";

export class ProxyEventBinder extends Function {
  /**
   * Name of the call being made, such as "on" or "off".
   * This is used to determine the type of event binding or unbinding operation.
   * @type {"on" | "off"}
   */
  eventCallType;

  /**
   * Handler for delegated events.
   * This function is invoked when an event is delegated to a target or query.
   * @type {Function}
   */
  #delegateHandler;

  /**
   * Handler for non-delegated events.
   * This function is invoked when an event is not delegated and is directly bound to a target.
   * @type {Function}
   */
  #nonDelegateHandler;

  /**
   * ProxyEventBinder is a class that allows you to bind and unbind event listeners
   * to a target element or query using a proxy. It provides a way to handle delegated
   * and non-delegated events in a flexible manner.
   *
   * @param {Object} options - Options for the ProxyEventBinder.
   * @param {string} options.callName - The name of the call (e.g., "on" or "off").
   * @param {Function} options.delegateHandler - The handler for delegated events.
   * @param {Function} options.nonDelegateHandler - The handler for non-delegated events.
   * @throws {Error} If callName, delegateHandler, or nonDelegateHandler are not provided.
   * @returns {Proxy<ProxyEventBinder>} An instance of ProxyEventBinder that can be used
   * to bind and unbind event listeners.
   */
  constructor({ callName, delegateHandler, nonDelegateHandler }) {
    super();
    this.target = null;

    if (!callName || !delegateHandler || !nonDelegateHandler) {
      throw new Error(
        "ProxyEventBinder: callName, delegateHandler and nonDelegateHandler are required"
      );
    }

    this.eventCallType = callName;
    this.#delegateHandler = delegateHandler;
    this.#nonDelegateHandler = nonDelegateHandler;

    return new Proxy(this, {
      apply: (target, _, args) => {
        return target.execute(args);
      },
    });
  }

  /**
   * Internal handler that is called whenever a method such as `on`, `off`, or `ignoreDelegation`
   * is invoked on the `ProxyEventBinder` class. It normalizes the arguments and delegates
   * the call to the corresponding method on the internal `EventManager` instance.
   *
   * This function supports multiple overloads to provide flexibility in how arguments are passed.
   *
   * Overload 1:
   * When using the signature:
   * `on(target, eventType, listener, options)`
   *
   * - `target`: A DOM element (`Document` | `HTMLElement`) or a CSS selector string
   * - `eventType`: A valid event type (e.g., `"click"`, `"keydown"`)
   * - `listener`: The event handler function
   * - `options`: A boolean or an `AddEventListenerOptions` object
   * - `ignoreDelegation`: Optional boolean to skip delegation
   *
   * Overload 2:
   * When using the signature:
   * `on(eventType, listener, options)`
   *
   * - `eventType`: A valid event type
   * - `listener`: The event handler function
   * - `options`: A boolean or `AddEventListenerOptions`
   * - `ignoreDelegation`: Optional boolean
   *
   * @overload
   * @param {[Document | HTMLElement | string, keyof DocumentEventMap, (event: DocumentEventMap[keyof DocumentEventMap]) => void, boolean | AddEventListenerOptions, boolean]} args
   * @returns {any} The result of the delegated method on the `EventManager` instance.
   *
   * @overload
   * @param {[keyof DocumentEventMap, (event: DocumentEventMap[keyof DocumentEventMap]) => void, boolean | AddEventListenerOptions, boolean]} args
   * @returns {any} The result of the delegated method on the `EventManager` instance.
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
   * Registers an event listener on a specific target that bypasses event delegation.
   *
   * This method supports two usage patterns (overloads):
   *
   * 1. **Overload 1 (Simplified usage with implicit target):**
   *    - When the first argument `target` is a string, it is treated as the event type.
   *    - The internal bound target (previously set with a method like `bindTarget`) will be used.
   *    - The second argument is the listener function, and the third argument is the options object.
   *
   *    Example:
   *    ```js
   *    ignoreDelegation("click", (event) => { console.log("Clicked"); }, { once: true });
   *    ```
   *
   * 2. **Overload 2 (Explicit DOM target):**
   *    - When the first argument `target` is a `Document` or `HTMLElement`, the event listener
   *      is attached directly to this element, bypassing delegation.
   *    - The second argument is the event type, the third is the listener function,
   *      and the fourth is the options object.
   *
   *    Example:
   *    ```js
   *    ignoreDelegation(document.body, "click", (event) => { console.log("Clicked"); }, { passive: true });
   *    ```
   *
   * Internally, this method normalizes arguments and then calls the underlying `execute()` method,
   * passing a flag to explicitly disable delegation.
   *
   * @overload
   * @param {keyof DocumentEventMap} eventType - The type of event (e.g., `"click"`, `"keydown"`).
   * @param {(event: DocumentEventMap[keyof DocumentEventMap]) => void} listener - The event handler callback function.
   * @param {boolean | AddEventListenerOptions} [options] - Optional options to control event listener behavior.
   * @returns {void}
   *
   * @overload
   * @param {Document | HTMLElement} target - The DOM element to which the event listener will be attached directly.
   * @param {keyof DocumentEventMap} eventType - The type of event.
   * @param {(event: DocumentEventMap[keyof DocumentEventMap]) => void} listener - The event handler callback function.
   * @param {boolean | AddEventListenerOptions} [options] - Optional options to control event listener behavior.
   * @returns {void}
   */
  ignoreDelegation = (target, eventType, listener, options) => {
    let args = [target, eventType, listener, options, false];
    /**
     * When the `target` parameter is a string, it means the method is being called
     * with an implicit bound target. In this case:
     * - `target` actually represents the event type (e.g., "click"),
     * - `eventType` is the event listener function,
     * - `listener` is the event options (e.g., `{ once: true }`).
     *
     * The method assumes that a target element was previously bound via `this.target`.
     * If no target has been bound, it throws an error.
     *
     * Example usage in this mode:
     * - ignoreDelegation("click", () => {}, { once: true });
     *
     * When the `target` is not a string, it is treated as the actual DOM element
     * to which the event listener will be attached directly.
     *
     * Example usage in this mode:
     * - ignoreDelegation(document, "click", () => {}, { once: true });
     */
    if (typeof target === "string") {
      if (!this.#hasBindedTarget()) {
        throw new Error(
          "ProxyEventBinder.ignoreDelegation: target must be provided"
        );
      }
      const normalizedEventType = target;
      const normalizedListener = eventType;
      const normalizedOptions = listener ?? {};
      const delegate = false;

      args = [
        this.target,
        normalizedEventType,
        normalizedListener,
        normalizedOptions,
        delegate,
      ];
    }
    return this.execute(args);
  };

  bindTarget(target) {
    this.target = target;
    return this;
  }

  #hasBindedTarget() {
    return this.target !== null;
  }

  #isOffCallWithoutArguments(args) {
    return (
      args.length === 0 &&
      this.eventCallType === PROXY_OFF_CALL_NAME &&
      this.#hasBindedTarget()
    );
  }

  #handleOffCallWithoutArguments() {
    let targetOrQuery;
    [targetOrQuery, this.target] = [this.target, null];
    return this.#delegateHandler(targetOrQuery, null, null, false);
  }

  #isEventListenerCall(args) {
    return typeof args[0] === "string" && typeof args[1] === "function";
  }

  #handleEventListenerCall(args) {
    if (!this.#hasBindedTarget()) {
      throw new Error(
        "ProxyEventBinder.#handleEventListenerCall: target must be provided"
      );
    }
    args = [this.target, ...args];
    return this.#invokeDelegateHandler(args);
  }

  #handleGeneralCall(args) {
    return this.#invokeDelegateHandler(args);
  }

  #invokeDelegateHandler(args) {
    const [targetOrQuery, eventType, listener, options = {}, delegate = true] =
      args;

    const handler = delegate ? this.#delegateHandler : this.#nonDelegateHandler;
    if (this.eventCallType === PROXY_OFF_CALL_NAME) {
      return handler(targetOrQuery, eventType, listener, delegate);
    }
    return handler(targetOrQuery, eventType, listener, options, delegate);
  }
}
