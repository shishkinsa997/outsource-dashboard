//#region \0vite/modulepreload-polyfill.js
(function polyfill() {
	const relList = document.createElement("link").relList;
	if (relList && relList.supports && relList.supports("modulepreload")) return;
	for (const link of document.querySelectorAll("link[rel=\"modulepreload\"]")) processPreload(link);
	new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") continue;
			for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
		}
	}).observe(document, {
		childList: true,
		subtree: true
	});
	function getFetchOpts(link) {
		const fetchOpts = {};
		if (link.integrity) fetchOpts.integrity = link.integrity;
		if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
		if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
		else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
		else fetchOpts.credentials = "same-origin";
		return fetchOpts;
	}
	function processPreload(link) {
		if (link.ep) return;
		link.ep = true;
		const fetchOpts = getFetchOpts(link);
		fetch(link.href, fetchOpts);
	}
})();
//#endregion
//#region src/js/state/appState.js
var STORAGE_KEY = "monthlyData";
var POSITIONS = [
	"Junior",
	"Middle",
	"Senior",
	"Lead",
	"Architect",
	"BO"
];
var now = /* @__PURE__ */ new Date();
var state = {
	monthlyData: {},
	currentMonth: now.getMonth(),
	currentYear: now.getFullYear(),
	activeTab: "projects",
	sort: {
		projects: {
			key: null,
			direction: null
		},
		employees: {
			key: null,
			direction: null
		}
	},
	filters: {
		projects: {},
		employees: {}
	}
};
var dom = {
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
	currentMonthDisplay: document.getElementById("current-month-display")
};
var uiState = { activeFilterPopup: null };
//#endregion
//#region src/js/utils/date.js
function isWeekend(year, month, day) {
	const dayOfWeek = new Date(year, month, day).getDay();
	return dayOfWeek === 0 || dayOfWeek === 6;
}
function countWorkingDays(year, month) {
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	let total = 0;
	for (let day = 1; day <= daysInMonth; day += 1) if (!isWeekend(year, month, day)) total += 1;
	return total;
}
function calculateAge(dob) {
	const birth = new Date(dob);
	const today = /* @__PURE__ */ new Date();
	let age = today.getFullYear() - birth.getFullYear();
	const monthDiff = today.getMonth() - birth.getMonth();
	if (monthDiff < 0 || monthDiff === 0 && today.getDate() < birth.getDate()) age -= 1;
	return age;
}
function getVacationCoefficient(employee) {
	const totalWorkingDays = countWorkingDays(state.currentYear, state.currentMonth);
	if (totalWorkingDays === 0) return 1;
	return (totalWorkingDays - (employee.vacationDays || []).filter((day) => !isWeekend(state.currentYear, state.currentMonth, day)).length) / totalWorkingDays;
}
//#endregion
//#region src/js/services/metricsService.js
function getEmployeeAssignment(employee, projectId) {
	return (employee.assignments || []).find((a) => a.projectId === projectId);
}
function getProjectMetrics(project, employees) {
	const assignments = [];
	for (const employee of employees) {
		const assignment = getEmployeeAssignment(employee, project.id);
		if (!assignment) continue;
		const vacationCoefficient = getVacationCoefficient(employee);
		const effectiveCapacity = Number(assignment.capacity) * Number(assignment.fit) * vacationCoefficient;
		assignments.push({
			employee,
			assignment,
			vacationCoefficient,
			effectiveCapacity
		});
	}
	const usedEffectiveCapacity = assignments.reduce((sum, item) => sum + item.effectiveCapacity, 0);
	const capacityForRevenue = Math.max(Number(project.employeeCapacity) || 0, usedEffectiveCapacity);
	const revenuePerEffectiveCapacity = capacityForRevenue > 0 ? project.budget / capacityForRevenue : 0;
	let totalRevenue = 0;
	let totalCost = 0;
	assignments.forEach((item) => {
		const revenue = revenuePerEffectiveCapacity * item.effectiveCapacity;
		const cost = item.employee.salary * Math.max(.5, Number(item.assignment.capacity));
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
		estimatedIncome: totalRevenue - totalCost
	};
}
function getEmployeeMetrics(employee, projects, employees) {
	const assignments = employee.assignments || [];
	let estimatedPayment = 0;
	let projectedIncome = 0;
	if (assignments.length === 0) estimatedPayment = employee.salary * .5;
	for (const assignment of assignments) {
		estimatedPayment += employee.salary * Math.max(.5, Number(assignment.capacity));
		const project = projects.find((p) => p.id === assignment.projectId);
		if (!project) continue;
		const assignmentMetrics = getProjectMetrics(project, employees).assignments.find((item) => item.employee.id === employee.id);
		if (assignmentMetrics) projectedIncome += assignmentMetrics.profit;
	}
	const usedCapacity = assignments.reduce((sum, item) => sum + Number(item.capacity), 0);
	return {
		estimatedPayment,
		projectedIncome,
		usedCapacity
	};
}
function getTotalEstimatedIncome(projects, employees) {
	return projects.reduce((sum, project) => sum + getProjectMetrics(project, employees).estimatedIncome, 0) - employees.filter((employee) => (employee.assignments || []).length === 0).reduce((sum, employee) => sum + employee.salary * .5, 0);
}
//#endregion
//#region src/data/appData.json
var appData_default = {
	"2026-0": {
		"projects": [
			{
				"id": 1704467200001,
				"projectName": "E-Commerce Platform",
				"companyName": "TechCorp",
				"budget": 12500,
				"employeeCapacity": 3
			},
			{
				"id": 1704467200002,
				"projectName": "Mobile Banking App",
				"companyName": "TechCorp",
				"budget": 16650,
				"employeeCapacity": 2
			},
			{
				"id": 1704467200003,
				"projectName": "Healthcare Portal",
				"companyName": "MediCare Solutions",
				"budget": 15e3,
				"employeeCapacity": 3
			},
			{
				"id": 1704467200004,
				"projectName": "Analytics Dashboard",
				"companyName": "DataViz Inc",
				"budget": 7900,
				"employeeCapacity": 1
			},
			{
				"id": 1704467200005,
				"projectName": "CRM System",
				"companyName": "SalesPro",
				"budget": 1e4,
				"employeeCapacity": 2
			}
		],
		"employees": [
			{
				"id": 1704467300001,
				"name": "John",
				"surname": "Smith",
				"dob": "1997-03-15",
				"position": "Junior",
				"salary": 3750,
				"assignments": [{
					"projectId": 1704467200001,
					"capacity": 1,
					"fit": .95
				}]
			},
			{
				"id": 1704467300002,
				"name": "Sarah",
				"surname": "Johnson",
				"dob": "1993-07-22",
				"position": "Middle",
				"salary": 5400,
				"assignments": [{
					"projectId": 1704467200001,
					"capacity": 1,
					"fit": 1
				}]
			},
			{
				"id": 1704467300003,
				"name": "Michael",
				"surname": "Williams",
				"dob": "1990-11-08",
				"position": "Senior",
				"salary": 7100,
				"assignments": [{
					"projectId": 1704467200001,
					"capacity": 1,
					"fit": 1
				}]
			},
			{
				"id": 1704467300004,
				"name": "Emily",
				"surname": "Brown",
				"dob": "1996-05-30",
				"position": "Middle",
				"salary": 5150,
				"assignments": [{
					"projectId": 1704467200002,
					"capacity": 1,
					"fit": .9
				}]
			},
			{
				"id": 1704467300005,
				"name": "David",
				"surname": "Jones",
				"dob": "1984-09-12",
				"position": "Lead",
				"salary": 7900,
				"assignments": [{
					"projectId": 1704467200002,
					"capacity": 1,
					"fit": 1
				}]
			},
			{
				"id": 1704467300006,
				"name": "Jessica",
				"surname": "Garcia",
				"dob": "1998-01-25",
				"position": "Junior",
				"salary": 4e3,
				"assignments": [{
					"projectId": 1704467200003,
					"capacity": .5,
					"fit": .85
				}]
			},
			{
				"id": 1704467300007,
				"name": "Robert",
				"surname": "Martinez",
				"dob": "1987-04-17",
				"position": "Senior",
				"salary": 7350,
				"assignments": [{
					"projectId": 1704467200003,
					"capacity": 1,
					"fit": 1
				}]
			},
			{
				"id": 1704467300008,
				"name": "Lisa",
				"surname": "Anderson",
				"dob": "1994-12-03",
				"position": "Middle",
				"salary": 5600,
				"assignments": [{
					"projectId": 1704467200003,
					"capacity": 1,
					"fit": .95
				}]
			},
			{
				"id": 1704467300009,
				"name": "James",
				"surname": "Taylor",
				"dob": "1980-06-20",
				"position": "Architect",
				"salary": 9150,
				"assignments": [{
					"projectId": 1704467200004,
					"capacity": 1,
					"fit": 1
				}]
			},
			{
				"id": 1704467300010,
				"name": "Maria",
				"surname": "Thomas",
				"dob": "1999-08-14",
				"position": "Junior",
				"salary": 3850,
				"assignments": [{
					"projectId": 1704467200005,
					"capacity": .5,
					"fit": .8
				}]
			},
			{
				"id": 1704467300011,
				"name": "Daniel",
				"surname": "Moore",
				"dob": "1992-02-28",
				"position": "Middle",
				"salary": 5850,
				"assignments": [{
					"projectId": 1704467200005,
					"capacity": 1,
					"fit": 1
				}]
			},
			{
				"id": 1704467300012,
				"name": "Jennifer",
				"surname": "Jackson",
				"dob": "1989-10-05",
				"position": "Senior",
				"salary": 7500,
				"assignments": [{
					"projectId": 1704467200003,
					"capacity": .5,
					"fit": 1
				}]
			},
			{
				"id": 1704467300013,
				"name": "Christopher",
				"surname": "White",
				"dob": "1995-03-19",
				"position": "Middle",
				"salary": 5350,
				"assignments": []
			},
			{
				"id": 1704467300014,
				"name": "Amanda",
				"surname": "Harris",
				"dob": "1997-11-27",
				"position": "Junior",
				"salary": 3900,
				"assignments": []
			},
			{
				"id": 1704467300015,
				"name": "Matthew",
				"surname": "Martin",
				"dob": "1983-07-09",
				"position": "Lead",
				"salary": 8150,
				"assignments": []
			}
		]
	},
	"2026-1": {
		"projects": [
			{
				"id": 1704467200001,
				"projectName": "E-Commerce Platform",
				"companyName": "TechCorp",
				"budget": 12500,
				"employeeCapacity": 3
			},
			{
				"id": 1704467200002,
				"projectName": "Mobile Banking App",
				"companyName": "TechCorp",
				"budget": 16650,
				"employeeCapacity": 2
			},
			{
				"id": 1704467200003,
				"projectName": "Healthcare Portal",
				"companyName": "MediCare Solutions",
				"budget": 15e3,
				"employeeCapacity": 3
			},
			{
				"id": 1704467200004,
				"projectName": "Analytics Dashboard",
				"companyName": "DataViz Inc",
				"budget": 7900,
				"employeeCapacity": 1
			},
			{
				"id": 1704467200005,
				"projectName": "CRM System",
				"companyName": "SalesPro",
				"budget": 1e4,
				"employeeCapacity": 2
			}
		],
		"employees": [
			{
				"id": 1704467300001,
				"name": "John",
				"surname": "Smith",
				"dob": "1997-03-15",
				"position": "Junior",
				"salary": 3750,
				"assignments": [{
					"projectId": 1704467200001,
					"capacity": 1,
					"fit": .95
				}]
			},
			{
				"id": 1704467300002,
				"name": "Sarah",
				"surname": "Johnson",
				"dob": "1993-07-22",
				"position": "Middle",
				"salary": 5400,
				"assignments": [{
					"projectId": 1704467200001,
					"capacity": 1,
					"fit": 1
				}]
			},
			{
				"id": 1704467300003,
				"name": "Michael",
				"surname": "Williams",
				"dob": "1990-11-08",
				"position": "Senior",
				"salary": 7100,
				"assignments": [{
					"projectId": 1704467200001,
					"capacity": 1,
					"fit": 1
				}]
			},
			{
				"id": 1704467300004,
				"name": "Emily",
				"surname": "Brown",
				"dob": "1996-05-30",
				"position": "Middle",
				"salary": 5150,
				"assignments": [{
					"projectId": 1704467200002,
					"capacity": 1,
					"fit": .9
				}]
			},
			{
				"id": 1704467300005,
				"name": "David",
				"surname": "Jones",
				"dob": "1984-09-12",
				"position": "Lead",
				"salary": 7900,
				"assignments": [{
					"projectId": 1704467200002,
					"capacity": 1,
					"fit": 1
				}]
			},
			{
				"id": 1704467300006,
				"name": "Jessica",
				"surname": "Garcia",
				"dob": "1998-01-25",
				"position": "Junior",
				"salary": 4e3,
				"assignments": [{
					"projectId": 1704467200003,
					"capacity": .5,
					"fit": .85
				}]
			},
			{
				"id": 1704467300007,
				"name": "Robert",
				"surname": "Martinez",
				"dob": "1987-04-17",
				"position": "Senior",
				"salary": 7350,
				"assignments": [{
					"projectId": 1704467200003,
					"capacity": 1,
					"fit": 1
				}]
			},
			{
				"id": 1704467300008,
				"name": "Lisa",
				"surname": "Anderson",
				"dob": "1994-12-03",
				"position": "Middle",
				"salary": 5600,
				"assignments": [{
					"projectId": 1704467200003,
					"capacity": 1,
					"fit": .95
				}]
			},
			{
				"id": 1704467300009,
				"name": "James",
				"surname": "Taylor",
				"dob": "1980-06-20",
				"position": "Architect",
				"salary": 9150,
				"assignments": [{
					"projectId": 1704467200004,
					"capacity": 1,
					"fit": 1
				}]
			},
			{
				"id": 1704467300010,
				"name": "Maria",
				"surname": "Thomas",
				"dob": "1999-08-14",
				"position": "Junior",
				"salary": 3850,
				"assignments": [{
					"projectId": 1704467200005,
					"capacity": .5,
					"fit": .8
				}]
			},
			{
				"id": 1704467300011,
				"name": "Daniel",
				"surname": "Moore",
				"dob": "1992-02-28",
				"position": "Middle",
				"salary": 5850,
				"assignments": [{
					"projectId": 1704467200005,
					"capacity": 1,
					"fit": 1
				}]
			},
			{
				"id": 1704467300012,
				"name": "Jennifer",
				"surname": "Jackson",
				"dob": "1989-10-05",
				"position": "Senior",
				"salary": 7500,
				"assignments": [{
					"projectId": 1704467200003,
					"capacity": .5,
					"fit": 1
				}]
			},
			{
				"id": 1704467300013,
				"name": "Christopher",
				"surname": "White",
				"dob": "1995-03-19",
				"position": "Middle",
				"salary": 5350,
				"assignments": []
			},
			{
				"id": 1704467300014,
				"name": "Amanda",
				"surname": "Harris",
				"dob": "1997-11-27",
				"position": "Junior",
				"salary": 3900,
				"assignments": []
			},
			{
				"id": 1704467300015,
				"name": "Matthew",
				"surname": "Martin",
				"dob": "1983-07-09",
				"position": "Lead",
				"salary": 8150,
				"assignments": []
			}
		]
	},
	"2026-3": {
		"projects": [
			{
				"id": 1704467200001,
				"projectName": "E-Commerce Platform",
				"companyName": "TechCorp",
				"budget": 12500,
				"employeeCapacity": 3
			},
			{
				"id": 1704467200002,
				"projectName": "Mobile Banking App",
				"companyName": "TechCorp",
				"budget": 16650,
				"employeeCapacity": 2
			},
			{
				"id": 1704467200003,
				"projectName": "Healthcare Portal",
				"companyName": "MediCare Solutions",
				"budget": 15e3,
				"employeeCapacity": 3
			},
			{
				"id": 1704467200004,
				"projectName": "Analytics Dashboard",
				"companyName": "DataViz Inc",
				"budget": 7900,
				"employeeCapacity": 1
			},
			{
				"id": 1704467200005,
				"projectName": "CRM System",
				"companyName": "SalesPro",
				"budget": 1e4,
				"employeeCapacity": 2
			}
		],
		"employees": [
			{
				"id": 1704467300001,
				"name": "John",
				"surname": "Smith",
				"dob": "1997-03-15",
				"position": "Junior",
				"salary": 3750,
				"assignments": [{
					"projectId": 1704467200001,
					"capacity": 1,
					"fit": .95
				}],
				"vacationDays": []
			},
			{
				"id": 1704467300002,
				"name": "Sarah",
				"surname": "Johnson",
				"dob": "1993-07-22",
				"position": "Middle",
				"salary": 5400,
				"assignments": [{
					"projectId": 1704467200001,
					"capacity": 1,
					"fit": 1
				}],
				"vacationDays": []
			},
			{
				"id": 1704467300003,
				"name": "Michael",
				"surname": "Williams",
				"dob": "1990-11-08",
				"position": "Senior",
				"salary": 7100,
				"assignments": [{
					"projectId": 1704467200001,
					"capacity": 1,
					"fit": 1
				}],
				"vacationDays": []
			},
			{
				"id": 1704467300004,
				"name": "Emily",
				"surname": "Brown",
				"dob": "1996-05-30",
				"position": "Middle",
				"salary": 5150,
				"assignments": [{
					"projectId": 1704467200002,
					"capacity": 1,
					"fit": .9
				}],
				"vacationDays": []
			},
			{
				"id": 1704467300005,
				"name": "David",
				"surname": "Jones",
				"dob": "1984-09-12",
				"position": "Lead",
				"salary": 7900,
				"assignments": [{
					"projectId": 1704467200002,
					"capacity": 1,
					"fit": 1
				}],
				"vacationDays": []
			},
			{
				"id": 1704467300006,
				"name": "Jessica",
				"surname": "Garcia",
				"dob": "1998-01-25",
				"position": "Junior",
				"salary": 4e3,
				"assignments": [{
					"projectId": 1704467200003,
					"capacity": .5,
					"fit": .85
				}],
				"vacationDays": []
			},
			{
				"id": 1704467300007,
				"name": "Robert",
				"surname": "Martinez",
				"dob": "1987-04-17",
				"position": "Senior",
				"salary": 7350,
				"assignments": [{
					"projectId": 1704467200003,
					"capacity": 1,
					"fit": 1
				}],
				"vacationDays": []
			},
			{
				"id": 1704467300008,
				"name": "Lisa",
				"surname": "Anderson",
				"dob": "1994-12-03",
				"position": "Middle",
				"salary": 5600,
				"assignments": [{
					"projectId": 1704467200003,
					"capacity": 1,
					"fit": .95
				}],
				"vacationDays": []
			},
			{
				"id": 1704467300009,
				"name": "James",
				"surname": "Taylor",
				"dob": "1980-06-20",
				"position": "Architect",
				"salary": 9150,
				"assignments": [{
					"projectId": 1704467200004,
					"capacity": 1,
					"fit": 1
				}],
				"vacationDays": []
			},
			{
				"id": 1704467300010,
				"name": "Maria",
				"surname": "Thomas",
				"dob": "1999-08-14",
				"position": "Junior",
				"salary": 3850,
				"assignments": [{
					"projectId": 1704467200005,
					"capacity": .5,
					"fit": .8
				}],
				"vacationDays": []
			},
			{
				"id": 1704467300011,
				"name": "Daniel",
				"surname": "Moore",
				"dob": "1992-02-28",
				"position": "Middle",
				"salary": 5850,
				"assignments": [{
					"projectId": 1704467200005,
					"capacity": 1,
					"fit": 1
				}],
				"vacationDays": []
			},
			{
				"id": 1704467300012,
				"name": "Jennifer",
				"surname": "Jackson",
				"dob": "1989-10-05",
				"position": "Senior",
				"salary": 7500,
				"assignments": [{
					"projectId": 1704467200003,
					"capacity": .5,
					"fit": 1
				}],
				"vacationDays": []
			},
			{
				"id": 1704467300013,
				"name": "Christopher",
				"surname": "White",
				"dob": "1995-03-19",
				"position": "Middle",
				"salary": 5350,
				"assignments": [],
				"vacationDays": []
			},
			{
				"id": 1704467300014,
				"name": "Amanda",
				"surname": "Harris",
				"dob": "1997-11-27",
				"position": "Junior",
				"salary": 3900,
				"assignments": [],
				"vacationDays": []
			},
			{
				"id": 1704467300015,
				"name": "Matthew",
				"surname": "Martin",
				"dob": "1983-07-09",
				"position": "Lead",
				"salary": 8150,
				"assignments": [],
				"vacationDays": []
			}
		]
	}
};
//#endregion
//#region src/js/utils/format.js
function deepClone(value) {
	return JSON.parse(JSON.stringify(value));
}
function formatCurrency(value) {
	return Number(value || 0).toLocaleString("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});
}
function toFixed(value, digits = 2) {
	return Number(value || 0).toFixed(digits);
}
//#endregion
//#region src/js/services/storageService.js
function toPeriodKey(year = state.currentYear, month = state.currentMonth) {
	return `${year}-${month}`;
}
function getCurrentPeriodData() {
	const key = toPeriodKey();
	if (!state.monthlyData[key]) state.monthlyData[key] = {
		employees: [],
		projects: []
	};
	return state.monthlyData[key];
}
function saveData() {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(state.monthlyData));
}
function normalizeMonthData(monthData) {
	const normalized = deepClone(monthData || {
		employees: [],
		projects: []
	});
	normalized.projects = Array.isArray(normalized.projects) ? normalized.projects : [];
	normalized.employees = Array.isArray(normalized.employees) ? normalized.employees : [];
	normalized.projects = normalized.projects.map((project) => ({
		...project,
		budget: Number(project.budget) || 0,
		employeeCapacity: Number(project.employeeCapacity) || 0
	}));
	normalized.employees = normalized.employees.map((employee) => ({
		...employee,
		salary: Number(employee.salary) || 0,
		assignments: Array.isArray(employee.assignments) ? employee.assignments : [],
		vacationDays: Array.isArray(employee.vacationDays) ? employee.vacationDays : []
	}));
	return normalized;
}
function loadData() {
	const saved = localStorage.getItem(STORAGE_KEY);
	if (saved) try {
		const parsed = JSON.parse(saved);
		Object.entries(parsed).forEach(([key, value]) => {
			state.monthlyData[key] = normalizeMonthData(value);
		});
	} catch {
		state.monthlyData = deepClone(appData_default);
	}
	else state.monthlyData = deepClone(appData_default);
	const currentKey = toPeriodKey();
	if (!state.monthlyData[currentKey]) state.monthlyData[currentKey] = {
		employees: [],
		projects: []
	};
	saveData();
}
//#endregion
//#region src/js/modules/forms.js
function validateEmployeeForm() {
	const form = dom.addEmployeeForm;
	const fields = {
		name: form.querySelector("#name"),
		surname: form.querySelector("#surname"),
		dob: form.querySelector("#dob"),
		position: form.querySelector("#position"),
		salary: form.querySelector("#salary")
	};
	const nameValid = /^[A-Za-z\s]{3,}$/.test(fields.name.value.trim());
	const surnameValid = /^[A-Za-z\s]{3,}$/.test(fields.surname.value.trim());
	const dobValid = (fields.dob.value ? calculateAge(fields.dob.value) : 0) >= 18;
	const positionValid = POSITIONS.includes(fields.position.value);
	const salaryValid = Number(fields.salary.value) > 0;
	document.getElementById("name-error").classList.toggle("show", !nameValid && fields.name.value !== "");
	document.getElementById("surname-error").classList.toggle("show", !surnameValid && fields.surname.value !== "");
	document.getElementById("dob-error").classList.toggle("show", fields.dob.value !== "" && !dobValid);
	document.getElementById("position-error").classList.toggle("show", fields.position.value !== "" && !positionValid);
	document.getElementById("salary-error").classList.toggle("show", fields.salary.value !== "" && !salaryValid);
	dom.employeeSubmitBtn.disabled = !(nameValid && surnameValid && dobValid && positionValid && salaryValid);
}
function validateProjectForm() {
	const form = dom.addProjectForm;
	const fields = {
		projectName: form.querySelector("#project-name"),
		companyName: form.querySelector("#company-name"),
		budget: form.querySelector("#project-budget"),
		capacity: form.querySelector("#employee-capacity")
	};
	const projectNameValid = /^[A-Za-z0-9\s]{3,}$/.test(fields.projectName.value.trim());
	const companyNameValid = /^[A-Za-z0-9\s]{2,}$/.test(fields.companyName.value.trim());
	const budgetValid = Number(fields.budget.value) > 0;
	const capacityValue = Number(fields.capacity.value);
	const capacityValid = Number.isInteger(capacityValue) && capacityValue >= 1;
	document.getElementById("project-name-error").classList.toggle("show", !projectNameValid && fields.projectName.value !== "");
	document.getElementById("company-name-error").classList.toggle("show", !companyNameValid && fields.companyName.value !== "");
	document.getElementById("project-budget-error").classList.toggle("show", !budgetValid && fields.budget.value !== "");
	document.getElementById("employee-capacity-error").classList.toggle("show", !capacityValid && fields.capacity.value !== "");
	dom.projectSubmitBtn.disabled = !(projectNameValid && companyNameValid && budgetValid && capacityValid);
}
//#endregion
//#region src/js/modules/sortFilter.js
function applySort(data, type, getCurrentPeriodData, getEmployeeMetrics, getProjectMetrics) {
	console.log("not sorted", data);
	const sort = state.sort[type];
	if (!sort.key || !sort.direction) return data;
	const sorted = [...data];
	sorted.sort((a, b) => {
		let aValue;
		let bValue;
		if (type === "projects") if (sort.key === "employeeCapacity") {
			const period = getCurrentPeriodData();
			aValue = getProjectMetrics(a, period.employees).usedEffectiveCapacity;
			bValue = getProjectMetrics(b, period.employees).usedEffectiveCapacity;
		} else if (sort.key === "estimatedIncome") {
			const period = getCurrentPeriodData();
			aValue = getProjectMetrics(a, period.employees).estimatedIncome;
			bValue = getProjectMetrics(b, period.employees).estimatedIncome;
		} else {
			aValue = a[sort.key];
			bValue = b[sort.key];
		}
		else {
			const period = getCurrentPeriodData();
			const aMetrics = getEmployeeMetrics(a, period.projects, period.employees);
			const bMetrics = getEmployeeMetrics(b, period.projects, period.employees);
			if (sort.key === "age") {
				aValue = calculateAge(a.dob);
				bValue = calculateAge(b.dob);
			} else if (sort.key === "estimatedPayment") {
				aValue = aMetrics.estimatedPayment;
				bValue = bMetrics.estimatedPayment;
			} else if (sort.key === "projectedIncome") {
				aValue = aMetrics.projectedIncome;
				bValue = bMetrics.projectedIncome;
			} else if (sort.key === "projectId") {
				aValue = (a.assignments || []).length;
				bValue = (b.assignments || []).length;
			} else {
				aValue = a[sort.key];
				bValue = b[sort.key];
			}
		}
		if (typeof aValue === "string" || typeof bValue === "string") {
			const compare = String(aValue || "").localeCompare(String(bValue || ""));
			return sort.direction === "asc" ? compare : -compare;
		}
		const compare = Number(aValue || 0) - Number(bValue || 0);
		return sort.direction === "asc" ? compare : -compare;
	});
	console.log("sorted:", sorted);
	return sorted;
}
function applyFilters(data, type, getCurrentPeriodData) {
	const filters = state.filters[type];
	if (!Object.keys(filters).length) return data;
	const period = getCurrentPeriodData();
	return data.filter((item) => Object.entries(filters).every(([key, rawValue]) => {
		const value = String(rawValue).toLowerCase();
		if (type === "employees" && key === "projectId") return (item.assignments || []).map((assignment) => period.projects.find((project) => project.id === assignment.projectId)?.projectName || "").join(" ").toLowerCase().includes(value);
		return String(item[key] || "").toLowerCase().includes(value);
	}));
}
function setSort(type, key, render) {
	if (state.sort[type].direction === "asc") state.sort[type] = {
		key,
		direction: "desc"
	};
	else state.sort[type] = {
		key,
		direction: "asc"
	};
	console.log("sort state:", state.sort[type]);
	render();
}
function updateSortIcons() {
	document.querySelectorAll("th.sortable").forEach((header) => {
		const type = header.closest("table").id === "projects-table" ? "projects" : "employees";
		const sort = state.sort[type];
		const icon = header.querySelector(".sort-icon");
		header.classList.remove("sorted");
		if (!icon) return;
		if (sort.key === header.dataset.sort) {
			header.classList.add("sorted");
			icon.textContent = sort.direction === "asc" ? "↑" : "↓";
		} else icon.textContent = "⇅";
	});
}
function renderFilterChips(render) {
	[{
		type: "projects",
		container: dom.projectFiltersContainer
	}, {
		type: "employees",
		container: dom.employeeFiltersContainer
	}].forEach(({ type, container }) => {
		container.innerHTML = "";
		const entries = Object.entries(state.filters[type]);
		entries.forEach(([key, value]) => {
			const chip = document.createElement("div");
			chip.className = "filter-chip";
			chip.innerHTML = `
        <span class="chip-label">${key}: ${value}</span>
        <span class="chip-remove">×</span>
      `;
			chip.querySelector(".chip-remove").addEventListener("click", () => {
				delete state.filters[type][key];
				render();
			});
			container.append(chip);
		});
		if (entries.length >= 2) {
			const clearChip = document.createElement("div");
			clearChip.className = "filter-chip clear-all-chip";
			clearChip.textContent = "Clear Filters";
			clearChip.addEventListener("click", () => {
				state.filters[type] = {};
				render();
			});
			container.append(clearChip);
		}
	});
}
function openFilterPopup(header, type, field, render, closeFilterPopup) {
	closeFilterPopup();
	const popup = document.createElement("div");
	popup.className = "filter-popup";
	const currentValue = state.filters[type][field] || "";
	const isPosition = field === "position";
	popup.innerHTML = `
    ${isPosition ? `<select class="filter-input">
        <option value="">All</option>
        ${POSITIONS.map((position) => `<option value="${position}" ${currentValue === position ? "selected" : ""}>${position}</option>`).join("")}
       </select>` : `<input class="filter-input" type="text" value="${currentValue}" placeholder="Filter..." />`}
    <button class="accept-filter">Apply</button>
    <button class="cancel-filter">Cancel</button>
  `;
	document.body.append(popup);
	const rect = header.getBoundingClientRect();
	popup.style.top = `${rect.bottom + window.scrollY + 4}px`;
	popup.style.left = `${rect.left + window.scrollX}px`;
	uiState.activeFilterPopup = popup;
	const input = popup.querySelector(".filter-input");
	const apply = () => {
		const value = String(input.value || "").trim();
		if (value) state.filters[type][field] = value;
		else delete state.filters[type][field];
		render();
		closeFilterPopup();
	};
	popup.querySelector(".accept-filter").addEventListener("click", apply);
	popup.querySelector(".cancel-filter").addEventListener("click", closeFilterPopup);
	input.addEventListener("keydown", (event) => {
		if (event.key === "Enter") apply();
	});
	if (isPosition) input.addEventListener("change", apply);
	else input.focus();
}
//#endregion
//#region src/js/modules/ui.js
function closeFilterPopup() {
	if (uiState.activeFilterPopup) {
		uiState.activeFilterPopup.remove();
		uiState.activeFilterPopup = null;
	}
}
function closePanels() {
	dom.addEmployeePanel.classList.remove("open");
	dom.addProjectPanel.classList.remove("open");
}
function openDetailsPopup(title, buildContent) {
	const popup = document.createElement("div");
	popup.className = "details-popup";
	popup.innerHTML = `
    <div class="popup-header">
      <h3>${title}</h3>
      <button class="close-popup-btn">×</button>
    </div>
    <div class="popup-content"></div>
  `;
	buildContent(popup.querySelector(".popup-content"), () => {
		popup.remove();
	});
	const close = () => {
		popup.remove();
	};
	popup.querySelector(".close-popup-btn").addEventListener("click", close);
	popup.addEventListener("click", (event) => event.stopPropagation());
	document.body.append(popup);
}
//#endregion
//#region src/js/modules/tables.js
function createTableModule(deps) {
	const { applyFilters, applySort, getCurrentPeriodData, getEmployeeMetrics, getProjectMetrics, getTotalEstimatedIncome, saveData, render, openDetailsPopup, showUnassignPopup, updateEmployee } = deps;
	function showProjectsPopup(project) {
		const rows = [...getProjectMetrics(project, getCurrentPeriodData().employees).assignments].sort((a, b) => `${a.employee.name} ${a.employee.surname}`.localeCompare(`${b.employee.name} ${b.employee.surname}`));
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
								assignments: target.assignments.filter((assignment) => assignment.projectId !== project.id)
							}));
						}
					});
				});
				tbody.append(row);
			});
			content.append(table);
		});
	}
	function renderProjectsTable() {
		const period = getCurrentPeriodData();
		const projects = applySort(applyFilters(period.projects, "projects"), "projects");
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
					assignments: (employee.assignments || []).filter((assignment) => assignment.projectId !== project.id)
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
		const employees = applySort(applyFilters(period.employees, "employees"), "employees");
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
	return {
		renderProjectsTable,
		renderEmployeesTable
	};
}
//#endregion
//#region src/js/modules/interaction.js
function showUnassignPopup(employee, project, assignment, deps) {
	const { getCurrentPeriodData, getProjectMetrics, onConfirm } = deps;
	const projectMetrics = getProjectMetrics(project, getCurrentPeriodData().employees);
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
//#endregion
//#region src/js/app.js
function updateEmployee(employeeId, updater) {
	const period = getCurrentPeriodData();
	const index = period.employees.findIndex((employee) => employee.id === employeeId);
	if (index === -1) return;
	period.employees[index] = updater(period.employees[index]);
	saveData();
	render();
}
var tableModule = createTableModule({
	applyFilters: (data, type) => applyFilters(data, type, getCurrentPeriodData),
	applySort: (data, type) => applySort(data, type, getCurrentPeriodData, getEmployeeMetrics, getProjectMetrics),
	getCurrentPeriodData,
	getEmployeeMetrics,
	getProjectMetrics,
	getTotalEstimatedIncome,
	saveData,
	render: () => render(),
	openDetailsPopup,
	showUnassignPopup,
	updateEmployee
});
function render() {
	closeFilterPopup();
	dom.projectsContent.classList.toggle("hidden", state.activeTab !== "projects");
	dom.employeesContent.classList.toggle("hidden", state.activeTab !== "employees");
	dom.navProjects.classList.toggle("active", state.activeTab === "projects");
	dom.navEmployees.classList.toggle("active", state.activeTab === "employees");
	tableModule.renderProjectsTable();
	tableModule.renderEmployeesTable();
	renderFilterChips(() => render());
	updateSortIcons();
}
function initEvents() {
	dom.monthSelect.value = String(state.currentMonth);
	dom.yearSelect.value = String(state.currentYear);
	dom.monthSelect.addEventListener("change", () => {
		state.currentMonth = Number(dom.monthSelect.value);
		getCurrentPeriodData();
		saveData();
		render();
	});
	dom.yearSelect.addEventListener("change", () => {
		state.currentYear = Number(dom.yearSelect.value);
		getCurrentPeriodData();
		saveData();
		render();
	});
	dom.navProjects.addEventListener("click", (event) => {
		event.preventDefault();
		state.activeTab = "projects";
		render();
	});
	dom.navEmployees.addEventListener("click", (event) => {
		event.preventDefault();
		state.activeTab = "employees";
		render();
	});
	dom.toggleButton.addEventListener("click", () => {
		dom.sidePanel.classList.add("hidden");
		dom.openButton.classList.remove("hidden");
	});
	dom.openButton.addEventListener("click", () => {
		dom.sidePanel.classList.remove("hidden");
		dom.openButton.classList.add("hidden");
	});
	dom.addEmployeeBtn.addEventListener("click", () => {
		dom.addEmployeePanel.classList.add("open");
		dom.addProjectPanel.classList.remove("open");
	});
	dom.addProjectBtn.addEventListener("click", () => {
		dom.addProjectPanel.classList.add("open");
		dom.addEmployeePanel.classList.remove("open");
	});
	dom.cancelEmployeeBtn.addEventListener("click", () => {
		dom.addEmployeeForm.reset();
		validateEmployeeForm();
		closePanels();
	});
	dom.cancelProjectBtn.addEventListener("click", () => {
		dom.addProjectForm.reset();
		validateProjectForm();
		closePanels();
	});
	["input", "blur"].forEach((eventName) => {
		dom.addEmployeeForm.addEventListener(eventName, validateEmployeeForm, true);
		dom.addProjectForm.addEventListener(eventName, validateProjectForm, true);
	});
	dom.addEmployeeForm.addEventListener("submit", (event) => {
		event.preventDefault();
		validateEmployeeForm();
		if (dom.employeeSubmitBtn.disabled) return;
		const period = getCurrentPeriodData();
		const formData = new FormData(dom.addEmployeeForm);
		period.employees.push({
			id: Date.now(),
			name: String(formData.get("name")).trim(),
			surname: String(formData.get("surname")).trim(),
			dob: String(formData.get("dob")),
			position: String(formData.get("position")),
			salary: Number(formData.get("salary")),
			assignments: [],
			vacationDays: []
		});
		saveData();
		dom.addEmployeeForm.reset();
		validateEmployeeForm();
		closePanels();
		render();
	});
	dom.addProjectForm.addEventListener("submit", (event) => {
		event.preventDefault();
		validateProjectForm();
		if (dom.projectSubmitBtn.disabled) return;
		const period = getCurrentPeriodData();
		const formData = new FormData(dom.addProjectForm);
		period.projects.push({
			id: Date.now(),
			projectName: String(formData.get("project-name")).trim(),
			companyName: String(formData.get("company-name")).trim(),
			budget: Number(formData.get("project-budget")),
			employeeCapacity: Number(formData.get("employee-capacity"))
		});
		saveData();
		dom.addProjectForm.reset();
		validateProjectForm();
		closePanels();
		render();
	});
	document.querySelectorAll("th.sortable").forEach((header) => {
		header.addEventListener("click", (event) => {
			if (event.target.classList.contains("filter-icon")) return;
			setSort(header.closest("table").id === "projects-table" ? "projects" : "employees", header.dataset.sort, () => render());
		});
	});
	document.querySelectorAll(".filter-icon").forEach((icon) => {
		icon.addEventListener("click", (event) => {
			event.stopPropagation();
			const header = icon.closest("th");
			openFilterPopup(header, header.closest("table").id === "projects-table" ? "projects" : "employees", header.dataset.filter, () => render(), closeFilterPopup);
		});
	});
	document.addEventListener("click", (event) => {
		if (uiState.activeFilterPopup && !uiState.activeFilterPopup.contains(event.target) && !event.target.classList.contains("filter-icon")) closeFilterPopup();
	});
}
function initDashboard() {
	loadData();
	initEvents();
	validateEmployeeForm();
	validateProjectForm();
	render();
}
//#endregion
//#region src/main.js
initDashboard();
//#endregion

//# sourceMappingURL=main.CLTQdtox.js.map