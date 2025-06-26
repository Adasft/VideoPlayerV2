import EventEmitter from "./events/event-emitter.js";
import { DomElement, DomText } from "./element.js";

export class Dom {
  static on(target, eventType, listener, options) {
    EventEmitter.shared.proxy.attach(
      target,
      eventType,
      listener,
      options,
      true
    );
  }

  static off(target, eventType, listener) {
    EventEmitter.shared.proxy.detach(target, eventType, listener, true);
  }

  static once(target, eventType, listener) {
    EventEmitter.shared.on.ignoreDelegation(target, eventType, listener, {
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
