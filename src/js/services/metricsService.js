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
  const capacityForRevenue = Math.max(Number(project.employeeCapacity) || 0, usedEffectiveCapacity);
  const revenuePerEffectiveCapacity = capacityForRevenue > 0 ? project.budget / capacityForRevenue : 0;

  let totalRevenue = 0;
  let totalCost = 0;
  assignments.forEach((item) => {
    const revenue = revenuePerEffectiveCapacity * item.effectiveCapacity;
    const cost = item.employee.salary * Math.max(0.5, Number(item.assignment.capacity));
    item.revenue = revenue;
    item.cost = cost;
    item.profit = revenue - cost;
    totalRevenue += revenue;
    totalCost += cost;
  });

  return {
    assignments,
    usedEffectiveCapacity,
    capacityForRevenue,
    revenuePerEffectiveCapacity,
    totalRevenue,
    totalCost,
    estimatedIncome: totalRevenue - totalCost,
  };
}

function getEmployeeMetrics(employee) {
  const assignments = employee.assignments || [];

  const usedCapacity = assignments.reduce((sum, item) => sum + Number(item.capacity), 0);
  return { usedCapacity };
}

export { getEmployeeAssignment, getProjectMetrics, getEmployeeMetrics };
