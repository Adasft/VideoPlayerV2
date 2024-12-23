import SliderComponent from "../common/slider-component.js";

export default class SeekerSliderComponent extends SliderComponent {
  constructor(widget) {
    super(widget);
    this.#init();
  }

  #init() {
    this.#toggleChaptersClass();
    this.widget.on("trackChanged", this.onTrackChanged.bind(this));
  }

  #resetIndicatorTrackBars() {
    const { widget: slider } = this;

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
    this.element.toggleClass("has-chapters", this.widget.hasChapters());
  }

  disableHoverEffects(canUnbindGlobalEvents = true) {
    super.disableHoverEffects(canUnbindGlobalEvents);
    this.widget.track.component.element.removeClass("active");
  }

  onRefresh() {
    this.onRefresh();
    this.#toggleChaptersClass();
  }

  onTrackChanged({ currentTrack, oldTrack }) {
    const { isDragging } = this.widget;
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
