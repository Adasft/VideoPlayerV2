import { Controller } from "../../controller.js";

export class SliderThumb extends Controller {
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
