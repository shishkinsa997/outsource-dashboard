import { getVacationCoefficient } from "../utils/date.js";

function getEmployeeAssignment(employee, projectId) {
  return (employee.assignments || []).find((a) => a.projectId === projectId);
}

function getProjectMetrics(project, employees) {
  const assignments = [];
  for (const employee of employees) {
    const assignment = getEmployeeAssignment(employee, project.id);
    if (!assignment) continue;
    const vacationCoefficient = getVacationCoefficient(employee);
    const effectiveCapacity =
      Number(assignment.capacity) * Number(assignment.fit) * vacationCoefficient;
    assignments.push({
      employee,
      assignment,
      vacationCoefficient,
      effectiveCapacity,
    });
  }

  const usedEffectiveCapacity = assignments.reduce((sum, item) => sum + item.effectiveCapacity, 0);

  return {
    assignments,
    usedEffectiveCapacity,
  };
}

function getEmployeeMetrics(employee) {
  const assignments = employee.assignments || [];

  const usedCapacity = assignments.reduce((sum, item) => sum + Number(item.capacity), 0);
  return { usedCapacity };
}

export { getEmployeeAssignment, getProjectMetrics, getEmployeeMetrics };
