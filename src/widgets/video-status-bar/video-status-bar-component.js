import { Component } from "../component.js";
import { Dom } from "../../dom/dom-utils.js";

export default class VideoStatusBarComponent extends Component {
  #ref = {
    videoTitleWrapper: this.createRef(),
    videoStatusControlsWrapper: this.createRef(),
  };

  constructor(widget) {
    super(widget);
    this.#init();
  }

  createElement() {
    return Dom.elm("div", {
      class: "video-status-bar",
    });
  }

  #init() {
    this.addClass("show");
    this.element.append([
      this.#createVideoStatusWrapper().element,
      this.#createVideoTimelineWrapper().element,
    ]);
  }

  #createVideoTitleWrapper() {
    const { textViews } = this.widget.controls;
    const titleComponent = textViews.title.component;
    const chapterTitleComponent = textViews.chapterTitle?.component;

    titleComponent.addClass("video-title");
    chapterTitleComponent?.addClass("video-chapter-title");

    return this.wrapper("div", "video-title-wrapper")
      .add(chapterTitleComponent)
      .add(titleComponent)
      .toRef(this.#ref.videoTitleWrapper);
  }

  #createVideoStatusControlsWrapper() {
    const { buttons } = this.widget.controls;
    return this.wrapper("div", "video-status-controls-wrapper")
      .add(buttons.chapters?.component)
      .add(buttons.playlist?.component)
      .add(buttons.shuffle.component)
      .add(buttons.repeat.component)
      .add(buttons.speed.component)
      .add(buttons.pictureInPicture.component)
      .add(buttons.fullscreen.component)
      .toRef(this.#ref.videoStatusControlsWrapper);
  }

  #createVideoStatusWrapper() {
    return this.wrapper("div", "video-status-wrapper")
      .add(this.#createVideoTitleWrapper())
      .add(this.#createVideoStatusControlsWrapper());
  }

  #createVideoSeekerWrapper() {
    return this.wrapper("div", "video-seeker-wrapper").add(
      this.widget.controls.sliders.seeker.component
    );
  }

  #createVideoTimeDisplayWrapper() {
    const { textViews } = this.widget.controls;
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
