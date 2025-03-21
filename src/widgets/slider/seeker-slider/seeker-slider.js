import Slider from "../common/slider.js";
import { MultiTrackManager } from "../track/multi-track-manager.js";
import { ProgressBar } from "../common/progress-bar.js";

export default class SeekerSlider extends Slider {
  /**
   * The multi-track manager of the slider. If the slider has chapters, this property will be set.
   *
   * @type {MultiTrackManager | null}
   */
  #multiTrackManager = null;

  get multiTrackManager() {
    return this.#multiTrackManager;
  }

  /**
   * The indicator track of the slider.
   *
   * @type {SliderTrack}
   */
  get indicatorTrack() {
    return this.hasChapters()
      ? this.multiTrackManager.getIndicatorCurrentTrack()
      : this.track;
  }

  /**
   * The buffer track of the slider.
   *
   * @type {SliderTrack}
   */
  get bufferTrack() {
    return this.hasChapters()
      ? this.multiTrackManager.getBufferCurrentTrack()
      : this.track;
  }

  /**
   * El progreso de carga del buffer del slider.
   *
   * @type {number}
   */
  #bufferLoadingProgress;

  /**
   * El valor del indicador del slider.
   *
   * @type {number}
   */
  #indicatorValue;

  constructor({ value, min, max, hoverPadding, chapters = [] }) {
    super({
      value,
      min,
      max,
      hoverPadding,
      showAlwaysThumb: false,
      enableHoverGrowth: true,
    });

    if (chapters.length > 0) {
      this.#createMultiTrackManager(chapters);
    }

    this.createTrack();

    this.on("mouseMove", this.setIndicatorValue.bind(this));
  }

  createTrack() {
    if (this.hasChapters()) {
      this.track = this.#multiTrackManager.chapteredTracksList;
    } else {
      super.createTrack();
      this.track.addBar(new ProgressBar("indicator"));
      this.track.addBar(new ProgressBar("buffer"));
    }
  }

  /**
   * Sets the indicator value of the slider.
   *
   * @param {number} value - The indicator value to set.
   */
  setIndicatorValue(value) {
    this.#indicatorValue = this.clampValue(value);
    if (!this.indicatorTrack) return;
    const relativeProgress = this.indicatorTrack.calculateRelativeProgress(
      this.#indicatorValue / this.max
    );

    this.indicatorTrack.bars.indicator.setProgress(relativeProgress);
  }

  getIndicatorValue() {
    return this.#indicatorValue;
  }

  clearIndicatorTrack() {
    this.multiTrackManager?.clearIndicatorTrack();
    this.#indicatorValue = 0;
  }

  /**
   * Sets the buffer value of the slider in the range [0, 1].
   *
   * @param {number} progress - The buffer value to set in the range [0, 1].
   */
  setBufferProgress(progress) {
    this.#bufferLoadingProgress = progress;
    if (!this.bufferTrack) return;

    const relativeProgress =
      this.bufferTrack.calculateRelativeProgress(progress);
    this.bufferTrack.bars.buffer.setProgress(relativeProgress);
  }

  getBufferProgress() {
    return this.#bufferLoadingProgress;
  }

  hasChapters() {
    return this.#multiTrackManager !== null;
  }

  getCurrentChapter() {
    return this.track.getChapter?.();
  }

  onRefresh({ value, min, max, chapters = [] }) {
    this.resetValue();
    this.min = min;
    this.max = max;

    if (chapters.length > 0) {
      this.#createMultiTrackManager(chapters);
    } else if (this.#multiTrackManager) {
      this.#resetMultiTrackManager();
    } else {
      this.track.destroy();
    }

    this.createTrack();
    this.emit("refresh");
    this.setValue(value);
  }

  #createMultiTrackManager(chapters) {
    this.track?.destroy();
    this.#multiTrackManager?.clearTracks();
    this.#multiTrackManager = new MultiTrackManager({
      slider: this,
      chapters,
    });
  }

  #resetMultiTrackManager() {
    this.#multiTrackManager?.clearTracks();
    this.#multiTrackManager = null;
  }
}
