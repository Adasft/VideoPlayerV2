const SVG_VOLUME_ICON = /* html */ `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-volume">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M15 8a5 5 0 0 1 0 8"></path>
    <path d="M17.7 5a9 9 0 0 1 0 14"></path>
    <path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5"></path>
  </svg>
`;

const SVG_VOLUME_LOW_ICON = /* html */ `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  class="icon icon-tabler icons-tabler-outline icon-tabler-volume-2">
  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
  <path d="M15 8a5 5 0 0 1 0 8" />
  <path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5" />
  </svg>
`;

const SVG_VOLUME_MUTED_ICON = /* html */ `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  class="icon icon-tabler icons-tabler-outline icon-tabler-volume-3">
  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
  <path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5" />
  <path d="M16 10l4 4m0 -4l-4 4" /></svg>
`;

const SVG_VOLUME_OFF_ICON = /* html */ `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  class="icon icon-tabler icons-tabler-outline icon-tabler-volume-off">
  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
  <path d="M15 8a5 5 0 0 1 1.912 4.934m-1.377 2.602a5 5 0 0 1 -.535 .464" />
  <path d="M17.7 5a9 9 0 0 1 2.362 11.086m-1.676 2.299a9 9 0 0 1 -.686 .615" />
  <path
    d="M9.069 5.054l.431 -.554a.8 .8 0 0 1 1.5 .5v2m0 4v8a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l1.294 -1.664" />
  <path d="M3 3l18 18" /></svg>
`;

const SVG_REPEAT_ICON = /* html */ `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-repeat">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3"></path>
    <path d="M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3"></path>
  </svg>
`;

const SVG_REPEAT_ONCE_ICON = /* html */ `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  class="icon icon-tabler icons-tabler-outline icon-tabler-repeat-once">
  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
  <path d="M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3" />
  <path d="M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3" />
  <path d="M11 11l1 -1v4" /></svg>
`;

const SVG_ShUFFLE_ICON = /* html */ `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-arrows-shuffle">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M18 4l3 3l-3 3"></path>
    <path d="M18 20l3 -3l-3 -3"></path>
    <path d="M3 7h3a5 5 0 0 1 5 5a5 5 0 0 0 5 5h5"></path>
    <path d="M21 7h-5a4.978 4.978 0 0 0 -3 1m-4 8a4.984 4.984 0 0 1 -3 1h-3"></path>
  </svg>
`;

const SVG_BACKWARD_ICON = /* html */ `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="2 2 20 20" fill="currentColor"
  class="icon icon-tabler icons-tabler-filled icon-tabler-player-skip-back">
  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
  <path d="M19.496 4.136l-12 7a1 1 0 0 0 0 1.728l12 7a1 1 0 0 0 1.504 -.864v-14a1 1 0 0 0 -1.504 -.864z" />
  <path d="M4 4a1 1 0 0 1 .993 .883l.007 .117v14a1 1 0 0 1 -1.993 .117l-.007 -.117v-14a1 1 0 0 1 1 -1z" />
</svg>
`;

const SVG_FORWARD_ICON = /* html */ `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="2 2 20 20" fill="currentColor"
  class="icon icon-tabler icons-tabler-filled icon-tabler-player-skip-forward">
  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
  <path d="M3 5v14a1 1 0 0 0 1.504 .864l12 -7a1 1 0 0 0 0 -1.728l-12 -7a1 1 0 0 0 -1.504 .864z" />
  <path d="M20 4a1 1 0 0 1 .993 .883l.007 .117v14a1 1 0 0 1 -1.993 .117l-.007 -.117v-14a1 1 0 0 1 1 -1z" />
</svg>
`;

const SVG_SKIP_FORWARD_5_ICON = /* html */ `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  class="icon icon-tabler icons-tabler-outline icon-tabler-rewind-forward-5">
  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
  <path d="M9 18a6 6 0 1 1 0 -12h11" />
  <path d="M13 20h2a1 1 0 0 0 1 -1v-1a1 1 0 0 0 -1 -1h-2v-3h3" />
  <path d="M17 9l3 -3l-3 -3" /></svg>`;

const SVG_SKIP_FORWARD_10_ICON = /* html */ `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  class="icon icon-tabler icons-tabler-outline icon-tabler-rewind-forward-10">
  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
  <path d="M17 9l3 -3l-3 -3" />
  <path d="M8 17.918a5.997 5.997 0 0 1 -5 -5.918a6 6 0 0 1 6 -6h11" />
  <path d="M12 14v6" />
  <path d="M15 15.5v3a1.5 1.5 0 0 0 3 0v-3a1.5 1.5 0 0 0 -3 0z" /></svg>`;

const SVG_SKIP_FORWARD_15_ICON = /* html */ `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  class="icon icon-tabler icons-tabler-outline icon-tabler-rewind-forward-15">
  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
  <path d="M17 9l3 -3l-3 -3" />
  <path d="M9 18a6 6 0 1 1 0 -12h11" />
  <path d="M16 20h2a1 1 0 0 0 1 -1v-1a1 1 0 0 0 -1 -1h-2v-3h3" />
  <path d="M13 14v6" /></svg>`;

const SVG_SKIP_FORWARD_20_ICON = /* html */ `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  class="icon icon-tabler icons-tabler-outline icon-tabler-rewind-forward-20">
  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
  <path d="M5.007 16.478a6 6 0 0 1 3.993 -10.478h11" />
  <path d="M15 15.5v3a1.5 1.5 0 0 0 3 0v-3a1.5 1.5 0 0 0 -3 0z" />
  <path d="M17 9l3 -3l-3 -3" />
  <path d="M9 14h2a1 1 0 0 1 1 1v1a1 1 0 0 1 -1 1h-1a1 1 0 0 0 -1 1v1a1 1 0 0 0 1 1h2" /></svg>`;

const SVG_SKIP_BACK_5_ICON = /* html */ `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  class="icon icon-tabler icons-tabler-outline icon-tabler-rewind-backward-5">
  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
  <path d="M15 18a6 6 0 1 0 0 -12h-11" />
  <path d="M7 9l-3 -3l3 -3" />
  <path d="M8 20h2a1 1 0 0 0 1 -1v-1a1 1 0 0 0 -1 -1h-2v-3h3" /></svg>
`;

const SVG_SKIP_BACK_10_ICON = /* html */ `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  class="icon icon-tabler icons-tabler-outline icon-tabler-rewind-backward-10">
  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
  <path d="M7 9l-3 -3l3 -3" />
  <path d="M15.997 17.918a6.002 6.002 0 0 0 -.997 -11.918h-11" />
  <path d="M6 14v6" />
  <path d="M9 15.5v3a1.5 1.5 0 0 0 3 0v-3a1.5 1.5 0 0 0 -3 0z" /></svg>
`;

const SVG_SKIP_BACK_15_ICON = /* html */ `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  class="icon icon-tabler icons-tabler-outline icon-tabler-rewind-backward-15">
  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
  <path d="M8 20h2a1 1 0 0 0 1 -1v-1a1 1 0 0 0 -1 -1h-2v-3h3" />
  <path d="M15 18a6 6 0 1 0 0 -12h-11" />
  <path d="M5 14v6" />
  <path d="M7 9l-3 -3l3 -3" /></svg>
`;

const SVG_SKIP_BACK_20_ICON = /* html */ `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  class="icon icon-tabler icons-tabler-outline icon-tabler-rewind-backward-20">
  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
  <path d="M19.007 16.466a6 6 0 0 0 -4.007 -10.466h-11" />
  <path d="M7 9l-3 -3l3 -3" />
  <path d="M12 15.5v3a1.5 1.5 0 0 0 3 0v-3a1.5 1.5 0 0 0 -3 0z" />
  <path d="M6 14h2a1 1 0 0 1 1 1v1a1 1 0 0 1 -1 1h-1a1 1 0 0 0 -1 1v1a1 1 0 0 0 1 1h2" /></svg>
`;

const SVG_PAUSE_ICON = /* html */ `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="3 3 18 18" fill="currentColor" class="icon icon-tabler icons-tabler-filled icon-tabler-player-pause">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M9 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z"></path>
    <path d="M17 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z"></path>
  </svg>
`;

const SVG_PLAY_ICON = /* html */ `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="3 3 18 18" fill="currentColor"
  class="icon icon-tabler icons-tabler-filled icon-tabler-player-play">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
  <path d="M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z"></path>
</svg>
`;

const SVG_PICTURE_IN_PICTURE_ICON = /* html */ `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  class="icon icon-tabler icons-tabler-outline icon-tabler-picture-in-picture">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
  <path d="M11 19h-6a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v4"></path>
  <path d="M14 14m0 1a1 1 0 0 1 1 -1h5a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-5a1 1 0 0 1 -1 -1z"></path>
</svg>
`;

const SVG_PICTURE_IN_PICTURE_ACTIVE_ICON = /* html */ `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  class="icon icon-tabler icons-tabler-outline icon-tabler-picture-in-picture-off">
  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
  <path d="M11 19h-6a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v4" />
  <path d="M14 14m0 1a1 1 0 0 1 1 -1h5a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-5a1 1 0 0 1 -1 -1z" />
  <path d="M7 9l4 4" />
  <path d="M7 12v-3h3" /></svg>
`;

const SVG_SPEED_ICON = /* html */ `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  class="icon icon-tabler icons-tabler-outline icon-tabler-brand-speedtest">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
  <path d="M5.636 19.364a9 9 0 1 1 12.728 0"></path>
  <path d="M16 9l-4 4"></path>
</svg>
`;

const SVG_FULLSCREEN_ICON = /* html */ `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  class="icon icon-tabler icons-tabler-outline icon-tabler-maximize">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
  <path d="M4 8v-2a2 2 0 0 1 2 -2h2"></path>
  <path d="M4 16v2a2 2 0 0 0 2 2h2"></path>
  <path d="M16 4h2a2 2 0 0 1 2 2v2"></path>
  <path d="M16 20h2a2 2 0 0 0 2 -2v-2"></path>
</svg>
`;

const SVG_PLAYLIST_ICON = /* html */ `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  class="icon icon-tabler icons-tabler-outline icon-tabler-playlist">
  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
  <path d="M14 17m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
  <path d="M17 17v-13h4" />
  <path d="M13 5h-10" />
  <path d="M3 9l10 0" />
  <path d="M9 13h-6" />
</svg>`;

const SVG_CHAPTERS_ICON = /* html */ `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  class="icon icon-tabler icons-tabler-outline icon-tabler-list-details">
  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
  <path d="M13 5h8" />
  <path d="M13 9h5" />
  <path d="M13 15h8" />
  <path d="M13 19h5" />
  <path d="M3 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
  <path d="M3 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
</svg>`;

export class SVGIcon {
  #isFilled;
  #svgContent;

  constructor(svgContent, isFilled = false) {
    this.#svgContent = svgContent;
    this.#isFilled = isFilled;
  }

  getHTML() {
    return this.#svgContent;
  }

  setFilled(isFilled) {
    this.#isFilled = isFilled;
  }

  isFilled() {
    return this.#isFilled;
  }
}

export default class SVGIcons {
  static VOLUME_HIGH = new SVGIcon(SVG_VOLUME_ICON);

  static VOLUME_MUTED = new SVGIcon(SVG_VOLUME_MUTED_ICON);

  static VOLUME_LOW = new SVGIcon(SVG_VOLUME_LOW_ICON);

  static VOLUME_OFF = new SVGIcon(SVG_VOLUME_OFF_ICON);

  static REPEAT = new SVGIcon(SVG_REPEAT_ICON);

  static REPEAT_ONCE = new SVGIcon(SVG_REPEAT_ONCE_ICON);

  static SHUFFLE = new SVGIcon(SVG_ShUFFLE_ICON);

  static BACKWARD = new SVGIcon(SVG_BACKWARD_ICON, true);

  static FORWARD = new SVGIcon(SVG_FORWARD_ICON, true);

  static SKIP_5_BACK = new SVGIcon(SVG_SKIP_BACK_5_ICON);

  static SKIP_5_FORWARD = new SVGIcon(SVG_SKIP_FORWARD_5_ICON);

  static SKIP_10_BACK = new SVGIcon(SVG_SKIP_BACK_10_ICON);

  static SKIP_10_FORWARD = new SVGIcon(SVG_SKIP_FORWARD_10_ICON);

  static SKIP_15_BACK = new SVGIcon(SVG_SKIP_BACK_15_ICON);

  static SKIP_15_FORWARD = new SVGIcon(SVG_SKIP_FORWARD_15_ICON);

  static SKIP_20_BACK = new SVGIcon(SVG_SKIP_BACK_20_ICON);

  static SKIP_20_FORWARD = new SVGIcon(SVG_SKIP_FORWARD_20_ICON);

  static PAUSE = new SVGIcon(SVG_PAUSE_ICON, true);

  static PLAY = new SVGIcon(SVG_PLAY_ICON, true);

  static PICTURE_IN_PICTURE = new SVGIcon(SVG_PICTURE_IN_PICTURE_ICON);

  static PICTURE_IN_PICTURE_ACTIVE = new SVGIcon(
    SVG_PICTURE_IN_PICTURE_ACTIVE_ICON
  );

  static SPEED = new SVGIcon(SVG_SPEED_ICON);

  static FULLSCREEN = new SVGIcon(SVG_FULLSCREEN_ICON);

  static PLAYLIST = new SVGIcon(SVG_PLAYLIST_ICON);

  static CHAPTERS = new SVGIcon(SVG_CHAPTERS_ICON);
}
