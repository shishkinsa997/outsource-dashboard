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

function getEmployeeMetrics(employee, projects, employees) {
  const assignments = employee.assignments || [];
  let estimatedPayment = 0;
  let projectedIncome = 0;

  if (assignments.length === 0) {
    estimatedPayment = employee.salary * 0.5;
  }

  for (const assignment of assignments) {
    estimatedPayment += employee.salary * Math.max(0.5, Number(assignment.capacity));
    const project = projects.find((p) => p.id === assignment.projectId);
    if (!project) continue;
    const projectMetrics = getProjectMetrics(project, employees);
    const assignmentMetrics = projectMetrics.assignments.find(
      (item) => item.employee.id === employee.id,
    );
    if (assignmentMetrics) projectedIncome += assignmentMetrics.profit;
  }

  const usedCapacity = assignments.reduce((sum, item) => sum + Number(item.capacity), 0);
  return { estimatedPayment, projectedIncome, usedCapacity };
}

function getTotalEstimatedIncome(projects, employees) {
  const projectsTotal = projects.reduce(
    (sum, project) => sum + getProjectMetrics(project, employees).estimatedIncome,
    0,
  );
  const benchPayments = employees
    .filter((employee) => (employee.assignments || []).length === 0)
    .reduce((sum, employee) => sum + employee.salary * 0.5, 0);
  return projectsTotal - benchPayments;
}

export { getEmployeeAssignment, getProjectMetrics, getEmployeeMetrics, getTotalEstimatedIncome };
