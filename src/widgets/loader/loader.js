import { Controller } from "../controller.js";

export default class Loader extends Controller {
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
