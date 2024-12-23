import { Component } from "../../component.js";
import { Dom } from "../../../dom/dom-utils.js";
import { SliderProgressBarComponent } from "../common/progress-bar-component.js";
// import { SeekerSlider } from "../seeker-slider/seeker-slider.js";

export class SliderTrackComponent extends Component {
  constructor(widget) {
    super(widget);
    this.setOnAppend();
    this.#init();
  }

  #createProgressBarsWrapper() {
    const wrapper = this.wrapper("div", "slider-progress-bars-wrapper");
    const { bars } = this.widget;

    for (const [, bar] of Object.entries(bars)) {
      wrapper.add(new SliderProgressBarComponent(bar));
    }

    return wrapper.element;
  }

  #bindMouseEvents() {
    this.on("mouseenter", this.onMouseEnter.bind(this));
    this.on("mouseleave", this.onMouseLeave.bind(this));
  }

  #init() {
    const { widget: track } = this;

    this.element.append([this.#createProgressBarsWrapper()]);

    this.css({
      width: `${track.ratioWidth * 100}%`,
    });

    this.#bindMouseEvents();
  }

  #setHoverPadding() {
    const hoverPadding = this.parent.widget.getHoverPadding();

    if (hoverPadding > 0) {
      this.css({
        paddingTop: `${hoverPadding}px`,
        paddingBottom: `${hoverPadding}px`,
      });
    }
  }

  onMouseEnter() {
    this.element.addClass("active");
  }

  onMouseLeave() {
    const { widget: slider } = this.parent;

    if (slider.isDragging) return;

    this.element.removeClass("active");
  }

  // onTrackChanged(track) {
  //   console.log("onTrackChanged", this);
  //   const { isDragging } = this.parent.widget;
  //   if (!isDragging) return;
  //   if (track.getIndex() === this.widget.getIndex()) {
  //     this.element.addClass("active");
  //   } else {
  //     this.element.removeClass("active");
  //   }
  // }

  onAppended() {
    this.#setHoverPadding();
    // console.log("onAppended", this);
    // this.parent.widget.on("trackChanged", (track) => {
    //   console.log("onTrackChanged", this);
    //   const { isDragging } = this.parent.widget;
    //   if (!isDragging) return;
    //   if (track.getIndex() === this.widget.getIndex()) {
    //     this.element.addClass("active");
    //   } else {
    //     this.element.removeClass("active");
    //   }
    // });
  }

  createElement() {
    return Dom.elm("div", {
      class: "slider-track",
    });
  }
}
