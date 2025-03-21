import { Widget } from "../widget.js";
import * as ui from "../../ui/ui-utils.js";
import SVGIcons from "../../ui/icons.js";
import PlayerControls from "./player-controls.js";
import StorageManager from "./storage-manager.js";
import { formatTime, getRandomId } from "../../utils.js";

const VALID_SKIP_TIMES = [5, 10, 15, 20];
const DEFAULT_SKIP_TIME = 5;

export default class Player extends Widget {
  #currentSource;
  #width;
  #height;
  #autoplay;
  #volume;
  #muted;
  #loop;
  #skipTime;
  #playlist;
  #isRandomPlaybackActive = false;
  #isControlsReady = false;
  #enableStorage;
  #overwriteStorage;
  #playbackRate;
  #loopMode;

  #storageTracker;

  #video;
  #videoStatusBar;
  #playbackControls;
  #loader;
  #volumeControl;
  #controls;

  #storageManager;

  constructor({
    source,
    width = 400,
    height = 400,
    autoplay = false,
    volume = 1,
    muted = false,
    loop = false,
    loopMode = "none",
    skipTime = DEFAULT_SKIP_TIME,
    playlist,
    enableStorage = false,
    overwriteStorage = false,
    playbackRate = 1,
  }) {
    super();

    this.#width = width;
    this.#height = height;
    this.#autoplay = autoplay;
    this.#volume = volume;
    this.#muted = muted;
    this.#loop = loop;
    this.#loopMode = loopMode;
    this.#skipTime = this.#normalizeSkipTime(skipTime);
    this.#enableStorage = enableStorage;
    this.#overwriteStorage = overwriteStorage;
    this.#playbackRate = playbackRate;

    if (this.#enableStorage) {
      this.#storageManager = new StorageManager({
        player: this,
        overwriteStorage: this.#overwriteStorage,
        syncPlayerState: (state) => {
          this.#muted = state.muted;
          this.#volume = state.volume;
          this.#playbackRate = state.playbackRate;
          this.#loop = state.loop;
          this.#loopMode = state.loopMode;
          this.#autoplay = state.autoplay;
        },
      });
    }

    this.#createLoader();

    if (playlist) {
      this.once("playlistReady", this.#onPlaylistReady.bind(this));
    }

    this.on("sourceChange", this.#onSourceChange.bind(this));
    this.once("videoReady", this.#onVideoReady.bind(this));

    this.#initializeMedia(source, playlist);
  }

  get controls() {
    return this.#controls;
  }

  get source() {
    return this.hasPlaylist()
      ? this.#playlist.currentSource
      : this.#currentSource;
  }

  get sources() {
    return this.hasPlaylist() ? this.#playlist.sources : [this.#currentSource];
  }

  get video() {
    return this.#video;
  }

  get videoStatusBar() {
    return this.#videoStatusBar;
  }

  get playbackControls() {
    return this.#playbackControls;
  }

  get loader() {
    return this.#loader;
  }

  get volumeControl() {
    return this.#volumeControl;
  }

  get width() {
    return this.#width;
  }

  get height() {
    return this.#height;
  }

  get duration() {
    return this.video.duration;
  }

  set currentTime(time) {
    this.video.currentTime = time;
  }

  get currentTime() {
    return this.video.currentTime;
  }

  set volume(volume) {
    this.#volume = volume;
    this.video.volume = volume;
    this.#storageManager?.saveVolume(volume);
  }

  get volume() {
    return this.#volume;
  }

  set muted(isMuted) {
    this.#muted = isMuted;
    this.video.muted = isMuted;
    this.#storageManager?.saveMuted(isMuted);
  }

  get muted() {
    return this.#muted;
  }

  // set

  get hasAudio() {
    return this.video.hasAudio;
  }

  set isRandomPlaybackActive(isRandomPlaybackActive) {
    this.#isRandomPlaybackActive = isRandomPlaybackActive;
  }

  get isRandomPlaybackActive() {
    return this.#isRandomPlaybackActive;
  }

  get isPiPActive() {
    return document.pictureInPictureElement !== null;
  }

  get skipTime() {
    return this.#skipTime;
  }

  set loop(isLoop) {
    this.#loop = isLoop;
    this.video.loop = isLoop;
    this.#storageManager?.saveLoop(isLoop);
  }

  get loop() {
    return this.#loop;
  }

  set loopMode(loopMode) {
    this.#loopMode = loopMode;
    this.video.loopMode = loopMode;
    this.#storageManager?.saveLoopMode(loopMode);
  }

  get loopMode() {
    return this.#loopMode;
  }

  set autoplay(isAutoplay) {
    this.#autoplay = isAutoplay;
  }

  get autoplay() {
    return this.#autoplay;
  }

  get isPlaying() {
    return this.#video.isPlaying;
  }

  get playlist() {
    return this.#playlist;
  }

  set playbackRate(playbackRate) {
    this.#playbackRate = playbackRate;
    this.#video.playbackRate = playbackRate;
    this.#storageManager?.savePlaybackRate(playbackRate);
  }

  get playbackRate() {
    return this.#playbackRate;
  }

  get storage() {
    return this.#storageTracker;
  }

  hasPlaylist() {
    return !!this.#playlist;
  }

  hasChapters() {
    return this.source.chapters?.length > 0;
  }

  activatePip() {
    this.video.requestPictureInPicture();
  }

  deactivatePip() {
    this.video.exitPictureInPicture();
  }

  getCurrentChapter() {
    if (!this.#isControlsReady) return null;
    return this.controls.sliders.seeker.getCurrentChapter();
  }

  getCurrentChapterTitle() {
    if (!this.#isControlsReady) return "";
    return this.#controls.sliders.seeker.track.getChapterTitle?.() ?? "";
  }

  play() {
    return this.video.play();
  }

  pause() {
    return this.video.pause();
  }

  skipBack() {
    this.video.currentTime -= this.#skipTime;
  }

  skipForward() {
    this.video.currentTime += this.#skipTime;
  }

  #normalizeSkipTime(skipTime) {
    if (!VALID_SKIP_TIMES.includes(skipTime)) {
      return DEFAULT_SKIP_TIME;
    }
    return skipTime;
  }

  async #createLoader() {
    this.#loader = await ui.createLoader();
  }

  #initializeMedia(source, playlist) {
    if ((source && playlist) || playlist) {
      this.#initializePlaylist(playlist, source);
    } else if (source) {
      this.#initializeCurrentSource(source);
    } else {
      throw new Error("Player: No se ha proporcionado ninguna fuente.");
    }
  }

  /**
   * Inicializa la playlist si se proporciona en las opciones.
   * @param {Object} options
   */
  async #initializePlaylist(playlist, defaultSource) {
    if (!Array.isArray(playlist?.sources) || typeof playlist !== "object") {
      throw new Error(
        "Invalid playlist: Expected an object with a sources array."
      );
    }

    try {
      this.#playlist = await this.#createPlaylist(playlist, defaultSource);
      this.#currentSource = null;
      this.emit("playlistReady");
    } catch (error) {
      console.error("Error initializing playlist:", error);
    }
  }

  #initializeCurrentSource(source) {
    if (!this.#isValidSource(source)) {
      throw new Error("Invalid source: Expected an object.");
    }

    source.id = getRandomId();
    this.#currentSource = source;
    this.#playlist = null;
    this.#createVideo();
  }

  async #createPlaylist(options, defaultSource) {
    try {
      const { default: PlayList } = await import("./playlist.js");

      if (defaultSource) {
        options.sources = [defaultSource, ...options.sources].filter(Boolean);
      }

      this.#storageManager?.mutatePlaylistOptions(options);

      return new PlayList({
        player: this,
        ...options,
      });
    } catch (error) {
      console.error("Error importing PlayList module:", error);
      throw error;
    }
  }

  async #createVideo() {
    this.#video = await ui.createVideo({
      src: this.source.src,
      width: this.#width,
      height: this.#height,
      volume: this.#volume,
      currentTime: this.source.currentTime,
      isMuted: this.#muted,
      playbackRate: this.#playbackRate,
      loopMode: this.#loopMode,
    });

    this.#setVideoEvents();
  }

  async #createVideoStatusBar() {
    this.#videoStatusBar = await ui.createVideoStatusBar({
      player: this,
    });
  }

  async #createPlaybackControls() {
    this.#playbackControls = await ui.createPlaybackControls({
      player: this,
    });
  }

  async #createVolumeControl() {
    this.#volumeControl = await ui.createVolumeControl({
      player: this,
      hasAudio: this.hasAudio,
    });
  }

  #setVideoEvents() {
    this.#video.on("loadedMetaData", this.#onLoadedMetaData.bind(this));
    this.#video.on("timeUpdate", this.#onTimeUpdate.bind(this));
    this.#video.on("progress", this.#onProgress.bind(this));
    this.#video.on("play", this.#onPlay.bind(this));
    this.#video.on("pause", this.#onPause.bind(this));
    this.#video.on("waiting", this.#onWaiting.bind(this));
    this.#video.on("playing", this.#onPlaying.bind(this));
    this.#video.on("ended", this.#onEnded.bind(this));
    // this.#video.on("audioDetected", this.#onAudioDetected.bind(this));
  }

  // async #onAudioDetected(hasAudio) {
  //   this.hasAudio = hasAudio;
  // }

  #isValidSource(source) {
    return (
      source && typeof source === "object" && typeof source.src === "string"
    );
  }

  #onSourceChange(source) {
    this.video.refresh({ src: source.src, currentTime: source.currentTime });

    if (this.#autoplay) {
      this.play();
    } else {
      this.play().then(() => {
        this.pause();
      });
    }

    this.#storageManager?.savePlaylist(
      this.#playlist.currentIndex,
      this.#playlist.loop
    );
  }

  #onPlaylistReady() {
    this.#createVideo();
    this.#storageManager?.savePlaylistState();
  }

  async #onVideoReady() {
    this.#controls = new PlayerControls(this);

    await this.#controls.createControls();

    this.#isControlsReady = true;

    await this.#createVideoStatusBar();
    await this.#createPlaybackControls();
    await this.#createVolumeControl();

    if (this.#autoplay) {
      this.play();
    }

    this.#storageManager?.syncPlaybackTimes();

    this.emit("controlsReady");
  }

  #onLoadedMetaData() {
    if (this.#videoStatusBar) {
      this.#videoStatusBar.refresh();
    }

    this.emit("videoReady");
  }

  #onTimeUpdate(time) {
    if (!this.#isControlsReady) return;

    this.controls.textViews.currentTime.text = formatTime(time);
    this.controls.sliders.seeker.setValue(time);
  }

  #onProgress(progress) {
    if (!this.#isControlsReady) return null;
    this.controls.sliders.seeker.setBufferProgress(progress);
  }

  #onPlay() {
    if (!this.#isControlsReady) return;
    this.controls.buttons.play.icon = SVGIcons.PAUSE;
    this.#storageManager?.startPlaybackTracker();
  }

  #onPause() {
    if (!this.#isControlsReady) return;
    this.controls.buttons.play.icon = SVGIcons.PLAY;
    this.#storageManager?.stopPlaybackTracker();
  }

  #onWaiting() {
    if (!this.#isControlsReady) return;
    this.controls.buttons.play.hide();
    this.loader.show();
  }

  #onPlaying() {
    if (!this.#isControlsReady) return;
    this.controls.buttons.play.show();
    this.loader.hide();
  }

  #onEnded() {
    const currentSource = this.source;
    const currentTime = currentSource.currentTime;

    if (currentTime >= this.duration) {
      currentSource.currentTime = 0;
    }

    if (!this.hasPlaylist() || (this.playlist.isEndOfList && !this.loop)) {
      this.controls.buttons.play.hide();
      this.controls.buttons.reload.show();
      return;
    }

    this.playlist.next();

    if (this.playlist.isEndOfList && !this.playlist.loop) {
      this.controls.buttons.next.enabled = false;
    }
  }
}
