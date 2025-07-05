import { Component } from "../../component.js";
import { Dom } from "../../../dom/dom-utils.js";

export class SliderThumbComponent extends Component {
  constructor(widget) {
    super(widget);
  }

  createElement() {
    return Dom.elm("div", {
      class: "slider-thumb",
    });
  }

  onAppended() {
    const { slider } = this.parent;

    if (!slider.showAlwaysThumb()) {
      this.hide();
    }
  }

  onMove(progress) {
    this.css({
      left: `calc(${progress * 100}% - var(--player-slider-thumb-size) / 2)`,
    });
  }

  onVisibilityChange(isVisible) {
    isVisible ? this.show() : this.hide();
  }

  onCreate() {
    this.thumb.on("move", this.onMove.bind(this));
    this.thumb.on("visibilityChange", this.onVisibilityChange.bind(this));
  }
}
