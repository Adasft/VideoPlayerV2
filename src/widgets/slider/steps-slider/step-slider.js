import Slider from "../common/slider.js";

export default class StepSlider extends Slider {
  /**
   * Pasos que representan los valores del slider.
   *
   * @type {number[]}
   */
  #steps;

  /**
   * Indica si se deben mostrar los pasos o no.
   *
   * @type {boolean}
   */
  #showSteps;

  /**
   * Indica si se deben mostrar las etiquetas o no.
   *
   * @type {boolean}
   */
  #showLabels;

  /**
   * Cache para no llamar a setValue si el valor actual no cambia
   *
   * @type {[number, number]}
   */
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

  get steps() {
    return this.#steps;
  }

  get showSteps() {
    return this.#showSteps;
  }

  get showLabels() {
    return this.#showLabels;
  }

  /**
   * Calcula el porcentaje que representa el paso en el slider.
   *
   * @param {number} index - El índice del paso.
   * @returns {number} - El porcentaje que representa el paso en el slider.
   */
  getStepRatio(index) {
    const step = this.#steps[index];
    return (step - this.min) / (this.max - this.min);
  }

  getStepIndex(step) {
    return this.#steps.indexOf(step);
  }

  setValue(value) {
    // Determinar los pasos de inicio y fin en los que cae el valor
    const [startStep, endStep] = this.#getStepRange(this.clampValue(value));

    if (startStep === undefined || endStep === undefined) {
      return;
    }

    this.#triggerSetValueForChanges(value, startStep, endStep);

    if (
      this.#stepTreatedCache[0] !== startStep &&
      this.#stepTreatedCache[1] !== endStep
    ) {
      this.#stepTreatedCache = [startStep, endStep];
    }
  }

  onRefresh({
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

  /**
   * Devuelve un array con los pasos de inicio y fin en los que cae el valor actual.
   *
   * @param {number} value - El valor actual del slider.
   * @returns {[number | undefined, number | undefined]} - El array con los pasos de inicio y fin en los que cae el valor actual.
   */
  #getStepRange(value) {
    return this.#steps.filter(
      (step, index) =>
        (step <= value && this.#steps[index + 1] > value) ||
        (this.#steps[index - 1] <= value && step > value)
    );
  }

  /**
   * Calcula la proximidad del valor actual en relación con los pasos de inicio y fin.
   *
   * @param {number} value - El valor actual del slider.
   * @param {number} startStep - El paso de inicio en el que cae el valor actual.
   * @param {number} endStep - El paso de fin en el que cae el valor actual.
   * @returns {number} - La proximidad del valor actual en relación con los pasos de inicio y fin.
   */
  #calculateStepProximity(value, startStep, endStep) {
    const stepDiff = endStep - startStep;
    return (stepDiff - (value - startStep)) / stepDiff;
  }

  /**
   * Llama a setValue si el valor actual cambia y los pasos de inicio y fin no han sido tratados previamente.
   *
   * @param {number} value - El valor actual del slider.
   * @param {number} startStep - El paso de inicio en el que cae el valor actual.
   * @param {number} endStep - El paso de fin en el que cae el valor actual.
   */
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
}
