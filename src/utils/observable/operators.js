import {Observable, Subscriber} from "./observable.js";

/**
 * Creates an observable that applies a transformation to the values emitted by the source observable.
 * This is useful for modifying the data stream, such as scaling or formatting values.
 * @param {(value: any) => any} projection - The transformation function to apply to each value.
 * @return {(source: Observable) => Observable} A new observable that emits transformed values.
 */
export function map(projection) {
  return (source) =>
    new Observable({
      onSubscribe: (observer) => {
        source.subscribe(new Subscriber(observer, projection));
      },
    });
}

/**
 * Creates an observable that emits initial values before the source observable.
 * This is useful for providing default values or initial state.
 * @param {...any} initialValues - The initial values to emit.
 * @return {(source: Observable) => Observable} A new observable that emits the initial values followed by the source observable's values.
 */
export function startWith(...initialValues) {
  return (source) =>
    new Observable({
      onSubscribe: (observer) => {
        const subscriber = new Subscriber(observer);
        initialValues.length
          ? initialValues.forEach((value) => subscriber.next(value))
          : subscriber.next();
        source.subscribe(observer);
      },
    });
}
