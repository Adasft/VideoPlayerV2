import SliderComponent from "../common/slider-component.js";

export default class SeekerSliderComponent extends SliderComponent {
  constructor(controller) {
    super(controller);
    this.#init();
  }

  #init() {
    this.#toggleChaptersClass();
    this.controller.on("trackChanged", this.onTrackChanged.bind(this));
  }

  #resetIndicatorTrackBars() {
    const { controller: slider } = this;

    if (slider.hasChapters()) {
      slider.multiTrackManager.rasterizeTrackBar({
        direction: "prev",
        mode: "reset",
        barName: "indicator",
        activeTrack: slider.indicatorTrack,
      });
    }
    slider.indicatorTrack.bars.indicator.reset();
    slider.clearIndicatorTrack();
  }

  #toggleChaptersClass() {
    this.element.toggleClass("has-chapters", this.controller.hasChapters());
  }

  disableHoverEffects(canUnbindGlobalEvents = true) {
    super.disableHoverEffects(canUnbindGlobalEvents);
    this.controller.track.component.element.removeClass("active");
  }

  onRefresh() {
    this.onRefresh();
    this.#toggleChaptersClass();
  }

  onTrackChanged({ currentTrack, oldTrack }) {
    const { isDragging } = this.controller;
    if (!isDragging) return;
    currentTrack.component.element.addClass("active");
    oldTrack?.component.element.removeClass("active");
  }

  onMouseLeave() {
    super.onMouseLeave();
    this.#resetIndicatorTrackBars();
  }

  onMouseDown({ clientX }) {
    super.onMouseDown({ clientX });
    this.#resetIndicatorTrackBars();
  }
}
