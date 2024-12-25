import { SliderTrack } from "./track.js";
import { SliderProgressBar } from "../common/progress-bar.js";

class ChapteredTrack extends SliderTrack {
  #chapter;
  #index;
  next = null;
  prev = null;

  constructor({ chapter, index, range, ratioWidth }) {
    super({ range, ratioWidth });
    this.#index = index;
    this.#chapter = chapter;
  }

  getChapter() {
    return this.#chapter;
  }

  getChapterTitle() {
    return `E${this.#index + 1} • ${this.#chapter.title}`;
  }

  getIndex() {
    return this.#index;
  }

  setProgress(progress) {
    const relativeProgress = this.calculateRelativeProgress(progress);
    super.setProgress(relativeProgress);
  }
}

export class ChapteredTrackList extends Array {
  #head;
  #chapters;
  #limit;

  constructor({ chapters, limit }) {
    super();
    this.#head = null;
    this.#chapters = chapters;
    this.#limit = limit;
    this.#addDefaultChapters();
  }

  #createChapteredTrack(chapter, index) {
    const range = {
      start: chapter.start,
      end: chapter.end,
      limit: this.#limit,
    };
    const ratioWidth = (range.end - range.start) / this.#limit;
    const chapteredTrack = new ChapteredTrack({
      chapter,
      index,
      range,
      ratioWidth,
    });

    chapteredTrack.addBar(new SliderProgressBar("indicator"));
    chapteredTrack.addBar(new SliderProgressBar("buffer"));

    return chapteredTrack;
  }

  #addDefaultChapters() {
    this.#chapters.forEach((chapter) => {
      this.add(chapter);
    });
  }

  /**
   * Iterates over the next chaptered tracks in the list.
   *
   * @param {ChapteredTrack} ref - The reference to the track to start iterating from.
   * @returns {Generator<ChapteredTrack>} A generator that yields the chaptered tracks in the list.
   */
  next = function* (ref) {
    let current = ref.next || this.#head.next;
    while (current) {
      yield current;
      current = current.next;
    }
  };

  /**
   * Iterates over the previous chaptered tracks in the list.
   *
   * @param {ChapteredTrack} ref - The reference to the track to start iterating from.
   * @returns {Generator<ChapteredTrack>} A generator that yields the chaptered tracks in the list.
   */
  prev = function* (ref) {
    let current = ref.prev || this.#head.prev;
    while (current) {
      yield current;
      current = current.prev;
    }
  };

  /**
   * Finds the chaptered track with the specified index.
   *
   * @param {number} index - The index of the chaptered track to get.
   * @returns {ChapteredTrack | null} The chaptered track with the specified index, or null if not found.
   */
  getByIndex(index) {
    for (const chapteredTrack of this) {
      if (chapteredTrack.getIndex() === index) {
        return chapteredTrack;
      }
    }
    return null;
  }

  size() {
    return this.length;
  }

  add(chapter) {
    const newChapteredTrack = this.#createChapteredTrack(chapter, this.size());
    if (this.#head === null) {
      this.#head = newChapteredTrack;
    } else {
      let current = this.#head;
      while (current.next !== null) {
        current = current.next;
      }
      current.next = newChapteredTrack;
      newChapteredTrack.prev = current;
    }

    this.push(newChapteredTrack);
  }

  /**
   * Iterator for the linked list.
   * Allows the linked list to be iterable, enabling usage with `for...of`, spread operator (`...`), and destructuring.
   *
   * @yields {*} The value of each node in the linked list, one by one.
   */
  *[Symbol.iterator]() {
    let current = this.#head;
    while (current) {
      yield current;
      current = current.next;
    }
  }
}
