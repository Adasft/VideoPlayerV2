import { Widget } from "../../widget.js";

export class SliderProgressBar extends Widget {
  #progress;
  #name;

  constructor(name = "progress") {
    super();
    this.#name = name;
  }

  setProgress(progress) {
    this.#progress = progress;
    this.emit("progressUpdate", progress);
  }

  getProgress() {
    return this.#progress;
  }

  complete() {
    this.setProgress(1);
  }

  reset() {
    this.setProgress(0);
  }

  getName() {
    return this.#name;
  }
}
