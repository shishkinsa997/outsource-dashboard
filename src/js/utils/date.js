import { state } from "../state/appState.js";

function isWeekend(year, month, day) {
  const dayOfWeek = new Date(year, month, day).getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
}

function countWorkingDays(year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let total = 0;
  for (let day = 1; day <= daysInMonth; day += 1) {
    if (!isWeekend(year, month, day)) total += 1;
  }
  return total;
}

function calculateAge(dob) {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

function getVacationCoefficient(employee) {
  const totalWorkingDays = countWorkingDays(state.currentYear, state.currentMonth);
  if (totalWorkingDays === 0) return 1;
  const vacationWorkingDays = (employee.vacationDays || []).filter(
    (day) => !isWeekend(state.currentYear, state.currentMonth, day),
  ).length;
  return (totalWorkingDays - vacationWorkingDays) / totalWorkingDays;
}

export { isWeekend, countWorkingDays, calculateAge, getVacationCoefficient };
