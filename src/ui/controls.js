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
   * @type {(options: Object<string, any>) => Widget}
   */
  #createControl;

  get createControl() {
    return this.#createControl;
  }

  constructor(group) {
    this.#name = group.name;
    this.#createControl = group.createControl;
  }

  #forEachControls(controls, callback) {
    const controlsEntries = Object.entries(controls);
    for (const [name, options] of controlsEntries) {
      if (controls[name] === null) {
        return;
      }
      callback({ name, options });
    }
  }

  #createConditionalControls = ({ name, options }) => {
    if (this.hasOwnProperty(name) && !!this[name]) {
      return;
    }
    this.#defineControl(name, options);
  };

  #destroyConditionalControls = ({ name }) => {
    if (!this.hasOwnProperty(name)) {
      return;
    }

    const control = this[name];
    control.destroy();
    this[name] = null;
  };

  /**
   * Crea un control y lo agrega al grupo
   *
   * @param {string} name Nombre del control
   * @param {Object<string, any>} options Opciones del control
   */
  #defineControl(name, options) {
    this.createControl(options)
      .then((control) => {
        Object.assign(this, { [name]: control });
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
      this.#defineControl(name, options);
    }
  }

  /**
   * Crea los controles cuando se cumple la condición, y los destruye cuando no se cumple.
   * Si los botones ya existen, y la condición se cumple, no se crearán nuevos controles.
   * Si los botones ya existen, y la condición no se cumple, se destruirán los controles existentes.
   *
   * @example
   *
   * const createPlaybackButtons = controls.createWhen(() => video.isPlaying);
   *
   * createPlaybackButtons({
   *   play: { icon: SVGIcons.PLAY },
   *   pause: { icon: SVGIcons.PAUSE },
   * });
   *
   * @param {() => boolean} condition Condición que determina si los controles se crearán o destruirán.
   * @returns {(controls: Object<string, any>) => void} Función que recibe los controles y los crea o los destruye según la condición.
   */
  createWhen(condition) {
    return (controls) => {
      const isTrue = condition();

      this.#forEachControls(
        controls,
        isTrue
          ? this.#createConditionalControls
          : this.#destroyConditionalControls
      );
    };
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
   * @param {(options: Object<string, any>) => Widget} group.createControl Funcion para crear el control
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
