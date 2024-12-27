import { Component } from "../component.js";
import { Dom } from "../../dom/dom-utils.js";

export default class VolumeControlsComponent extends Component {
  #ref = {
    volumeSliderWrapper: this.createRef(),
  };

  constructor(widget) {
    super(widget);
    this.#init();
  }

  createElement() {
    return Dom.elm("div", {
      class: "player-volume-controls",
    });
  }

  #init() {
    const { controls } = this.volumeControl;
    this.addClass("show");

    // this.append(controls.sliders.volume.component);
    // this.appendWrapper(this.#createVolumeSliderWrapper());
    this.append(controls.buttons.volume.component);
    this.appendWrapper(this.#createVolumeSliderWrapper());

    this.volumeControl.on("audioDetected", (hasAudio) => {
      if (hasAudio) {
        // console.log("hasAudio", controls.sliders.volume.component);
        this.#ref.volumeSliderWrapper.current.add(
          controls.sliders.volume.component
        );
      }
    });
  }

  #createVolumeSliderWrapper() {
    const { sliders } = this.volumeControl.controls;
    const { volume } = sliders;

    return this.wrapper("div", "player-volume-slider-wrapper")
      .add(volume.component)
      .toRef(this.#ref.volumeSliderWrapper);
  }

  // #createVolumeSliderWrapper() {
  //   const { sliders } = this.widget.controls;
  //   const { volume } = sliders;

  //   return this.wrapper("div", "player-volume-slider-wrapper")
  //     .add(volume.component)
  //     .toRef(this.#ref.volumeSlider);
  // }
}
