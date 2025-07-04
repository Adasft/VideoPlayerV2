import { Component } from "../widgets/component.js";
import EventEmitter from "./events/event-emitter.js";

export class DomNode {
  static DOM_ELEMENT_TYPE = 1;
  static DOM_TEXT_TYPE = 3;

  #node;

  constructor(tagNameOrText, type) {
    this.#node =
      type === DomNode.DOM_ELEMENT_TYPE
        ? document.createElement(tagNameOrText)
        : document.createTextNode(tagNameOrText);
  }

  get node() {
    return this.#node;
  }

  get isConnected() {
    return this.#node.isConnected;
  }

  get parent() {
    return this.#node.parentNode;
  }

  isChildOf(parent) {
    return parent.node.contains(this.#node);
  }

  clearNode() {
    if (this.isConnected) {
      return;
    }
    this.#node = null;
  }
}

export class DomElement extends DomNode {
  #cacheBounds;
  #children = new Set();

  constructor(tagName, attributes, ...children) {
    super(tagName, DomNode.DOM_ELEMENT_TYPE);

    if (attributes) {
      this.#configAttributes(attributes);
    }

    if (children) {
      this.append(children);
    }
  }

  get on() {
    return EventEmitter.shared.on.bindTarget(this.node);
  }

  get off() {
    return EventEmitter.shared.off.bindTarget(this.node);
  }

  get firstChild() {
    return this.#children.values().next().value ?? null;
  }

  get children() {
    return this.#children;
  }

  /**
   * Appends children to the DOM element.
   *
   * @param {(DomNode | Component | string | number)[]} children - The children to append.
   * @param {((child: DomNode | Component | string | number) => void)} [callback] - A callback function to be called after each child is appended.
   */
  append(children, callback) {
    this.#addChildren(children, "append", callback);
  }

  /**
   * Prepends children to the DOM element.
   *
   * @param {(DomNode | Component | string | number)[]} children - The children to prepend.
   * @param {((child: DomNode | Component | string | number) => void)} [callback] - A callback function to be called after each child is prepended.
   */
  prepend(children, callback) {
    this.#addChildren(children, "prepend", callback);
  }

  css(styles) {
    if (!styles) {
      return;
    }

    const { properties, ...rules } = styles;

    if (properties) {
      Object.keys(properties).forEach((prop) =>
        this.node.style.setProperty(prop, properties[prop])
      );
    }

    Object.assign(this.node.style, rules);
  }

  addClass(...classList) {
    this.node.classList.add(...classList);
  }

  removeClass(...classList) {
    this.node.classList.remove(...classList);
  }

  toggleClass(className, force) {
    this.node.classList.toggle(className, force);
  }

  getBounds() {
    if (!this.#cacheBounds) {
      this.#cacheBounds = this.node.getBoundingClientRect();
    }
    return this.#cacheBounds;
  }

  resetBounds() {
    this.#cacheBounds = null;
  }

  setHTML(html) {
    this.node.innerHTML = html;
  }

  /**
   * Disconnects the element by removing all event listeners and detaching the node from the DOM.
   * This prevents any further event callbacks from being triggered.
   * Does not affect child elements or internal references.
   *
   * @returns {void}
   */
  disconnect() {
    // Eliminamos todos los eventos relacionados con el elemento
    // para evitar que se ejecuten callbacks innecesariamente.
    this.off();

    if (this.isConnected) {
      this.node.remove();
    }
  }

  /**
   * Fully destroys the element and its children.
   * Performs a complete cleanup by:
   * - Disconnecting event listeners and removing the element from the DOM
   * - Recursively destroying child elements
   * - Clearing internal caches and references to allow garbage collection
   * - Invoking `clearNode()` to clean up any additional internal state
   *
   * @returns {void}
   */
  destroy() {
    this.disconnect();

    for (const child of this.#children) {
      child.destroy();
    }

    this.clearNode();
  }

  /**
   * Removes the element from the DOM and recursively removes its children.
   * Calls `disconnect()` internally to handle event cleanup and node removal.
   *
   * @returns {void}
   */
  remove() {
    this.disconnect();

    for (const child of this.#children) {
      child.remove();
    }
  }

  clearNode() {
    super.clearNode();
    this.#children.clear();
    this.#cacheBounds = null;
  }

  #configAttributes(attributes) {
    const { styles, ...restAttrs } = attributes;
    Object.entries(restAttrs).forEach(([key, value]) => {
      this.node.setAttribute(key, value);
    });

    this.css(styles);
  }

  /**
   * Appends or prepends children to the DOM element.
   *
   * @param {(DomNode | Component | string | number)[]} children - The children to add.
   * @param {"append" | "prepend"} method - The method to use for adding children.
   * @param {((child: DomNode | Component | string | number) => void)} [callback] - A callback function to be called after each child is added.
   */
  #addChildren(children, method, callback) {
    children.forEach((child) => {
      const isChildComponent = child instanceof Component;
      const isChildDomNode = child instanceof DomNode;

      if (isChildComponent || isChildDomNode) {
        this.node[method](child.node);
        if (isChildComponent) {
          this.#children.add(child.element);
        } else {
          this.#children.add(child);
        }
      } else if (child !== null && child !== undefined) {
        this.node[method](document.createTextNode(JSON.stringify(child)));
      }

      if (callback) {
        callback(child);
      }
    });
  }
}

export class DomText extends DomNode {
  constructor(text) {
    super(text, DomNode.DOM_TEXT_TYPE);
  }

  setText(text) {
    if (this.node.textContent === text) {
      return;
    }
    this.node.textContent = text;
  }

  getText() {
    return this.node.textContent;
  }

  destroy() {
    this.node.remove();
    this.clearNode();
  }

  remove() {
    this.node.remove();
  }
}
