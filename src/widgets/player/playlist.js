import { shuffle, orderBy, getRandomId } from "../../utils.js";

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
  #title;
  #player;
  #sources;
  #currentIndex;
  #loop;
  #isShuffleActive = false;

  constructor({
    title = "Playlist",
    player,
    sources,
    startIndex = 0,
    loop = false,
  }) {
    this.#title = title;
    this.#player = player;
    this.#sources = this.#mapSourceByIndex(sources);
    this.#currentIndex = startIndex;
    this.#loop = loop;
  }

  get title() {
    return this.#title;
  }

  get isActiveRandomPlayblack() {
    return this.#isShuffleActive;
  }

  set isActiveRandomPlayblack(active) {
    const state = Boolean(active);

    if (this.#isShuffleActive === state) {
      return;
    }

    this.#isShuffleActive = Boolean(state);
    this.#reorganizeSources();
  }

  get loop() {
    return this.#loop;
  }

  set loop(loop) {
    this.#loop = Boolean(loop);
  }

  get sources() {
    return this.#sources;
  }

  get isEndOfList() {
    return this.#currentIndex === this.size - 1;
  }

  get isStartOfList() {
    return this.#currentIndex === 0;
  }

  get size() {
    return this.#sources.length;
  }

  get currentSource() {
    return this.#sources[this.#currentIndex];
  }

  set currentIndex(index) {
    this.#currentIndex = Math.max(0, Math.min(index, this.size - 1));
    this.#player.emit("sourceChange", this.currentSource);
  }

  get currentIndex() {
    return this.#currentIndex;
  }

  get data() {
    return {
      sources: this.#sources,
      title: this.#title,
      currentIndex: this.#currentIndex,
      size: this.size,
      currentSource: this.currentSource,
      isEnd: this.isEndOfList,
      isStart: this.isStartOfList,
      loop: this.#loop,
      isShuffleActive: this.#player.isRandomPlaybackActive,
    };
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
    if (this.isEndOfList && !this.#loop) {
      return;
    }

    this.#currentIndex++;

    if (this.#currentIndex >= this.size) {
      this.#currentIndex = 0;
    }

    this.#player.emit("sourceChange", this.currentSource);
  }

  prev() {
    if (
      this.#player.currentTime >= 5 ||
      (!this.#loop && this.#currentIndex === 0)
    ) {
      this.#player.currentTime = 0;
      return;
    }

    if (this.isStartOfList && !this.#loop) {
      return;
    }

    this.#currentIndex--;

    if (this.#currentIndex < 0) {
      this.#currentIndex = this.size - 1;
    }

    this.#player.emit("sourceChange", this.currentSource);
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
      id: getRandomId(),
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

  #reorganizeSources() {
    const currentActiveSource = this.#sources
      .splice(this.#currentIndex, 1)
      .at();
    if (this.#isShuffleActive) {
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
