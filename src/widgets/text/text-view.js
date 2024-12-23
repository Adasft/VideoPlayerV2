import { Widget } from "../widget.js";

export default class TextView extends Widget {
  #text;

  constructor({ text }) {
    super();
    this.#text = text;
  }

  set text(text) {
    this.#text = text;
    this.emit("change", text);
  }

  get text() {
    return this.#text;
  }
}
