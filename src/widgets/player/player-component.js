import { Component } from "../component.js";
import { Dom } from "../../dom/dom-utils.js";

export default class PlayerComponent extends Component {
  constructor(widget) {
    super(widget);
    this.#init();
  }

  createElement() {
    return Dom.elm("div", {
      class: "player-container",
    });
  }

  #init() {
    this.css({
      width: `${this.widget.width}px`,
      height: `${this.widget.height}px`,
    });

    this.widget.once("controlsReady", () => {
      const videoStatusBarComponent = this.widget.videoStatusBar.component;
      this.append(videoStatusBarComponent);
    });

    this.widget.once("videoReady", () => {
      this.element.append([this.#createVideoContainerWrapper().element]);
    });
  }

  #createVideoContainerWrapper() {
    return this.wrapper("div", "player-video-container").add(
      this.widget.video.component
    );
  }
}
