import seedData from "../../data/appData.json";
import { STORAGE_KEY, state } from "../state/appState.js";
import { deepClone } from "../utils/format.js";

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.monthlyData));
}

function loadData() {
  state.monthlyData = deepClone(seedData);

  saveData();
}

export {
  saveData,
  loadData,
};
