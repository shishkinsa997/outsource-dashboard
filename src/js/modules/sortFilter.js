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


export {
  applySort,
  applyFilters,
  setSort,
  updateSortIcons,
};
