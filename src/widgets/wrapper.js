import { Dom } from "../dom/dom-utils.js";
import { Component } from "./component.js";

export class Wrapper {
  #element;
  get element() {
    return this.#element;
  }

  #parentComponent;

  get isConnected() {
    return this.#element.isConnected();
  }

  constructor(tagName, className, parentComponent) {
    this.#element = Dom.elm(tagName, {
      class: className,
    });

    this.#parentComponent = parentComponent;
  }

  #insertChildToParent(child, insertMethod) {
    console.log("insertChildToParent", child, child?.isConnected);
    if (!child || child.isConnected) {
      return this;
    }

    if (child instanceof Component) {
      child.insertTo(this, insertMethod === Dom.append ? "append" : "prepend");
    } else {
      insertMethod(this.#element.node, child.#element.node);
    }

    return this;
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

  getParentComponent() {
    return this.#parentComponent;
  }
}
