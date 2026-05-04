import { POSITIONS, dom } from "../state/appState.js";
import { calculateAge } from "../utils/date.js";
import { formatCurrency, toFixed } from "../utils/format.js";

function createTableModule(deps) {
  const {
    applyFilters,
    applySort,
    getCurrentPeriodData,
    getEmployeeMetrics,
    getProjectMetrics,
    getTotalEstimatedIncome,
    saveData,
    render,
    openDetailsPopup,
    showUnassignPopup,
    updateEmployee,
  } = deps;

  function showProjectsPopup(project) {
    const period = getCurrentPeriodData();
    const metrics = getProjectMetrics(project, period.employees);
    const rows = [...metrics.assignments].sort((a, b) =>
      `${a.employee.name} ${a.employee.surname}`.localeCompare(`${b.employee.name} ${b.employee.surname}`),
    );

    openDetailsPopup(`Project Employees - ${project.projectName}`, (content) => {
      if (!rows.length) {
        content.innerHTML = "<p>No employees assigned to this project.</p>";
        return;
      }

      const table = document.createElement("table");
      table.className = "details-table";
      table.innerHTML = `
        <thead>
          <tr>
            <th>Employee</th>
            <th>Capacity</th>
            <th>Fit</th>
            <th>Vacation Days</th>
            <th>Effective Capacity</th>
            <th>Revenue</th>
            <th>Cost</th>
            <th>Profit</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody></tbody>
      `;

      const tbody = table.querySelector("tbody");
      rows.forEach((item) => {
        const row = document.createElement("tr");
        const vacationDays = (item.employee.vacationDays || []).length;
        row.innerHTML = `
          <td><a href="#" class="employee-link">${item.employee.name} ${item.employee.surname}</a></td>
          <td>${toFixed(item.assignment.capacity, 2)}</td>
          <td>${toFixed(item.assignment.fit, 2)}</td>
          <td>${vacationDays}</td>
          <td>${toFixed(item.effectiveCapacity, 3)}</td>
          <td>${formatCurrency(item.revenue)}</td>
          <td>${formatCurrency(item.cost)}</td>
          <td class="${item.profit >= 0 ? "positive-income" : "negative-income"}">${formatCurrency(item.profit)}</td>
          <td>
            <button class="edit-assignment-btn">Edit</button>
            <button class="delete-btn">Unassign</button>
          </td>
        `;

        row.querySelector(".delete-btn").addEventListener("click", () => {
          showUnassignPopup(item.employee, project, item.assignment, {
            getCurrentPeriodData,
            getProjectMetrics,
            onConfirm: () => {
              updateEmployee(item.employee.id, (target) => ({
                ...target,
                assignments: target.assignments.filter((assignment) => assignment.projectId !== project.id),
              }));
            },
          });
        });
        tbody.append(row);
      });

      content.append(table);
    });
  }

  function renderProjectsTable() {
    const period = getCurrentPeriodData();
    const filtered = applyFilters(period.projects, "projects");
    const projects = applySort(filtered, "projects");
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

      row.querySelector(".show-details-btn").addEventListener("click", () => {
        showProjectsPopup(project);
      });
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

    let totalBlock = document.getElementById("total-income-info");
    if (!totalBlock) {
      totalBlock = document.createElement("div");
      totalBlock.id = "total-income-info";
      totalBlock.className = "total-income-info";
      dom.projectsContent.append(totalBlock);
    }
    const total = getTotalEstimatedIncome(period.projects, period.employees);
    totalBlock.innerHTML = `
      Total Estimated Income:
      <span class="total-amount ${total >= 0 ? "positive-income" : "negative-income"}">${formatCurrency(total)}</span>
    `;
  }

  function renderEmployeesTable() {
    const period = getCurrentPeriodData();
    const filtered = applyFilters(period.employees, "employees");
    const employees = applySort(filtered, "employees");
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
        <td>${formatCurrency(metrics.estimatedPayment)}</td>
        <td>
          <button class="show-details-btn">
            Show Assignments (${(employee.assignments || []).length})
            <span class="capacity-indicator">${toFixed(metrics.usedCapacity, 1)}/1.5</span>
          </button>
        </td>
        <td class="${metrics.projectedIncome >= 0 ? "positive-income" : "negative-income"}">${formatCurrency(metrics.projectedIncome)}</td>
        <td class="action-buttons">
          <button class="availability-btn">Availability</button>
          <button class="assign-btn" ${metrics.usedCapacity >= 1.5 ? "disabled" : ""}>Assign</button>
          <button class="delete-btn">Delete</button>
        </td>
      `;
      row.querySelector(".delete-btn").addEventListener("click", () => {
        if (!window.confirm(`Delete employee "${employee.name} ${employee.surname}"?`)) return;
        period.employees = period.employees.filter((item) => item.id !== employee.id);
        saveData();
        render();
      });

      dom.employeesTableBody.append(row);
    });
  }

  return { renderProjectsTable, renderEmployeesTable };
}

export { createTableModule };
