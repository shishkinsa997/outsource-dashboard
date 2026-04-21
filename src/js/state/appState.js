const STORAGE_KEY = "monthlyData";
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const POSITIONS = ["Junior", "Middle", "Senior", "Lead", "Architect", "BO"];
const WEEK_DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const now = new Date();
const state = {
  monthlyData: {},
  currentMonth: now.getMonth(),
  currentYear: now.getFullYear(),
  activeTab: "projects",
};

const dom = {
  monthSelect: document.getElementById("month-select"),
  yearSelect: document.getElementById("year-select"),
  navProjects: document.getElementById("nav-projects"),
  navEmployees: document.getElementById("nav-employees"),
  projectsContent: document.getElementById("projects-content"),
  employeesContent: document.getElementById("employees-content"),
  projectsTableBody: document.querySelector("#projects-table tbody"),
  employeesTableBody: document.querySelector("#employees-table tbody"),
  sidePanel: document.getElementById("side-panel"),
  toggleButton: document.getElementById("toggle-button"),
  openButton: document.getElementById("open-button"),
  addEmployeeBtn: document.getElementById("add-employee-btn"),
  addProjectBtn: document.getElementById("add-project-btn"),
  addEmployeePanel: document.getElementById("add-employee-panel"),
  addProjectPanel: document.getElementById("add-project-panel"),
  addEmployeeForm: document.getElementById("add-employee-form"),
  addProjectForm: document.getElementById("add-project-form"),
  cancelEmployeeBtn: document.getElementById("cancel-btn-form"),
  cancelProjectBtn: document.getElementById("cancel-project-btn-form"),
  employeeSubmitBtn: document.getElementById("add-btn-form"),
  projectSubmitBtn: document.getElementById("add-project-btn-form"),
  projectFiltersContainer: document.getElementById("project-filters-container"),
  employeeFiltersContainer: document.getElementById("employee-filters-container"),
  seedDataBtn: document.getElementById("seed-data-btn"),
  seedDataBackdrop: document.getElementById("seed-data-backdrop"),
  seedDataPopup: document.getElementById("seed-data-popup"),
  seedDataTableBody: document.getElementById("seed-data-table-body"),
  currentMonthDisplay: document.getElementById("current-month-display"),
};

console.dir(dom);

export { STORAGE_KEY, MONTH_NAMES, POSITIONS, WEEK_DAY_NAMES, now, state, dom };
