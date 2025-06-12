import { Dom } from "../dom/dom-utils.js";
import { Component } from "./component.js";

export class Wrapper {
  #element;
  #parentComponent;

  constructor(tagName, className, parentComponent) {
    this.#element = Dom.elm(tagName, {
      class: className,
    });

    this.#parentComponent = parentComponent;
  }

  get element() {
    return this.#element;
  }

  get isConnected() {
    return this.#element.isConnected;
  }

  get parentComponent() {
    return this.#parentComponent;
  }

  /**
   * Appends a child to the wrapper.
   *
   * @param {Component | Wrapper} child - The child to append.
   * @return {Wrapper} The wrapper instance.
   */
  add(child) {
    return this.#insertChildToParent(child, Dom.append);
  }

  /**
   * Prepends a child to the wrapper.
   *
   * @param {Component | Wrapper} child - The child to prepend.
   * @return {Wrapper} The wrapper instance.
   */
  prepend(child) {
    return this.#insertChildToParent(child, Dom.prepend);
  }

  toRef(ref) {
    ref.current = this;
    return this;
  }

  text(text) {
    const textNode = Dom.text(text);
    this.#element.append(textNode);
    return this;
  }

  class(...classList) {
    this.#element.addClass(classList);
    return this;
  }

  #insertChildToParent(child, insertMethod) {
    if (!child || child.isConnected) {
      return this;
    }

    if (child instanceof Component) {
      // console.log("SI", child);
      child.insertTo(this, insertMethod === Dom.append ? "append" : "prepend");
    } else {
      insertMethod(this.#element.node, child.#element.node);
    }

    return this;
  }
}
