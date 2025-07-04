import { Widget } from "../widget.js";
import SVGIcons from "../../ui/icons.js";
import Popover from "../popover/popover.js";
import PopoverComponent from "../popover/popover-component.js";

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

    if (this.player.muted) {
      this.#player.controls.buttons.volume.icon = SVGIcons.VOLUME_OFF;
    } else {
      this.#player.controls.buttons.volume.icon = this.#getVolumeIcon(
        this.player.volume
      );
    }

    this.refresh(this.player.hasAudio);
  }

  enableVolumeButton(isEnabled) {
    this.controls.buttons.volume.enabled = isEnabled;
  }

  async onRefresh(hasAudio) {
    await this.controls.createOrDestroyVolumeSlider();

    if (!hasAudio) {
      this.controls.buttons.volume.icon = SVGIcons.VOLUME_MUTED;
    } else if (this.player.autoplay && this.player.muted) {
      this.#player.controls.buttons.volume.icon = this.#volumeLevels.OFF;
      this.controls.sliders.volume.slideToStart();
    }

    this.#setVolumeSliderEvents();
    this.enableVolumeButton(hasAudio);
    this.emit("refresh", hasAudio);
  }

  onVolumeChange(volume) {
    const { buttons } = this.controls;

    if (volume === 0) {
      this.player.muted = true;
    } else if (this.player.muted) {
      this.player.muted = false;
    }

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
