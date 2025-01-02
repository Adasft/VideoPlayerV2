import { Widget } from "../widget.js";
import SVGIcons from "../../ui/icons.js";

export default class PlaybackControls extends Widget {
  #player;

  constructor({ player }) {
    super();
    this.#player = player;
    this.#initializeControlsEvents();
  }

  get player() {
    return this.#player;
  }

  get controls() {
    return this.#player.controls;
  }

  onRefresh() {
    this.emit("refresh");
  }

  #setPlayButtonEvents() {
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

    buttons.reload.on("click", () => {
      this.player.play();
      buttons.play.show();
      buttons.reload.hide();
    });
  }

  #setSkipButtonsEvents() {
    const { buttons } = this.controls;

    buttons.skipBack.on("click", () => {
      this.player.skipBack();
    });

    buttons.skipForward.on("click", () => {
      this.player.skipForward();
    });
  }

  #setPlaylistButtonsEvents() {
    const { buttons } = this.controls;

    buttons.prev.on("click", () => {
      this.player.playlist.prev();

      if (this.player.playlist.size > 1) {
        buttons.next.enabled = true;
      }
    });

    buttons.next.on("click", () => {
      const currentSource = this.player.source;
      const currentTime = currentSource.currentTime;

      if (currentTime >= this.player.duration) {
        currentSource.currentTime = 0;
      }

      this.player.playlist.next();

      if (this.player.playlist.isEndOfList && !this.player.playlist.loop) {
        buttons.next.enabled = false;
      }
    });
  }

  #initializeControlsEvents() {
    this.#setPlayButtonEvents();
    this.#setSkipButtonsEvents();

    if (this.player.hasPlaylist()) {
      this.#setPlaylistButtonsEvents();
    }
  }
}
