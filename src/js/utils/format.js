function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function toFixed(value, digits = 2) {
  return Number(value || 0).toFixed(digits);
}

export { deepClone, toFixed };
