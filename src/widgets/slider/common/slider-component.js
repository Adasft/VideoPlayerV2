import { Component } from "../../component.js";
import { Dom } from "../../../dom-utils/dom.js";
import { SliderThumbComponent } from "./thumb-component.js";
import { SliderTrackComponent } from "../track/track-component.js";
import { throttle } from "../../../utils.js";
import SeekerSlider from "../seeker-slider/seeker-slider.js";
// import { Slider } from "./slider.js";

export default class SliderComponent extends Component {
  // static hasSliderDragged = false;

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
    slider.on("trackChanged", this.onTrackChanged.bind(this));
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

  #disableHoverEffects(canUnbindGlobalEvents = true) {
    const { controller: slider } = this;

    if (slider.isHoverGrowthEnabled()) {
      this.element.removeClass("hover");
    }

    if (!slider.showAlwaysThumb()) {
      slider.thumb.hide();
    }

    if (slider.hasChapters?.()) {
      slider.track.component.element.removeClass("active");
    }

    if (canUnbindGlobalEvents) this.#unbindGlobalEvents();
  }

  #resetIndicatorTrackBars() {
    const { controller: slider } = this;

    if (!(slider instanceof SeekerSlider)) return;

    if (slider.hasChapters?.()) {
      slider.multiTrackManager.rasterizeTrackBar({
        direction: "prev",
        mode: "reset",
        barName: "indicator",
        activeTrack: slider.indicatorTrack,
      });
    }
    slider.indicatorTrack.bars.indicator.reset();
    slider.clearIndicatorTrack();
  }

  #mousePositionToValue(mouseX) {
    const bounds = this.bounds;
    const max = this.controller.max;
    const min = this.controller.min;
    return ((mouseX - bounds.x) / bounds.width) * (max - min) + min;
  }

  onRefresh() {
    this.#appendTracks();
  }

  onTrackChanged({ currentTrack, oldTrack }) {
    const { isDragging } = this.controller;
    if (!isDragging) return;
    currentTrack.component.element.addClass("active");
    oldTrack?.component.element.removeClass("active");
  }

  onMouseMove({ clientX }) {
    const { controller: slider } = this;

    if (!slider.isMouseMoving) return;

    this.#throttledBoundsRecalculation();

    const value = this.#mousePositionToValue(clientX);

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
      this.#disableHoverEffects(canUnbindGlobalEvents);
    }

    slider.isDragging = false;
    slider.isMousePressed = false;

    Dom.enableSelection();
    Dom.setCursorDefault();

    // if (SliderComponent.hasSliderDragged) {
    //   slider.emit("dragEnd");
    // }

    slider.emit("dragEnd");

    // SliderComponent.hasSliderDragged = false;
  }

  onMouseEnter() {
    const { controller: slider } = this;
    this.#isMouseEntered = true;

    // if (SliderComponent.hasSliderDragged) return;

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

    // if (SliderComponent.hasSliderDragged || slider.isDragging) return;
    if (slider.isDragging) return;

    this.#disableHoverEffects();
    this.#resetIndicatorTrackBars();
  }

  onMouseDown({ clientX }) {
    const { controller: slider } = this;

    Dom.disableSelection();
    Dom.setCursorPointer();

    this.#resetIndicatorTrackBars();

    const value = this.#mousePositionToValue(clientX);

    slider.isMousePressed = true;
    slider.setValue(value);
    slider.emit("mousePressed", slider.getValue());
  }

  onMounted() {
    this.controller.initializeValue();
  }

  createElement() {
    const hasChapters = !!this.controller.hasChapters?.();
    return Dom.elm("div", {
      class: hasChapters ? "slider-container has-chapters" : "slider-container",
    });
  }
}
