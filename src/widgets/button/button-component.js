import { Dom } from "../../dom/dom-utils.js";
// import { Widget } from "../widget.js";
import { Component } from "../component.js";

export default class ButtonComponent extends Component {
  constructor(widget) {
    super(widget);
    this.init();
  }

  #setIcon(icon) {
    this.element.innerHTML = icon.getHTML();
  }

  #handleClickEvent = () => {
    this.widget.emit("click");
  };

  init() {
    if (this.widget.hasIcon) {
      this.#setIcon(this.widget.icon);
      this.widget.on("iconChange", (icon) => {
        this.#setIcon(icon);
      });
    }

    this.addClass(this.widget.isFilled ? "filled-icon" : "outline-icon");

    this.on("click", this.#handleClickEvent);

    this.widget.on("enabledChange", (isEnabled) => {
      this.node.disabled = !isEnabled;
      if (isEnabled) {
        this.on("click", this.#handleClickEvent);
        this.removeClass("disabled");
      } else {
        this.off("click", this.#handleClickEvent);
        this.addClass("disabled");
      }
    });

    this.widget.on("selectedChange", (isSelected) => {
      if (isSelected) {
        this.addClass("selected");
      } else {
        this.removeClass("selected");
      }
    });
  }

  createElement() {
    return Dom.elm("button", {
      class: "player-button-control",
    });
  }
}
