import { triggerLifecycleEvent, LCEvents } from "../widgets/component.js";

const widgetPaths = {
  player: {
    widget: "../widgets/player/player.js",
    component: "../widgets/player/player-component.js",
  },
  loader: {
    widget: "../widgets/loader/loader.js",
    component: "../widgets/loader/loader-component.js",
  },
  button: {
    widget: "../widgets/button/button.js",
    component: "../widgets/button/button-component.js",
  },
  textView: {
    widget: "../widgets/text/text-view.js",
    component: "../widgets/text/text-view-component.js",
  },
  seekerSlider: {
    widget: "../widgets/slider/seeker-slider/seeker-slider.js",
    component: "../widgets/slider/seeker-slider/seeker-slider-component.js",
  },
  stepSlider: {
    widget: "../widgets/slider/steps-slider/step-slider.js",
    component: "../widgets/slider/steps-slider/step-slider-component.js",
  },
  volumeSlider: {
    widget: "../widgets/slider/common/slider.js",
    component: "../widgets/slider/common/slider-component.js",
  },
  video: {
    widget: "../widgets/video/video.js",
    component: "../widgets/video/video-component.js",
  },
  videoStatusBar: {
    widget: "../widgets/video-status-bar/video-status-bar.js",
    component: "../widgets/video-status-bar/video-status-bar-component.js",
  },
  playbackControls: {
    widget: "../widgets/playback-controls/playback-controls.js",
    component: "../widgets/playback-controls/playback-controls-component.js",
  },
  volumeControl: {
    widget: "../widgets/volume-control/volume-control.js",
    component: "../widgets/volume-control/volume-control-component.js",
  },
};

/**
 * Importa dinámicamente el widget y el componente del Widget, luego crea la instancia del widget
 * e inicializa el componente con las opciones dadas.
 *
 * @param {Object} paths - Objeto que contiene las rutas de los módulos de widgets y componentes.
 * @param {string} paths.widget - Ruta al módulo del widget.
 * @param {string} paths.component - Ruta al módulo del componente del widget.
 * @param {Object<string, any>} options - Opciones para inicializar el widget.
 *
 * @returns {Promise<import("../widgets/widget.js").Widget>} Una promesa que se resuelve en la instancia del widget creado.
 */
async function createWidget(paths, options) {
  const [Widget, WidgetComponent] = await Promise.all([
    import(paths.widget),
    import(paths.component),
  ]);

  const widget = new Widget.default(options);
  new WidgetComponent.default(widget);

  triggerLifecycleEvent(LCEvents.CREATE, widget.component);

  return widget;
}

export function createPlayer(options) {
  return createWidget(widgetPaths.player, options);
}

/**
 * Crea un loader, para mostrar un indicador de carga.
 *
 * @returns {Promise<Loader>}
 */
export function createLoader() {
  return createWidget(widgetPaths.loader);
}

/**
 * Crea un botón, que puede contener un icono.
 *
 * @param {Object} options - Opciones para el botón.
 * @param {SVGIcon} options.icon - Icono del botón.
 * @returns {Promise<Button>}
 */
export function createButton(options) {
  return createWidget(widgetPaths.button, options);
}

/**
 * Crea una vista de texto, que muestra un texto en pantalla.
 *
 * @param {Object} options - Opciones para el componente de texto.
 * @param {string} options.text - Texto del componente.
 * @returns {Promise<TextView>}
 */
export function createTextView(options) {
  return createWidget(widgetPaths.textView, options);
}

/**
 * Crea un control deslizante para seleccionar el tiempo de reproducción.
 *
 * @param {Object} options - Opciones para el control deslizante.
 * @param {number} options.value - Valor del control deslizante.
 * @param {number} options.min - Valor mínimo del control deslizante.
 * @param {number} options.max - Valor máximo del control deslizante.
 * @param {number} options.hoverPadding - Valor del padding de hover.
 * @param {{start: number, end: number, title: string}[]} options.chapters - Capítulos del control deslizante.
 *
 * @returns {Promise<SeekerSlider>}
 */
export function createSeekerSlider(options) {
  return createWidget(widgetPaths.seekerSlider, options);
}

/**
 * Crea un control deslizante con pasos para seleccionar el tiempo de reproducción.
 *
 * @param {Object} options - Opciones para el control deslizante.
 * @param {number} options.value - Valor del control deslizante.
 * @param {number[]} options.steps - Pasos del control deslizante.
 * @param {boolean} [options.showSteps=false] - Indica si se deben mostrar los pasos.
 * @param {boolean} [options.showLabels=false] - Indica si se deben mostrar las etiquetas.
 *
 * @returns {Promise<StepsSlider>}
 */
export function createStepsSlider(options) {
  return createWidget(widgetPaths.stepSlider, options);
}

/**
 * Crea un control deslizante para seleccionar el volumen del video.
 *
 * @param {Object} options - Opciones para el control deslizante.
 * @param {number} options.volume - Volumen del control deslizante.
 *
 * @returns {Promise<Slider>}
 */
export function createVolumeSlider({ volume }) {
  return createWidget(widgetPaths.volumeSlider, {
    value: volume,
    min: 0,
    max: 1,
    hoverPadding: 10,
  });
}

/**
 * Crea un video para reproducir un archivo multimedia.
 *
 * @param {Object} options - Opciones para el video.
 * @param {string} options.src - URL del archivo multimedia.
 * @param {number} options.width - Ancho del video.
 * @param {number} options.height - Alto del video.
 * @param {number} [options.volume=1] - Volumen del video.
 * @param {number} [options.currentTime=0] - Tiempo actual del video.
 * @param {boolean} [options.isMuted=false] - Indica si el video está silenciado.
 * @param {number} [options.playbackRate=1] - Velocidad de reproducción del video.
 * @param {"none" | "infinite" | "once"} [options.loopMode="none"] - Modo de bucle del video.
 *
 * @returns {Promise<Video>}
 */
export function createVideo(options) {
  return createWidget(widgetPaths.video, options);
}

/**
 * Crea una barra de estado de video, que muestra información sobre el video.
 * Esta barra se encuentra en la parte inferior de la pantalla y muestra al
 * seeker del video, el tiempo actual del video y el tiempo total del video.
 * Ademas, muestra información sobre el video, como el título del video y el
 * título del capítulo actual. También muestra los botones de control del video,
 * como los botones de repetición, pantalla completa, picture in picture, etc.
 *
 * @param {Object} options - Opciones para la barra de estado del video.
 * @param {Player} options.player - Objeto del player que se utilizará para mostrar la barra de estado.
 *
 * @returns {Promise<VideoStatusBar>}
 */
export function createVideoStatusBar(options) {
  return createWidget(widgetPaths.videoStatusBar, options);
}

/**
 * Crea los controles de reproducción, que muestran los botones de reproducción,
 * de repetición, de salto de segundos, etc.
 *
 * @param {Object} options - Opciones para los controles de reproducción.
 * @param {Player} options.player - Objeto del player que se utilizará para mostrar los controles de reproducción.
 *
 * @returns {Promise<PlaybackControls>}
 */
export function createPlaybackControls(options) {
  return createWidget(widgetPaths.playbackControls, options);
}

export function createVolumeControl(options) {
  return createWidget(widgetPaths.volumeControl, options);
}
