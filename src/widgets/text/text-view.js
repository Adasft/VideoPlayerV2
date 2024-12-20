import { Controller } from "../controller.js";

export default class TextView extends Controller {
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
