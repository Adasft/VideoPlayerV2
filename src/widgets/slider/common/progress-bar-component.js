import { Component } from "../../component.js";
import { Dom } from "../../../dom/dom-utils.js";

export class SliderProgressBarComponent extends Component {
  constructor(widget) {
    super(widget);
    this.#init();
  }

  #init() {
    this.progressBar.on("progressUpdate", (progress) => {
      this.css({
        width: `${progress * 100}%`,
      });
    });

    this.element.addClass(this.progressBar.getName());
  }

  createElement() {
    return Dom.elm("div", {
      class: "slider-progress-bar",
    });
  }
}
