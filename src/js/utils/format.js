function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function toFixed(value, digits = 2) {
  return Number(value || 0).toFixed(digits);
}

export { deepClone, formatCurrency, toFixed };
