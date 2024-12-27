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

  get bars() {
    return this.#bars;
  }

  #range;

  get range() {
    return this.#range;
  }

  #ratioWidth;

  get ratioWidth() {
    return this.#ratioWidth;
  }

  constructor({ range, ratioWidth }) {
    super("track");
    this.#range = range;
    this.#ratioWidth = ratioWidth;
  }

  setProgress(progress) {
    this.#bars.progress.setProgress(progress);
  }

  calculateRelativeProgress(progress) {
    return (
      (progress * this.range.limit - this.range.start) /
      (this.range.end - this.range.start)
    );
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
