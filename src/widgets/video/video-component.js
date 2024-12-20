import { Component } from "../component.js";
import { Dom } from "../../dom-utils/dom.js";

export default class VideoComponent extends Component {
  constructor(controller) {
    super(controller);
    this.#init();
  }

  #initializeVideoData() {
    const video = this.controller;

    Object.assign(this.node, {
      width: video.width,
      height: video.height,
      preload: "auto",
      crossOrigin: "anonymous",
      src: video.src,
      currentTime: video.currentTime,
      playbackRate: video.playbackRate,
      muted: video.muted,
      volume: video.volume,
    });
  }

  #calculateBufferedEndProgress() {
    const { buffered, currentTime, duration } = this.node;

    if (buffered.length === 0) return null;

    for (let i = 0; i < buffered.length; i++) {
      const start = buffered.start(i);
      const end = buffered.end(i);

      if (currentTime >= start && currentTime <= end) {
        return end / duration;
      }
    }
    return 0;
  }

  #isPlaying() {
    return !this.node.paused;
  }

  #hasAudio() {
    const video = this.node;
    return (
      video.mozHasAudio ||
      Boolean(video.webkitAudioDecodedByteCount) ||
      Boolean(video.audioTracks?.length)
    );
  }

  #init() {
    const video = this.controller;
    // Eventos del controlador
    video.on("refresh", this.#initializeVideoData.bind(this));
    video.on("volumeChange", (volume) => (this.node.volume = volume));
    video.on("playbackRateChange", (rate) => (this.node.playbackRate = rate));
    video.on("mutedChange", (isMuted) => (this.node.muted = isMuted));
    video.on("loopChange", (isLoop) => (this.node.loop = isLoop));

    // Eventos del DOM
    this.on("click", this.#togglePlayback.bind(this));
    this.#bindEvent("waiting", () => video.emit("waiting"));
    this.#bindEvent("playing", this.#onPlaying.bind(this));
    this.#bindEvent("loadedmetadata", this.#onLoadedMetadata.bind(this));
    this.#bindEvent("canplaythrough", () => video.emit("canPlay"));
    this.#bindEvent("timeupdate", () =>
      video.emit("timeUpdate", this.node.currentTime)
    );
    this.#bindEvent("pause", () => video.emit("pause"));
    this.#bindEvent("play", () => video.emit("play"));
    this.#bindEvent("progress", () =>
      video.emit("progress", this.#calculateBufferedEndProgress())
    );
    this.#bindEvent("error", () =>
      console.error("VideoController: error loading video")
    );
    this.#bindEvent("ended", () => video.emit("ended"));

    this.#initializeVideoData();
  }

  #togglePlayback() {
    if (this.#isPlaying()) {
      this.pause();
    } else {
      this.play();
    }
  }

  #onPlaying() {
    const video = this.controller;
    video.emit("playing");
    if (video.loop && Math.floor(video.currentTime) === 0) {
      if (video.loopMode === "once") {
        video.loop = false;
      }
    }
  }

  #onLoadedMetadata() {
    this.#bindEvent(
      "canplay",
      () => {
        this.controller.emit("canPlay");
        this.controller.emit("audioDetected", this.#hasAudio());
      },
      { once: true }
    );

    this.controller.emit("loadedMetaData", {
      duration: this.node.duration,
      currentTime: this.node.currentTime,
      volume: this.node.volume,
    });
  }

  #bindEvent(eventName, handler, options = {}) {
    this.on.ignoreDelegation(eventName, handler, options);
  }

  play() {
    this.node.play();
  }

  pause() {
    this.node.pause();
  }

  setCurrentTime(time) {
    this.node.currentTime = time;
  }

  requestPictureInPicture() {
    this.node
      .requestPictureInPicture()
      .then(() => {
        Dom.once(document, "leavepictureinpicture", () => {
          this.controller.emit("pictureInPictureExit");
        });
      })
      .catch(() => {
        alert("Error al entrar en modo Picture in Picture");
      });
  }

  exitPictureInPicture() {
    document.exitPictureInPicture().catch(() => {
      alert("Error al salir de modo Picture in Picture");
    });
  }

  createElement() {
    return Dom.elm("video", { class: "player-video" });
  }
}
