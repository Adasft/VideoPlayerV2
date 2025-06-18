import { Widget } from "../widget.js";
export default class Popover extends Widget {
  #preventOverflow;
  #target;
  #delay;
  #placement;
  #offset;
  #arrowAlign;

  #isOpen = false;

  constructor({
    player,
    target,
    preventOverflow = false,
    delay = 0,
    placement = "top",
    offset = 0,
  }) {
    super("popover");

    if (!target) {
      throw new Error("Popover requires a target element.");
    }

    this.player = player;
    this.#target = target;
    this.#preventOverflow = preventOverflow;
    this.#delay = delay;
    this.#placement = placement;
    this.#offset = offset;

    this.on("opened", () => {
      this.#isOpen = true;
    });

    this.on("closed", () => {
      this.#isOpen = false;
    });
  }

  get target() {
    return this.#target;
  }

  get preventOverflow() {
    return this.#preventOverflow;
  }

  get delay() {
    return this.#delay;
  }

  get placement() {
    return this.#placement;
  }

  get offset() {
    return this.#offset;
  }

  get isOpen() {
    return this.#isOpen;
  }

  open() {
    if (this.#isOpen) return;
    this.emit("startOpen");
  }

  close() {
    if (!this.#isOpen) return;
    this.emit("startClose");
  }
}
