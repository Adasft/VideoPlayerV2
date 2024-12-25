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
  }

  onRefresh() {
    const { source } = this.player;
    const { sliders } = this.controls;

    const duration = this.player.duration;
    const currentTime = this.player.currentTime;
    const titleText = source.title;
    const chapterTitleText = this.player.getCurrentChapter()?.title ?? "";

    sliders.seeker.refresh({
      value: currentTime,
      min: 0,
      max: duration,
      chapters: source.chapters,
    });

    this.controls.createOrDestroyPlaylistControls();
    this.controls.createOrDestroyChaptersControls();
    this.controls.createOrDestroyChapterTitle();

    this.setTitle(titleText);
    this.setChapterTitle(chapterTitleText);
    this.setCurrentTimeText(currentTime);
    this.setDurationText(duration);

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

    seeker.on("valueChanged", (value) => {
      this.setCurrentTimeText(value);
    });

    seeker.on("dragStart", () => {
      this.player.pause();
    });

    seeker.on("dragEnd", () => {
      this.player.currentTime = seeker.getValue();
      this.player.play();
    });

    seeker.on("mousePressed", () => {
      this.player.pause();
      this.player.currentTime = seeker.getValue();
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

  #togglePipMode() {
    const { buttons } = this.controls;
    const isPiPActive = !this.player.isPiPActive;

    if (isPiPActive) {
      this.player.activatePip();
    } else {
      this.player.deactivatePip();
    }

    buttons.pictureInPicture.icon = isPiPActive
      ? SVGIcons.PICTURE_IN_PICTURE_ACTIVE
      : SVGIcons.PICTURE_IN_PICTURE;
    buttons.pictureInPicture.selected = isPiPActive;
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
