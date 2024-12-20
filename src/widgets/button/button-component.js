import { Dom } from "../../dom-utils/dom.js";
import { Controller } from "../controller.js";
import { Component } from "../component.js";

export default class ButtonComponent extends Component {
  static CLASS_NAME = "player-button-control";

  constructor(controller) {
    super(controller);
    this.init();
  }

  #setIcon(icon) {
    this.setHTML(icon.getHTML());
  }

  #handleClickEvent = () => {
    this.controller.emit(Controller.CLICK_EVT);
  };

  init() {
    if (this.controller.hasIcon()) {
      this.#setIcon(this.controller.getIcon());
      this.controller.on(Controller.ICON_CHANGE_EVT, (icon) => {
        this.#setIcon(icon);
      });
    }

    this.addClass(this.controller.isFilled() ? "filled-icon" : "outline-icon");

    this.on(Component.CLICK, this.#handleClickEvent);

    this.controller.on("enabledChange", (isEnabled) => {
      this.node.disabled = !isEnabled;
      if (isEnabled) {
        this.on(Component.CLICK, this.#handleClickEvent);
        this.removeClass("disabled");
      } else {
        this.off(Component.CLICK, this.#handleClickEvent);
        this.addClass("disabled");
      }
    });

    this.controller.on("selectedChange", (isSelected) => {
      if (isSelected) {
        this.addClass("selected");
      } else {
        this.removeClass("selected");
      }
    });
  }

  createElement() {
    return Dom.elm("button", {
      class: ButtonComponent.CLASS_NAME,
    });
  }
}
