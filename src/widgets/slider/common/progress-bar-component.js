import { Component } from "../../component.js";
import { Dom } from "../../../dom/dom-utils.js";

export class SliderProgressBarComponent extends Component {
  constructor(widget) {
    super(widget);
  }

  createElement() {
    return Dom.elm("div", {
      class: "slider-progress-bar",
    });
  }

  onProgressUpdate(progress) {
    this.css({
      width: `${progress * 100}%`,
    });
  }

  onCreate() {
    this.progressBar.on("progressUpdate", this.onProgressUpdate.bind(this));

    this.element.addClass(this.progressBar.getName());
  }
}
