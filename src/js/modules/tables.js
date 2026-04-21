import { dom } from "../state/appState.js";
import { calculateAge } from "../utils/date.js";
import { toFixed } from "../utils/format.js";

function createTableModule(deps) {
  const {
    getCurrentPeriodData,
    getEmployeeMetrics,
    getProjectMetrics,
  } = deps;

  function renderProjectsTable() {
    const period = getCurrentPeriodData();
    const projects = period.projects;
    dom.projectsTableBody.innerHTML = "";

    projects.forEach((project) => {
      const metrics = getProjectMetrics(project, period.employees);
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${project.companyName}</td>
        <td>${project.projectName}</td>
        <td>${project.budget}</td>
        <td>${toFixed(metrics.usedEffectiveCapacity, 3)}/${toFixed(project.employeeCapacity, 2)}</td>
        <td><button class="show-details-btn">Show Employees (${metrics.assignments.length})</button></td>
        <td></td>
        <td><button class="delete-btn">Delete</button></td>
      `;

      dom.projectsTableBody.append(row);
    });
  }

  function renderEmployeesTable() {
    const period = getCurrentPeriodData();
    const employees = period.employees;
    dom.employeesTableBody.innerHTML = "";

    employees.forEach((employee) => {
      const metrics = getEmployeeMetrics(employee);
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${employee.name}</td>
        <td>${employee.surname}</td>
        <td>${calculateAge(employee.dob)}</td>
        <td class="editable-position">${employee.position}</td>
        <td class="editable-salary">${employee.salary}</td>
        <td>${employee.salary}</td>
        <td>
          <button class="show-details-btn">
            Show Assignments (${(employee.assignments || []).length})
            <span class="capacity-indicator">${toFixed(metrics.usedCapacity, 1)}/1.5</span>
          </button>
        </td>
        <td></td>
        <td class="action-buttons">
          <button class="availability-btn">Availability</button>
          <button class="assign-btn">Assign</button>
          <button class="delete-btn">Delete</button>
        </td>
      `;

      dom.employeesTableBody.append(row);
    });
  }

  return { renderProjectsTable, renderEmployeesTable };
}

export { createTableModule };
