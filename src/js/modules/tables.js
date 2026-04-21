import { dom } from "../state/appState.js";
import { toFixed } from "../utils/format.js";

function createTableModule(deps) {
  const {
    getCurrentPeriodData,
  } = deps;

  function renderProjectsTable() {
    const period = getCurrentPeriodData();
    const projects = period.projects;
    dom.projectsTableBody.innerHTML = "";
    console.log(projects)

    projects.forEach((project) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${project.companyName}</td>
        <td>${project.projectName}</td>
        <td>${project.budget}</td>
        <td>${toFixed(3)}/${toFixed(project.employeeCapacity, 2)}</td>
        <td><button class="show-details-btn">Show Employees (3)</button></td>
        <td></td>
        <td><button class="delete-btn">Delete</button></td>
      `;

      dom.projectsTableBody.append(row);
    });
  }

  return { renderProjectsTable };
}

export { createTableModule };
