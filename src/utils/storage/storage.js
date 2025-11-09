export default class Storage {
  static save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  static get(key) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  static has(key) {
    return localStorage.getItem(key) !== null;
  }

  static create() {
    return new Storage();
  }
}
