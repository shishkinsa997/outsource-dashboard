import { MONTH_NAMES, dom, state } from "../state/appState.js";
import { deepClone, formatCurrency } from "../utils/format.js";

function closeSeedDataPopup() {
  dom.seedDataBackdrop.style.display = "none";
  dom.seedDataPopup.style.display = "none";
}

function openSeedDataPopup(deps) {
  const { toPeriodKey, normalizeMonthData, getTotalEstimatedIncome, saveData, render } = deps;
  const currentKey = toPeriodKey();
  dom.currentMonthDisplay.textContent = `${MONTH_NAMES[state.currentMonth]} ${state.currentYear}`;
  dom.seedDataTableBody.innerHTML = "";
  const periods = Object.keys(state.monthlyData).filter((key) => key !== currentKey);

  periods.forEach((key) => {
    const [year, month] = key.split("-").map(Number);
    const period = normalizeMonthData(state.monthlyData[key]);
    const income = getTotalEstimatedIncome(period.projects, period.employees);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${year}</td>
      <td>${MONTH_NAMES[month]}</td>
      <td>${period.projects.length}</td>
      <td>${period.employees.length}</td>
      <td class="${income >= 0 ? "positive-income" : "negative-income"}">${formatCurrency(income)}</td>
      <td><button class="seed-month-btn">Seed</button></td>
    `;

    row.querySelector(".seed-month-btn").addEventListener("click", () => {
      const fromPeriod = `${MONTH_NAMES[month]} ${year}`;
      const toPeriod = `${MONTH_NAMES[state.currentMonth]} ${state.currentYear}`;
      if (!window.confirm(`Copy data from ${fromPeriod} to ${toPeriod}?`)) return;

      const copied = deepClone(state.monthlyData[key]);
      copied.employees = copied.employees.map((employee) => ({
        ...employee,
        vacationDays: [],
      }));
      state.monthlyData[currentKey] = copied;
      saveData();
      closeSeedDataPopup();
      render();
    });

    dom.seedDataTableBody.append(row);
  });

  dom.seedDataBackdrop.style.display = "block";
  dom.seedDataPopup.style.display = "flex";
}

export { openSeedDataPopup, closeSeedDataPopup };
