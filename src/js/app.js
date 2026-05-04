import { dom, state, uiState } from "./state/appState.js";
import { getEmployeeAssignment, getEmployeeMetrics, getProjectMetrics, getTotalEstimatedIncome } from "./services/metricsService.js";
import { getCurrentPeriodData, loadData, saveData, toPeriodKey } from "./services/storageService.js";
import { validateEmployeeForm, validateProjectForm } from "./modules/forms.js";
import { applyFilters, applySort, openFilterPopup, renderFilterChips, setSort, updateSortIcons } from "./modules/sortFilter.js";
import { closeFilterPopup, closePanels, openDetailsPopup } from "./modules/ui.js";
import { createTableModule } from "./modules/tables.js";
import { showUnassignPopup } from "./modules/interaction.js";

function updateEmployee(employeeId, updater) {
  const period = getCurrentPeriodData();
  const index = period.employees.findIndex((employee) => employee.id === employeeId);
  if (index === -1) return;
  period.employees[index] = updater(period.employees[index]);
  saveData();
  render();
}

const tableModule = createTableModule({
  applyFilters: (data, type) => applyFilters(data, type, getCurrentPeriodData),
  applySort: (data, type) =>
    applySort(data, type, getCurrentPeriodData, getEmployeeMetrics, getProjectMetrics),
  getCurrentPeriodData,
  getEmployeeMetrics,
  getProjectMetrics,
  getTotalEstimatedIncome,
  saveData,
  render: () => render(),
  openDetailsPopup,
  showUnassignPopup,
  updateEmployee,
});

function render() {
  closeFilterPopup();
  dom.projectsContent.classList.toggle("hidden", state.activeTab !== "projects");
  dom.employeesContent.classList.toggle("hidden", state.activeTab !== "employees");
  dom.navProjects.classList.toggle("active", state.activeTab === "projects");
  dom.navEmployees.classList.toggle("active", state.activeTab === "employees");
  tableModule.renderProjectsTable();
  tableModule.renderEmployeesTable();
  renderFilterChips(() => render());
  updateSortIcons();
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
    validateEmployeeForm();
    closePanels();
  });
  dom.cancelProjectBtn.addEventListener("click", () => {
    dom.addProjectForm.reset();
    validateProjectForm();
    closePanels();
  });

  ["input", "blur"].forEach((eventName) => {
    dom.addEmployeeForm.addEventListener(eventName, validateEmployeeForm, true);
    dom.addProjectForm.addEventListener(eventName, validateProjectForm, true);
  });

  dom.addEmployeeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    validateEmployeeForm();
    if (dom.employeeSubmitBtn.disabled) return;
    const period = getCurrentPeriodData();
    const formData = new FormData(dom.addEmployeeForm);
    period.employees.push({
      id: Date.now(),
      name: String(formData.get("name")).trim(),
      surname: String(formData.get("surname")).trim(),
      dob: String(formData.get("dob")),
      position: String(formData.get("position")),
      salary: Number(formData.get("salary")),
      assignments: [],
      vacationDays: [],
    });
    saveData();
    dom.addEmployeeForm.reset();
    validateEmployeeForm();
    closePanels();
    render();
  });

  dom.addProjectForm.addEventListener("submit", (event) => {
    event.preventDefault();
    validateProjectForm();
    if (dom.projectSubmitBtn.disabled) return;
    const period = getCurrentPeriodData();
    const formData = new FormData(dom.addProjectForm);
    period.projects.push({
      id: Date.now(),
      projectName: String(formData.get("project-name")).trim(),
      companyName: String(formData.get("company-name")).trim(),
      budget: Number(formData.get("project-budget")),
      employeeCapacity: Number(formData.get("employee-capacity")),
    });
    saveData();
    dom.addProjectForm.reset();
    validateProjectForm();
    closePanels();
    render();
  });

  document.querySelectorAll("th.sortable").forEach((header) => {
    header.addEventListener("click", (event) => {
      if (event.target.classList.contains("filter-icon")) return;
      const tableType = header.closest("table").id === "projects-table" ? "projects" : "employees";
      setSort(tableType, header.dataset.sort, () => render());
    });
  });

  document.querySelectorAll(".filter-icon").forEach((icon) => {
    icon.addEventListener("click", (event) => {
      event.stopPropagation();
      const header = icon.closest("th");
      const tableType = header.closest("table").id === "projects-table" ? "projects" : "employees";
      openFilterPopup(header, tableType, header.dataset.filter, () => render(), closeFilterPopup);
    });
  });

  document.addEventListener("click", (event) => {
    if (
      uiState.activeFilterPopup &&
      !uiState.activeFilterPopup.contains(event.target) &&
      !event.target.classList.contains("filter-icon")
    ) {
      closeFilterPopup();
    }
  });

}

function initDashboard() {
  loadData();
  initEvents();
  validateEmployeeForm();
  validateProjectForm();
  render();
}

export { initDashboard };
