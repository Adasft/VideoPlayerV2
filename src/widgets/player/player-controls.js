import { Controls } from "../../ui/controls.js";
import { noop, formatTime } from "../../utils.js";
import * as ui from "../../ui/ui-utils.js";
import SVGIcons from "../../ui/icons.js";

export default class PlayerControls {
  #controls;

  #conditionalControls = {
    handlePlaylistControls: noop,
    handleChaptersControls: noop,
    handleChapterTitle: noop,
    handleVolumeSlider: noop,
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

  async createControls() {
    const group = [
      this.#createButtonGroupControls(),
      this.#createSliderGroupControls(),
      this.#createTextViewGroupControls(),
    ];

    await this.#defineControlGroups(group);

    this.togglePlaylistControls();
    this.toggleChaptersControls();
  }

  togglePlaylistControls() {
    return this.#conditionalControls.handlePlaylistControls({
      buttons: {
        prev: { icon: SVGIcons.BACKWARD },
        next: { icon: SVGIcons.FORWARD },
        playlist: { icon: SVGIcons.PLAYLIST },
        shuffle: { icon: SVGIcons.SHUFFLE },
        loop: { icon: SVGIcons.REPEAT },
      },
      textViews: {
        currentSourceTitle: { text: this.player.playlist.currentSource.title },
      },
    });
  }

  toggleChaptersControls() {
    return this.#conditionalControls.handleChaptersControls({
      buttons: {
        chapters: { icon: SVGIcons.CHAPTERS },
      },
      textViews: {
        chapterTitle: { text: this.player.getCurrentChapterTitle() },
      },
    });
  }

  toggleVolumeSlider() {
    return this.#conditionalControls.handleVolumeSlider({
      volume: {
        volume: this.player.volume,
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

  #createConditionalHandler({ condition, groups }) {
    const handlers = groups.map((group) => [
      group.name,
      group.createWhen(condition),
    ]);

    return (options) => {
      return Promise.allSettled(
        handlers.map(([name, handler]) => handler(options[name]))
      );
    };
  }

  #defineConditionalControls() {
    this.#conditionalControls.handleVolumeSlider = this.sliders.createWhen(
      () => this.player.hasAudio
    );

    this.#conditionalControls.handlePlaylistControls =
      this.#createConditionalHandler({
        condition: () => this.player.hasPlaylist(),
        groups: [this.buttons, this.textViews],
      });

    this.#conditionalControls.handleChaptersControls =
      this.#createConditionalHandler({
        condition: () => this.player.hasChapters(),
        groups: [this.buttons, this.textViews],
      });
  }
}
