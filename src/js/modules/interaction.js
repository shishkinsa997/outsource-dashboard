import { formatCurrency, toFixed } from "../utils/format.js";

function showUnassignPopup(employee, project, assignment, deps) {
  const { getCurrentPeriodData, getProjectMetrics, onConfirm } = deps;
  const period = getCurrentPeriodData();
  const projectMetrics = getProjectMetrics(project, period.employees);
  const assignmentMetrics = projectMetrics.assignments.find((item) => item.employee.id === employee.id);
  if (!assignmentMetrics) return;

  const overlay = document.createElement("div");
  overlay.className = "unassignment-popup-overlay";
  const afterUsedCapacity = projectMetrics.usedEffectiveCapacity - assignmentMetrics.effectiveCapacity;
  const afterIncome = projectMetrics.estimatedIncome - assignmentMetrics.profit;
  const salaryShare = employee.salary * Number(assignment.capacity);
  const budgetShare = projectMetrics.revenuePerEffectiveCapacity * assignmentMetrics.effectiveCapacity;

  overlay.innerHTML = `
    <div class="unassignment-popup-content">
      <h3>Unassign Confirmation</h3>
      <div class="unassign-message">
        Unassign <strong>${employee.name} ${employee.surname}</strong> from
        <strong>${project.projectName}</strong>?
      </div>
      <div class="unassignment-info">
        <div>Assigned capacity: <strong>${toFixed(assignment.capacity, 2)}</strong></div>
        <div>Salary share: <strong>${formatCurrency(salaryShare)}</strong></div>
        <div>Budget share: <strong>${formatCurrency(budgetShare)}</strong></div>
        <div>Assignment income:
          <strong class="${assignmentMetrics.profit >= 0 ? "positive-income" : "negative-income"}">${formatCurrency(assignmentMetrics.profit)}</strong>
        </div>
        <div>Project capacity:
          <strong>${toFixed(projectMetrics.usedEffectiveCapacity, 3)}</strong> → <strong>${toFixed(afterUsedCapacity, 3)}</strong>
        </div>
        <div>Project income:
          <strong class="${projectMetrics.estimatedIncome >= 0 ? "positive-income" : "negative-income"}">${formatCurrency(projectMetrics.estimatedIncome)}</strong>
          →
          <strong class="${afterIncome >= 0 ? "positive-income" : "negative-income"}">${formatCurrency(afterIncome)}</strong>
        </div>
      </div>
      <div class="popup-actions">
        <button class="popup-btn popup-cancel">Cancel</button>
        <button class="popup-btn popup-confirm-unassign">Confirm</button>
      </div>
    </div>
  `;

  const close = () => overlay.remove();
  overlay.querySelector(".popup-cancel").addEventListener("click", close);
  overlay.querySelector(".popup-confirm-unassign").addEventListener("click", () => {
    onConfirm();
    close();
  });
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });
  document.body.append(overlay);
}

export { showUnassignPopup };
