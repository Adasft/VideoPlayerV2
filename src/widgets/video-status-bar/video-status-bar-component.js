import { Component } from "../component.js";
import { Dom } from "../../dom/dom-utils.js";
import PlaylistPopoverComponent from "../popover/playlist-popover/playlist-popover-component.js";

export default class VideoStatusBarComponent extends Component {
  #refs = {
    videoTitleWrapper: this.createRef(),
    videoStatusControlsWrapper: this.createRef(),
  };

  constructor(widget) {
    super(widget);
    this.#init();
  }

  onRefresh() {
    const { buttons } = this.videoStatusBar.controls;

    this.#refs.videoTitleWrapper.current.prepend(
      this.#prepareChapterTitleForInsertion()
    );
    this.#refs.videoStatusControlsWrapper.current.prepend(
      buttons.chapters?.component
    );
  }

  createElement() {
    return Dom.elm("div", {
      class: "video-status-bar",
    });
  }

  #init() {
    this.addClass("show");
    this.appendWrapper(
      this.#createVideoStatusWrapper(),
      this.#createVideoTimelineWrapper()
    );

    if (this.videoStatusBar.player.hasPlaylist()) {
      new PlaylistPopoverComponent(this.videoStatusBar.popovers.playlist);
    }

    this.videoStatusBar.on("refresh", this.onRefresh.bind(this));
  }

  #prepareChapterTitleForInsertion() {
    const { textViews } = this.videoStatusBar.controls;
    const chapterTitleComponent = textViews.chapterTitle?.component;
    chapterTitleComponent?.addClass("video-chapter-title");
    return chapterTitleComponent;
  }

  #createVideoTitleWrapper() {
    const { textViews } = this.videoStatusBar.controls;
    const titleComponent = textViews.title.component;

    titleComponent.addClass("video-title");

    return this.wrapper("div", "video-title-wrapper")
      .add(this.#prepareChapterTitleForInsertion())
      .add(titleComponent)
      .toRef(this.#refs.videoTitleWrapper);
  }

  #createVideoStatusControlsWrapper() {
    const { buttons } = this.videoStatusBar.controls;
    return (
      this.wrapper("div", "video-status-controls-wrapper")
        .add(buttons.chapters?.component)
        .add(buttons.playlist?.component)
        // .add(buttons.shuffle.component)
        .add(buttons.repeat.component)
        .add(buttons.speed.component)
        .add(buttons.pictureInPicture.component)
        .add(buttons.fullscreen.component)
        .toRef(this.#refs.videoStatusControlsWrapper)
    );
  }

  #createVideoStatusWrapper() {
    return this.wrapper("div", "video-status-wrapper")
      .add(this.#createVideoTitleWrapper())
      .add(this.#createVideoStatusControlsWrapper());
  }

  #createVideoSeekerWrapper() {
    return this.wrapper("div", "video-seeker-wrapper").add(
      this.videoStatusBar.controls.sliders.seeker.component
    );
  }

  #createVideoTimeDisplayWrapper() {
    const { textViews } = this.videoStatusBar.controls;
    return this.wrapper("div", "video-time-display-wrapper")
      .add(textViews.currentTime.component)
      .add(textViews.duration.component);
  }

  #createVideoTimelineWrapper() {
    return this.wrapper("div", "video-timeline-wrapper")
      .add(this.#createVideoSeekerWrapper())
      .add(this.#createVideoTimeDisplayWrapper());
  }
}
