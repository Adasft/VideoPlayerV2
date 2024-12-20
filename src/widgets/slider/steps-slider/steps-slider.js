import Slider from "../common/slider.js";

export default class StepsSlider extends Slider {
  #steps;
  get steps() {
    return this.#steps;
  }
  #showSteps;
  get showSteps() {
    return this.#showSteps;
  }
  #showLabels;
  get showLabels() {
    return this.#showLabels;
  }

  #stepTreatedCache = [];

  constructor({ value, steps, showSteps = false, showLabels = false }) {
    const min = steps.at(0);
    const max = steps.at(-1);
    super({
      value: value ?? min,
      min,
      max,
      enableHoverGrowth: false,
      hoverPadding: 10,
      showAlwaysThumb: true,
    });

    this.#steps = steps;
    this.#showSteps = showLabels || showSteps;
    this.#showLabels = showLabels;

    this.createTrack();
  }

  #getStepRange(value) {
    return this.#steps.filter((step, index) => {
      return (
        (step <= value && this.#steps[index + 1] > value) ||
        (this.#steps[index - 1] <= value && step > value)
      );
    });
  }

  #calculateStepProximity(value, startStep, endStep) {
    const stepDiff = endStep - startStep;
    return (stepDiff - (value - startStep)) / stepDiff;
  }

  #triggerSetValueForChanges(value, startStep, endStep) {
    const stepProximity = this.#calculateStepProximity(
      value,
      startStep,
      endStep
    );
    const newValue = stepProximity < 0.5 ? endStep : startStep;

    // Solo llama a super.setValue si el valor actual cambia
    if (this.getValue() !== newValue || this.#stepTreatedCache.length === 0) {
      super.setValue(newValue);
    }
  }

  initializeValue() {
    this.setValue(this.getValue());
  }

  getStepRatio(index) {
    const step = this.#steps[index];
    return (step - this.min) / (this.max - this.min);
  }

  getStepIndex(step) {
    return this.#steps.indexOf(step);
  }

  setValue(value) {
    value = this.clampValue(value);

    // Determinar los pasos de inicio y fin en los que cae el valor
    const [startStep, endStep] = this.#getStepRange(value);

    if (startStep === undefined || endStep === undefined) {
      return;
    }

    if (
      this.#stepTreatedCache[0] === startStep &&
      this.#stepTreatedCache[1] === endStep
    ) {
      this.#triggerSetValueForChanges(value, startStep, endStep);
      return;
    }

    this.#triggerSetValueForChanges(value, startStep, endStep);
    this.#stepTreatedCache = [startStep, endStep];
  }

  refresh({
    value,
    steps,
    showSteps = this.#showSteps,
    showLabels = this.#showLabels,
  }) {
    this.#steps = steps;
    this.min = steps.at(0);
    this.max = steps.at(-1);
    this.#showSteps = showLabels || showSteps;
    this.#showLabels = showLabels;

    this.track.destroy();

    this.createTrack();
    this.emit("refresh");
    this.setValue(value);
  }
}
