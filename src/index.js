// import { Slider } from "./widgets/slider/common/slider.js";
// import { SliderComponent } from "./widgets/slider/common/slider-component.js";
// import { SeekerSlider } from "./widgets/slider/seeker-slider/seeker-slider.js";
// import { StepsSlider } from "./widgets/slider/steps-slider/steps-slider.js";
// import { StepsSliderComponent } from "./widgets/slider/steps-slider/steps-slider-component.js";
// import { createLoader } from "./ui/ui.js";

import * as ui from "./ui/ui-utils.js";
import { Controls } from "./ui/controls.js";
import SVGIcons from "./ui/icons.js";
import Player from "./widgets/player/player.js";
import PlayerComponent from "./widgets/player/player-component.js";

// const video = document.getElementById("video");
// const button = document.getElementById("button");

// const controls = new Controls();

// controls.defineGroup({
//   name: "buttons",
//   createControl: (options) => ui.createButton(options),
// });

// await controls.buttons.add({
//   forward: { icon: SVGIcons.FORWARD },
//   backward: { icon: SVGIcons.BACKWARD },
// });

// console.log(controls.buttons.forward);

// const createPlaybackButtons = controls.buttons.createWhen(() => !video.paused);

// button.addEventListener("click", () => {
//   // ui.createSeekerSlider({
//   //   value: 6,
//   //   min: 0,
//   //   max: 10,
//   //   hoverPadding: 10,
//   //   chapters: [
//   //     { start: 0, end: 3 },
//   //     { start: 3, end: 5 },
//   //     { start: 5, end: 8 },
//   //     { start: 8, end: 10 },
//   //   ],
//   // }).then((seekerSlider) => {
//   //   seekerSlider.mount(document.body);
//   // });

//   // ui.createStepsSlider({
//   //   value: 6.7,
//   //   steps: [3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8],
//   //   showSteps: true,
//   //   showLabels: true,
//   // }).then((stepSlider) => {
//   //   stepSlider.on("valueChanged", (value) => {
//   //     console.log("valueChanged", value);
//   //   });

//   //   stepSlider.mount(document.body);
//   // });

//   // ui.createVolumeSlider({
//   //   volume: 0.5,
//   // }).then((volumeSlider) => {
//   //   volumeSlider.mount(document.body);
//   // });

//   // console.log(video.isPlaying);
//   // console.log(video.paused);

//   createPlaybackButtons({
//     play: { icon: SVGIcons.PLAY },
//     pause: { icon: SVGIcons.PAUSE },
//   });
// });

// // console.log(controls.textViews.title);

// window.controls = controls;

const player = new Player({
  source: {
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    title: "Este es un video con un titulo",
    currentTime: 596.474195,
    chapters: [
      { start: 0, end: 200, title: "Chapter 1" },
      { start: 200, end: 270, title: "Chapter 2" },
      { start: 270, end: 400, title: "Chapter 3" },
      { start: 400, end: 410, title: "Chapter 4" },
      { start: 410, end: 500, title: "Chapter 4" },
      { start: 500, end: 596.474195, title: "Chapter 5" },
    ],
  },
  volume: 0.5,
  width: 1200,
  height: 700,
  muted: false,
  enableStorage: true,
  overwriteStorage: false,
  autoplay: false,
  skipTime: 5,
  playlist: {
    loop: false,
    startIndex: 0,
    sources: [
      {
        src: "./video1.mp4",
        title: "Video 1",
      },
      {
        src: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        title: "Video 2",
      },
      {
        src: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
        title: "Video 3",
      },
    ],
  },
});

const playerComponent = new PlayerComponent(player);

playerComponent.mount(document.body);

window.player = player;

// const stepSlider = new StepsSlider({
//   value: 0,
//   // pasos para elegir la velocidad de video
//   // steps: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8],
//   steps: [3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8],
//   showSteps: true,
//   showLabels: true,
//   // min: 0,
//   // max: 10.026667,
//   // chapters: [
//   //   { start: 0, end: 3 },
//   //   { start: 3, end: 5 },
//   //   { start: 5, end: 8 },
//   //   { start: 8, end: 10.026667 },
//   // ],
//   // hoverPadding: 30,
//   // enableHoverGrowth: true,
//   // hoverPadding: 10,
//   // showAlwaysThumb: false,
// });

// // const slider = new Slider({
// //   value: 0,
// //   min: 30,
// //   max: 50,
// //   enableHoverGrowth: true,
// //   hoverPadding: 10,
// //   showAlwaysThumb: false,
// // });

// const sliderComponent = new StepsSliderComponent(stepSlider);

// // document.getElementById("button").addEventListener("click", () => {
// //   stepSlider.refresh({
// //     value: 0,
// //     steps: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8],
// //     showSteps: true,
// //     showLabels: true,
// //   });
// // });

// const normalSlider = new Slider({
//   value: 0,
//   min: 0,
//   max: 10,
//   hoverPadding: 10,
// });

// const normalSliderComponent = new SliderComponent(normalSlider);

// // normalSlider.on("valueChanged", (value) => {
// //   console.log("valueChanged", value);
// // });

// const seekerSlider = new SeekerSlider({
//   value: 0,
//   min: 0,
//   max: 10,
//   hoverPadding: 10,
// });

// const seekerSliderComponent = new SliderComponent(seekerSlider);

// // seekerSlider.on("valueChanged", (value) => {
// //   console.log("valueChanged", value);
// // });

// // seekerSlider.on("drag", (value) => {
// //   console.log("drag", value);
// // });

// // seekerSlider.on("dragStart", (value) => {
// //   console.log("dragStart", value);
// // });

// // seekerSlider.on("dragEnd", () => {
// //   console.log("dragEnd");
// // });

// const seekerSliderChaptered = new SeekerSlider({
//   value: 0,
//   min: 0,
//   max: 10,
//   hoverPadding: 10,
//   chapters: [
//     { start: 0, end: 3 },
//     { start: 3, end: 5 },
//     { start: 5, end: 8 },
//     { start: 8, end: 10 },
//   ],
// });

// const seekerSliderChapteredComponent = new SliderComponent(
//   seekerSliderChaptered
// );

// document.getElementById("button").addEventListener("click", () => {
//   seekerSliderChaptered.refresh({
//     value: video.currentTime,
//     min: 0,
//     max: 10,
//     chapters: [
//       { start: 0, end: 2 },
//       { start: 2, end: 5 },
//       { start: 5, end: 6 },
//       { start: 6, end: 8 },
//       { start: 8, end: 9 },
//       { start: 9, end: 10 },
//     ],
//   });

//   createLoader().then((loader) => {
//     console.log(loader);
//   });
// });

// // stepSlider.on("valueChanged", (value) => {
// //   console.log("valueChanged", value);
// // });

// video.addEventListener("timeupdate", () => {
//   // console.log(video.currentTime / video.duration);
//   seekerSlider.setValue(video.currentTime);
//   seekerSliderChaptered.setValue(video.currentTime);
// });

// video.addEventListener("progress", () => {
//   const buffered = video.buffered;

//   if (buffered.length === 0) {
//     return null; // Devuelve null para indicar que el buffer está vacío
//   }

//   let progress = 0;

//   for (let i = 0; i < buffered.length; i++) {
//     const start = buffered.start(i);
//     const end = buffered.end(i);

//     // Si `currentTime` está dentro del rango de este segmento de buffer
//     if (video.currentTime >= start && video.currentTime <= end) {
//       // slider.setBufferProgress(end / video.duration);
//       progress = end / video.duration;
//     }
//   }

//   // Retorna 0% si el `currentTime` no está en ningún segmento de buffer
//   seekerSlider.setBufferProgress(progress);
//   seekerSliderChaptered.setBufferProgress(progress);
// });

// // simular buffer

// // slider.on("drag", (value) => {
// //   console.log("drag", value);
// // });

// // slider.on("dragStart", (value) => {
// //   console.log("dragStart", value);
// // });

// // slider.on("dragEnd", () => {
// //   console.log("dragEnd");
// // });

// normalSliderComponent.mount(document.body);
// sliderComponent.mount(document.body);
// seekerSliderComponent.mount(document.body);
// seekerSliderChapteredComponent.mount(document.body);

// // const controls = new Controls()

// // // Aceder a los controles por categoria
// // controls.buttons.enable("play")
// // controls.buttons.disable("play")
// // controls.buttons.play // <- Es un ButtonWidget

// // controls.buttons.on("play", "click", () => {
// //   console.log("play clicked")
// // })

// // const loader = createLoader().then((loader) => {
// //   console.log(loader);
// // });

// // console.log(loader);
