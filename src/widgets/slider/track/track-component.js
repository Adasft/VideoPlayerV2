import { Component } from "../../component.js";
import { Dom } from "../../../dom/dom-utils.js";
import { SliderProgressBarComponent } from "../common/progress-bar-component.js";
// import { SeekerSlider } from "../seeker-slider/seeker-slider.js";

export class SliderTrackComponent extends Component {
  constructor(controller) {
    super(controller);
    this.setOnAppend();
    this.#init();
  }

  #createProgressBarsWrapper() {
    const wrapper = this.wrapper("div", "slider-progress-bars-wrapper");
    const { bars } = this.controller;

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
    const { controller: track } = this;

    this.element.append([this.#createProgressBarsWrapper()]);

    this.css({
      width: `${track.ratioWidth * 100}%`,
    });

    this.#bindMouseEvents();
  }

  #setHoverPadding() {
    const hoverPadding = this.parent.controller.getHoverPadding();

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
    const { controller: slider } = this.parent;

    if (slider.isDragging) return;

    this.element.removeClass("active");
  }

  // onTrackChanged(track) {
  //   console.log("onTrackChanged", this);
  //   const { isDragging } = this.parent.controller;
  //   if (!isDragging) return;
  //   if (track.getIndex() === this.controller.getIndex()) {
  //     this.element.addClass("active");
  //   } else {
  //     this.element.removeClass("active");
  //   }
  // }

  onAppended() {
    this.#setHoverPadding();
    // console.log("onAppended", this);
    // this.parent.controller.on("trackChanged", (track) => {
    //   console.log("onTrackChanged", this);
    //   const { isDragging } = this.parent.controller;
    //   if (!isDragging) return;
    //   if (track.getIndex() === this.controller.getIndex()) {
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
