import { Dom } from "../../dom/dom-utils.js";
import { Component } from "../component.js";

export default class TextViewComponent extends Component {
  #textNode;

  /**
   * Crea un componente de texto virtual del controlador
   *
   * @param {Text} widget
   */
  constructor(widget) {
    super(widget);
    this.#init();
  }

  #init() {
    const { textView } = this;
    this.#textNode = Dom.text(textView.text);
    this.element.append([this.#textNode]);

    textView.on("change", (value) => {
      this.#textNode.setText(value);
    });
  }

  createElement() {
    return Dom.elm("div", {
      class: "player-text-view",
    });
  }
}
