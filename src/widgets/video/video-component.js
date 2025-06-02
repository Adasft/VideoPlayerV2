import { Component } from "../component.js";
import { Dom } from "../../dom/dom-utils.js";

export default class VideoComponent extends Component {
  constructor(widget) {
    super(widget);
    this.#init();
  }

  play() {
    return this.node.play();
  }

  pause() {
    return this.node.pause();
  }

  setCurrentTime(time) {
    this.node.currentTime = time;
  }

  requestPictureInPicture() {
    this.node
      .requestPictureInPicture()
      .then(() => {
        Dom.once(document, "leavepictureinpicture", () => {
          this.video.emit("pictureInPictureExit");
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

  onRefresh() {
    console.log("VideoComponent: onRefresh", this.video.muted);
    this.#initializeVideoData(this.video.muted);
  }

  onVolumeChange(volume) {
    this.node.volume = volume;
  }

  onPlaybackRateChange(rate) {
    this.node.playbackRate = rate;
  }

  onMutedChange(isMuted) {
    this.node.muted = isMuted;
  }

  onLoopChange(isLoop) {
    this.node.loop = isLoop;
  }

  onClick() {
    if (this.#isPlaying()) {
      this.pause();
    } else {
      this.play();
    }
  }

  onWaiting() {
    this.video.emit("waiting");
  }

  onPlaying() {
    const { video } = this;
    video.emit("playing");
    if (video.loop && Math.floor(video.currentTime) === 0) {
      if (video.loopMode === "once") {
        video.loop = false;
      }
    }
  }

  onLoadedMetaData() {
    this.#bindEvent("canplay", () => this.onCanPlay(), { once: true });

    this.video.emit("loadedMetaData", {
      duration: this.node.duration,
      currentTime: this.node.currentTime,
      volume: this.node.volume,
    });
  }

  onCanPlay() {
    const { video } = this;
    video.emit("canPlay");
    video.emit("audioDetected", this.#hasAudio());
  }

  onTimeUpdate() {
    this.video.emit("timeUpdate", this.node.currentTime);
  }

  onPause() {
    this.video.emit("pause");
  }

  onPlay() {
    this.video.emit("play");
  }

  onProgress() {
    this.video.emit("progress", this.#calculateBufferedEndProgress());
  }

  onError() {
    console.error("VideoWidget: error loading video");
    this.video.emit("error");
  }

  onEnded() {
    this.video.emit("ended");
  }

  #init() {
    const { video } = this;
    // Eventos del controlador
    video.on("refresh", this.onRefresh.bind(this));
    video.on("volumeChange", this.onVolumeChange.bind(this));
    video.on("playbackRateChange", this.onPlaybackRateChange.bind(this));
    video.on("mutedChange", this.onMutedChange.bind(this));
    video.on("loopChange", this.onLoopChange.bind(this));

    this.#initializeVideoData(video.autoplay ? true : video.muted);

    // Eventos del DOM
    this.on("click", this.onClick.bind(this));
    this.#bindEvent("waiting", this.onWaiting.bind(this));
    this.#bindEvent("playing", this.onPlaying.bind(this));
    this.#bindEvent("loadedmetadata", this.onLoadedMetaData.bind(this));
    // this.#bindEvent("canplaythrough", this.onCanPlay.bind(this));
    this.#bindEvent("timeupdate", this.onTimeUpdate.bind(this));
    this.#bindEvent("pause", this.onPause.bind(this));
    this.#bindEvent("play", this.onPlay.bind(this));
    this.#bindEvent("progress", this.onProgress.bind(this));
    this.#bindEvent("error", this.onError.bind(this));
    this.#bindEvent("ended", this.onEnded.bind(this));
  }

  #initializeVideoData(muted) {
    const { video } = this;

    Object.assign(this.node, {
      width: video.width,
      height: video.height,
      preload: "auto",
      crossOrigin: "anonymous",
      src: video.src,
      currentTime: video.currentTime,
      playbackRate: video.playbackRate,
      muted: muted, // Mute if autoplay is true
      volume: video.volume,
      autoplay: video.autoplay,
    });

    console.log("hola");

    // this.pause();
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

  #bindEvent(eventName, handler, options = {}) {
    this.on.ignoreDelegation(eventName, handler, options);
  }
}
