import { Widget } from "../../widget.js";

export class SliderThumb extends Widget {
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
