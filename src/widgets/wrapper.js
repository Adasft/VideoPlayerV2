import { Dom } from "../dom/dom-utils.js";
import { DomElement } from "../dom/element.js";
import { Component } from "./component.js";

export class Wrapper extends DomElement {
  #parentComponent;

  constructor(tagName, className, parentComponent) {
    super(tagName, { class: className });
    this.#parentComponent = parentComponent;
  }

  get element() {
    return this.node;
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
    return this.#insertChildAtPosition("append", child);
  }

  /**
   * Prepends a child to the wrapper.
   *
   * @param {Component | Wrapper} child - The child to prepend.
   * @return {Wrapper} The wrapper instance.
   */
  addFirst(child) {
    return this.#insertChildAtPosition("prepend", child);
  }

  toRef(ref) {
    ref.current = this;
    return this;
  }

  text(...text) {
    const nodes = text.map((t) => Dom.text(t));
    this.append(nodes);
    return this;
  }

  class(...classList) {
    this.addClass(classList);
    return this;
  }

  #shouldInsertChild(child) {
    if (!child || child.isConnected) {
      return false;
    }

    return true;
  }

  #insertChildAtPosition(position, child) {
    const shouldInsert = this.#shouldInsertChild(child);
    const isComponent = child instanceof Component;
    if (shouldInsert) {
      this[position]([child]); // "append" or "prepend"
      if (isComponent) {
        child.attachToComponent(this.#parentComponent);
      }
    }
    return this;
  }
}
