import PlayerStorageTracker, {
  STORAGE_KEY,
} from "../../storage/player-tracker.js";
import Storage from "../../storage/storage.js";
import { debounce } from "../../utils.js";

const STORAGE_DELAY = 900;

export default class StorageManager {
  #tracker;
  #overwriteStorage;
  #isStorageDefined = false;

  constructor({ player, overwriteStorage, syncPlayerState }) {
    this.player = player;
    this.#overwriteStorage = overwriteStorage;
    this.#tracker = new PlayerStorageTracker(player);

    this.#isStorageDefined =
      Storage.has(STORAGE_KEY) && !this.#overwriteStorage;

    const state = this.#getState();

    if (this.#isStorageDefined) {
      syncPlayerState(state);
    } else {
      this.#tracker.saveState(state);
    }
  }

  syncPlaybackTimes() {
    if (this.#isStorageDefined) {
      const times = this.#tracker.getState().times;

      times.forEach((time, index) => {
        this.player.sources[index].currentTime = time;
      });

      this.player.currentTime = this.player.source.currentTime;
    } else {
      const times = this.player.sources.map((source) => source.currentTime);
      this.#tracker.saveState({
        times,
      });
    }
  }

  savePlaylistState() {
    this.#tracker.saveState({
      playlist: {
        currentIndex: this.player.playlist.currentIndex,
        loop: this.player.playlist.loop,
      },
    });
  }

  mutatePlaylistOptions(options) {
    if (!this.#isStorageDefined) {
      return;
    }

    const { currentIndex, loop } = this.#tracker.getState().playlist;
    options.startIndex = currentIndex;
    options.loop = loop;
  }

  startPlaybackTracker() {
    this.#tracker.startCurrentTimeTracker();
  }

  stopPlaybackTracker() {
    this.#tracker.stopCurrentTimeTracker();
  }

  saveVolume = debounce((volume) => {
    this.#tracker?.saveState({
      volume,
    });
  }, STORAGE_DELAY);

  saveMuted = debounce((muted) => {
    this.#tracker?.saveState({
      muted,
    });
  }, STORAGE_DELAY);

  savePlaybackRate = debounce((playbackRate) => {
    this.#tracker?.saveState({
      playbackRate,
    });
  }, STORAGE_DELAY);

  saveLoop = debounce((loop) => {
    this.#tracker?.saveState({
      loop,
    });
  }, STORAGE_DELAY);

  saveLoopMode = debounce((loopMode) => {
    this.#tracker?.saveState({
      loopMode,
    });
  }, STORAGE_DELAY);

  savePlaylist = debounce((currentIndex, loop) => {
    this.#tracker?.saveState({
      playlist: {
        currentIndex,
        loop,
      },
    });
  }, STORAGE_DELAY);

  #getState() {
    const { muted, volume, playbackRate, loop, loopMode, autoplay } = this
      .#isStorageDefined
      ? this.#tracker.getState()
      : this.player;

    return {
      muted,
      volume,
      playbackRate,
      loop,
      loopMode,
      autoplay,
    };
  }
}
