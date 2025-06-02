import EventEmitter from "./event-emitter.js";
import { DomElement, DomText } from "./element.js";
import { Browser } from "../utils.js";

export class Dom {
  static #eventEmitter = EventEmitter.getInstance();
  static get eventEmitter() {
    return this.#eventEmitter;
  }

  static on(target, eventType, listener, options) {
    this.#eventEmitter.registerEvent(
      target,
      eventType,
      listener,
      options,
      true
    );
  }

  static off(target, eventType, listener) {
    this.#eventEmitter.unregisterEvent(target, eventType, listener, true);
  }

  static once(target, eventType, listener) {
    this.#eventEmitter.on.ignoreDelegation(target, eventType, listener, {
      once: true,
    });
  }

  static elm(tagName, attributes, ...children) {
    return new DomElement(tagName, attributes, ...children);
  }

  static text(text) {
    return new DomText(text);
  }

  static append(parent, ...children) {
    parent.append(...children);
  }

  static prepend(parent, ...children) {
    parent.prepend(...children);
  }

  static disableSelection() {
    document.documentElement.style.userSelect = "none";
    document.documentElement.style.webkitUserSelect = "none"; // Safari
    document.documentElement.style.MozUserSelect = "none"; // Firefox
  }

  static enableSelection() {
    document.documentElement.style.userSelect = "";
    document.documentElement.style.webkitUserSelect = ""; // Safari
    document.documentElement.style.MozUserSelect = ""; // Firefox
  }

  static setCursorPointer() {
    document.documentElement.style.cursor = "pointer";
  }

  static setCursorDefault() {
    document.documentElement.style.cursor = "default";
  }
}
