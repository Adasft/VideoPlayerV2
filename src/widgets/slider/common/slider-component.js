import { Component } from "../../component.js";
import { Dom } from "../../../dom/dom-utils.js";
import { SliderThumbComponent } from "./thumb-component.js";
import { SliderTrackComponent } from "../track/track-component.js";
import { throttle } from "../../../utils.js";

export default class SliderComponent extends Component {
  /**
   * Throttled para recalcular los bounds del slider.
   *
   * @type {(func: Function) => void}
   */
  #throttledBoundsRecalculation;

  /**
   * Indica si el mouse está dentro del slider.
   *
   * @type {boolean}
   */
  #isMouseEntered = false;

  /**
   * Crea un componente de slider.
   *
   * @param {Slider} widget - Instancia del slider.
   */
  constructor(widget) {
    super(widget);

    this.#throttledBoundsRecalculation = throttle(
      this.#resetBounds.bind(this),
      1000
    );

    this.#init();
  }

  createElement() {
    return Dom.elm("div", {
      class: "slider-container",
    });
  }

  disableHoverEffects(canUnbindGlobalEvents = true) {
    if (this.slider.isHoverGrowthEnabled()) {
      this.removeClass("hover");
    }

    if (!this.slider.showAlwaysThumb()) {
      this.slider.thumb.hide();
    }

    if (canUnbindGlobalEvents) this.#unbindGlobalEvents();
  }

  mousePositionToValue(mouseX) {
    const bounds = this.bounds;
    const max = this.slider.max;
    const min = this.slider.min;
    return ((mouseX - bounds.x) / bounds.width) * (max - min) + min;
  }

  onRefresh() {
    this.#appendTracks();
  }

  onMouseMove({ clientX }) {
    const { slider } = this;

    if (!slider.isMouseMoving) return;

    this.#throttledBoundsRecalculation();

    const value = this.mousePositionToValue(clientX);

    if (!slider.isMousePressed) {
      slider.emit("mouseMove", value);
      return;
    }

    if (!slider.isDragging) {
      slider.isDragging = true;
      slider.emit("dragStart", value);
    }

    if (!slider.isUpdateNotAllowed) {
      slider.emit("drag", value);
    }

    slider.setValue(value);
  }

  onMouseUp({ target }) {
    const { slider } = this;

    if (!this.#isMouseEntered) {
      const closestTarget = target.closest(".slider-container");
      const canUnbindGlobalEvents = !closestTarget;
      this.disableHoverEffects(canUnbindGlobalEvents);
    }

    slider.isDragging = false;
    slider.isMousePressed = false;

    Dom.enableSelection();
    Dom.setCursorDefault();

    slider.emit("dragEnd");
  }

  onMouseEnter() {
    const { slider } = this;
    this.#isMouseEntered = true;

    if (slider.isHoverGrowthEnabled()) {
      this.addClass("hover");
    }

    if (!slider.showAlwaysThumb()) {
      slider.thumb.show();
    }

    slider.isMouseMoving = true;
    this.#bindGlobalEvents();
  }

  onMouseLeave() {
    this.#isMouseEntered = false;

    if (this.slider.isDragging) return;

    this.disableHoverEffects();
  }

  onMouseDown({ clientX }) {
    const { slider } = this;

    Dom.disableSelection();
    Dom.setCursorPointer();

    const value = this.mousePositionToValue(clientX);

    slider.isMousePressed = true;
    slider.setValue(value);
    slider.emit("mousePressed", slider.getValue());
  }

  onMounted() {
    this.#bindMouseEvents();
    this.slider.initializeValue();
  }

  #init() {
    const { slider } = this;

    this.#setupSliderComponents();
    // this.#bindMouseEvents();

    slider.on("refresh", () => {
      this.onRefresh();
    });

    slider.on("mousePressed", () => {
      slider.thumb.component.addClass("active");
    });

    slider.on("dragEnd", () => {
      slider.thumb.component.removeClass("active");
    });
  }

  #setupSliderComponents() {
    this.append(new SliderThumbComponent(this.slider.thumb));
    this.#appendTracks();
  }

  #appendTracks() {
    const { tracks } = this.slider;
    for (const track of tracks) {
      this.append(new SliderTrackComponent(track));
    }
  }

  #resetBounds() {
    const { tracks } = this.slider;
    for (const track of tracks) {
      track.component.element.resetBounds();
    }
    this.element.resetBounds();
  }

  #bindMouseEvents() {
    this.on("mouseenter", this.onMouseEnter.bind(this));
    this.on("mouseleave", this.onMouseLeave.bind(this));
    this.on("mousedown", this.onMouseDown.bind(this));
  }

  #bindGlobalEvents() {
    Dom.on(document, "mousemove", this.onMouseMove.bind(this));
    Dom.on(document, "mouseup", this.onMouseUp.bind(this));
  }

  #unbindGlobalEvents() {
    this.slider.isMouseMoving = false;
    Dom.off(document, "mousemove");
    Dom.off(document, "mouseup");
  }
}
