import { shuffle, orderBy } from "../../utils.js";

/**
 * Formato de un source:
 *
 * interface Chapter {
 *   start: number;
 *   end: number;
 *   title: string;
 * }
 *
 * interface Subtitle {
 *   start: number;
 *   end: number;
 *   text: string;
 * }
 *
 * interface Source {
 *   src: string;
 *   title: string;
 *   poster?: string;
 *   thumbnail?: string;
 *   currentTime?: number;
 *   chapters?: Chapter[];
 *   subtitles?: Subtitle[];
 * }
 */

export default class PlayList {
  #player;
  #sources;
  #currentIndex;
  #loop;

  constructor({ player, sources, startIndex = 0, loop = false }) {
    this.#player = player;
    this.#sources = this.#mapSourceByIndex(sources);
    this.#currentIndex = startIndex;
    this.#loop = loop;

    this.#player.on("activeRandomPlaybackChanged", (isShuffleActive) =>
      this.#reorganizeSources(isShuffleActive)
    );
  }

  isEndOfList() {
    return this.#currentIndex === this.size() - 1;
  }

  isStartOfList() {
    return this.#currentIndex === 0;
  }

  size() {
    return this.#sources.length;
  }

  getCurrentSource() {
    return this.#sources[this.#currentIndex];
  }

  getCurrentIndex() {
    return this.#currentIndex;
  }

  prepend(source) {
    this.#sources = this.#mapSourceByIndex([source, ...this.#sources]);
    this.#player.emit("insertSource", source);
  }

  push(source) {
    this.#sources = this.#mapSourceByIndex([...this.#sources, source]);
    this.#player.emit("insertSource", source);
  }

  remove(source) {
    this.#sources = this.#sources.filter((s) => s.src !== source.src);
    this.#player.emit("removeSource", source);
  }

  next() {
    if (this.isEndOfList() && !this.#loop) {
      return;
    }

    this.#currentIndex++;

    if (this.#currentIndex >= this.size()) {
      this.#currentIndex = 0;
    }

    this.#player.emit("sourceChange", this.getCurrentSource());
  }

  prev() {
    if (
      this.#player.getCurrentTime() >= 5 ||
      (!this.#loop && this.#currentIndex === 0)
    ) {
      this.#player.setCurrentTime(0);
      return;
    }

    if (this.isStartOfList() && !this.#loop) {
      return;
    }

    this.#currentIndex--;

    if (this.#currentIndex < 0) {
      this.#currentIndex = this.size() - 1;
    }

    this.#player.emit("sourceChange", this.getCurrentSource());
  }
  /**
   * interface Source {
   *   src: string;
   *   title: string;
   *   poster?: string;
   *   thumbnail?: string;
   *   currentTime?: number;
   *   chapters?: Chapter[];
   *   subtitles?: Subtitle[];
   * }
   */

  #mapSourceByIndex(sources) {
    return sources.map((source, index) => ({
      src: source.src,
      title: source.title ?? "Untitled",
      poster: source.poster,
      thumbnail: source.thumbnail,
      currentTime: source.currentTime ?? 0,
      chapters: source.chapters,
      subtitles: source.subtitles,
      orderIndex: index,
    }));
  }

  #reorganizeSources(isShuffleActive) {
    const currentActiveSource = this.#sources
      .splice(this.#currentIndex, 1)
      .at();
    if (isShuffleActive) {
      this.#sources = shuffle(this.#sources);
      this.#sources.unshift(currentActiveSource);
      this.#currentIndex = 0;
    } else {
      this.#sources.push(currentActiveSource);
      this.#sources = orderBy(this.#sources, "orderIndex");
      this.#currentIndex = this.#sources.findIndex(
        (source) => source.src === currentActiveSource.src
      );
    }
  }
}
