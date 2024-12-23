import { Widget } from "../../widget.js";
import { SliderProgressBar } from "../common/progress-bar.js";

export class SliderTrack extends Widget {
  #bars = {
    progress: new SliderProgressBar(),
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
    super();
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
