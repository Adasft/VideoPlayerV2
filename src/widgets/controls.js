class ControlsGroup {
  /**
   * Nombre del grupo de controles
   *
   * @type {string}
   */
  #name;

  get name() {
    return this.#name;
  }

  /**
   * Funcion para crear el control
   *
   * @type {(options: Object<string, any>) => Controller}
   */
  #createControl;

  get createControl() {
    return this.#createControl;
  }

  /**
   * Objeto con los controles del grupo
   *
   * @type {Object<string, Controller>}
   */
  #controls = {};

  get controls() {
    return this.#controls;
  }

  #controlsNames = new Set();

  get controlsNames() {
    return this.#controlsNames;
  }

  constructor(group) {
    this.#name = group.name;
    this.#createControl = group.createControl;

    new Proxy(this, {
      get: (target, name) => {
        if (!target.controlsNames.has(name)) {
          return target[name];
        }

        return target.controls[name];
      },
    });
  }

  /**
   * Crea un control y lo agrega al grupo
   *
   * @param {string} name Nombre del control
   * @param {Object<string, any>} options Opciones del control
   */
  defineControl(name, options) {
    return this.createControl(options)
      .then((control) => {
        Object.assign(this.controls, { [name]: control });
        this.controlsNames.add(name);
      })
      .catch((error) => {
        console.error("Error creating control:", error);
        throw error;
      });
  }

  /**
   * Permite agregar controles al grupo
   *
   * @param {Object<string, any>} controls Objeto con las opciones de los controles
   */
  add(controls) {
    for (const [name, options] of Object.entries(controls)) {
      if (this.controlsNames.has(name)) {
        console.warn(
          `Control "${name}" already exists in group "${this.name}".`
        );
        continue;
      }
      this.defineControl(name, options);
    }
  }
}

export class Controls {
  #assignGroup(group) {
    Object.defineProperty(this, group.name, {
      value: new ControlsGroup(group),
    });
  }

  /**
   * Define un nuevo grupo de controles
   *
   * @param {Object} group Objeto con los atributos del grupo
   * @param {string} group.name Nombre del grupo
   * @param {(options: Object<string, any>) => Controller} group.createControl Funcion para crear el control
   */
  defineGroup({ name, createControl }) {
    if (this.hasOwnProperty(name)) {
      throw new Error(
        `Controls.createGroup() cannot override existing group "${name}".`
      );
    }

    this.#assignGroup({
      name,
      createControl,
    });
  }
}

// example

// 1
// controls
//   .createIf(() => true)
//   .do(() => ({
//     category: "buttons",
//     name: "play",
//     widget: new Button({ text: "Button" }),
//   }));

// // 2
// controls
//   .createIf(controls.buttons, () => true)
//   .do(() => ({
//     name: "play",
//     widget: new Button({ text: "Button" }),
//   }));

// // 3
// controls.buttons
//   .createIf(() => true)
//   .do(() => ({
//     name: "play",
//     widget: new Button({ text: "Button" }),
//   }));

// // 4
// controls.buttons
//   .createIf(() => true)
//   .do(() => ({
//     name: "play",
//     options: {
//       icon: SVGIcons.PLAY,
//     },
//   }));

// controls.sliders
//   .createWhen(() => true)
//   .configure(() => ({
//     name: "seeker",
//     options: {
//       value: 0,
//       min: 0,
//       max: 10,
//       hoverPadding: 10,
//       chapters: [
//         { start: 0, end: 3 },
//         { start: 3, end: 5 },
//         { start: 5, end: 8 },
//         { start: 8, end: 10 },
//       ],
//     },
//   }));

// controls.defineGroup({
//   name: "buttons",
//   createControl: options => ui.createButton(options)
// })

// controls.buttons.add({
//   play: { icon: SVGIcons.PLAY },
//   pause: { icon: SVGIcons.PAUSE },
//   stop: { icon: SVGIcons.STOP },
// })

// controls.defineGroup({
//   name: "sliders",
//   createControl: options => ui.createSeekerSlider(options)
// })

// controls.sliders.add({
//   seeker: {
//     value: 0,
//     min: 0,
//     max: 10,
//     hoverPadding: 10,
//     chapters: [
//       { start: 0, end: 3 },
//       { start: 3, end: 5 },
//       { start: 5, end: 8 },
//       { start: 8, end: 10 },
//     ],
//   },
// })

// controls.createGroup("buttons", {
//   play: ui.createButton({ icon: SVGIcons.PLAY }),
//   pause: ui.createButton({ icon: SVGIcons.PAUSE }),
//   stop: ui.createButton({ icon: SVGIcons.STOP }),
// })

// // uso
// controls.buttons.play.enabled = true;

// controls.buttons
//   .createWhen(() => true)
//   .configure(() => ({
//     play: { icon: SVGIcons.PLAY },
//     pause: { icon: SVGIcons.PAUSE },
//     stop: { icon: SVGIcons.STOP },
//   }));
