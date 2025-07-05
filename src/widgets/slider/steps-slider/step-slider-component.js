import { Dom } from "../../../dom-utils/dom.js";
import SliderComponent from "../common/slider-component.js";

export default class StepsSliderComponent extends SliderComponent {
  #stepElementsSet = [];
  #lastStepIndex = null;

  constructor(widget) {
    super(widget);
  }

  onValueChanged(step) {
    const { slider } = this;
    const stepIndex = slider.getStepIndex(step);
    const activateStepsLeft =
      this.#lastStepIndex < stepIndex || this.#lastStepIndex === null;

    if (activateStepsLeft) {
      for (let i = 0; i < stepIndex; i++) {
        this.#getStepElementByIndex(i).addClass("active");
      }
    } else {
      for (let i = stepIndex; i < this.#stepElementsSet.length; i++) {
        this.#getStepElementByIndex(i).removeClass("active");
      }
    }

    this.#selectStep(stepIndex);

    this.#lastStepIndex = stepIndex;
  }

  onRefresh() {
    super.onRefresh();

    this.#removeSteps();
    this.slider.off("valueChanged");
    this.#createSteps();
    this.#createStepsLabels();
  }

  onCreate() {
    this.element.addClass("steps-slider");

    this.#createSteps();
    this.#createStepsLabels();
  }

  #getStepElementByIndex(index) {
    return this.#stepElementsSet.at(index);
  }

  #createSteps() {
    const { widget: slider } = this;
    const { steps } = slider;

    if (!slider.showSteps) return;

    for (let i = 0; i < steps.length; i++) {
      const stepElement = Dom.elm("span", {
        class: "slider-step-point",
      });

      const stepRatio = slider.getStepRatio(i);

      stepElement.css({
        left: `calc(${stepRatio * 100}% - var(--player-slider-step-size) / 2)`,
      });

      this.element.append([stepElement]);
      this.#stepElementsSet.push(stepElement);
    }

    this.slider.on("valueChanged", this.onValueChanged.bind(this));
  }

  #removeSteps() {
    for (const stepElement of this.#stepElementsSet) {
      stepElement.destroy();
    }

    this.#stepElementsSet = [];
    this.#lastStepIndex = null;
  }

  #createStepsLabels() {
    const { slider } = this;

    if (!slider.showLabels) return;

    for (let i = 0; i < this.#stepElementsSet.length; i++) {
      const stepElement = this.#getStepElementByIndex(i);
      const step = slider.steps[i];
      const stepLabelElement = Dom.elm(
        "span",
        {
          class: "slider-step-label with-steps",
        },
        step
      );

      stepLabelElement.on("click", () => {
        slider.setValue(step);
      });

      stepElement.append([stepLabelElement]);
    }
  }

  #selectStep(currentStepIndex) {
    const lastStepElement = this.#getStepElementByIndex(this.#lastStepIndex);
    const currentStepElement = this.#getStepElementByIndex(currentStepIndex);

    if (lastStepElement) {
      lastStepElement.removeClass("selected");
    }

    currentStepElement.addClass("selected");
  }
}
