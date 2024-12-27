import { Component } from "../component.js";
import { Dom } from "../../dom/dom-utils.js";

export default class PlaybackControlsComponent extends Component {
  #ref = {
    playbackButtonsWrapper: this.createRef(),
  };

  constructor(widget) {
    super(widget);
    this.#init();
  }

  createElement() {
    return Dom.elm("div", {
      class: "player-playback-controls",
    });
  }

  #init() {
    const { buttons } = this.playbackControls.controls;

    this.append(buttons.skipBack.component);
    this.appendWrapper(this.#createPlaybackButtonsWrapper());
    this.append(buttons.skipForward.component);
  }

  #createPlayAndLoaderWrapper() {
    const { playbackControls } = this;
    const { buttons } = playbackControls.controls;
    const loaderComponent = playbackControls.player.loader.component;

    loaderComponent.hide();
    buttons.play.component.addClass("play-button");

    return this.wrapper("div", "player-play-and-loader-wrapper")
      .add(buttons.play.component)
      .add(loaderComponent);
  }

  #createPlaybackButtonsWrapper() {
    const { buttons } = this.playbackControls.controls;

    return this.wrapper("div", "player-playback-buttons-wrapper")
      .add(buttons.prev?.component)
      .add(this.#createPlayAndLoaderWrapper())
      .add(buttons.next?.component)
      .toRef(this.#ref.playbackButtonsWrapper);
  }
}
