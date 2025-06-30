import { DomElement } from "../dom/element.js";
import { Wrapper } from "./wrapper.js";
import { Dom } from "../dom/dom-utils.js";
import { getRandomId } from "../utils.js";

const LCEvents = {
  /**
   * Lifecycle that triggers when the component is mounted to the DOM.
   * @type {"onMounted"}
   */
  MOUNTED: "onMounted",
  DISMOUNT: "onDismount",
  /**
   * Lifecycle that triggers when the component is appended to the parent element.
   * @type {"onAppended"}
   */
  APPENDED: "onAppended",
};

const lifecycleManager = {
  /**
   * @type {Map<"onMounted" | "onAppended", Set<Component>> | null}
   */
  stateMap: null,

  getStates() {
    if (!this.stateMap) {
      this.stateMap = new Map();
    }
    return this.stateMap;
  },

  clear() {
    this.stateMap = null;
  },
};

function triggerStates(eventName, componentsSet, parentElement) {
  const invokeMethod = (component) => {
    const method = component[eventName];
    if (!method) return;
    method.call(component);
    componentsSet.delete(component);
  };

  for (const component of [...componentsSet]) {
    if (parentElement) {
      if (component.element?.isChildOf(parentElement)) {
        invokeMethod(component);
        continue;
      }
    } else {
      invokeMethod(component);
    }
  }
}

function triggerAppendedState(componentsSet, component) {
  if (!componentsSet.has(component)) {
    return;
  }

  component.onAppended();
  componentsSet.delete(component);
}

/**
 * Triggers the lifecycle state of a component.
 *
 * @param {Element} parent - The parent element to trigger the lifecycle state on.
 * @param {"onMounted" | "onAppended"} state - The lifecycle state to trigger.
 */
function triggerLifecycleEvent(eventName, parentElement, component) {
  const states = lifecycleManager.getStates();
  const componentsSet = states.get(eventName);

  // console.log(eventName, componentsSet, component);

  if (!componentsSet) return;

  switch (eventName) {
    case LCEvents.MOUNTED:
    case LCEvents.DISMOUNT:
      triggerStates(eventName, componentsSet, parentElement);
      if (componentsSet.size === 0) {
        states.delete(eventName);
      }
      break;

    case LCEvents.APPENDED:
      triggerAppendedState(componentsSet, component);
      break;
  }

  if (states.size === 0) {
    lifecycleManager.clear();
  }
}

function registerLifecycleEvent(eventName, component) {
  const states = lifecycleManager.getStates();
  if (!states.has(eventName)) {
    states.set(eventName, new Set());
  }
  states.get(eventName).add(component);
}

export class Component {
  /**
   * DOM element that represents the component.
   *
   * @type {DomElement}
   */
  #element;

  /**
   * The parent component of the component.
   *
   * @type {Component}
   */
  #parent;

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

  get element() {
    return this.#element;
  }

  get parent() {
    return this.#parent;
  }

  get node() {
    return this.#element.node;
  }

  get bounds() {
    return this.#element.getBounds();
  }

  get isConnected() {
    return this.#element.isConnected;
  }

  get on() {
    return this.#element.on;
  }

  get off() {
    return this.#element.off;
  }

  set parent(parent) {
    this.#parent = parent;
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

  resetBounds() {
    this.#element.resetBounds();
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
      this.#element.destroy();
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
      if (child.onAppended) {
        registerLifecycleEvent(LCEvents.APPENDED, child);
      }
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
      parent instanceof Component ? parent : parent.parentComponent;

    if (insertMethod === "append") {
      parentElement.append([this.element]);
    } else if (insertMethod === "prepend") {
      parentElement.prepend([this.element]);
    }

    if (this.onAppended) {
      registerLifecycleEvent(LCEvents.APPENDED, this);
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
      throw new Error(
        "Component.mount() must be called with a parent element."
      );
    }

    if (!parent.isConnected) {
      throw new Error(
        "Component.mount() must be called with a connected parent element."
      );
    }

    if (this.onMounted) {
      registerLifecycleEvent(LCEvents.MOUNTED, this);
    }

    Dom.append(parent, this.node);

    triggerLifecycleEvent(LCEvents.MOUNTED, parent, this);
  }

  dismount() {
    if (this.onDismount) {
      registerLifecycleEvent(LCEvents.DISMOUNT, this);
    }

    this.#element.remove();

    triggerLifecycleEvent(LCEvents.DISMOUNT, null, this);
  }

  createRef() {
    return { current: null };
  }

  wrapper(tagName, className) {
    return new Wrapper(tagName, className, this);
  }

  #attachChild(child, parentComponent) {
    child.parent = parentComponent;

    triggerLifecycleEvent(LCEvents.APPENDED, parentComponent.node, child);

    if (child.onMounted) {
      registerLifecycleEvent(LCEvents.MOUNTED, child);

      if (parentComponent.isConnected) {
        triggerLifecycleEvent(LCEvents.MOUNTED, parentComponent.node, child);
      }
    }

    if (child.onDismount) {
      registerLifecycleEvent(LCEvents.DISMOUNT, child);
    }
  }
}
