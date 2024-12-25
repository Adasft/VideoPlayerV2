import { Component } from "../component.js";
import { Dom } from "../../dom/dom-utils.js";

export default class VideoComponent extends Component {
  constructor(widget) {
    super(widget);
    this.#init();
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
          this.widget.emit("pictureInPictureExit");
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
    this.#initializeVideoData();
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
    this.widget.emit("waiting");
  }

  onPlaying() {
    const video = this.widget;
    video.emit("playing");
    if (video.loop && Math.floor(video.currentTime) === 0) {
      if (video.loopMode === "once") {
        video.loop = false;
      }
    }
  }

  onLoadedMetaData() {
    this.#bindEvent("canplay", () => this.onCanPlay(), { once: true });

    this.widget.emit("loadedMetaData", {
      duration: this.node.duration,
      currentTime: this.node.currentTime,
      volume: this.node.volume,
    });
  }

  onCanPlay() {
    this.widget.emit("canPlay");
    this.widget.emit("audioDetected", this.#hasAudio());
  }

  onTimeUpdate() {
    this.widget.emit("timeUpdate", this.node.currentTime);
  }

  onPause() {
    this.widget.emit("pause");
  }

  onPlay() {
    this.widget.emit("play");
  }

  onProgress() {
    this.widget.emit("progress", this.#calculateBufferedEndProgress());
  }

  onError() {
    console.error("VideoWidget: error loading video");
    this.widget.emit("error");
  }

  onEnded() {
    this.widget.emit("ended");
  }

  #init() {
    const video = this.widget;
    // Eventos del controlador
    video.on("refresh", this.onRefresh.bind(this));
    video.on("volumeChange", this.onVolumeChange.bind(this));
    video.on("playbackRateChange", this.onPlaybackRateChange.bind(this));
    video.on("mutedChange", this.onMutedChange.bind(this));
    video.on("loopChange", this.onLoopChange.bind(this));

    // Eventos del DOM
    this.on("click", this.onClick.bind(this));
    this.#bindEvent("waiting", this.onWaiting.bind(this));
    this.#bindEvent("playing", this.onPlaying.bind(this));
    this.#bindEvent("loadedmetadata", this.onLoadedMetaData.bind(this));
    this.#bindEvent("canplaythrough", this.onCanPlay.bind(this));
    this.#bindEvent("timeupdate", this.onTimeUpdate.bind(this));
    this.#bindEvent("pause", this.onPause.bind(this));
    this.#bindEvent("play", this.onPlay.bind(this));
    this.#bindEvent("progress", this.onProgress.bind(this));
    this.#bindEvent("error", this.onError.bind(this));
    this.#bindEvent("ended", this.onEnded.bind(this));

    this.#initializeVideoData();
  }

  #initializeVideoData() {
    const video = this.widget;

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

  #bindEvent(eventName, handler, options = {}) {
    this.on.ignoreDelegation(eventName, handler, options);
  }
}
