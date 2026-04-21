import { dom, state } from "./state/appState.js";
import { loadData, saveData } from "./services/storageService.js";

function render() {
  dom.projectsContent.classList.toggle("hidden", state.activeTab !== "projects");
  dom.employeesContent.classList.toggle("hidden", state.activeTab !== "employees");
  dom.navProjects.classList.toggle("active", state.activeTab === "projects");
  dom.navEmployees.classList.toggle("active", state.activeTab === "employees");
}

function initEvents() {
  dom.monthSelect.value = String(state.currentMonth);
  dom.yearSelect.value = String(state.currentYear);

  dom.monthSelect.addEventListener("change", () => {
    state.currentMonth = Number(dom.monthSelect.value);
    saveData();
    render();
  });
  dom.yearSelect.addEventListener("change", () => {
    state.currentYear = Number(dom.yearSelect.value);
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
  });
  dom.cancelProjectBtn.addEventListener("click", () => {
    dom.addProjectForm.reset();
  });

}

console.log(dom.addEmployeeForm);

function initDashboard() {
  loadData();
  initEvents();
  render();
}

export { initDashboard };
