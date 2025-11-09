import { map, startWith } from "../../../utils/observable/operators.js";
import { createSignal } from "../../../utils/signals.js";
import PopoverComponent from "../popover-component.js";

export default class PlaylistPopoverComponent extends PopoverComponent {
  #currentPlaylistIndex = createSignal(this.#getCurrentPlaylistIndex());

  constructor(widget) {
    super(widget);
  }

  onCreate() {
    super.onCreate();

    const { player } = this.popover;
    const { textViews } = player.controls;

    this.appendWrapper(
      this.#createHeaderWrapper(),
      this.#createContentWrapper()
    );

    // Update the current source title when the source changes
    player.on("sourceChanged", (source) => {
      textViews.currentSourceTitle.text = source.title;
    });

    player.on("sourceInserted", () => {
      this.#currentPlaylistIndex.value = this.#getCurrentPlaylistIndex();
    });
  }

  #createHeaderWrapper() {
    const { player } = this.popover;
    const { title } = player.playlist;
    const { buttons, textViews } = player.controls;

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
    // const { player } = this.popover;
    // const { playlist } = player;

    // const playlist$ = new BehaviorSubject(playlist.sources);

    // player
    //   .observeEvent(["sourceInserted", "sourceRemoved", "sourceMoved"])
    //   .subscribe(() => {
    //     playlist$.next([...playlist.sources]);
    //   });

    return this.wrapper("div", "playlist-popover-content")
      .add(
        this.wrapper("div", "playlist-popover-info").text(
          "Lista de videos ",
          this.#currentPlaylistIndex
        )
      )
      .add(
        this.wrapper("section", "playlist-popover-videos").add(
          this.wrapper("ul", "playlist-popover-list")
          // .repeat((item) => {

          // }, { items: [], watch: "" })
        )
      );
  }

  #getCurrentPlaylistIndex$() {
    return this.popover.player
      .observeEvent(["sourceInserted", "sourceChanged"])
      .pipe(
        startWith(),
        map(() => {
          const { size, currentIndex } = this.popover.player.playlist.data;
          return `(${currentIndex + 1} de ${size})`;
        })
      );
  }

  #getCurrentPlaylistIndex() {
    const { size, currentIndex } = this.popover.player.playlist.data;
    return `(${currentIndex + 1} de ${size})`;
  }
}
