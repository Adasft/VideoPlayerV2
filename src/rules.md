Para definir los eventos de los widgets, se deben seguir los siguientes patrones:

- La funcion que se encarga de definir los eventos debe ser un método privado del widget que crea a otros widgets.
- El nombre del método debe empezar con `set` y después seguir con el nombre del widget
  y terminar con `Events`. Por ejemplo, si el widget es `Video`, el método que se encarga de definir los eventos debe llamarse `setVideoEvents`.
- Si los widgets son controles, el método debe empezar con `set` y seguir con el nombre
  del control y el grupo al que pertenece, para finalmente terminar con `Events`. Por ejmplo, si el control se llama `volume` y pertenece al grupo `sliders`, el método que se encarga de definir los eventos debe llamarse `setVolumeSliderEvents`.

Para crear a los widgets, la funcion que se encarga de crearlos debe ser un método privado del widget que crea a otros widgets. Y el nombre del método debe seguir los siguientes patrones:

- la funcion que se encarga de crear al widget debe empezar con `create` y seguir con
  el nombre del widget y terminar con `Widget`. Por ejemplo, si el widget es `Video`, el método que se encarga de crearlo debe llamarse `createVideoWidget`.
- Dentro de la funcion que se encarga de crear al widget, se puede llamar al método
  encargado de definir los eventos de los widgets.

Las funciones que comienzan con `initialize` se encargan de inicializar cualquier estado que se necesite para que el widget funcione correctamente.

Las funciones que comienzan con `on` se encargan de manejar los eventos del widget. Estas funciones deben llamarse `on` seguido del nombre del evento. Siempre deben ser privadas a excepción del manejador para el evento `refresh` (`onRefresh`).

En los componentes, de los widgets, las funciones que manejan los eventos deben llamarse `on` seguido del nombre del evento. En los componentes, estas funciones si pueden ser publicas.

Primero en todas las clases, primero se definen las propiedades estáticas, luego se definen las propiedades de instancia, y por último se definen los métodos de clase.

1. Propiedades estáticas
2. Propiedades de instancia
3. Se llama al constructor de la clase, si así lo requiere.
4. Se definen los getters y setters de las propiedades de la clase.
5. Se definen los métodos publicos de la clase.
6. Se definen los métodos privados de la clasa.

Cuando se trata de un componente, se siguen los mismos pasos, pero en la seccion de los metodos publicos, primero se llama al metodo `createElement` y luego se definen los métodos de clase. Aplica igual para el método `#init`.
