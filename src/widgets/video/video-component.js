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
    this.on.ignoreDelegation("canplay", () => this.onCanPlay(), { once: true });

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
    this.on.ignoreDelegation(
      "loadedmetadata",
      this.onLoadedMetaData.bind(this)
    );
    this.on("click", this.onClick.bind(this));
    this.on.ignoreDelegation("waiting", this.onWaiting.bind(this));
    this.on.ignoreDelegation("playing", this.onPlaying.bind(this));
    this.on.ignoreDelegation("timeupdate", this.onTimeUpdate.bind(this));
    this.on.ignoreDelegation("pause", this.onPause.bind(this));
    this.on.ignoreDelegation("play", this.onPlay.bind(this));
    this.on.ignoreDelegation("progress", this.onProgress.bind(this));
    this.on.ignoreDelegation("error", this.onError.bind(this));
    this.on.ignoreDelegation("ended", this.onEnded.bind(this));
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
      muted: muted,
      volume: video.volume,
      autoplay: video.autoplay,
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
}
