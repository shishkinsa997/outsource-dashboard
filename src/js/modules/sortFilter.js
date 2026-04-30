import { state, uiState } from "../state/appState.js";
import { calculateAge } from "../utils/date.js";

function applySort(data, type, getCurrentPeriodData, getEmployeeMetrics, getProjectMetrics) {
  console.log('not sorted', data)
  const sort = state.sort[type];
  if (!sort.key || !sort.direction) return data;


  const sorted = [...data];
  sorted.sort((a, b) => {
    let aValue;
    let bValue;

    if (type === "projects") {
      if (sort.key === "employeeCapacity") {
        const period = getCurrentPeriodData();
        aValue = getProjectMetrics(a, period.employees).usedEffectiveCapacity;
        bValue = getProjectMetrics(b, period.employees).usedEffectiveCapacity;
      } else if (sort.key === "estimatedIncome") {
        const period = getCurrentPeriodData();
        aValue = getProjectMetrics(a, period.employees).estimatedIncome;
        bValue = getProjectMetrics(b, period.employees).estimatedIncome;
      } else {
        aValue = a[sort.key];
        bValue = b[sort.key];
      }
    } else {
      const period = getCurrentPeriodData();
      const aMetrics = getEmployeeMetrics(a, period.projects, period.employees);
      const bMetrics = getEmployeeMetrics(b, period.projects, period.employees);
      if (sort.key === "age") {
        aValue = calculateAge(a.dob);
        bValue = calculateAge(b.dob);
      } else if (sort.key === "estimatedPayment") {
        aValue = aMetrics.estimatedPayment;
        bValue = bMetrics.estimatedPayment;
      } else if (sort.key === "projectedIncome") {
        aValue = aMetrics.projectedIncome;
        bValue = bMetrics.projectedIncome;
      } else if (sort.key === "projectId") {
        aValue = (a.assignments || []).length;
        bValue = (b.assignments || []).length;
      } else {
        aValue = a[sort.key];
        bValue = b[sort.key];
      }
    }

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

function applyFilters(data, type, getCurrentPeriodData) {
  const filters = state.filters[type];
  if (!Object.keys(filters).length) return data;

  const period = getCurrentPeriodData();
  return data.filter((item) =>
    Object.entries(filters).every(([key, rawValue]) => {
      const value = String(rawValue).toLowerCase();
      if (type === "employees" && key === "projectId") {
        const projectNames = (item.assignments || [])
          .map((assignment) => period.projects.find((project) => project.id === assignment.projectId)?.projectName || "")
          .join(" ");
        return projectNames.toLowerCase().includes(value);
      }
      return String(item[key] || "").toLowerCase().includes(value);
    }),
  );
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

function updateSortIcons() {
  document.querySelectorAll("th.sortable").forEach((header) => {
    const type = header.closest("table").id === "projects-table" ? "projects" : "employees";
    const sort = state.sort[type];
    const icon = header.querySelector(".sort-icon");
    header.classList.remove("sorted");
    if (!icon) return;
    if (sort.key === header.dataset.sort) {
      header.classList.add("sorted");
      icon.textContent = sort.direction === "asc" ? "↑" : "↓";
    } else {
      icon.textContent = "⇅";
    }
  });
}

function openFilterPopup(header, type, field, render, closeFilterPopup) {
  closeFilterPopup();

  const popup = document.createElement("div");
  popup.className = "filter-popup";
  const currentValue = state.filters[type][field] || "";
  const content = `<input class="filter-input" type="text" value="${currentValue}" placeholder="Filter..." />`;

  popup.innerHTML = `
    ${content}
    <button class="accept-filter">Apply</button>
    <button class="cancel-filter">Cancel</button>
  `;

  document.body.append(popup);
  const rect = header.getBoundingClientRect();
  popup.style.top = `${rect.bottom + window.scrollY + 4}px`;
  popup.style.left = `${rect.left + window.scrollX}px`;
  uiState.activeFilterPopup = popup;

  const input = popup.querySelector(".filter-input");
  const apply = () => {
    const value = String(input.value || "").trim();
    if (value) state.filters[type][field] = value;
    else delete state.filters[type][field];
    render();
    closeFilterPopup();
  };

  popup.querySelector(".accept-filter").addEventListener("click", apply);
  popup.querySelector(".cancel-filter").addEventListener("click", closeFilterPopup);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") apply();
  });
  input.focus();
}

export {
  applySort,
  applyFilters,
  setSort,
  updateSortIcons,
  openFilterPopup,
};
