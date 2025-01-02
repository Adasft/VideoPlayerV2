export default class VideoCurrentTimeTracker {
  #rAF;
  #saveInterval = 5000;
  #lastSaveTime = 0;
  #playerTracker;

  constructor(playerTracker) {
    this.#playerTracker = playerTracker;
  }

  get currentSource() {
    return this.#playerTracker.player.source;
  }

  start() {
    if (this.#rAF) return;
    this.#rAF = requestAnimationFrame(this.#updateCurrentTime);
  }

  stop() {
    cancelAnimationFrame(this.#rAF);
    this.#rAF = null;
  }

  save() {
    const currentTime = this.#playerTracker.player.currentTime;
    const orderIndex = this.currentSource.orderIndex;
    this.#playerTracker.patchState((state) => {
      state.times[orderIndex] = currentTime;
      this.currentSource.currentTime = currentTime;
    });
  }

  #updateCurrentTime = () => {
    if (!this.#playerTracker.player.isPlaying) {
      this.stop();
      return;
    }

    const now = performance.now();

    if (now - this.#lastSaveTime > this.#saveInterval) {
      this.save();
      this.#lastSaveTime = now;
    }

    this.#rAF = requestAnimationFrame(this.#updateCurrentTime);
  };
}
