import { Widget } from "../../widget.js";

export class Thumb extends Widget {
  constructor() {
    super();
  }

  moveTo(progress) {
    this.emit("move", progress);
  }

  show() {
    this.emit("visibilityChange", true);
  }

  hide() {
    this.emit("visibilityChange", false);
  }
}
