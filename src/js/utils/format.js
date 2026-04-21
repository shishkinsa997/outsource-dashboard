function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

export { deepClone };
