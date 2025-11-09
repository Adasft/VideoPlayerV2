import { shuffle, orderBy, getRandomId } from "../../utils.js";

/**
 * @typedef {import("../player/player.js").default} Player
 *
 * @typedef {Object} Source
 * @property {string} src - The source URL of the media.
 * @property {string} title - The title of the media.
 * @property {string} [poster] - Optional poster image URL.
 * @property {string} [thumbnail] - Optional thumbnail image URL.
 * @property {number} [currentTime] - Optional current playback time in seconds.
 * @property {{start: number, end: number, title: string}[]} chapters - Optional array of chapters with start and end times.
 * @property {{start: number, end: number, text: string}[]} subtitles - Optional array of subtitles with start and end times.
 * @property {string} [author] - Optional author of the media.
 * @property {string} [description] - Optional description of the media.
 * @property {number} orderIndex - The index of the source in the playlist.
 */

export default class PlayList {
  /**
   * Player instance associated with the playlist.
   * @type {Player}
   */
  #player;

  /**
   * Title of the playlist.
   * @type {string}
   */
  #title;

  /**
   * Array of sources in the playlist.
   * Each source is an object containing details like src, title, poster, etc.
   * @type {Source[]}
   */
  #sources;

  /**
   * Current index of the source being played in the playlist.
   * @type {number}
   */
  #currentIndex;

  /**
   * Indicates whether the playlist is set to loop.
   * @type {boolean}
   */
  #loop;

  /**
   * Indicates whether random playback is active.
   * When true, the sources are shuffled and played in random order.
   * @type {boolean}
   */
  #isShuffleActive = false;

  /**
   * Creates a new PlayList instance.
   * @param {Object} options - Options for the playlist.
   * @param {Player} options.player - The player instance associated with the playlist.
   * @param {Source[]} options.sources - Array of sources to initialize the playlist with.
   * @param {string} [options.title="Playlist"] - The title of the playlist.
   * @param {number} [options.startIndex=0] - The index of the source to start playback from.
   * @param {boolean} [options.loop=false] - Whether the playlist should loop.
   */
  constructor({
    player,
    sources,
    title = "Playlist",
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
    this.#player.emit("sourceChanged", this.currentSource);
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

  /**
   * Inserts a new source at the beginning of the playlist.
   * And emits the `sourceInserted` event.
   * @param {Source} source - The source to insert.
   */
  prepend(source) {
    this.#sources = this.#mapSourceByIndex([source, ...this.#sources]);
    this.#player.emit("sourceInserted", source);
  }

  /**
   * Inserts a new source at the end of the playlist.
   * And emits the `sourceInserted` event.
   * @param {Source} source - The source to insert.
   */
  push(source) {
    this.#sources = this.#mapSourceByIndex([...this.#sources, source]);
    this.#player.emit("sourceInserted", source);
  }

  /**
   * Removes a source from the playlist by its source URL.
   * If the source is currently playing, it will emit the `sourceChanged` event with the next source.
   * @param {Source} source - The source to remove.
   */
  remove(source) {
    this.#sources = this.#sources.filter((s) => s.src !== source.src);
    this.#player.emit("sourceRemoved", source);
  }

  next() {
    if (this.isEndOfList && !this.#loop) {
      return;
    }

    this.#currentIndex++;

    if (this.#currentIndex >= this.size) {
      this.#currentIndex = 0;
    }

    this.#player.emit("sourceChanged", this.currentSource);
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

    this.#player.emit("sourceChanged", this.currentSource);
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
      author: source.author,
      description: source.description,
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
