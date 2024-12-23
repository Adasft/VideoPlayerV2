import { Widget } from "../widget.js";

export default class Loader extends Widget {
  constructor() {
    super();
  }

  show() {
    this.emit("visibilityChange", true);
  }

  hide() {
    this.emit("visibilityChange", false);
  }
}
