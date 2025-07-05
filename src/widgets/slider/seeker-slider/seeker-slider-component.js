import SliderComponent from "../common/slider-component.js";

export default class SeekerSliderComponent extends SliderComponent {
  constructor(widget) {
    super(widget);
    // this.#init();
  }

  disableHoverEffects(canUnbindGlobalEvents = true) {
    super.disableHoverEffects(canUnbindGlobalEvents);
    this.slider.track.component.element.removeClass("active");
  }

  onRefresh() {
    super.onRefresh();
    this.#toggleChaptersClass();
  }

  onTrackChanged({ currentTrack, oldTrack }) {
    const { isDragging } = this.slider;
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

  onCreate() {
    super.onCreate();
    this.#toggleChaptersClass();
    this.slider.on("trackChanged", this.onTrackChanged.bind(this));
  }

  #resetIndicatorTrackBars() {
    const { slider } = this;

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
    this.element.toggleClass("has-chapters", this.slider.hasChapters());
  }
}
