import seedData from "../../data/appData.json";
import { STORAGE_KEY, state } from "../state/appState.js";
import { deepClone } from "../utils/format.js";

function toPeriodKey(year = state.currentYear, month = state.currentMonth) {
  return `${year}-${month}`;
}

function getCurrentPeriodData() {
  const key = toPeriodKey();
  if (!state.monthlyData[key]) {
    state.monthlyData[key] = { employees: [], projects: [] };
  }
  return state.monthlyData[key];
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.monthlyData));
}


function loadData() {
  state.monthlyData = deepClone(seedData);

  const currentKey = toPeriodKey();
  if (!state.monthlyData[currentKey]) {
    state.monthlyData[currentKey] = { employees: [], projects: [] };
  }
  saveData();
}

export { toPeriodKey, getCurrentPeriodData, saveData, loadData };
