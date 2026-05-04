import { MONTH_NAMES, WEEK_DAY_NAMES, now, uiState, state } from "../state/appState.js";
import { formatCurrency, toFixed } from "../utils/format.js";
import { countWorkingDays, formatVacationRanges, getVacationCoefficient, isWeekend } from "../utils/date.js";

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

function openAssignmentPopup(employee, anchorButton, options, deps) {
  const { closeAssignmentPopup, getCurrentPeriodData, getEmployeeAssignment, getProjectMetrics, updateEmployee } = deps;
  closeAssignmentPopup();

  const period = getCurrentPeriodData();
  let popup = null;

  const overlayCloseHandler = (event) => {
    if (popup && !popup.contains(event.target) && event.target !== anchorButton) {
      closeAssignmentPopup();
    }
  };

  popup = document.createElement("div");
  popup.className = "assignment-popup";
  popup.innerHTML = `
    <div class="assignment-popup-content">
      <h3>${options.editMode ? "Edit Assignment" : "Assign Employee"}</h3>
      <div class="capacity-status">
        Current capacity: <strong class="target-capacity"></strong><br />
        Available capacity: <strong class="available-capacity"></strong>
      </div>
      <label>Project:</label>
      <select class="project-select"></select>
      <div class="project-info">
        <div class="info-row"><span class="info-label">Project capacity:</span><span class="info-value project-capacity-value">-</span></div>
        <div class="info-row"><span class="info-label">Predicted employee capacity:</span><span class="info-value predicted-capacity-value">-</span></div>
        <div class="info-row"><span class="info-label">Effective capacity:</span><span class="info-value effective-capacity-value">-</span></div>
      </div>
      <div class="capacity-input-section">
        <label>Capacity: <span class="capacity-value"></span></label>
        <input type="range" class="capacity-input" min="0" max="1.5" step="0.1" />
      </div>
      <div class="capacity-input-section">
        <label>Fit: <span class="fit-value"></span></label>
        <input type="range" class="fit-input" min="0" max="1" step="0.1" />
      </div>
      <div class="validation-message"></div>
      <div class="popup-buttons">
        <button class="cancel-assignment">Cancel</button>
        <button class="apply-assignment">${options.editMode ? "Save" : "Assign"}</button>
      </div>
    </div>
  `;
  document.body.append(popup);

  const projectSelect = popup.querySelector(".project-select");
  const capacityInput = popup.querySelector(".capacity-input");
  const fitInput = popup.querySelector(".fit-input");
  const applyBtn = popup.querySelector(".apply-assignment");
  const validationMessage = popup.querySelector(".validation-message");
  const capacityValue = popup.querySelector(".capacity-value");
  const fitValue = popup.querySelector(".fit-value");
  const targetCapacityEl = popup.querySelector(".target-capacity");
  const availableCapacityEl = popup.querySelector(".available-capacity");
  const projectCapacityValue = popup.querySelector(".project-capacity-value");
  const predictedCapacityValue = popup.querySelector(".predicted-capacity-value");
  const effectiveCapacityValue = popup.querySelector(".effective-capacity-value");

  const currentUsedCapacity = (employee.assignments || []).reduce(
    (sum, item) => sum + Number(item.capacity),
    0,
  );
  targetCapacityEl.textContent = `${toFixed(currentUsedCapacity, 1)}/1.5`;

  const editableProjectId = options.project?.id || null;
  const currentAssignment = editableProjectId
    ? getEmployeeAssignment(employee, editableProjectId)
    : null;

  const availableProjects = period.projects.filter((project) => {
    if (options.editMode) return project.id === editableProjectId;
    return !(employee.assignments || []).some((assignment) => assignment.projectId === project.id);
  });

  if (!availableProjects.length) {
    projectSelect.innerHTML = '<option value="">No available projects</option>';
    applyBtn.disabled = true;
  } else {
    projectSelect.innerHTML = availableProjects
      .map((project) => `<option value="${project.id}">${project.projectName}</option>`)
      .join("");
  }

  capacityInput.value = currentAssignment ? currentAssignment.capacity : 0.5;
  fitInput.value = currentAssignment ? currentAssignment.fit : 1;

  function positionPopup() {
    const rect = anchorButton.getBoundingClientRect();
    popup.style.top = `${rect.bottom + 8}px`;
    popup.style.left = `${rect.left}px`;
    const popupRect = popup.getBoundingClientRect();
    if (popupRect.right > window.innerWidth - 8) {
      popup.style.left = `${window.innerWidth - popupRect.width - 8}px`;
    }
    if (popupRect.bottom > window.innerHeight - 8) {
      popup.style.top = `${Math.max(8, rect.top - popupRect.height - 8)}px`;
    }
    if (popup.getBoundingClientRect().left < 8) popup.style.left = "8px";
  }

  function validateAndRender() {
    const selectedProject = period.projects.find((project) => project.id === Number(projectSelect.value));
    const selectedCapacity = Number(capacityInput.value);
    const selectedFit = Number(fitInput.value);
    capacityValue.textContent = toFixed(selectedCapacity, 1);
    fitValue.textContent = toFixed(selectedFit, 1);

    const capacityExcludingEdited = options.editMode
      ? currentUsedCapacity - Number(currentAssignment?.capacity || 0)
      : currentUsedCapacity;
    const predictedEmployeeCapacity = capacityExcludingEdited + selectedCapacity;
    const available = Math.max(0, 1.5 - capacityExcludingEdited);
    availableCapacityEl.textContent = toFixed(available, 1);
    predictedCapacityValue.textContent = `${toFixed(predictedEmployeeCapacity, 1)}/1.5`;
    const vacationCoefficient = getVacationCoefficient(employee);
    effectiveCapacityValue.textContent = toFixed(
      selectedCapacity * selectedFit * vacationCoefficient,
      3,
    );

    if (!selectedProject) {
      projectCapacityValue.textContent = "-";
      validationMessage.className = "validation-message error";
      validationMessage.textContent = "Select a project.";
      applyBtn.disabled = true;
      return;
    }

    const projectMetrics = getProjectMetrics(selectedProject, period.employees);
    const currentProjectLoad = projectMetrics.usedEffectiveCapacity;
    projectCapacityValue.innerHTML =
      `<span class="${currentProjectLoad > selectedProject.employeeCapacity ? "over-capacity" : ""}">` +
      `${toFixed(currentProjectLoad, 3)} / ${toFixed(selectedProject.employeeCapacity, 2)}</span>`;

    if (predictedEmployeeCapacity > 1.5) {
      validationMessage.className = "validation-message error";
      validationMessage.textContent = "Employee capacity cannot exceed 1.5.";
      applyBtn.disabled = true;
      return;
    }
    if (selectedCapacity <= 0) {
      validationMessage.className = "validation-message error";
      validationMessage.textContent = "Capacity must be greater than 0.";
      applyBtn.disabled = true;
      return;
    }

    const predictedProjectEffective =
      currentProjectLoad +
      selectedCapacity * selectedFit * vacationCoefficient -
      (options.editMode
        ? Number(currentAssignment?.capacity || 0) *
          Number(currentAssignment?.fit || 0) *
          vacationCoefficient
        : 0);

    if (predictedProjectEffective > selectedProject.employeeCapacity) {
      validationMessage.className = "validation-message warning";
      validationMessage.textContent = "Warning: project will be over-capacity (allowed).";
    } else {
      validationMessage.className = "validation-message success";
      validationMessage.textContent = "Assignment is valid.";
    }
    applyBtn.disabled = false;
  }

  const close = () => closeAssignmentPopup();
  popup.querySelector(".cancel-assignment").addEventListener("click", close);
  applyBtn.addEventListener("click", () => {
    const projectId = Number(projectSelect.value);
    const capacity = Number(capacityInput.value);
    const fit = Number(fitInput.value);
    updateEmployee(employee.id, (target) => {
      const assignments = [...(target.assignments || [])];
      const existingIndex = assignments.findIndex((assignment) => assignment.projectId === projectId);
      if (existingIndex >= 0) assignments[existingIndex] = { projectId, capacity, fit };
      else assignments.push({ projectId, capacity, fit });
      return { ...target, assignments };
    });
    close();
  });

  [projectSelect, capacityInput, fitInput].forEach((input) =>
    input.addEventListener("input", validateAndRender),
  );
  window.addEventListener("resize", positionPopup);
  window.addEventListener("scroll", positionPopup, true);
  document.addEventListener("click", overlayCloseHandler);

  positionPopup();
  validateAndRender();

  uiState.activeAssignmentPopup = {
    cleanup() {
      window.removeEventListener("resize", positionPopup);
      window.removeEventListener("scroll", positionPopup, true);
      document.removeEventListener("click", overlayCloseHandler);
      popup.remove();
    },
  };
}

function showEditAssignmentPopup(employee, project, deps) {
  const fakeAnchor = document.createElement("span");
  fakeAnchor.style.position = "fixed";
  fakeAnchor.style.top = "50%";
  fakeAnchor.style.left = "50%";
  fakeAnchor.style.width = "1px";
  fakeAnchor.style.height = "1px";
  document.body.append(fakeAnchor);
  openAssignmentPopup(employee, fakeAnchor, { editMode: true, project }, deps);
  setTimeout(() => fakeAnchor.remove(), 0);
}

function openCalendarPopup(employee, deps) {
  const { updateEmployee } = deps;
  const popup = document.createElement("div");
  popup.className = "calendar-popup";
  const daysInMonth = new Date(state.currentYear, state.currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(state.currentYear, state.currentMonth, 1).getDay();
  const isCurrentPeriod =
    state.currentYear === now.getFullYear() && state.currentMonth === now.getMonth();

  let selectedDays = [...(employee.vacationDays || [])];

  function renderCalendar() {
    const totalWorking = countWorkingDays(state.currentYear, state.currentMonth);
    const vacationWorking = selectedDays.filter(
      (day) => !isWeekend(state.currentYear, state.currentMonth, day),
    ).length;
    const currentWorking = totalWorking - vacationWorking;

    popup.innerHTML = `
      <div class="calendar-header">
        <h3>${employee.name} ${employee.surname}</h3>
        <h4>${MONTH_NAMES[state.currentMonth]} ${state.currentYear}</h4>
        <button class="close-calendar-btn">×</button>
      </div>
      <div class="calendar-grid"></div>
      <div class="calendar-info">
        <div class="working-days-info">Working Days: <strong>${currentWorking}/${totalWorking} days</strong></div>
        <div class="chosen-days-section">
          <span class="chosen-days-label">Vacation Days:</span>
          <span class="chosen-days-display">${formatVacationRanges(selectedDays)}</span>
          <button class="set-vacation-btn">Set Vacation</button>
        </div>
      </div>
    `;

    const grid = popup.querySelector(".calendar-grid");
    WEEK_DAY_NAMES.forEach((name) => {
      const dayHeader = document.createElement("div");
      dayHeader.className = "calendar-day-header";
      dayHeader.textContent = name;
      grid.append(dayHeader);
    });

    for (let index = 0; index < firstDayIndex; index += 1) {
      const empty = document.createElement("div");
      empty.className = "calendar-day empty";
      grid.append(empty);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const dayElement = document.createElement("div");
      const weekend = isWeekend(state.currentYear, state.currentMonth, day);
      const today = isCurrentPeriod && day === now.getDate() ? "today" : "";
      const selected = selectedDays.includes(day) ? "selected vacation" : "";
      dayElement.className = `calendar-day ${weekend ? "weekend" : ""} ${today} ${selected}`.trim();
      dayElement.textContent = String(day);
      dayElement.addEventListener("click", () => {
        if (selectedDays.includes(day)) {
          selectedDays = selectedDays.filter((value) => value !== day);
        } else {
          selectedDays.push(day);
        }
        renderCalendar();
      });
      grid.append(dayElement);
    }

    popup.querySelector(".close-calendar-btn").addEventListener("click", close);
    popup.querySelector(".set-vacation-btn").addEventListener("click", () => {
      updateEmployee(employee.id, (target) => ({
        ...target,
        vacationDays: [...new Set(selectedDays)].sort((a, b) => a - b),
      }));
      close();
    });
  }

  const close = () => {
    popup.remove();
  };

  renderCalendar();
  popup.addEventListener("click", (event) => event.stopPropagation());
  document.body.append(popup);
  popup.style.top = "50%";
  popup.style.left = "50%";
  popup.style.transform = "translate(-50%, -50%)";
}

export { showUnassignPopup, openAssignmentPopup, showEditAssignmentPopup, openCalendarPopup };
