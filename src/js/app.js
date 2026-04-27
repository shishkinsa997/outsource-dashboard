import { dom, state } from "./state/appState.js";
import { getEmployeeAssignment, getEmployeeMetrics, getProjectMetrics, getTotalEstimatedIncome } from "./services/metricsService.js";
import { getCurrentPeriodData, loadData, saveData, toPeriodKey } from "./services/storageService.js";
import { applySort, setSort } from "./modules/sortFilter.js";
import { closePanels } from "./modules/ui.js";
import { createTableModule } from "./modules/tables.js";

const tableModule = createTableModule({
  applySort: (data, type) =>
    applySort(data, type),
  getCurrentPeriodData,
  getEmployeeMetrics,
  getProjectMetrics,
  getTotalEstimatedIncome,
  saveData,
  render: () => render(),
});

function render() {
  dom.projectsContent.classList.toggle("hidden", state.activeTab !== "projects");
  dom.employeesContent.classList.toggle("hidden", state.activeTab !== "employees");
  dom.navProjects.classList.toggle("active", state.activeTab === "projects");
  dom.navEmployees.classList.toggle("active", state.activeTab === "employees");
  tableModule.renderProjectsTable();
  tableModule.renderEmployeesTable();
}

function initEvents() {
  dom.monthSelect.value = String(state.currentMonth);
  dom.yearSelect.value = String(state.currentYear);

  dom.monthSelect.addEventListener("change", () => {
    state.currentMonth = Number(dom.monthSelect.value);
    getCurrentPeriodData();
    saveData();
    render();
  });
  dom.yearSelect.addEventListener("change", () => {
    state.currentYear = Number(dom.yearSelect.value);
    getCurrentPeriodData();
    saveData();
    render();
  });

  dom.navProjects.addEventListener("click", (event) => {
    event.preventDefault();
    state.activeTab = "projects";
    render();
  });
  dom.navEmployees.addEventListener("click", (event) => {
    event.preventDefault();
    state.activeTab = "employees";
    render();
  });

  dom.toggleButton.addEventListener("click", () => {
    dom.sidePanel.classList.add("hidden");
    dom.openButton.classList.remove("hidden");
  });
  dom.openButton.addEventListener("click", () => {
    dom.sidePanel.classList.remove("hidden");
    dom.openButton.classList.add("hidden");
  });

  dom.addEmployeeBtn.addEventListener("click", () => {
    dom.addEmployeePanel.classList.add("open");
    dom.addProjectPanel.classList.remove("open");
  });
  dom.addProjectBtn.addEventListener("click", () => {
    dom.addProjectPanel.classList.add("open");
    dom.addEmployeePanel.classList.remove("open");
  });
  dom.cancelEmployeeBtn.addEventListener("click", () => {
    dom.addEmployeeForm.reset();
    closePanels();
  });
  dom.cancelProjectBtn.addEventListener("click", () => {
    dom.addProjectForm.reset();
    closePanels();
  });

  document.querySelectorAll("th.sortable").forEach((header) => {
    header.addEventListener("click", (event) => {
      if (event.target.classList.contains("filter-icon")) return;
      const tableType = header.closest("table").id === "projects-table" ? "projects" : "employees";
      setSort(tableType, header.dataset.sort, () => render());
    });
  });

}

function initDashboard() {
  loadData();
  initEvents();
  render();
}

export { initDashboard };
