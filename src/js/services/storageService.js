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
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      Object.entries(parsed).forEach(([key, value]) => {
        state.monthlyData[key] = normalizeMonthData(value);
      });
    } catch {
      state.monthlyData = deepClone(seedData);
    }
  } else {
    state.monthlyData = deepClone(seedData);
  }

  const currentKey = toPeriodKey();
  if (!state.monthlyData[currentKey]) {
    state.monthlyData[currentKey] = { employees: [], projects: [] };
  }
  saveData();
}

export { toPeriodKey, getCurrentPeriodData, saveData, loadData };
