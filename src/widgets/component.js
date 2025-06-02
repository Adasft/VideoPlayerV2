import { DomElement } from "../dom/element.js";
import { Wrapper } from "./wrapper.js";
import { Dom } from "../dom/dom-utils.js";
import { getRandomId } from "../utils.js";

export class Component {
  /**
   * Lifecycle that triggers when the component is mounted to the DOM.
   * @type {"onMounted"}
   */
  static ON_MOUNTED = "onMounted";

  /**
   * Lifecycle that triggers when the component is appended to the parent element.
   * @type {"onAppended"}
   */
  static ON_APPENDED = "onAppended";

  /**
   * Lifecycle states that a component can have.
   *
   * @type {Map<"onMounted" | "onAppended", Set<Component> | undefined> | undefined}
   */
  static #lifecycleStates;

  /**
   * DOM element that represents the component.
   *
   * @type {DomElement}
   */
  #element;

  get element() {
    return this.#element;
  }

  /**
   * The parent component of the component.
   *
   * @type {Component}
   */
  #parent;

  get parent() {
    return this.#parent;
  }

  set parent(parent) {
    this.#parent = parent;
  }

  get node() {
    return this.#element.node;
  }

  get bounds() {
    return this.#element.getBounds();
  }

  get isConnected() {
    return this.#element.isConnected();
  }

  get on() {
    return this.#element.on;
  }

  get off() {
    return this.#element.off;
  }

  constructor(widget) {
    widget.component = this;

    this.id = `${widget.name}-${getRandomId()}`;

    // Se define el nombre de la propiedad con la cual se podrá acceder al widget
    // de la instancia de la clase. Por ejemplo, si el nombre del widget es Player,
    // el nombre de la propiedad será "player". Y su acceso será `this.player`.
    // En caso existir un error al obtener el nombre del widget, se utilizará el
    // nombre "widget" como nombre de la propiedad.
    Object.defineProperty(this, widget.name ?? "widget", {
      get: () => widget,
    });

    const element = this.createElement();
    if (!element || !(element instanceof DomElement)) {
      throw new Error("Component.createElement() must return a DomElement.");
    }

    this.#element = element;

    widget.on("destroy", () => this.destroy());
  }

  #attachChild(child, parentComponent) {
    child.parent = parentComponent;
    child.#tiggerLifecycleState(parentComponent.node, Component.ON_APPENDED);

    if (parentComponent.isConnected) {
      child.#tiggerLifecycleState(parentComponent.node, Component.ON_MOUNTED);
    }
  }

  /**
   * Triggers the lifecycle state of a component.
   *
   * @param {Element} parent - The parent element to trigger the lifecycle state on.
   * @param {"onMounted" | "onAppended"} lifecycleState - The lifecycle state to trigger.
   */
  #tiggerLifecycleState(parent, lifecycleState) {
    const lifecycleStates = Component.#getLifecycleStates();
    const lifecycleStateSet = lifecycleStates.get(lifecycleState);

    if (!lifecycleStateSet) {
      return;
    }

    if (lifecycleState === Component.ON_MOUNTED) {
      [...lifecycleStateSet].forEach((component) => {
        const element = component.element;

        if (!element?.isChildOf(parent)) {
          return;
        }

        component.onMounted?.();
        lifecycleStateSet.delete(component);

        if (lifecycleStateSet.size === 0) {
          lifecycleStates.delete(lifecycleState);
        }
      });
    } else if (lifecycleState === Component.ON_APPENDED) {
      if (lifecycleStateSet.has(this)) {
        this.onAppended?.();
      }
    }

    if (lifecycleStates.size === 0) {
      Component.#lifecycleStates = undefined;
    }
  }

  /**
   * Create the component's DOM element.
   *
   * @abstract
   * @returns {HTMLElement}
   */
  createElement() {
    throw new Error("Component.createElement() must be implemented.");
  }

  show() {
    this.#element.removeClass("hide");
    this.#element.addClass("show");
  }

  hide() {
    this.#element.removeClass("show");
    this.#element.addClass("hide");
  }

  addClass(className) {
    this.#element.addClass(className);
  }

  removeClass(className) {
    this.#element.removeClass(className);
  }

  css(styles) {
    this.#element.css(styles);
  }

  destroy() {
    if (this.isConnected) {
      this.#element.disconnect();
    }

    this.#parent = null;
    this.#element = null;
  }

  /**
   * Appends children to the component's DOM element.
   *
   * @param {...Component} children - The children to append.
   */
  append(...children) {
    this.#element.append(children, (child) => {
      this.#attachChild(child, this);
    });
  }

  /**
   * Appends the component to the specified parent.
   *
   * @param {Component | Wrapper} parent - The parent element or wrapper to append the component to.
   */
  insertTo(parent, insertMethod) {
    const parentElement = parent.element;
    const parentComponent =
      parent instanceof Component ? parent : parent.getParentComponent();

    if (insertMethod === "append") {
      parentElement.append([this.element]);
    } else if (insertMethod === "prepend") {
      parentElement.prepend([this.element]);
    }

    this.#attachChild(this, parentComponent);
  }

  appendWrapper(...wrapper) {
    const wrapperElements = wrapper.map((wrapper) => wrapper.element);
    this.element.append(wrapperElements);
  }

  /**
   * Mounts the component to the DOM.
   *
   * @param {Element} parent - The parent element to mount the component to.
   */
  mount(parent) {
    if (!parent) {
      throw new Error("Widget.render() must be called with a parent element.");
    }

    if (!parent.isConnected) {
      throw new Error(
        "Widget.render() must be called with a connected parent element."
      );
    }

    Dom.append(parent, this.node);
    this.#tiggerLifecycleState(parent, Component.ON_MOUNTED);
  }

  createRef() {
    return { current: null };
  }

  wrapper(tagName, className) {
    return new Wrapper(tagName, className, this);
  }

  setOnMount() {
    Component.#registerLifecycleState(Component.ON_MOUNTED, this);
  }

  setOnAppend() {
    Component.#registerLifecycleState(Component.ON_APPENDED, this);
  }

  static #getLifecycleStates() {
    if (!Component.#lifecycleStates) {
      Component.#lifecycleStates = new Map();
    }
    return Component.#lifecycleStates;
  }

  static #registerLifecycleState(lifecycleState, component) {
    const lifecycleStates = Component.#getLifecycleStates();
    const lifecycleStateSet = lifecycleStates.get(lifecycleState);

    if (!lifecycleStateSet) {
      lifecycleStates.set(lifecycleState, new Set());
    }

    lifecycleStates.get(lifecycleState).add(component);
  }
}
