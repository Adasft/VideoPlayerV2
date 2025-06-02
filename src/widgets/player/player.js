import { Widget } from "../widget.js";
import * as ui from "../../ui/ui-utils.js";
import SVGIcons from "../../ui/icons.js";
import PlayerControls from "./player-controls.js";
import StorageManager from "./storage-manager.js";
import { formatTime, getRandomId } from "../../utils.js";

const VALID_SKIP_TIMES = [5, 10, 15, 20];
const DEFAULT_SKIP_TIME = 5;

export default class Player extends Widget {
  /**
   * The current media source object being played
   * @type {Object|null}
   * @private
   */
  #currentSource;

  /**
   * Player width in pixels
   * @type {number}
   * @private
   */
  #width;

  /**
   * Player height in pixels
   * @type {number}
   * @private
   */
  #height;

  // Playback Configuration Properties

  /**
   * Whether the player should start playing automatically. If this is true,
   * the property `muted` will be set to true by default.
   * @type {boolean}
   * @private
   */
  #autoplay;

  /**
   * Audio volume level (0.0 to 1.0)
   * @type {number}
   * @private
   */
  #volume;

  /**
   * Whether the audio is muted
   * @type {boolean}
   * @private
   */
  #muted;

  /**
   * Whether the current media should loop when it ends
   * @type {boolean}
   * @private
   */
  #loop;

  /**
   * Time in seconds to skip forward/backward
   * @type {number}
   * @private
   */
  #skipTime;

  /**
   * Playback speed multiplier
   * @type {number}
   * @private
   */
  #playbackRate;

  /**
   * Loop mode for playlist behavior ('none', 'infinite', 'once')
   * @type {"none" | "infinite" | "once"}
   * @private
   */
  #loopMode;

  // Playlist and Player State

  /**
   * Playlist object containing multiple media sources
   * @type {Object|null}
   * @private
   */
  #playlist;

  /**
   * Whether the player is currently using a playlist
   * @type {boolean}
   * @private
   */
  #hasPlaylist;

  /**
   * Whether random/shuffle playback is currently active
   * @type {boolean}
   * @private
   */
  #isRandomPlaybackActive = false;

  /**
   * Whether player controls have been initialized and are ready for use
   * @type {boolean}
   * @private
   */
  #isControlsReady = false;

  // Storage Configuration

  /**
   * Whether local storage functionality is enabled for persisting player state
   * @type {boolean}
   * @private
   */
  #enableStorage;

  /**
   * Whether to overwrite existing storage data on initialization
   * @type {boolean}
   * @private
   */
  #overwriteStorage;

  /**
   * Storage tracking object for monitoring playback progress and state
   * @type {Object|null}
   * @private
   */
  #storageTracker;

  // UI Components

  /**
   * Main video element for media playback
   * @type {Object|null}
   * @private
   */
  #video;

  /**
   * Video status bar component showing playback information
   * @type {Object|null}
   * @private
   */
  #videoStatusBar;

  /**
   * Playback control buttons component (play, pause, stop, etc.)
   * @type {Object|null}
   * @private
   */
  #playbackControls;

  /**
   * Loading spinner/indicator component
   * @type {Object|null}
   * @private
   */
  #loader;

  /**
   * Volume control slider and mute button component
   * @type {Object|null}
   * @private
   */
  #volumeControl;

  /**
   * Main player controls container managing all control components
   * @type {PlayerControls|null}
   * @private
   */
  #controls;

  // Storage Management

  /**
   * Storage manager instance for handling data persistence and retrieval
   * @type {StorageManager|null}
   * @private
   */
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
    this.#muted = autoplay || muted;
    this.#loop = loop;
    this.#loopMode = loopMode;
    this.#skipTime = this.#normalizeSkipTime(skipTime);
    this.#enableStorage = enableStorage;
    this.#overwriteStorage = overwriteStorage;
    this.#playbackRate = playbackRate;
    this.#hasPlaylist = Boolean(playlist);

    this.#initializeStorage();
    this.#initializeMedia(source, playlist);
    this.#createLoader();
    this.#setupEvents();
  }

  // Getters públicos
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

  get playlist() {
    return this.#playlist;
  }

  get storage() {
    return this.#storageTracker;
  }

  // Propiedades de configuración
  get width() {
    return this.#width;
  }

  get height() {
    return this.#height;
  }

  get skipTime() {
    return this.#skipTime;
  }

  get autoplay() {
    return this.#autoplay;
  }

  get loop() {
    return this.#loop;
  }

  get loopMode() {
    return this.#loopMode;
  }

  get playbackRate() {
    return this.#playbackRate;
  }

  get volume() {
    return this.#volume;
  }

  get muted() {
    return this.#muted;
  }

  // Propiedades del video
  get duration() {
    return this.video?.duration || 0;
  }

  get currentTime() {
    return this.video?.currentTime || 0;
  }

  get hasAudio() {
    return this.video?.hasAudio || false;
  }

  get isPlaying() {
    return this.#video?.isPlaying || false;
  }

  get isPiPActive() {
    return document.pictureInPictureElement !== null;
  }

  // Estado del reproductor
  get isRandomPlaybackActive() {
    return this.#isRandomPlaybackActive;
  }

  // Setters con validación y persistencia
  set currentTime(time) {
    if (this.video) this.video.currentTime = time;
  }

  set volume(volume) {
    this.#volume = Math.max(0, Math.min(1, volume));
    if (this.video) this.video.volume = this.#volume;
    this.#storageManager?.saveVolume(this.#volume);
  }

  set muted(isMuted) {
    this.#muted = Boolean(isMuted);
    if (this.video) this.video.muted = this.#muted;
    this.#storageManager?.saveMuted(this.#muted);
  }

  set loop(isLoop) {
    this.#loop = Boolean(isLoop);
    if (this.video) this.video.loop = this.#loop;
    this.#storageManager?.saveLoop(this.#loop);
  }

  set loopMode(loopMode) {
    this.#loopMode = loopMode;
    if (this.video) this.video.loopMode = loopMode;
    this.#storageManager?.saveLoopMode(loopMode);
  }

  set autoplay(isAutoplay) {
    this.#autoplay = Boolean(isAutoplay);
  }

  set playbackRate(rate) {
    this.#playbackRate = Math.max(0.25, Math.min(4, rate));
    if (this.#video) this.#video.playbackRate = this.#playbackRate;
    this.#storageManager?.savePlaybackRate(this.#playbackRate);
  }

  set isRandomPlaybackActive(isActive) {
    this.#isRandomPlaybackActive = Boolean(isActive);
  }

  hasPlaylist() {
    return this.#hasPlaylist;
  }

  hasChapters() {
    return Boolean(this.source?.chapters?.length);
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

  #initializeStorage() {
    if (!this.#enableStorage) {
      return;
    }

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

  #setupEvents() {
    if (this.hasPlaylist()) {
      this.once("playlistReady", this.#onPlaylistReady.bind(this));
    }

    this.on("sourceChange", this.#onSourceChange.bind(this));
    this.once("videoReady", this.#onVideoReady.bind(this));
    this.once("controlsReady", this.#onControlsReady.bind(this));
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

    this.#currentSource = {
      ...source,
      id: getRandomId(),
    };
    this.#playlist = null;
    this.#createVideo();
  }

  async #createPlaylist(options, defaultSource) {
    try {
      const { default: PlayList } = await import("./playlist.js");

      const playlistOptions = {
        ...options,
        sources: defaultSource
          ? [defaultSource, ...options.sources].filter(Boolean)
          : options.sources,
      };
      const finalPlaylistOptions =
        this.#storageManager?.adjustPlaylistOptions(playlistOptions) ??
        playlistOptions;

      return new PlayList({
        player: this,
        ...finalPlaylistOptions,
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
      autoplay: this.#autoplay,
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
    this.#video.on("audioDetected", this.#onAudioDetected.bind(this));
    this.#video.on("canPlay", () => {
      if (this.#autoplay && !this.#isControlsReady) {
        this.pause();
      }
    });
  }

  #isValidSource(source) {
    return (
      source && typeof source === "object" && typeof source.src === "string"
    );
  }

  #onSourceChange(source) {
    this.video.refresh({ src: source.src, currentTime: source.currentTime });

    if (this.#autoplay) {
      if (!this.isPlaying) this.play();
    } else {
      this.pause();
      this.controls.buttons.play.icon = SVGIcons.PLAY;
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

    this.#storageManager?.syncPlaybackTimes();

    this.emit("controlsReady");
  }

  #onControlsReady() {
    if (!this.#autoplay) {
      return;
    }

    this.play();
  }

  #onLoadedMetaData() {
    this.#videoStatusBar?.refresh();

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

    this.#storageManager.setTimeAt(this.playlist.currentIndex, 0);
    currentSource.currentTime = 0;

    this.playlist.next();

    if (this.playlist.isEndOfList && !this.playlist.loop) {
      this.controls.buttons.next.enabled = false;
    }
  }

  #onAudioDetected(hasAudio) {
    this.#volumeControl?.refresh(hasAudio);
  }
}
