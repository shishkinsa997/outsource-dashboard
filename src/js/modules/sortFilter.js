import { state } from "../state/appState.js";

function applySort(data, type) {
  console.log('not sorted', data)
  const sort = state.sort[type];
  if (!sort.key || !sort.direction) return data;


  const sorted = [...data];
  sorted.sort((a, b) => {
    let aValue;
    let bValue;

    aValue = a[sort.key];
    bValue = b[sort.key];

    if (typeof aValue === "string" || typeof bValue === "string") {
      const compare = String(aValue || "").localeCompare(String(bValue || ""));
      return sort.direction === "asc" ? compare : -compare;
    }
    const compare = Number(aValue || 0) - Number(bValue || 0);
    return sort.direction === "asc" ? compare : -compare;
  });
  console.log('sorted:', sorted);

  return sorted;
}

function setSort(type, key, render) {
  const current = state.sort[type];
  if (current.direction === "asc") {
    state.sort[type] = { key, direction: "desc" };
  } else {
    state.sort[type] = { key, direction: "asc" };
  }
  console.log('sort state:', state.sort[type]);
  render();
}

export {
  applySort,
  setSort,
};
