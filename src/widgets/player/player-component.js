import { Component } from "../component.js";
import { Dom } from "../../dom/dom-utils.js";

export default class PlayerComponent extends Component {
  constructor(widget) {
    super(widget);
  }

  createElement() {
    return Dom.elm("div", {
      class: "player-container",
    });
  }

  onControlsReady() {
    const videoStatusBarComponent = this.player.videoStatusBar.component;
    const playbackControlsComponent = this.player.playbackControls.component;
    const volumeControlComponent = this.player.volumeControl.component;
    this.append(
      videoStatusBarComponent,
      playbackControlsComponent,
      volumeControlComponent
    );
  }

  onVideoReady() {
    this.appendWrapper(this.#createVideoContainerWrapper());
  }

  onCreate() {
    this.css({
      width: `${this.player.width}px`,
      height: `${this.player.height}px`,
    });

    this.player.once("controlsReady", this.onControlsReady.bind(this));
    this.player.once("videoReady", this.onVideoReady.bind(this));
  }

  #createVideoContainerWrapper() {
    return this.wrapper("div", "player-video-container").add(
      this.player.video.component
    );
  }
}
