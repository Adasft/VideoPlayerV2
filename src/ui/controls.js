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
   * @type {(options: Object<string, any>) => Promise<Widget>}
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
    const pendingPrimises = [];
    const controlsEntries = Object.entries(controls);
    for (const [name, options] of controlsEntries) {
      if (controls[name] === null) {
        return;
      }

      pendingPrimises.push(callback({ name, options }));
    }

    return Promise.all(pendingPrimises);
  }

  #createConditionalControls = ({ name, options }) => {
    if (this.hasOwnProperty(name) && !!this[name]) {
      return;
    }

    const control = this.#defineControl(name, options);

    control.then((control) => {
      console.log("createConditionalControls", {
        this: { ...this },
        name,
        options,
        control,
      });
    });

    return control;
  };

  #destroyConditionalControls = ({ name }) => {
    if (!this.hasOwnProperty(name) || !this[name]) {
      return;
    }

    const control = this[name];
    control.destroy();
    this[name] = null;
    return new Promise((resolve) => resolve());
  };

  /**
   * Crea un control y lo agrega al grupo
   *
   * @param {string} name Nombre del control
   * @param {Object<string, any>} options Opciones del control
   * @returns {Promise<Widget>}
   */
  async #defineControl(name, options) {
    try {
      const control = await this.createControl(options, name);
      Object.assign(this, { [name]: control });
      return new Promise((resolve) => resolve(control));
    } catch (error) {
      console.error("Error creating control:", error);
      throw error;
    }
  }

  /**
   * Permite agregar controles al grupo
   *
   * @param {Object<string, any>} controls Objeto con las opciones de los controles
   * @returns {Promise<void>}
   */
  async add(controls) {
    for (const [name, options] of Object.entries(controls)) {
      await this.#defineControl(name, options);
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
    return async (controls) => {
      const isTrue = condition();

      return await this.#forEachControls(
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
    const controlsGroup = new ControlsGroup(group);
    Object.defineProperty(this, group.name, {
      value: controlsGroup,
    });
    return controlsGroup;
  }

  /**
   * Define un nuevo grupo de controles
   *
   * @param {Object} group Objeto con los atributos del grupo
   * @param {string} group.name Nombre del grupo
   * @param {(options: Object<string, any>) => Widget} group.createControl Funcion para crear el control
   */
  defineGroup({ name, createControl }) {
    if (typeof createControl !== "function") {
      throw new Error(
        "Controls.defineGroup() createControl must be a function."
      );
    }

    if (this.hasOwnProperty(name)) {
      throw new Error(
        `Controls.createGroup() cannot override existing group "${name}".`
      );
    }

    return this.#assignGroup({
      name,
      createControl,
    });
  }
}
