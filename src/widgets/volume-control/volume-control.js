import { Widget } from "../widget.js";
import SVGIcons from "../../ui/icons.js";

export default class VolumeControl extends Widget {
  #player;
  #lastVolume;

  get controls() {
    return this.#player.controls;
  }

  get player() {
    return this.#player;
  }

  #volumeLevels = {
    OFF: SVGIcons.VOLUME_OFF,
    LOW: SVGIcons.VOLUME_LOW,
    HIGH: SVGIcons.VOLUME_HIGH,
  };

  constructor({ player, hasAudio }) {
    super();
    this.#player = player;
    this.#lastVolume = this.#player.volume;

    this.#setVolumenButtonEvents();
    this.#setVolumeSliderEvents();

    console.log("hasAudio", hasAudio);
    // if (hasAudio) {
    this.toggleVolumeControls(hasAudio);
    // }

    // this.player.video.on("audioDetected", this.onAudioDetected.bind(this));
  }

  enableVolumeButton(isEnabled) {
    this.controls.buttons.volume.enabled = isEnabled;
  }

  async toggleVolumeControls(hasAudio) {
    await this.controls.createOrDestroyVolumeSlider();

    if (!hasAudio) {
      this.controls.buttons.volume.icon = SVGIcons.VOLUME_MUTED;
    }

    console.log("onAudioDetected", hasAudio);
    this.#setVolumeSliderEvents();
    this.enableVolumeButton(hasAudio);
    this.emit("audioDetected", hasAudio);
  }

  onVolumeChange(volume) {
    const { buttons } = this.controls;
    if (this.player.muted) this.player.muted = false;
    console.log("onVolumeChange", volume);
    this.player.volume = volume;
    buttons.volume.icon = this.#getVolumeIcon(volume);
  }

  onMutedChange() {
    const { sliders, buttons } = this.controls;
    if (this.player.volume > 0) {
      this.#lastVolume = this.player.volume;
    }

    const isMuted = !this.player.muted;
    const volume = isMuted ? 0 : this.#lastVolume;

    sliders.volume.setValue(volume);

    this.player.muted = isMuted;

    buttons.volume.icon = this.#getVolumeIcon(volume);
  }

  #getVolumeIcon(volume) {
    const volumeLevel = volume === 0 ? "OFF" : volume < 0.5 ? "LOW" : "HIGH";
    return this.#volumeLevels[volumeLevel];
  }

  #setVolumeSliderEvents() {
    const { sliders } = this.controls;
    if (!this.player.hasAudio) return;
    sliders.volume.on("valueChanged", this.onVolumeChange.bind(this));
  }

  #setVolumenButtonEvents() {
    const { buttons } = this.controls;
    buttons.volume.on("click", this.onMutedChange.bind(this));
  }
}
