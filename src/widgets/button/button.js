// import ClickableEventController from "../eventControllers/clickableEventController.js";
import { Controller } from "../controller.js";
import { SVGIcon } from "../../ui/icons.js";

export default class Button extends Controller {
  /**
   * Icono del controller
   *
   * @type {SVGIcon}
   */
  #icon;
  #isEnabled = true;
  #isSelected = false;

  constructor({ icon }) {
    super();
    if (!(icon instanceof SVGIcon)) {
      throw new Error("Invalid icon type, must be an instance of SVGIcon");
    }
    this.#icon = icon;
    // this.injectEventController(new ClickableEventController(this.eventBus));
  }

  // setEnabled(isEnabled) {
  //   this.#isEnabled = isEnabled;
  //   this.emit("enabledChange", isEnabled);
  // }

  // isEnabled() {
  //   return this.#isEnabled;
  // }

  set enabled(isEnabled) {
    this.#isEnabled = isEnabled;
    this.emit("enabledChange", isEnabled);
  }

  get enabled() {
    return this.#isEnabled;
  }

  // isFilled() {
  //   return this.#icon.isFilled();
  // }

  get hasFilledIcon() {
    return this.#icon.isFilled();
  }

  /**
   * Establece el icono del controller
   *
   * @param {SVGIcon} icon
   */
  set icon(icon) {
    if (this.#icon === icon) return;
    this.#icon = icon;
    this.emit("iconChange", icon);
  }

  /**
   * Retorna el icono del controller
   *
   * @returns {SVGIcon}
   */
  get icon() {
    return this.#icon;
  }

  /**
   * Retorna si el controller tiene un icono
   *
   * @returns {boolean}
   */
  get hasIcon() {
    return !!this.#icon;
  }

  set selected(isSelected) {
    this.#isSelected = isSelected;
    this.emit("selectedChange", isSelected);
  }

  get selected() {
    return this.#isSelected;
  }
}
