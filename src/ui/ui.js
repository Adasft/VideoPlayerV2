const widgetPaths = {
  loader: {
    controller: "../widgets/loader/loader.js",
    component: "../widgets/loader/loader-component.js",
  },
  button: {
    controller: "../widgets/button/button.js",
    component: "../widgets/button/button-component.js",
  },
  textView: {
    controller: "../widgets/text/text-view.js",
    component: "../widgets/text/text-view-component.js",
  },
  seekerSlider: {
    controller: "../widgets/slider/seeker-slider/seeker-slider.js",
    component: "../widgets/slider/common/slider-component.js",
  },
  stepsSlider: {
    controller: "../widgets/slider/steps-slider/steps-slider.js",
    component: "../widgets/slider/steps-slider/steps-slider-component.js",
  },
  volumeSlider: {
    controller: "../widgets/slider/common/slider.js",
    component: "../widgets/slider/common/slider-component.js",
  },
  video: {
    controller: "../widgets/video/video.js",
    component: "../widgets/video/video-component.js",
  },
};

async function createWidget(paths, options) {
  const [Widget, WidgetComponent] = await Promise.all([
    import(paths.controller),
    import(paths.component),
  ]);

  const widget = new Widget.default(options);
  new WidgetComponent.default(widget);

  return widget;
}

export async function createLoader() {
  return await createWidget(widgetPaths.loader);
}

export async function createButton(options) {
  return await createWidget(widgetPaths.button, options);
}

export async function createTextView(options) {
  return await createWidget(widgetPaths.textView, options);
}

export async function createSeekerSlider(options) {
  return await createWidget(widgetPaths.seekerSlider, options);
}

export async function createStepsSlider(options) {
  return await createWidget(widgetPaths.stepsSlider, options);
}

export async function createVolumeSlider({ volume }) {
  return await createWidget(widgetPaths.volumeSlider, { value: volume });
}

export async function createVideo(options) {
  return await createWidget(widgetPaths.video, options);
}
