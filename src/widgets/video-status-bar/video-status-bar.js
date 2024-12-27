import { formatTime } from "../../utils.js";
import { Widget } from "../widget.js";
import SVGIcons from "../../ui/icons.js";

export default class VideoStatusBar extends Widget {
  #player;

  get player() {
    return this.#player;
  }

  get controls() {
    return this.#player.controls;
  }

  constructor({ player }) {
    super();
    this.#player = player;
    this.#initializeControlsEvents();

    this.#player.video.on("pictureInPictureExit", () => {
      this.#togglePiPButtonActive(false);
    });
  }

  async onRefresh() {
    const { source } = this.player;
    const { sliders } = this.controls;

    const duration = this.player.duration;
    const currentTime = this.player.currentTime;
    const titleText = source.title;

    await this.controls.createOrDestroyPlaylistControls();
    await this.controls.createOrDestroyChaptersControls();
    await this.controls.createOrDestroyChapterTitle();

    sliders.seeker.refresh({
      value: currentTime,
      min: 0,
      max: duration,
      chapters: source.chapters ?? [],
    });

    this.setTitle(titleText);
    this.setCurrentTimeText(currentTime);
    this.setDurationText(duration);

    if (this.player.hasChapters()) {
      const chapterTitleText = this.player.getCurrentChapterTitle();
      this.setChapterTitle(chapterTitleText);
    }

    this.emit("refresh");
  }

  setTitle(title) {
    this.controls.textViews.title.text = title;
  }

  setChapterTitle(title) {
    this.controls.textViews.chapterTitle.text = title;
  }

  setCurrentTimeText(time) {
    this.controls.textViews.currentTime.text = formatTime(time);
  }

  setDurationText(duration) {
    this.controls.textViews.duration.text = formatTime(duration);
  }

  #setupSeekerSliderEvents() {
    const { seeker } = this.controls.sliders;
    let isPlaying;

    seeker.on("drag", (value) => {
      this.setCurrentTimeText(value);
    });

    seeker.on("dragStart", () => {
      isPlaying = this.player.isPlaying;
      this.player.pause();
    });

    seeker.on("dragEnd", () => {
      this.player.currentTime = seeker.getValue();
      if (isPlaying) {
        this.player.play();
      }
    });

    seeker.on("mousePressed", () => {
      const value = seeker.getValue();
      this.player.currentTime = value;
      this.setCurrentTimeText(value);
    });

    seeker.on("trackChanged", ({ currentTrack }) => {
      this.setChapterTitle(currentTrack.getChapterTitle());
    });
  }

  #toggleRepeatMode() {
    const { video } = this.player;
    const { buttons } = this.controls;

    const modes = video.loopModes;
    const currentMode = video.getCurrentLoopMode();
    const nextMode = (currentMode + 1) % modes.length;

    video.loopMode = modes[nextMode];
    buttons.repeat.selected = nextMode !== 0;
    buttons.repeat.icon =
      modes[nextMode] === "infinite"
        ? SVGIcons.REPEAT
        : modes[nextMode] === "once"
        ? SVGIcons.REPEAT_ONCE
        : SVGIcons.REPEAT;
    video.loop = nextMode !== 0;
  }

  #toggleActiveRandomPlayback() {
    const { buttons } = this.controls;
    const isActiveRandomPlayback = !this.player.isActiveRandomPlayback;

    this.player.isActiveRandomPlayback = isActiveRandomPlayback;

    buttons.shuffle.selected = isActiveRandomPlayback;
    buttons.next.enabled = true;

    this.player.emit("activeRandomPlaybackChanged", isActiveRandomPlayback);
  }

  #togglePiPButtonActive(isPiPActive) {
    const { buttons } = this.controls;
    buttons.pictureInPicture.icon = isPiPActive
      ? SVGIcons.PICTURE_IN_PICTURE_ACTIVE
      : SVGIcons.PICTURE_IN_PICTURE;
    buttons.pictureInPicture.selected = isPiPActive;
  }

  #togglePipMode() {
    const isPiPActive = !this.player.isPiPActive;

    if (isPiPActive) {
      this.player.activatePip();
    } else {
      this.player.deactivatePip();
    }

    this.#togglePiPButtonActive(isPiPActive);
  }

  #setupButtonsEvents() {
    const { buttons } = this.controls;

    buttons.repeat.on("click", () => this.#toggleRepeatMode());
    buttons.shuffle.on("click", () => this.#toggleActiveRandomPlayback());
    buttons.pictureInPicture.on("click", () => this.#togglePipMode());

    // speed.on("click", () => {
    //   this.player.video.playbackRate =
    //     this.player.video.playbackRate === 0.5 ? 1 : 0.5;
    // });

    // fullscreen.on("click", () => {
    //   this.player.video.requestFullscreen();
    // });
  }

  #initializeControlsEvents() {
    this.#setupSeekerSliderEvents();
    this.#setupButtonsEvents();
  }
}
