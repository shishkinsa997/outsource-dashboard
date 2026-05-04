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

function normalizeMonthData(monthData) {
  const normalized = deepClone(monthData || { employees: [], projects: [] });
  normalized.projects = Array.isArray(normalized.projects) ? normalized.projects : [];
  normalized.employees = Array.isArray(normalized.employees) ? normalized.employees : [];

  normalized.projects = normalized.projects.map((project) => ({
    ...project,
    budget: Number(project.budget) || 0,
    employeeCapacity: Number(project.employeeCapacity) || 0,
  }));

  normalized.employees = normalized.employees.map((employee) => ({
    ...employee,
    salary: Number(employee.salary) || 0,
    assignments: Array.isArray(employee.assignments) ? employee.assignments : [],
    vacationDays: Array.isArray(employee.vacationDays) ? employee.vacationDays : [],
  }));

  return normalized;
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

export { toPeriodKey, getCurrentPeriodData, saveData, normalizeMonthData, loadData };
