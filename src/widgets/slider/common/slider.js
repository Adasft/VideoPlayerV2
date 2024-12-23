import { Widget } from "../../widget.js";
import { ChapteredTrackList } from "../track/chaptered-track-list.js";
import { SliderTrack } from "../track/track.js";
import { SliderThumb } from "./thumb.js";
// import { SeekerSlider } from "../seeker-slider/seeker-slider.js";

export default class Slider extends Widget {
  /**
   * The current value of the slider.
   *
   * @type {number}
   */
  #value;
  /**
   * The minimum value of the slider.
   *
   * @type {number}
   */
  #min;

  get min() {
    return this.#min;
  }

  set min(min) {
    this.#min = min;
  }

  /**
   * The maximum value of the slider.
   *
   * @type {number}
   */
  #max;

  get max() {
    return this.#max;
  }

  set max(max) {
    this.#max = max;
  }

  /**
   * Whether the slider is currently dragging.
   *
   * @type {boolean}
   */
  isDragging = false;
  /**
   * Whether the slider is currently being pressed by the mouse.
   *
   * @type {boolean}
   */
  isMousePressed = false;
  /**
   * Whether the slider is currently being moved by the mouse.
   *
   * @type {boolean}
   */
  isMouseMoving = false;
  /**
   * Whether the slider is currently sliding automatically.
   *
   * @type {boolean}
   */
  #isAutoSliding = false;
  /**
   * Indicates whether the hover growth is enabled.
   *
   * @type {boolean}
   */
  #enableHoverGrowth;
  /**
   * The padding of the slider when hovered.
   *
   * @type {number}
   */
  #hoverPadding;
  /**
   * Whether to show the thumb when hovered.
   *
   * @type {boolean}
   */
  #showAlwaysThumb;
  /**
   * The thumb element of the slider.
   * @type {SliderThumb}
   */
  #thumb;
  get thumb() {
    return this.#thumb;
  }

  /**
   * The track element of the slider.
   *
   * @type {SliderTrack | ChapteredTrackList}
   */
  #track;
  get tracks() {
    return this.#track instanceof SliderTrack ? [this.#track] : this.#track;
  }

  get track() {
    return this.#track instanceof ChapteredTrackList
      ? this.multiTrackManager.getProgressCurrentTrack()
      : this.#track;
  }

  set track(track) {
    this.#track = track;
  }

  #isCompleted = false;

  get isCompleted() {
    return this.#isCompleted;
  }

  #isStated = false;

  get isStated() {
    return this.#isStated;
  }

  get isUpdateNotAllowed() {
    return (
      (this.#value >= this.#max && this.#isCompleted) ||
      (this.#value <= this.#min && this.#isStated)
    );
  }

  #isInitializedValue = false;

  constructor({
    value,
    min,
    max,
    enableHoverGrowth = false,
    hoverPadding = 0,
    showAlwaysThumb = true,
  }) {
    super();
    this.#value = value;
    this.#min = min;
    this.#max = max;
    this.#enableHoverGrowth = enableHoverGrowth;
    this.#hoverPadding = hoverPadding;
    this.#showAlwaysThumb = showAlwaysThumb;

    this.#thumb = new SliderThumb();

    if (new.target === Slider) {
      this.createTrack();
    }
  }

  #updateProgress() {
    const progress = this.getProgress();
    this.#thumb.moveTo(progress);
    this.track.setProgress(progress);
  }

  #updateState() {
    this.#isCompleted = this.#value === this.#max;
    this.#isStated = this.#value === this.#min;
  }

  #applyValue(value) {
    const clampedValue = this.clampValue(value);
    const isSameValue = clampedValue === this.#value;
    this.#value = clampedValue;
    return isSameValue;
  }

  clampValue(value) {
    return Math.min(this.#max, Math.max(this.#min, value));
  }

  createTrack() {
    this.track = new SliderTrack({
      range: { start: this.#min, end: this.#max, limit: this.#max },
      ratioWidth: 1,
    });
  }

  shouldStopUpdatingValue(value) {
    return (
      (this.isCompleted() && value === this.#max) ||
      (this.isStarted() && value === this.#min)
    );
  }

  initializeValue() {
    this.setValue(this.#value);
    this.#isInitializedValue = true;
  }

  setValue(value) {
    const isSameValue = this.#applyValue(value);

    if ((isSameValue && this.#isInitializedValue) || this.isUpdateNotAllowed)
      return;

    this.#isAutoSliding = !this.isDragging && !this.isMousePressed;

    this.#updateState();
    this.#updateProgress();
    this.emit("valueChanged", this.#value);
  }

  getValue() {
    return this.#value;
  }

  resetValue() {
    this.setValue(0);
  }

  refresh({ value, min, max }) {
    this.#min = min;
    this.#max = max;
    this.setValue(value);
  }

  getProgress() {
    return (this.#value - this.#min) / (this.#max - this.#min);
  }

  isAutoSliding() {
    return this.#isAutoSliding;
  }

  isHoverGrowthEnabled() {
    return this.#enableHoverGrowth;
  }

  getHoverPadding() {
    return this.#hoverPadding;
  }

  showAlwaysThumb() {
    return this.#showAlwaysThumb;
  }
}
