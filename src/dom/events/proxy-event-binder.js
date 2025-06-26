import { PROXY_OFF_CALL_NAME } from "./event-emitter.js";

export class ProxyEventBinder extends Function {
  #callName;
  #delegateHandler;
  #nonDelegateHandler;

  constructor({ callName, delegateHandler, nonDelegateHandler }) {
    super();
    this.target = null;

    if (!callName || !delegateHandler || !nonDelegateHandler) {
      throw new Error(
        "ProxyEventBinder: callName, delegateHandler and nonDelegateHandler are required"
      );
    }

    this.#callName = callName;
    this.#delegateHandler = delegateHandler;
    this.#nonDelegateHandler = nonDelegateHandler;

    return new Proxy(this, {
      apply: (target, _, args) => {
        return target.execute(args);
      },
    });
  }

  /**
   * Esta función se invoca cuando se llama a un método de la clase `ProxyEventBinder`,
   * como `on`, `off` o `ignoreDelegation`, y se decide ejecutar el método correspondiente
   * en la instancia de `EventManager`. Se encarga de normalizar los argumentos y de
   * delegar la llamada al método adecuado en `EventManager`.
   *
   * Se ejecuta cuando se invocan los métodos `on` o `off` con la siguiente firma:
   * `on(target, eventType, listener, options)` o `off(target, eventType, listener)`.
   *
   * **Sobrecarga 1**: Si el primer argumento es un `Document` o `HTMLElement`, o incluso un selector en forma de `string`,
   * y el segundo argumento es el tipo de evento (`eventType`), el tercer argumento es el `listener`
   * y el cuarto es un objeto de opciones de tipo `boolean` o `AddEventListenerOptions`.
   *
   * **Sobrecarga 2**: Si no se pasa el primer argumento como un objeto del DOM, la llamada aún es válida
   * si el primer argumento es el tipo de evento (`eventType`), el segundo es el `listener`,
   * y el tercero es el objeto de opciones.
   *
   * @overload
   * @param {[Document | HTMLElement | string, keyof DocumentEventMap, (event: DocumentEventMap[keyof DocumentEventMap]) => void, boolean | AddEventListenerOptions, boolean]} args
   *   Los argumentos para configurar un delegado de eventos. El primer parámetro puede ser un elemento del DOM o un selector como cadena de texto.
   *   El segundo es el tipo de evento, el tercero es el `listener` (función del manejador de eventos),
   *   y el cuarto es el conjunto de opciones (puede ser un `boolean` o `AddEventListenerOptions`).
   * @returns {any} El resultado de la ejecución del método delegado correspondiente.
   *
   * @overload
   * @param {[keyof DocumentEventMap, (event: DocumentEventMap[keyof DocumentEventMap]) => void, boolean | AddEventListenerOptions, boolean]} args
   *   Los argumentos cuando el primer parámetro es un tipo de evento, el segundo es un `listener`,
   *   y el tercero es un conjunto de opciones (de tipo `boolean` o `AddEventListenerOptions`).
   * @returns {any} El resultado de la ejecución del método delegado correspondiente.
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
   * Configura un delegado de eventos para un `target` específico.
   *
   * **Sobrecarga 1:**
   * Si el `target` es de tipo `string`, la función se utiliza para enlazar un tipo de evento
   * a un delegado. En este caso, el `target` almacena el tipo de evento y el `eventType`
   * toma el valor del listener, mientras que `listener` recibe el valor de las opciones.
   *
   *
   * **Sobrecarga 2:**
   * Si el `target` no es de tipo `string`, se utiliza para delegar eventos a un elemento
   * del DOM específico. En este caso, el `target` es un elemento del DOM, y el tipo de
   * evento es el valor del parámetro `eventType`.
   *
   * @overload
   * @param {keyof DocumentEventMap} eventType - Tipo de evento
   * @param {((event: DocumentEventMap[keyof DocumentEventMap]) => void)} listener - Función que se ejecutará al dispararse el evento
   * @param {boolean | AddEventListenerOptions} options - Opciones del evento
   * @return {void}
   *
   * @overload
   * @param {Document | HTMLElement} target - Elemento al que se le agregará el listener o query para delegación de eventos
   * @param {keyof DocumentEventMap} eventType - Tipo de evento
   * @param {((event: DocumentEventMap[keyof DocumentEventMap]) => void)} listener - Función que se ejecutará al dispararse el evento
   * @param {boolean | AddEventListenerOptions} options - Opciones del evento
   * @return {void}
   */
  ignoreDelegation = (target, eventType, listener, options) => {
    let args = [target, eventType, listener, options, false];
    /**
     * Si el `target` es de tipo `string`, esto indica que el `target` está enlazado a un evento específico.
     * En este caso, el `target` almacena el tipo de evento, mientras que `eventType` toma el valor del listener
     * y `listener` recibe el valor de `options`.
     *
     * @example
     * Este comportamiento se utiliza de la siguiente manera:
     * - ignoreDelegation("click", () => {}, { once: true });
     *
     * @example
     * Si el `target` no es de tipo `string`, entonces la función se usa de la siguiente manera:
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
      this.#callName === PROXY_OFF_CALL_NAME &&
      this.#hasBindedTarget()
    );
  }

  #handleOffCallWithoutArguments() {
    let targetOrQuery;
    [targetOrQuery, this.target] = [this.target, null];
    return this.#delegateHandler(targetOrQuery, null, null, false);
  }

  #isEventListenerCall(args) {
    return typeof args[0] === "string" && args.length <= 4;
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
    if (this.#callName === PROXY_OFF_CALL_NAME) {
      return handler(targetOrQuery, eventType, listener, delegate);
    }
    return handler(targetOrQuery, eventType, listener, options, delegate);
  }
}
