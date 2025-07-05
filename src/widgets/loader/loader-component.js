import { Component } from "../component.js";
import { Dom } from "../../dom/dom-utils.js";

export default class LoaderComponent extends Component {
  constructor(widget) {
    super(widget);
  }

  createElement() {
    return Dom.elm("div", {
      class: "loader",
    });
  }

  onCreate() {
    this.loader.on("visibilityChange", (isVisible) => {
      isVisible ? this.show() : this.hide();
    });
  }
}
