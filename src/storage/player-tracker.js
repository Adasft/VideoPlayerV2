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
  static #INSTANCE;

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

  static getInstance(player) {
    if (!PlayerStorageTracker.#INSTANCE) {
      PlayerStorageTracker.#INSTANCE = new PlayerStorageTracker(player);
    }

    return PlayerStorageTracker.#INSTANCE;
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

  patchState(callback) {
    const state = this.getState();
    callback(state);
    this.saveState(state);
  }

  saveState(newState) {
    const state = this.getState();

    Object.assign(state, newState);

    Storage.save(STORAGE_KEY, state);
    this.#stateCache = null;
  }

  // /**
  //  * Inicializa el mapa de videos por primera vez.
  //  * Cada vez que se llama a este método, se borra el mapa de videos, y
  //  * se crea un nuevo mapa vacío.
  //  *
  //  * @param {string} videoId - El id del video.
  //  * @param {number} currentTime - El tiempo actual del video.
  //  */
  // saveCurrentTimeVideos(videos) {
  //   const state = this.getState();

  //   state.videos = {};
  //   for (const video of videos) {
  //     state.videos[video.id] = {
  //       currentTime: video.currentTime,
  //     };
  //   }

  //   Storage.save(STORAGE_KEY, state);
  // }

  // /**
  //  * Actualiza el tiempo actual del video en el mapa de videos.
  //  * A comparacion con `saveVideoCurrentTime()`, este método solo
  //  * actualiza el tiempo actual del video.
  //  *
  //  * @param {string} videoId - El id del video.
  //  * @param {number} currentTime - El tiempo actual del video.
  //  */
  // updateVideoCurrentTime(videoId, currentTime) {
  //   const state = this.getState();
  //   const updatedVideo = state.videos[videoId];
  //   if (!updatedVideo) return;
  //   updatedVideo.currentTime = currentTime;
  //   this.player.source.currentTime = currentTime;
  //   Storage.save(StorageKey, state);
  // }

  // savePlaylist(currentIndex, loop) {
  //   const state = this.getState();
  //   state.playlist = {
  //     currentIndex,
  //     loop,
  //   };
  //   Storage.save(StorageKey, state);
  // }
}
