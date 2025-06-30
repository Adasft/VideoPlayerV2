import ButtonComponent from "../../button/button-component.js";
import PopoverComponent from "../popover-component.js";

export default class PlaylistPopoverComponent extends PopoverComponent {
  #ref = {
    currentSourceWrapper: this.createRef(),
  };
  constructor(widget) {
    super(widget);
    this.#init();
  }

  #init() {
    // console.log(this.#createHeaderWrapper());
    this.appendWrapper(this.#createHeaderWrapper());

    this.popover.player.on("sourceChange", (source) => {
      this.#ref.currentSourceWrapper.current.text(source.title);
    });
  }

  #createHeaderWrapper() {
    const { title, currentSource } = this.popover.player.playlist.data;
    const { buttons } = this.popover.player.controls;

    console.log(buttons);

    return this.wrapper("header", "playlist-popover-header")
      .add(this.wrapper("h2", "playlist-popover-title").text(title))
      .add(
        this.wrapper("div", "playlist-popover-current-source")
          .text("Reproduciendo: ")
          .add(
            this.wrapper("span", "playlist-popover-current-source-title")
              .text(currentSource.title)
              .toRef(this.#ref.currentSourceWrapper)
          )
      )
      .add(
        this.wrapper("div", "playlist-popover-controls")
          .add(buttons.shuffle.component)
          .add(buttons.loop.component)
      );
  }
}
