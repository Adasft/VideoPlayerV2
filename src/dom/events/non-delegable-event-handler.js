export class NonDelegableEventHandler {
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

  /**
   * List of non-delegable events.
   * These events cannot be delegated through a query selector and require
   * special handling.
   *
   * @type {Object<string, string>}
   */
  #nonDelegableEvents = {
    // For mouseenter and mouseleave events, an additional listener is registered
    // for the mouseover and mouseout events. This is because mouseenter and
    // mouseleave events do not bubble, so they cannot be delegated through a query.
    // The mouseover and mouseout events are used to handle the delegation.
    // The mouseover event is used to handle mouseenter and the mouseout event is used
    // to handle mouseleave.
    mouseenter: "mouseover",
    mouseleave: "mouseout",
  };

  /**
   * Creates an instance of NonDelegableEventHandler.
   * @param {EventDelegator} eventDelegator - The event delegator instance to use for handling events.
   */
  constructor(eventDelegator) {
    this.#eventDelegator = eventDelegator;
  }

  /**
   * Handles the non-delegable events based on the event type.
   *
   * @param {string} query - The CSS selector query to match the target element.
   * @param {string} eventType - The type of event to handle (e.g., "mouseenter", "mouseleave").
   * @param {Function} originalListener - The original event listener function to call.
   * @returns {[Function, string]} - Returns an array containing the listener function and the event type.
   */
  handle(query, eventType, originalListener) {
    switch (eventType) {
      case "mouseenter":
        return this.#handleMouseEnter(query, originalListener);
      case "mouseleave":
        return this.#handleMouseLeave(query, originalListener);
      default:
        throw new Error(
          `NonDelegableEventHandler.handle: Unsupported event type "${eventType}"`
        );
    }
  }

  /**
   * Checks if the event type is a non-delegable event.
   *
   * @param {string} eventType - The type of event to check.
   * @returns {boolean} - Returns true if the event type is non-delegable, false otherwise.
   */
  has(eventType) {
    return this.#nonDelegableEvents.hasOwnProperty(eventType);
  }

  /**
   * Retrieves the non-delegable event type for a given event type.
   *
   * @param {string} eventType - The type of event to retrieve.
   * @returns {string} - Returns the non-delegable event type if it exists, otherwise undefined.
   */
  get(eventType) {
    return this.#nonDelegableEvents[eventType];
  }

  #handleMouseEnter(query, originalListener) {
    const eventType = "mouseover";
    const listener = (event) => {
      const target = event.target.closest(query);
      if (!target) return;
      originalListener(event);
      // No se verifica si el mapa de eventos ya tiene el evento mouseover, debido a que si se ejecuta esta funcion
      // es porque el evento mouseenter se ha disparado, por lo que el evento mouseover ya debería estar registrado.
      // Por lo tanto esta listener jamas se ejecutará si no se ha registrado el evento mouseover.
      const listenerSet = this.#eventDelegator.getListeners(eventType, query);

      listenerSet.delete(listener);

      const mouseLeaveListener = () => {
        listenerSet.add(listener);
        target.removeEventListener("mouseleave", mouseLeaveListener);
      };
      target.addEventListener("mouseleave", mouseLeaveListener);
    };

    return [listener, eventType];
  }

  #handleMouseLeave(query, originalListener) {
    const eventType = "mouseout";
    const listener = (event) => {
      const target = event.target.closest(query);
      if (
        !target ||
        target === event.relatedTarget ||
        target.contains(event.relatedTarget)
      )
        return;

      originalListener(event);
    };

    return [listener, eventType];
  }
}
