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

function formatVacationRanges(days) {
  if (!days.length) return "None";
  const sorted = [...new Set(days)].sort((a, b) => a - b);
  const ranges = [];
  let start = sorted[0];
  let prev = sorted[0];
  const canJoinThroughWeekend = (from, to) => {
    for (let d = from + 1; d < to; d += 1) {
      if (!isWeekend(state.currentYear, state.currentMonth, d)) return false;
    }
    return true;
  };

  for (let i = 1; i <= sorted.length; i += 1) {
    const current = sorted[i];
    if (current && (current === prev + 1 || canJoinThroughWeekend(prev, current))) {
      prev = current;
      continue;
    }
    ranges.push([start, prev]);
    start = current;
    prev = current;
  }

  return ranges
    .map(([s, e]) => {
      const left = `${String(s).padStart(2, "0")}.${String(state.currentMonth + 1).padStart(2, "0")}`;
      const right = `${String(e).padStart(2, "0")}.${String(state.currentMonth + 1).padStart(2, "0")}`;
      return s === e ? left : `${left}-${right}`;
    })
    .join(", ");
}

export { isWeekend, countWorkingDays, calculateAge, getVacationCoefficient, formatVacationRanges };
