import { Widget } from "../widget.js";

export default class Video extends Widget {
  #hasAudio = true;

  get hasAudio() {
    return this.#hasAudio;
  }

  #currentTime;

  set currentTime(time) {
    this.component?.setCurrentTime(time);
  }

  get currentTime() {
    return this.#currentTime;
  }

  #isPlaying = false;

  get isPlaying() {
    return this.#isPlaying;
  }

  #isMuted = false;

  set muted(isMuted) {
    this.#isMuted = isMuted;
    this.emit("mutedChange", isMuted);
  }

  get muted() {
    return this.#isMuted;
  }

  #src;

  get src() {
    return this.#src;
  }

  #volume;

  set volume(volume) {
    this.#volume = volume;
    this.emit("volumeChange", volume);
  }

  get volume() {
    return this.#volume;
  }

  #playbackRate = 1;

  set playbackRate(playbackRate) {
    this.#playbackRate = playbackRate;
    this.emit("playbackRateChange", playbackRate);
  }

  get playbackRate() {
    return this.#playbackRate;
  }

  #isLoop = false;

  set loop(isLoop) {
    this.#isLoop = isLoop;
    this.emit("loopChange", isLoop);
  }

  get loop() {
    return this.#isLoop;
  }

  #loopModes = ["none", "infinite", "once"];

  get loopModes() {
    return this.#loopModes;
  }

  /**
   * Especifica cuantas veces se repite el video si es un loop
   * @type {"none" | "infinite" | "once"}
   * @default "none"
   */
  #loopMode = "none";

  set loopMode(loopMode) {
    this.#loopMode = loopMode;
  }

  get loopMode() {
    return this.#loopMode;
  }

  #duration;

  get duration() {
    return this.#duration;
  }

  #width;

  get width() {
    return this.#width;
  }

  #height;

  get height() {
    return this.#height;
  }

  constructor({
    src,
    width,
    height,
    volume = 1,
    currentTime = 0,
    isMuted = false,
  }) {
    super();
    if (!src) throw new Error("VideoWidget: src must be provided");
    this.#src = src;
    this.#width = width;
    this.#height = height;
    this.#volume = volume;
    this.#isMuted = isMuted;
    this.#currentTime = currentTime;

    // this.injectEventWidget(new MediaPlaybackEventWidget(this.eventBus));

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
    this.component?.play();
  }

  /**
   * Método para establecer el video en pausa y notificar al componente
   */
  pause() {
    this.component?.pause();
  }

  requestPictureInPicture() {
    this.component?.requestPictureInPicture();
  }

  exitPictureInPicture() {
    this.component?.exitPictureInPicture();
  }

  getCurrentLoopMode() {
    return this.#loopModes.indexOf(this.#loopMode);
  }
}
