/**
 * Esto es lo que se va a guardar en localStorage:
 *
 * {
 *  muted: false,
 *  volume: 0.5,
 *  playbackRate: 1,
 *  loop: false,
 *  loopMode: "none",
 *  autoplay: false,
 *  playlist: {
 *    currentIndex: 0,
 *    loop: false
 *  },
 *  videos: {
 *    "video-1": {
 *      currentTime: 0
 *    }
 *  }
 * }
 */

import VideoCurrentTimeTracker from "./video-current-time-tracker.js";
import Storage from "./storage.js";

export const STORAGE_KEY = "playerState";

export default class PlayerStorageTracker {
  #videoCurrentTimeTracker;

  #stateCache = null;

  #defaultState = {
    muted: false,
    volume: 1,
    playbackRate: 1,
    loop: false,
    loopMode: "none",
    autoplay: false,
    playlist: null,
    times: [],
  };

  #validStateKeys = Object.keys(this.#defaultState);

  constructor(player) {
    this.player = player;
  }

  getState() {
    if (!this.#stateCache) {
      const state = Storage.get(STORAGE_KEY) || {};

      this.#stateCache = this.#validStateKeys.reduce((acc, key) => {
        acc[key] = state[key] ?? this.#defaultState[key];
        return acc;
      }, {});
    }

    return this.#stateCache;
  }

  startCurrentTimeTracker() {
    if (!this.#videoCurrentTimeTracker) {
      this.#videoCurrentTimeTracker = new VideoCurrentTimeTracker(this);
    }
    this.#videoCurrentTimeTracker.start();
  }

  stopCurrentTimeTracker() {
    if (!this.#videoCurrentTimeTracker) return;
    this.#videoCurrentTimeTracker.stop();
  }

  saveState(newState) {
    const state = this.getState();

    Object.assign(
      state,
      typeof newState === "function" ? newState(state) : newState
    );

    Storage.save(STORAGE_KEY, state);
    this.#stateCache = null;
  }
}
