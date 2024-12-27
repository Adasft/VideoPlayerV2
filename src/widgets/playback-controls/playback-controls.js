import { Widget } from "../widget.js";
import SVGIcons from "../../ui/icons.js";

export default class PlaybackControls extends Widget {
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
    this.emit("refresh");
  }

  #setupPlayButtonEvents() {
    const { buttons } = this.controls;

    buttons.play.on("click", () => {
      if (this.player.isPlaying) {
        this.player.pause();
        buttons.play.icon = SVGIcons.PLAY;
      } else {
        this.player.play();
        buttons.play.icon = SVGIcons.PAUSE;
      }
    });
  }

  #setupSkipButtonsEvents() {
    const { buttons } = this.controls;

    buttons.skipBack.on("click", () => {
      this.player.skipBack();
    });

    buttons.skipForward.on("click", () => {
      this.player.skipForward();
    });
  }

  #setupPlaylistButtonsEvents() {
    const { buttons } = this.controls;

    buttons.prev.on("click", () => {
      this.player.playlist.prev();
    });

    buttons.next.on("click", () => {
      this.player.playlist.next();
    });
  }

  #initializeControlsEvents() {
    this.#setupPlayButtonEvents();
    this.#setupSkipButtonsEvents();

    if (this.player.hasPlaylist()) {
      this.#setupPlaylistButtonsEvents();
    }
  }
}
