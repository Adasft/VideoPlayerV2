import { Controls } from "../../ui/controls.js";
import { noop, formatTime } from "../../utils.js";
import * as ui from "../../ui/ui-utils.js";
import SVGIcons from "../../ui/icons.js";

export default class PlayerControls {
  #controls;

  #conditionalControls = {
    createOrDestroyPlaylistControls: noop,
    createOrDestroyChaptersControls: noop,
    createOrDestroyChapterTitle: noop,
    createOrDestroyVolumeSlider: noop,
  };

  constructor(player) {
    this.player = player;
    this.#controls = new Controls();
  }

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
      volume: {
        volume: this.player.volume,
        // this.player.autoplay && this.player.muted ? 0 : this.player.volume,
      },
    });
  }

  #getSkipTimeIcon(skipTime, suffix) {
    return SVGIcons[`SKIP_${skipTime}_${suffix}`];
  }

  #createButtonGroupControls() {
    const skipTime = this.player.skipTime;

    const controls = {
      play: { icon: SVGIcons.PLAY },
      reload: { icon: SVGIcons.RELOAD },
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
