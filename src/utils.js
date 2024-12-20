export function getEnum(symbol) {
  return symbol.description;
}

export function getRandomId() {
  return Math.random().toString(36).substring(2);
}

export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffle(array) {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

export function orderBy(array, key, order = "asc") {
  const sortedArray = [...array];
  return sortedArray.sort((a, b) => {
    if (a[key] < b[key]) {
      return order === "asc" ? -1 : 1;
    } else if (a[key] > b[key]) {
      return order === "asc" ? 1 : -1;
    } else {
      return 0;
    }
  });
}

export function toCamelCase(str) {
  return str?.replace(/-([a-z])/, (_, letter) => letter.toUpperCase());
}

export function toSnakeCase(str, global = false) {
  return str?.replace(
    global ? /[A-Z]/g : /[A-Z]/,
    (letter) => `-${letter.toLowerCase()}`
  );
}

export function toCapitalCase(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const hoursString = hours > 0 ? hours.toFixed(0).padStart(2, "0") + ":" : "";
  const minutesString = minutes.toFixed(0).padStart(2, "0");
  const secondsString = secs.toFixed(0).padStart(2, "0");

  return `${hoursString}${minutesString}:${secondsString}`;
}

export function noop() {}

export function throttle(func, delay) {
  let lastCall = 0;
  return function (...args) {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    func(...args);
  };
}
