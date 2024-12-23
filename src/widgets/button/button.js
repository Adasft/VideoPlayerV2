// import ClickableEventWidget from "../eventWidgets/clickableEventWidget.js";
import { Widget } from "../widget.js";
import { SVGIcon } from "../../ui/icons.js";

export default class Button extends Widget {
  /**
   * Icono del boton
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
  }

  set enabled(isEnabled) {
    this.#isEnabled = isEnabled;
    this.emit("enabledChange", isEnabled);
  }

  get enabled() {
    return this.#isEnabled;
  }

  get hasFilledIcon() {
    return this.#icon.isFilled();
  }

  /**
   * Establece el icono del boton
   *
   * @param {SVGIcon} icon
   */
  set icon(icon) {
    if (this.#icon === icon) return;
    this.#icon = icon;
    this.emit("iconChange", icon);
  }

  /**
   * Retorna el icono del boton
   *
   * @returns {SVGIcon}
   */
  get icon() {
    return this.#icon;
  }

  /**
   * Retorna si el boton tiene un icono
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
