import { DomElement } from "../dom/element.js";
import { Wrapper } from "./wrapper.js";
import { Dom } from "../dom/dom-utils.js";
import { getRandomId } from "../utils.js";

export const LCEvents = {
  /**
   * Lifecycle that triggers when the component is created.
   * @type {"onCreate"}
   */
  CREATE: "onCreate",
  /**
   * Lifecycle that triggers when the component is mounted to the DOM.
   * @type {"onMounted"}
   */
  MOUNTED: "onMounted",
  /**
   * Lifecycle that triggers when the component is dismounted from the DOM.
   * @type {"onDismount"}
   */
  DISMOUNT: "onDismount",
  /**
   * Lifecycle that triggers when the component is appended to the parent element.
   * @type {"onAppended"}
   */
  APPENDED: "onAppended",
};

const LifecycleManager = {
  /**
   * @type {Map<LCEvents[keyof LCEvents], Set<Component>> | null}
   */
  stateMap: null,

  /**
   * Retrieves the current state map of components.
   * If the state map does not exist, it initializes a new one.
   * @returns {Map<LCEvents[keyof LCEvents], Set<Component>>}
   */
  getStates() {
    if (!this.stateMap) {
      this.stateMap = new Map();
    }
    return this.stateMap;
  },

  /**
   * Deletes a component from the lifecycle manager.
   * @param {Component} item - The component to delete.
   */
  delete(item) {
    if (!this.stateMap) return;

    for (const [key, componentsSet] of this.stateMap.entries()) {
      if (componentsSet.has(item)) {
        componentsSet.delete(item);
        if (componentsSet.size === 0) {
          this.stateMap.delete(key);
        }
      }
    }

    if (this.stateMap.size === 0) {
      this.clear();
    }
  },

  /**
   * Clears the lifecycle manager's state map.
   */
  clear() {
    this.stateMap = null;
  },
};

/**
 * Invokes a method on a component and handles the event propagation.
 * @param {LCEvents[keyof LCEvents]} name - The name of the method to invoke.
 * @param {Component} component - The component on which to invoke the method.
 * @param {Set<Component>} componentsSet - The set of components to manage lifecycle events.
 * @returns {boolean} - Returns true if the component should be preserved, false otherwise.
 */
function dispatchComponentEvent(name, component, componentsSet) {
  const method = component[name];
  // console.log(method);
  if (!method) return;

  let shouldDispose = true;
  const event = {
    type: name,
    target: component,
    preventDispose: () => {
      shouldDispose = false;
    },
  };

  method.call(component, event);

  if (shouldDispose) {
    componentsSet.delete(component);
    return false;
  }

  return true;
}

/**
 * Triggers an event with propagation to child components.
 * @param {LCEvents[keyof LCEvents]} eventName - The name of the event to trigger.
 * @param {Component} rootComponent - The root component that initiates the event.
 * @param {Set<Component>} componentsSet - The set of components to manage lifecycle events.
 */
function triggerEventWithPropagation(eventName, rootComponent, componentsSet) {
  const wasPreserved = dispatchComponentEvent(
    eventName,
    rootComponent,
    componentsSet
  );

  const remainingComponents = wasPreserved
    ? [...componentsSet].filter((c) => c !== rootComponent)
    : [...componentsSet];

  for (const component of remainingComponents) {
    const element = component.element;
    if (!element?.isChildOf(rootComponent.element)) {
      continue;
    }
    dispatchComponentEvent(eventName, component, componentsSet);
  }
}

/**
 * Triggers an event without propagation to child components.
 * @param {LCEvents[keyof LCEvents]} eventName - The name of the event to trigger.
 * @param {Component} component - The component to trigger the event for.
 * @param {Set<Component>} componentsSet - The set of components to manage lifecycle events.
 */
function triggerEventWithoutPropagation(eventName, component, componentsSet) {
  if (!componentsSet.has(component)) {
    console.log("removed: ", component);
    return;
  }
  console.log("add: ", component);

  dispatchComponentEvent(eventName, component, componentsSet);
}

/**
 * Triggers the lifecycle state of a component.
 *
 * @param {LCEvents[keyof LCEvents]} eventName - The name of the lifecycle event to trigger.
 * @param {Component} component - The component to trigger the event for.
 */
export function triggerLifecycleEvent(eventName, component) {
  const states = LifecycleManager.getStates();
  const componentsSet = states.get(eventName);

  if (!componentsSet) return;

  switch (eventName) {
    case LCEvents.MOUNTED:
    case LCEvents.DISMOUNT:
      triggerEventWithPropagation(eventName, component, componentsSet);
      break;
    case LCEvents.CREATE:
    case LCEvents.APPENDED:
      triggerEventWithoutPropagation(eventName, component, componentsSet);
      break;
  }

  if (componentsSet.size === 0) {
    states.delete(eventName);
  }

  if (states.size === 0) {
    LifecycleManager.clear();
  }
}

export function createComponentThroughCreationLifecycle(CtorComponent, widget) {
  const component = new CtorComponent(widget);
  triggerLifecycleEvent(LCEvents.CREATE, component);
  return component;
}

/**
 * Registers a component for a specific lifecycle event.
 * @param {LCEvents[keyof LCEvents]} eventName - The name of the lifecycle event.
 * @param {Component} component - The component to register for the event.
 */
export function registerLifecycleEvent(eventName, component) {
  const states = LifecycleManager.getStates();
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
    this.widgetName = widget.name ?? "widget";
    // Defines the property name used to access the widget from the class instance.
    // For example, if the widget name is Player, the property name will be "player",
    // and it can be accessed as `this.player`.
    // If there is an error obtaining the widget name, "widget" will be used as the property name.
    Object.defineProperty(this, this.widgetName, {
      get: () => widget,
    });

    const element = this.createElement();
    if (!element || !(element instanceof DomElement)) {
      throw new Error("Component.createElement() must return a DomElement.");
    }

    this.#element = element;

    widget.on("destroy", () => this.destroy());

    this.#attachLifecycleMethods();
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
    if (!(parent instanceof Component)) {
      throw new Error(
        "Component.parent: Parent must be an instance of Component."
      );
    }

    this.#parent = parent;
  }

  /**
   * Create the component's DOM element.
   *
   * @abstract
   * @throws {Error} If not implemented in a subclass.
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

    this.id = null;
    this.#parent = null;
    this.#element = null;
    // this[this.widgetName] = null;

    LifecycleManager.delete(this);
  }

  /**
   * Appends children to the component's DOM element.
   *
   * @param {...Component} children - The children to append.
   */
  append(...children) {
    this.#element.append(children, (child) => child.attachToComponent(this));
  }

  appendWrapper(...wrappers) {
    this.#element.append(wrappers);
  }

  attachToComponent(parentComponent) {
    if (!(parentComponent instanceof Component)) {
      throw new Error(
        "Component.attachToComponent() must be called with a parent Component."
      );
    }

    this.parent = parentComponent;

    this.#attachChild(this, parentComponent);
  }

  /**
   * Mounts the component to the DOM.
   *
   * @param {Element} parent - The parent element to mount the component to.
   * @throws {Error} If the parent element is not provided or not connected.
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

    Dom.append(parent, this.node);

    triggerLifecycleEvent(LCEvents.MOUNTED, this);
  }

  dismount() {
    this.#element.remove();
    triggerLifecycleEvent(LCEvents.DISMOUNT, this);
  }

  createRef() {
    return { current: null };
  }

  wrapper(tagName, className) {
    return new Wrapper(tagName, className, this);
  }

  #attachLifecycleMethods() {
    if (this.onCreate) {
      registerLifecycleEvent(LCEvents.CREATE, this);
    }

    if (this.onAppended) {
      registerLifecycleEvent(LCEvents.APPENDED, this);
    }

    if (this.onMounted) {
      registerLifecycleEvent(LCEvents.MOUNTED, this);
    }

    if (this.onDismount) {
      registerLifecycleEvent(LCEvents.DISMOUNT, this);
    }
  }

  #attachChild(child, parentComponent) {
    if (child.element.isChildOf(parentComponent.element)) {
      triggerLifecycleEvent(LCEvents.APPENDED, child);
    }

    if (parentComponent.isConnected) {
      triggerLifecycleEvent(LCEvents.MOUNTED, child);
    }
  }
}
