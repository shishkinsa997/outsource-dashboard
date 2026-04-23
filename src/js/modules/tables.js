import { POSITIONS, dom } from "../state/appState.js";
import { calculateAge } from "../utils/date.js";
import { formatCurrency, toFixed } from "../utils/format.js";

function createTableModule(deps) {
  const {
    getCurrentPeriodData,
    getEmployeeMetrics,
    getProjectMetrics,
    saveData,
    render,
  } = deps;

  function renderProjectsTable() {
    const period = getCurrentPeriodData();
    const projects = period.projects;
    dom.projectsTableBody.innerHTML = "";

    projects.forEach((project) => {
      const metrics = getProjectMetrics(project, period.employees);
      const row = document.createElement("tr");
      const capacityClass = metrics.usedEffectiveCapacity > project.employeeCapacity ? "over-capacity" : "";
      row.innerHTML = `
        <td>${project.companyName}</td>
        <td>${project.projectName}</td>
        <td>${formatCurrency(project.budget)}</td>
        <td class="${capacityClass}">${toFixed(metrics.usedEffectiveCapacity, 3)}/${toFixed(project.employeeCapacity, 2)}</td>
        <td><button class="show-details-btn">Show Employees (${metrics.assignments.length})</button></td>
        <td class="${metrics.estimatedIncome >= 0 ? "positive-income" : "negative-income"}">${formatCurrency(metrics.estimatedIncome)}</td>
        <td><button class="delete-btn">Delete</button></td>
      `;

      row.querySelector(".delete-btn").addEventListener("click", () => {
        if (!window.confirm(`Delete project "${project.projectName}"?`)) return;
        period.projects = period.projects.filter((item) => item.id !== project.id);
        period.employees = period.employees.map((employee) => ({
          ...employee,
          assignments: (employee.assignments || []).filter((assignment) => assignment.projectId !== project.id),
        }));
        saveData();
        render();
      });

      dom.projectsTableBody.append(row);
    });
  }

  function renderEmployeesTable() {
    const period = getCurrentPeriodData();
    const employees = period.employees;
    dom.employeesTableBody.innerHTML = "";

    employees.forEach((employee) => {
      const metrics = getEmployeeMetrics(employee, period.projects, period.employees);
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${employee.name}</td>
        <td>${employee.surname}</td>
        <td>${calculateAge(employee.dob)}</td>
        <td class="editable-position">${employee.position}</td>
        <td class="editable-salary">${formatCurrency(employee.salary)}</td>
        <td>${formatCurrency(employee.salary)}</td>
        <td>
          <button class="show-details-btn">
            Show Assignments (${(employee.assignments || []).length})
            <span class="capacity-indicator">${toFixed(metrics.usedCapacity, 1)}/1.5</span>
          </button>
        </td>
        <td></td>
        <td class="action-buttons">
          <button class="availability-btn">Availability</button>
          <button class="assign-btn" ${metrics.usedCapacity >= 1.5 ? "disabled" : ""}>Assign</button>
          <button class="delete-btn">Delete</button>
        </td>
      `;

      dom.employeesTableBody.append(row);
    });
  }

  return { renderProjectsTable, renderEmployeesTable };
}

export { createTableModule };
