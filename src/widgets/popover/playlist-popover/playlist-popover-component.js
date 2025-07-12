import { Dom } from "../../../dom/dom-utils.js";
import PopoverComponent from "../popover-component.js";

export default class PlaylistPopoverComponent extends PopoverComponent {
  constructor(widget) {
    super(widget);
  }

  onCreate() {
    super.onCreate();
    // console.log(this.#createHeaderWrapper());
    this.appendWrapper(this.#createHeaderWrapper());

    this.popover.player.on("sourceChange", (source) => {
      this.popover.player.controls.textViews.currentSourceTitle.text =
        source.title;
    });
  }

  #createHeaderWrapper() {
    const { title } = this.popover.player.playlist.data;
    const { buttons, textViews } = this.popover.player.controls;

    return this.wrapper("header", "playlist-popover-header")
      .add(this.wrapper("h2", "playlist-popover-title").text(title))
      .add(
        this.wrapper("div", "playlist-popover-current-source")
          .text("Reproduciendo: ")
          .add(textViews.currentSourceTitle.component)
      )
      .add(
        this.wrapper("div", "playlist-popover-controls")
          .add(buttons.shuffle.component)
          .add(buttons.loop.component)
      );
  }

  #createContentWrapper() {
    const observer = this.player.observeEvent("insertSource");

    // const text = Dom.text("").listenTo(sub)

    return this.wrapper("div", "playlist-popover-content").add(
      this.wrapper("div", "playlist-popover-info").reactiveText(
        observer.map(() => {
          const { size, currentIndex } = this.popover.player.playlist.data;
          return `Lista de videos (${currentIndex + 1} de ${size})`;
        })
      )
    );
  }
}
