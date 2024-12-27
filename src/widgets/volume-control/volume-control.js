import { Widget } from "../widget.js";
import SVGIcons from "../../ui/icons.js";

export default class VolumeControl extends Widget {
  #player;

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

  constructor({ player }) {
    super();
    this.#player = player;

    this.#initializeControlsEvents();

    this.player.video.on("audioDetected", this.onAudioDetected.bind(this));
  }

  enableVolumeButton(isEnabled) {
    this.controls.buttons.volume.enabled = isEnabled;
  }

  async onAudioDetected(hasAudio) {
    console.log("onAudioDetected", hasAudio);
    await this.controls.createOrDestroyVolumeSlider();
    this.enableVolumeButton(hasAudio);
    this.emit("audioDetected", hasAudio);
  }

  #getVolumeIcon(volume) {
    const volumeLevel = volume === 0 ? "OFF" : volume < 0.5 ? "LOW" : "HIGH";
    return this.#volumeLevels[volumeLevel];
  }

  #initializeControlsEvents() {
    const { sliders, buttons } = this.controls;
    let lastVolume;

    sliders.volume.on("valueChanged", (value) => {
      if (this.player.muted) this.player.muted = false;
      this.player.volume = value;
      buttons.volume.icon = this.#getVolumeIcon(value);
    });

    buttons.volume.on("click", () => {
      if (this.player.volume > 0) {
        lastVolume = this.player.volume;
      }

      const isMuted = !this.player.muted;
      const volume = isMuted ? 0 : lastVolume;

      sliders.volume.setValue(volume);

      this.player.muted = isMuted;

      buttons.volume.icon = this.#getVolumeIcon(volume);
    });
  }
}
