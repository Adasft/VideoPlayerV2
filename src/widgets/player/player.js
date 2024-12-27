import { Widget } from "../widget.js";
import * as ui from "../../ui/ui-utils.js";
import { Controls } from "../../ui/controls.js";
import SVGIcons from "../../ui/icons.js";
import { formatTime, noop } from "../../utils.js";

class PlayerControls {
  #controls;

  #conditionalControls = {
    createOrDestroyPlaylistControls: noop,
    createOrDestroyChaptersControls: noop,
    createOrDestroyChapterTitle: noop,
    createOrDestroyVolumeSlider: noop,
  };

  get controls() {
    return this.#controls;
  }

  get buttons() {
    return this.#controls.buttons;
  }

  get sliders() {
    return this.#controls.sliders;
  }

  get textViews() {
    return this.#controls.textViews;
  }

  constructor(player) {
    this.player = player;
    this.#controls = new Controls();
  }

  createOrDestroyPlaylistControls() {
    return this.#conditionalControls.createOrDestroyPlaylistControls({
      prev: { icon: SVGIcons.BACKWARD },
      next: { icon: SVGIcons.FORWARD },
      playlist: { icon: SVGIcons.PLAYLIST },
    });
  }

  createOrDestroyChaptersControls() {
    return this.#conditionalControls.createOrDestroyChaptersControls({
      chapters: { icon: SVGIcons.CHAPTERS },
    });
  }

  createOrDestroyChapterTitle() {
    return this.#conditionalControls.createOrDestroyChapterTitle({
      chapterTitle: { text: this.player.getCurrentChapterTitle() },
    });
  }

  createOrDestroyVolumeSlider() {
    return this.#conditionalControls.createOrDestroyVolumeSlider({
      volume: { value: this.player.volume },
    });
  }

  #getSkipTimeIcon(skipTime, suffix) {
    return SVGIcons[`SKIP_${skipTime}_${suffix}`];
  }

  #createButtonGroupControls() {
    const skipTime = this.player.skipTime;

    const controls = {
      play: { icon: SVGIcons.PLAY },
      volume: { icon: SVGIcons.VOLUME_HIGH },
      repeat: { icon: SVGIcons.REPEAT },
      shuffle: { icon: SVGIcons.SHUFFLE },
      fullscreen: { icon: SVGIcons.FULLSCREEN },
      skipBack: { icon: this.#getSkipTimeIcon(skipTime, "BACK") },
      skipForward: { icon: this.#getSkipTimeIcon(skipTime, "FORWARD") },
      pictureInPicture: { icon: SVGIcons.PICTURE_IN_PICTURE },
      speed: { icon: SVGIcons.SPEED },
    };

    return {
      name: "buttons",
      createControl: (options) => ui.createButton(options),
      controls,
    };
  }

  #createSliderGroupControls() {
    const { source, video, muted, volume } = this.player;

    const seekerOptions = {
      value: source.currentTime,
      min: 0,
      max: video.duration,
      hoverPadding: 10,
      chapters: source.chapters,
    };

    const volumeOptions = {
      volume: muted ? 0 : volume,
    };

    const controls = {
      seeker: seekerOptions,
      volume: volumeOptions,
    };

    const createControl = (options, controlName) => {
      return (
        controlName === "seeker"
          ? ui.createSeekerSlider
          : controlName === "volume"
          ? ui.createVolumeSlider
          : ui.createStepsSlider
      )(options);
    };

    return {
      name: "sliders",
      createControl,
      controls,
    };
  }

  #createTextViewGroupControls() {
    const { source, video } = this.player;

    const controls = {
      title: { text: source.title },
      currentTime: { text: formatTime(source.currentTime) },
      duration: { text: formatTime(video.duration) },
    };

    return {
      name: "textViews",
      createControl: (options) => ui.createTextView(options),
      controls,
    };
  }

  async #defineControlGroups(group) {
    for (const { name, createControl, controls } of group) {
      const controlsGroup = this.#controls.defineGroup({
        name,
        createControl,
      });

      await controlsGroup.add(controls);
    }

    this.#defineConditionalControls();
  }

  #defineConditionalControls() {
    // Define las condiciones para crear o destruir los controles de
    // la lista de reproducción y los capítulos.
    this.#conditionalControls.createOrDestroyPlaylistControls =
      this.buttons.createWhen(() => this.player.hasPlaylist());
    this.#conditionalControls.createOrDestroyChaptersControls =
      this.buttons.createWhen(() => this.player.hasChapters());
    this.#conditionalControls.createOrDestroyChapterTitle =
      this.textViews.createWhen(() => this.player.hasChapters());
    this.#conditionalControls.createOrDestroyVolumeSlider =
      this.sliders.createWhen(() => this.player.hasAudio);
  }

  async createControls() {
    const group = [
      this.#createButtonGroupControls(),
      this.#createSliderGroupControls(),
      this.#createTextViewGroupControls(),
    ];

    await this.#defineControlGroups(group);

    this.createOrDestroyPlaylistControls();
    this.createOrDestroyChaptersControls();
    this.createOrDestroyChapterTitle();
  }
}

export default class Player extends Widget {
  static #VALID_SKIP_TIMES = [5, 10, 15, 20];
  static #DEFAULT_SKIP_TIME = 5;

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

  #video;
  #videoStatusBar;
  #playbackControls;
  #loader;
  #volumeControl;
  #controls;

  constructor({
    source,
    width = 400,
    height = 400,
    autoplay = false,
    volume = 1,
    muted = false,
    loop = false,
    skipTime = Player.#DEFAULT_SKIP_TIME,
    playlist,
  }) {
    super();

    this.#width = width;
    this.#height = height;
    this.#autoplay = autoplay;
    this.#volume = volume;
    this.#muted = muted;
    this.#loop = loop;
    this.#skipTime = this.#normalizeSkipTime(skipTime);

    this.#initializeLoader();

    if (playlist) {
      this.once("playlistReady", () => {
        this.#initializeVideo();
      });
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
      ? this.#playlist.getCurrentSource()
      : this.#currentSource;
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
    this.video.volume = volume;
  }

  get volume() {
    return this.video.volume;
  }

  set muted(isMuted) {
    this.#muted = isMuted;
    this.video.muted = isMuted;
  }

  get muted() {
    return this.video.muted;
  }

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

  get loop() {
    return this.#loop;
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
    if (!Player.#VALID_SKIP_TIMES.includes(skipTime)) {
      return Player.#DEFAULT_SKIP_TIME;
    }
    return skipTime;
  }

  async #initializeLoader() {
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

    this.#currentSource = source;
    this.#playlist = null;
    this.#initializeVideo();
  }

  async #createPlaylist(playlist, defaultSource) {
    try {
      const { default: PlayList } = await import("./playlist.js");
      const { sources, ...playlistOptions } = playlist;

      return new PlayList({
        player: this,
        sources: [defaultSource, ...sources].filter(Boolean),
        ...playlistOptions,
      });
    } catch (error) {
      console.error("Error importing PlayList module:", error);
      throw error;
    }
  }

  async #initializeVideo() {
    this.#video = await ui.createVideo({
      src: this.source.src,
      width: this.#width,
      height: this.#height,
      volume: this.#volume,
      currentTime: this.source.currentTime,
      isMuted: this.#muted,
    });

    this.#setupVideoEvents();
  }

  async #initializeVideoStatusBar() {
    this.#videoStatusBar = await ui.createVideoStatusBar({
      player: this,
    });
  }

  async #initializePlaybackControls() {
    this.#playbackControls = await ui.createPlaybackControls({
      player: this,
    });
  }

  async #initializeVolumeControl() {
    this.#volumeControl = await ui.createVolumeControl({
      player: this,
    });
  }

  #setupVideoEvents() {
    this.#video.on("loadedMetaData", this.#onLoadedMetaData.bind(this));
    this.#video.on("timeUpdate", this.#onTimeUpdate.bind(this));
    this.#video.on("progress", this.#onProgress.bind(this));
    this.#video.on("play", this.#onPlay.bind(this));
    this.#video.on("pause", this.#onPause.bind(this));
    this.#video.on("waiting", this.#onWaiting.bind(this));
    this.#video.on("playing", this.#onPlaying.bind(this));
  }

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
  }

  async #onVideoReady() {
    this.#controls = new PlayerControls(this);
    await this.#controls.createControls();
    await this.#initializeVideoStatusBar();
    await this.#initializePlaybackControls();
    await this.#initializeVolumeControl();
    this.#isControlsReady = true;

    if (this.#autoplay) {
      this.play();
    }

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
  }

  #onPause() {
    if (!this.#isControlsReady) return;
    this.controls.buttons.play.icon = SVGIcons.PLAY;
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
}
