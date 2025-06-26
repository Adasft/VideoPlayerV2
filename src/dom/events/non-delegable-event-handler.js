export class NonDelegableEventHandler {
  #eventEmitter;

  /**
   * Lista de eventos que no se pueden delegar a través de un query y que
   * si son posibles de delegar implementando un listener adicional
   *
   * @type {{[key in keyof DocumentEventMap]?: string}}
   */
  #nonDelegableEvents = {
    // Para los eventos mouseenter y mouseleave, se registra un listener adicional
    // para el evento mouseover y mouseout esto debido a que los eventos mouseenter y
    // mouseleave no se propagan, por lo que no se puede delegar a través de un query.
    mouseenter: "mouseover",
    mouseleave: "mouseout",
  };

  constructor(eventEmitter) {
    this.#eventEmitter = eventEmitter;
  }

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

  has(eventType) {
    return this.#nonDelegableEvents.hasOwnProperty(eventType);
  }

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
      const listenerSet = this.#eventEmitter.getListeners(eventType, query);

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
