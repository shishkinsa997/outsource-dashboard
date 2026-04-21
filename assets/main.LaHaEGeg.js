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
var now = /* @__PURE__ */ new Date();
var state = {
	monthlyData: {},
	currentMonth: now.getMonth(),
	currentYear: now.getFullYear(),
	activeTab: "projects"
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
console.dir(dom);
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
		const vacationCoefficient = 1;
		const effectiveCapacity = Number(assignment.capacity) * Number(assignment.fit) * vacationCoefficient;
		assignments.push({
			employee,
			assignment,
			vacationCoefficient,
			effectiveCapacity
		});
	}
	return {
		assignments,
		usedEffectiveCapacity: assignments.reduce((sum, item) => sum + item.effectiveCapacity, 0)
	};
}
function getEmployeeMetrics(employee) {
	return { usedCapacity: (employee.assignments || []).reduce((sum, item) => sum + Number(item.capacity), 0) };
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
function loadData() {
	state.monthlyData = deepClone(appData_default);
	const currentKey = toPeriodKey();
	if (!state.monthlyData[currentKey]) state.monthlyData[currentKey] = {
		employees: [],
		projects: []
	};
	saveData();
}
//#endregion
//#region src/js/modules/ui.js
function closePanels() {
	dom.addEmployeePanel.classList.remove("open");
	dom.addProjectPanel.classList.remove("open");
}
//#endregion
//#region src/js/utils/date.js
function calculateAge(dob) {
	const birth = new Date(dob);
	const today = /* @__PURE__ */ new Date();
	let age = today.getFullYear() - birth.getFullYear();
	const monthDiff = today.getMonth() - birth.getMonth();
	if (monthDiff < 0 || monthDiff === 0 && today.getDate() < birth.getDate()) age -= 1;
	return age;
}
//#endregion
//#region src/js/modules/tables.js
function createTableModule(deps) {
	const { getCurrentPeriodData, getEmployeeMetrics, getProjectMetrics, saveData, render } = deps;
	function renderProjectsTable() {
		const period = getCurrentPeriodData();
		const projects = period.projects;
		dom.projectsTableBody.innerHTML = "";
		projects.forEach((project) => {
			const metrics = getProjectMetrics(project, period.employees);
			const row = document.createElement("tr");
			row.innerHTML = `
        <td>${project.companyName}</td>
        <td>${project.projectName}</td>
        <td>${formatCurrency(project.budget)}</td>
        <td>${toFixed(metrics.usedEffectiveCapacity, 3)}/${toFixed(project.employeeCapacity, 2)}</td>
        <td><button class="show-details-btn">Show Employees (${metrics.assignments.length})</button></td>
        <td></td>
        <td><button class="delete-btn">Delete</button></td>
      `;
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
	}
	function renderEmployeesTable() {
		const period = getCurrentPeriodData();
		const employees = period.employees;
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
        <td>${formatCurrency(employee.salary)}</td>
        <td>
          <button class="show-details-btn">
            Show Assignments (${(employee.assignments || []).length})
            <span class="capacity-indicator">${toFixed(metrics.usedCapacity, 1)}/1.5</span>
          </button>
        </td>
        <td></td>
        <td class="action-buttons">
          <button class="availability-btn">Availability</button>
          <button class="assign-btn" ${metrics.usedCapacity >= 1.5 ? "disabled" : ""}>Assign</button>
          <button class="delete-btn">Delete</button>
        </td>
      `;
			dom.employeesTableBody.append(row);
		});
	}
	return {
		renderProjectsTable,
		renderEmployeesTable
	};
}
//#endregion
//#region src/js/app.js
var tableModule = createTableModule({
	getCurrentPeriodData,
	getEmployeeMetrics,
	getProjectMetrics,
	saveData,
	render: () => render()
});
function render() {
	dom.projectsContent.classList.toggle("hidden", state.activeTab !== "projects");
	dom.employeesContent.classList.toggle("hidden", state.activeTab !== "employees");
	dom.navProjects.classList.toggle("active", state.activeTab === "projects");
	dom.navEmployees.classList.toggle("active", state.activeTab === "employees");
	tableModule.renderProjectsTable();
	tableModule.renderEmployeesTable();
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
		closePanels();
	});
	dom.cancelProjectBtn.addEventListener("click", () => {
		dom.addProjectForm.reset();
		closePanels();
	});
}
function initDashboard() {
	loadData();
	initEvents();
	render();
}
//#endregion
//#region src/main.js
initDashboard();
//#endregion
