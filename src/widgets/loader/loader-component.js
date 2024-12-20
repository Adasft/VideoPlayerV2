import { Component } from "../component.js";
import { Dom } from "../../dom-utils/dom.js";

export default class LoaderComponent extends Component {
  constructor(controller) {
    super(controller);
    this.#init();
  }

  #init() {
    this.controller.on("visibilityChange", (isVisible) => {
      this.css({
        display: isVisible ? "block" : "none",
      });
    });
  }

  createElement() {
    return Dom.elm("div", {
      class: "loader",
    });
  }
}
