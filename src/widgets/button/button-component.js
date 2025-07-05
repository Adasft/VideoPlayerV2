import { Dom } from "../../dom/dom-utils.js";
import { Component } from "../component.js";

export default class ButtonComponent extends Component {
  constructor(widget) {
    super(widget);
  }

  createElement() {
    return Dom.elm("button", {
      class: "player-button-control",
    });
  }

  onClick = () => {
    this.button.emit("click");
  };

  onEnabledChange(isEnabled) {
    this.node.disabled = !isEnabled;
    if (isEnabled) {
      this.on("click", this.onClick);
      this.removeClass("disabled");
    } else {
      this.off("click", this.onClick);
      this.addClass("disabled");
    }
  }

  onSelectedChange(isSelected) {
    if (isSelected) {
      this.addClass("selected");
    } else {
      this.removeClass("selected");
    }
  }

  onIconChange(icon) {
    this.#setIcon(icon);
  }

  onVisibilityChange(isVisible) {
    isVisible ? this.show() : this.hide();
  }

  onMounted() {
    this.on("click", this.onClick);
  }

  onCreate() {
    const { button } = this;

    if (button.hasIcon) {
      this.#setIcon(button.icon);

      button.on("iconChange", this.onIconChange.bind(this));
    }

    this.addClass(button.hasFilledIcon ? "filled-icon" : "outline-icon");

    button.on("enabledChange", this.onEnabledChange.bind(this));
    button.on("selectedChange", this.onSelectedChange.bind(this));
    button.on("visibilityChange", this.onVisibilityChange.bind(this));
  }

  #setIcon(icon) {
    this.element.setHTML(icon.getHTML());
  }
}
