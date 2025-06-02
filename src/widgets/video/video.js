import { Browser } from "../../utils.js";
import { Widget } from "../widget.js";

export default class Video extends Widget {
  #hasAudio = true;

  #currentTime;

  #isPlaying = false;

  #muted = false;

  #src;

  #volume;

  #playbackRate = 1;

  #loop = false;

  #loopModes = ["none", "infinite", "once"];

  /**
   * Especifica cuantas veces se repite el video si esta en modo "loop"
   * @type {"none" | "infinite" | "once"}
   * @default "none"
   */
  #loopMode = "none";

  #duration;

  #width;

  #height;

  #autoplay;

  constructor({
    src,
    width,
    height,
    volume = 1,
    currentTime = 0,
    isMuted = false,
    playbackRate = 1,
    loopMode = "none",
    autoplay = false,
  }) {
    super();
    if (!src) throw new Error("VideoWidget: src must be provided");
    this.#src = src;
    this.#width = width;
    this.#height = height;
    this.#volume = volume;
    this.#muted = isMuted;
    this.#currentTime = currentTime;
    this.#playbackRate = playbackRate;
    this.#loopMode = loopMode;
    this.#autoplay = autoplay;

    this.on("play", () => {
      this.#isPlaying = true;
    });

    this.on("pause", () => {
      this.#isPlaying = false;
    });

    this.on("timeUpdate", (time) => {
      this.#currentTime = time;
    });

    this.on("loadedMetaData", ({ duration }) => {
      this.#duration = duration;
    });

    this.on("audioDetected", (hasAudio) => {
      this.#hasAudio = hasAudio;
    });
  }

  get hasAudio() {
    return this.#hasAudio;
  }

  set currentTime(time) {
    this.component?.setCurrentTime(time);
  }

  get currentTime() {
    return this.#currentTime;
  }

  get isPlaying() {
    return this.#isPlaying;
  }

  set muted(isMuted) {
    this.#muted = isMuted;
    this.emit("mutedChange", isMuted);
  }

  get muted() {
    return this.#muted;
  }

  get src() {
    return this.#src;
  }

  set volume(volume) {
    this.#volume = volume;
    this.emit("volumeChange", volume);
  }

  get volume() {
    return this.#volume;
  }

  set playbackRate(playbackRate) {
    this.#playbackRate = playbackRate;
    this.emit("playbackRateChange", playbackRate);
  }

  get playbackRate() {
    return this.#playbackRate;
  }

  set loop(isLoop) {
    this.#loop = isLoop;
    this.emit("loopChange", isLoop);
  }

  get loop() {
    return this.#loop;
  }

  get loopModes() {
    return this.#loopModes;
  }

  set loopMode(loopMode) {
    this.#loopMode = loopMode;
  }

  get loopMode() {
    return this.#loopMode;
  }

  get duration() {
    return this.#duration;
  }

  get width() {
    return this.#width;
  }

  get height() {
    return this.#height;
  }

  get autoplay() {
    return this.#autoplay;
  }

  onRefresh({ src, currentTime }) {
    this.#src = src;
    this.#currentTime = currentTime;
    this.#isPlaying = false;
    this.emit("refresh");
  }

  /**
   * Método para reproducir el video y notificar al componente
   */
  play() {
    return this.component?.play();
  }

  /**
   * Método para establecer el video en pausa y notificar al componente
   */
  pause() {
    return this.component?.pause();
  }

  requestPictureInPicture() {
    if (Browser.current === Browser.FIREFOX) {
      return;
    }
    this.component?.requestPictureInPicture();
  }

  exitPictureInPicture() {
    if (Browser.current === Browser.FIREFOX) {
      return;
    }
    this.component?.exitPictureInPicture();
  }

  getCurrentLoopMode() {
    return this.#loopModes.indexOf(this.#loopMode);
  }
}
