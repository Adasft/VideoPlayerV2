import { Component } from "../../component.js";
import { Dom } from "../../../dom/dom-utils.js";
import { SliderProgressBarComponent } from "../common/progress-bar-component.js";

export class SliderTrackComponent extends Component {
  constructor(widget) {
    super(widget);
    this.setOnAppend();
    this.#init();
  }

  onMouseEnter() {
    this.element.addClass("active");
  }

  onMouseLeave() {
    const { slider } = this.parent;

    if (slider.isDragging) return;

    this.element.removeClass("active");
  }

  createElement() {
    return Dom.elm("div", {
      class: "slider-track",
    });
  }

  onAppended() {
    this.#setHoverPadding();
  }

  #init() {
    const { track } = this;

    this.element.append([this.#createProgressBarsWrapper()]);

    this.css({
      width: `${track.ratioWidth * 100}%`,
    });

    this.on("mouseenter", this.onMouseEnter.bind(this));
    this.on("mouseleave", this.onMouseLeave.bind(this));
  }

  #createProgressBarsWrapper() {
    const wrapper = this.wrapper("div", "slider-progress-bars-wrapper");
    const { bars } = this.track;

    for (const [, bar] of Object.entries(bars)) {
      wrapper.add(new SliderProgressBarComponent(bar));
    }

    return wrapper.element;
  }

  #setHoverPadding() {
    const hoverPadding = this.parent.slider.getHoverPadding();

    if (hoverPadding > 0) {
      this.css({
        paddingTop: `${hoverPadding}px`,
        paddingBottom: `${hoverPadding}px`,
      });
    }
  }
}
