import { Component } from "../../component.js";
import { Dom } from "../../../dom/dom-utils.js";
import { SliderThumbComponent } from "./thumb-component.js";
import { SliderTrackComponent } from "../track/track-component.js";
import { throttle } from "../../../utils.js";

export default class SliderComponent extends Component {
  #throttledBoundsRecalculation;
  #isMouseEntered = false;

  constructor(controller) {
    super(controller);
    this.#throttledBoundsRecalculation = throttle(
      this.#recalculateBounds.bind(this),
      1000
    );
    this.setOnMount();
    this.#init();
  }

  #init() {
    const slider = this.controller;
    this.#setupSliderComponents();
    this.#bindMouseEvents();

    slider.on("refresh", () => {
      this.onRefresh();
    });
    slider.on("mousePressed", () => {
      slider.thumb.component.element.addClass("active");
    });
    slider.on("dragEnd", () => {
      slider.thumb.component.element.removeClass("active");
    });
  }

  #setupSliderComponents() {
    this.append(new SliderThumbComponent(this.controller.thumb));
    this.#appendTracks();
  }

  #appendTracks() {
    for (const track of this.controller.tracks) {
      this.append(new SliderTrackComponent(track));
    }
  }

  #recalculateBounds() {
    const { tracks } = this.controller;
    for (const track of tracks) {
      track.component.element.recalculateBounds();
    }
    this.element.recalculateBounds();
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
    this.controller.isMouseMoving = false;
    Dom.off(document, "mousemove");
    Dom.off(document, "mouseup");
  }

  disableHoverEffects(canUnbindGlobalEvents = true) {
    const { controller: slider } = this;

    if (slider.isHoverGrowthEnabled()) {
      this.element.removeClass("hover");
    }

    if (!slider.showAlwaysThumb()) {
      slider.thumb.hide();
    }

    if (canUnbindGlobalEvents) this.#unbindGlobalEvents();
  }

  mousePositionToValue(mouseX) {
    const bounds = this.bounds;
    const max = this.controller.max;
    const min = this.controller.min;
    return ((mouseX - bounds.x) / bounds.width) * (max - min) + min;
  }

  onRefresh() {
    this.#appendTracks();
  }

  onMouseMove({ clientX }) {
    const { controller: slider } = this;

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
    const { controller: slider } = this;

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
    const { controller: slider } = this;
    this.#isMouseEntered = true;

    if (slider.isHoverGrowthEnabled()) {
      this.element.addClass("hover");
    }

    if (!slider.showAlwaysThumb()) {
      slider.thumb.show();
    }

    slider.isMouseMoving = true;
    this.#bindGlobalEvents();
  }

  onMouseLeave() {
    const { controller: slider } = this;
    this.#isMouseEntered = false;

    if (slider.isDragging) return;

    this.disableHoverEffects();
  }

  onMouseDown({ clientX }) {
    const { controller: slider } = this;

    Dom.disableSelection();
    Dom.setCursorPointer();

    const value = this.mousePositionToValue(clientX);

    slider.isMousePressed = true;
    slider.setValue(value);
    slider.emit("mousePressed", slider.getValue());
  }

  onMounted() {
    this.controller.initializeValue();
  }

  createElement() {
    return Dom.elm("div", {
      class: "slider-container",
    });
  }
}
