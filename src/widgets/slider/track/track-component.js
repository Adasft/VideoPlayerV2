import {
  Component,
  createComponentThroughCreationLifecycle,
} from "../../component.js";
import { Dom } from "../../../dom/dom-utils.js";
import { SliderProgressBarComponent } from "../common/progress-bar-component.js";

export class SliderTrackComponent extends Component {
  constructor(widget) {
    super(widget);
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

  onMounted() {
    this.on("mouseenter", this.onMouseEnter.bind(this));
    this.on("mouseleave", this.onMouseLeave.bind(this));
  }

  onAppended() {
    this.#setHoverPadding();
  }

  onCreate() {
    const { track } = this;

    this.element.append([this.#createProgressBarsWrapper()]);

    this.css({
      width: `${track.ratioWidth * 100}%`,
    });
  }

  #createProgressBarsWrapper() {
    const wrapper = this.wrapper("div", "slider-progress-bars-wrapper");
    const { bars } = this.track;

    for (const [, bar] of Object.entries(bars)) {
      wrapper.add(
        createComponentThroughCreationLifecycle(SliderProgressBarComponent, bar)
      );
    }

    return wrapper;
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
