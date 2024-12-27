import { Component } from "../component.js";
import { Dom } from "../../dom/dom-utils.js";

export default class LoaderComponent extends Component {
  constructor(widget) {
    super(widget);
    this.#init();
  }

  #init() {
    this.loader.on("visibilityChange", (isVisible) => {
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
