import { Widget } from "../../widget.js";
import { ProgressBar } from "../common/progress-bar.js";

export class Track extends Widget {
  /**
   * Barras del track.
   *
   * @type {{
   *   progress: ProgressBar,
   *   indicator?: ProgressBar,
   *   buffer?: ProgressBar
   * }}
   */
  #bars = {
    progress: new ProgressBar(),
  };

  #range;

  #ratioWidth;

  constructor({ range, ratioWidth }) {
    super("track");
    this.#range = range;
    this.#ratioWidth = ratioWidth;
  }

  get bars() {
    return this.#bars;
  }

  get range() {
    return this.#range;
  }

  get ratioWidth() {
    return this.#ratioWidth;
  }

  setProgress(progress) {
    this.#bars.progress.setProgress(progress);
  }

  calculateRelativeProgress(progress) {
    const relativeProgress =
      (progress * this.range.limit - this.range.start) /
      (this.range.end - this.range.start);
    return relativeProgress;
  }

  complete() {
    this.#bars.progress.complete();
  }

  reset() {
    this.#bars.progress.reset();
  }

  addBar(bar) {
    this.#bars[bar.getName()] = bar;
  }
}
