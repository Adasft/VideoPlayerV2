import { Component } from "../../component.js";
import { Dom } from "../../../dom/dom-utils.js";

export class SliderThumbComponent extends Component {
  constructor(widget) {
    super(widget);
    this.setOnAppend();
    this.#init();
  }

  #init() {
    this.thumb.on("move", (progress) => {
      this.css({
        left: `calc(${progress * 100}% - var(--player-slider-thumb-size) / 2)`,
      });
    });

    this.thumb.on("visibilityChange", (isVisible) => {
      isVisible ? this.show() : this.hide();
    });
  }

  onAppended() {
    const { slider } = this.parent;

    if (!slider.showAlwaysThumb()) {
      this.hide();
    }
  }

  createElement() {
    return Dom.elm("div", {
      class: "slider-thumb",
    });
  }
}
