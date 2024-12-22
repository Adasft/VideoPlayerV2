import { Component } from "../../component.js";
import { Dom } from "../../../dom/dom-utils.js";

export class SliderProgressBarComponent extends Component {
  constructor(controller) {
    super(controller);
    this.#init();
  }

  #init() {
    this.controller.on("progressUpdate", (progress) => {
      this.css({
        width: `${progress * 100}%`,
      });
    });

    this.element.addClass(this.controller.getName());
  }

  createElement() {
    return Dom.elm("div", {
      class: "slider-progress-bar",
    });
  }
}
