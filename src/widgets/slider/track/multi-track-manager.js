import { ChapteredTrackList } from "./chaptered-track-list.js";

export class MultiTrackManager {
  #chapteredTracksList;

  get chapteredTracksList() {
    return this.#chapteredTracksList;
  }

  #slider;

  /**
   * The cache of the tracks in the slider.
   *
   * @typedef {Object} Bar
   * @property {string} barName - The name of the bar (e.g., "progress" or "buffer").
   * @property {boolean} shouldUpdate - Indicates whether the bar should be updated.
   * @property {*} value - The value of the bar (can be of any type, e.g., number, null, etc.).
   *
   * @typedef {Object} BarCollection
   * @property {Bar} progress - The progress bar configuration.
   * @property {Bar} buffer - The buffer bar configuration.
   *
   * @type {BarCollection}
   */
  #tracksInCache = {
    progress: {
      barName: "progress",
      shouldUpdate: false,
      value: null,
    },
    buffer: {
      barName: "buffer",
      shouldUpdate: false,
      value: null,
    },
    indicator: {
      barName: "indicator",
      shouldUpdate: false,
      value: null,
    },
  };

  constructor({ slider, chapters }) {
    this.#slider = slider;
    this.#chapteredTracksList = new ChapteredTrackList({
      chapters,
      limit: slider.max,
    });
  }

  #rasterizeTracks(cache, oldActiveChapteredTrack) {
    const [direction, mode] =
      oldActiveChapteredTrack?.getIndex() < cache.value.getIndex() ||
      !oldActiveChapteredTrack
        ? ["prev", "complete"]
        : ["next", "reset"];

    this.rasterizeTrackBar({
      direction,
      mode,
      barName: cache.barName,
      activeTrack: cache.value,
    });
  }

  #getActiveChapteredTrack(value, cache) {
    const isCacheValid = !cache.shouldUpdate && cache.value;

    if (isCacheValid) {
      return cache.value;
    }

    const newActiveTrack = this.#getActiveTrack(value);

    if (newActiveTrack) {
      this.#updateActiveChapteredTrack(cache, newActiveTrack);
      return newActiveTrack;
    }

    return null;
  }

  #updateActiveChapteredTrack(cache, newActiveTrack) {
    const oldActiveTrack = cache.value;

    cache.value = newActiveTrack;
    cache.shouldUpdate = false;

    this.#rasterizeTracks(cache, oldActiveTrack);

    if (cache.barName === "progress") {
      this.#slider.emit("trackChanged", {
        currentTrack: newActiveTrack,
        oldTrack: oldActiveTrack,
      });
    }
  }

  #getTracksInDirection(activeTrack, direction) {
    return direction === "next"
      ? this.#chapteredTracksList.next(activeTrack)
      : this.#chapteredTracksList.prev(activeTrack);
  }

  #resetBars(track, barName, mode) {
    const bar = track.bars[barName];
    if (!bar) {
      console.warn(`Bar "${barName}" not found in track.`);
      return;
    }

    bar[mode]?.();
  }

  #getActiveTrack(value) {
    return this.#chapteredTracksList.find(
      ({ range }) => value >= range.start && value <= range.end
    );
  }

  /**
   * Gets the current track based on the value of the slider.
   * If the cache is valid, it returns the cached track.
   * Otherwise, it finds the track that matches the value of the slider.
   * If a track is found, it updates the cache with the new track.
   *
   * @param {"progress" | "buffer"} type - The type of the track to get (e.g., "progress" or "buffer").
   * @param {number} value - The value of the slider.
   * @returns {ChapteredTrack | null} The current track, or null if no track is found.
   */
  #getCurrentTrack(type, value) {
    const cache = this.#tracksInCache[type];
    if (
      cache.value &&
      (value < cache.value.range.start || value > cache.value.range.end)
    ) {
      cache.shouldUpdate = true;
    }
    return this.#getActiveChapteredTrack(value, cache);
  }

  /**
   * Rasterizes the track bars based on the direction and mode.
   * If the direction is "next", it rasterizes the track bars in the next direction.
   * If the direction is "prev", it rasterizes the track bars in the previous direction.
   * If the mode is "complete", it completes the track bar.
   * If the mode is "reset", it resets the track bar.
   *
   * @param {{
   *  direction: "next" | "prev",
   *  mode: "complete" | "reset",
   *  barName: "progress" | "buffer",
   *  activeTrack: ChapteredTrack
   * }} options - The options for rasterizing the track bars.
   */
  rasterizeTrackBar({
    direction,
    mode,
    barName = this.#tracksInCache.progress.barName,
    activeTrack = this.#tracksInCache.progress.value,
  }) {
    if (!["next", "prev"].includes(direction)) {
      throw new Error("Invalid direction. Use 'next' or 'prev'.");
    }

    const tracksToRasterize = this.#getTracksInDirection(
      activeTrack,
      direction
    );

    for (const track of tracksToRasterize) {
      this.#resetBars(track, barName, mode);
    }
  }

  getProgressCurrentTrack() {
    return this.#getCurrentTrack("progress", this.#slider.getValue());
  }

  getBufferCurrentTrack() {
    return this.#getCurrentTrack(
      "buffer",
      this.#slider.getBufferProgress() * this.#slider.max
    );
  }

  getIndicatorCurrentTrack() {
    return this.#getCurrentTrack("indicator", this.#slider.getIndicatorValue());
  }

  clearIndicatorTrack() {
    this.#tracksInCache.indicator.shouldUpdate = false;
    this.#tracksInCache.indicator.value = null;
  }

  clearTracks() {
    for (const track of this.#chapteredTracksList) {
      track.destroy();
    }
  }
}
