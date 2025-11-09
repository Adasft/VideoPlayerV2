import { Widget } from "../widget.js";
import * as ui from "../../ui/ui-utils.js";
import SVGIcons from "../../ui/icons.js";
import PlayerControls from "./player-controls.js";
import StorageManager from "./storage-manager.js";
import { formatTime, getRandomId } from "../../utils.js";

const VALID_SKIP_TIMES = [5, 10, 15, 20];
const DEFAULT_SKIP_TIME = 5;

class InterceptorAction {
  #actions = [];
  #defaultAction = null;
  #defaultActionCanceled = false;

  get hasActions() {
    return this.#actions.length > 0;
  }

  cancelDefaultAction() {
    this.#defaultActionCanceled = true;
  }

  registerDefaultAction(handler) {
    if (typeof handler !== "function") {
      throw new TypeError("Interceptor default action must be a function.");
    }

    if (this.#defaultAction) {
      console.warn("Default action already set. Overwriting.");
    }

    this.#defaultAction = handler;
  }

  define({ name, handler }) {
    if (typeof handler !== "function") {
      throw new TypeError("Action handler must be a function.");
    }

    if (!name) {
      throw new Error("Action must have a name.");
    }

    if (this.#nameAlreadyExists(name)) {
      throw new Error(`Action "${name}" is already defined.`);
    }

    this.#actions.push({ name, handler });
  }

  remove(name) {
    const index = this.#actions.findIndex((a) => a.name === name);
    if (index !== -1) {
      this.#actions.splice(index, 1);
    } else {
      console.warn(`Action "${name}" not found.`);
    }
  }

  createHandler(ctx) {
    if (!ctx || typeof ctx !== "object") {
      throw new TypeError("Context must be an object.");
    }

    return (event) => {
      ctx.event = event;

      if (this.hasActions) {
        this.#actions.forEach((action) => action.handler(ctx));
      }

      if (!this.#defaultActionCanceled) {
        this.#defaultAction?.(ctx);
      }
    };
  }

  #nameAlreadyExists(name) {
    return this.#actions.some((a) => a.name === name);
  }
}

class InterceptorActions {
  showPlaylist = new InterceptorAction();
  showChapters = new InterceptorAction();
}

/**
 * @typedef {import("./playlist.js").default} PlayList
 * @typedef {import("../video/video.js").default} Video
 * @typedef {import("../video-status-bar/video-status-bar.js").default} VideoStatusBar
 * @typedef {import("../playback-controls/playback-controls.js").default} PlaybackControls
 * @typedef {import("../loader/loader.js").default} Loader
 * @typedef {import("../volume-control/volume-control.js").default} VolumeControl
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

export default class Player extends Widget {
  /**
   * Unique identifier for the player instance
   * @type {string}
   * @private
   */
  #id = `player-${getRandomId()}`;

  /**
   * The current media source object being played
   * @type {Source|null}
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
   *
   * @type {PlayList}
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

  // UI Components

  /**
   * Main video element for media playback
   * @type {Video}
   * @private
   */
  #video;

  /**
   * Video status bar component showing playback information
   * @type {VideoStatusBar}
   * @private
   */
  #videoStatusBar;

  /**
   * Playback control buttons component (play, pause, stop, etc.)
   * @type {PlaybackControls}
   * @private
   */
  #playbackControls;

  /**
   * Loading spinner/indicator component
   * @type {Loader}
   * @private
   */
  #loader;

  /**
   * Volume control slider and mute button component
   * @type {VolumeControl}
   * @private
   */
  #volumeControl;

  /**
   * Main player controls container managing all control components
   * @type {PlayerControls}
   * @private
   */
  #controls;

  // Storage Management

  /**
   * Storage manager instance for handling data persistence and retrieval.
   * This manages player state like volume, playback rate, etc.
   *
   * @type {StorageManager|null}
   * @private
   */
  #storageManager;

  #actions = null;

  /**
   * Creates a new Player instance.
   * @param {Object} options - Player configuration options.
   * @param {Source} options.source - The initial media source to play.
   * @param {number} [options.width=400] - The width of the player in pixels.
   * @param {number} [options.height=400] - The height of the player in pixels.
   * @param {boolean} [options.autoplay=false] - Whether to autoplay the media.
   * @param {number} [options.volume=1] - Initial volume level (0.0 to 1.0).
   * @param {boolean} [options.muted=false] - Whether to start muted.
   * @param {boolean} [options.loop=false] - Whether the media should loop.
   * @param {"none" | "infinite" | "once"} [options.loopMode="none"] - Loop mode for playlist behavior.
   * @param {number} [options.skipTime=5] - Time in seconds to skip forward/backward.
   * @param {{loop: boolean, startIndex: number, sources: Source[]}} [options.playlist] - Optional playlist object containing multiple sources.
   * @param {boolean} [options.enableStorage=false] - Whether to enable local storage for player state.
   * @param {boolean} [options.overwriteStorage=false] - Whether to overwrite existing storage data.
   * @param {number} [options.playbackRate=1] - Initial playback speed multiplier (0.25 to 4).
   */
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
    this.#actions = new InterceptorActions();

    this.#initializeStorage();
    this.#initializeMedia(source, playlist);
    this.#createLoader();
    this.#setupEvents();
  }

  get id() {
    return this.#id;
  }

  get actions() {
    return this.#actions;
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

  get isControlsReady() {
    return this.#isControlsReady;
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

    this.on("sourceChanged", this.#onsourceChanged.bind(this));
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
   * @param {PlayList} playlist
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

  #onsourceChanged(source) {
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

    if (
      !this.hasPlaylist() ||
      (this.playlist.isEndOfList && !this.loop && !this.playlist.loop)
    ) {
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

export async function create(options) {
  const mountedQueue = [];
  const player = await ui.createPlayer(options);

  player.once("controlsReady", () => {
    mountedQueue.forEach((fn) => fn());
  });
  return {
    player,
    mount(parent) {
      if (player.isControlsReady) {
        player.mount(parent);
      } else {
        mountedQueue.push(() => player.mount(parent));
      }
    },
  };
}

// class VideoPlayer {
//   static #players = new Set()

//   #player;

//   constructor(config) {
//     this.#player = new Player(config);
//     VideoPlayer.#players.add(this.#player);
//   }
// }
