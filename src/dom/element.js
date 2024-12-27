import { Dom } from "./dom-utils.js";
import { Component } from "../widgets/component.js";

export class DomNode {
  static DOM_ELEMENT_TYPE = 1;
  static DOM_TEXT_TYPE = 3;

  #node;
  get node() {
    return this.#node;
  }

  constructor(tagNameOrText, type) {
    this.#node =
      type === DomNode.DOM_ELEMENT_TYPE
        ? document.createElement(tagNameOrText)
        : document.createTextNode(tagNameOrText);
  }

  isConnected() {
    return this.#node.isConnected;
  }

  isChildOf(parent) {
    return parent.contains(this.#node);
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
    Object.assign(this.node.style, styles);
  }

  addClass(...classNames) {
    this.node.classList.add(...classNames);
  }

  removeClass(...classNames) {
    this.node.classList.remove(...classNames);
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

  recalculateBounds() {
    this.#cacheBounds = null;
  }

  setHTML(html) {
    this.node.innerHTML = html;
  }

  disconnect() {
    // Eliminamos todos los eventos relacionados con el elemento
    // para evitar que se ejecuten callbacks innecesariamente.
    this.off();

    if (this.isConnected()) {
      this.node.remove();
    }

    for (const child of this.#children) {
      child.disconnect();
    }

    this.#children.clear();
  }

  get on() {
    return Dom.eventEmitter.on.bindTarget(this.node);
  }

  get off() {
    return Dom.eventEmitter.off.bindTarget(this.node);
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

  disconnect() {
    this.node.remove();
  }
}
