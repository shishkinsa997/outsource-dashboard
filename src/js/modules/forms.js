import { POSITIONS, dom } from "../state/appState.js";
import { calculateAge } from "../utils/date.js";

function validateEmployeeForm() {
  const form = dom.addEmployeeForm;
  const fields = {
    name: form.querySelector("#name"),
    surname: form.querySelector("#surname"),
    dob: form.querySelector("#dob"),
    position: form.querySelector("#position"),
    salary: form.querySelector("#salary"),
  };

  const nameValid = /^[A-Za-z\s]{3,}$/.test(fields.name.value.trim());
  const surnameValid = /^[A-Za-z\s]{3,}$/.test(fields.surname.value.trim());
  const age = fields.dob.value ? calculateAge(fields.dob.value) : 0;
  const dobValid = age >= 18;
  const positionValid = POSITIONS.includes(fields.position.value);
  const salaryValid = Number(fields.salary.value) > 0;

  document
    .getElementById("name-error")
    .classList.toggle("show", !nameValid && fields.name.value !== "");
  document
    .getElementById("surname-error")
    .classList.toggle("show", !surnameValid && fields.surname.value !== "");
  document
    .getElementById("dob-error")
    .classList.toggle("show", fields.dob.value !== "" && !dobValid);
  document
    .getElementById("position-error")
    .classList.toggle("show", fields.position.value !== "" && !positionValid);
  document
    .getElementById("salary-error")
    .classList.toggle("show", fields.salary.value !== "" && !salaryValid);

  dom.employeeSubmitBtn.disabled = !(
    nameValid &&
    surnameValid &&
    dobValid &&
    positionValid &&
    salaryValid
  );
}

function validateProjectForm() {
  const form = dom.addProjectForm;
  const fields = {
    projectName: form.querySelector("#project-name"),
    companyName: form.querySelector("#company-name"),
    budget: form.querySelector("#project-budget"),
    capacity: form.querySelector("#employee-capacity"),
  };

  const projectNameValid = /^[A-Za-z0-9\s]{3,}$/.test(fields.projectName.value.trim());
  const companyNameValid = /^[A-Za-z0-9\s]{2,}$/.test(fields.companyName.value.trim());
  const budgetValid = Number(fields.budget.value) > 0;
  const capacityValue = Number(fields.capacity.value);
  const capacityValid = Number.isInteger(capacityValue) && capacityValue >= 1;

  document
    .getElementById("project-name-error")
    .classList.toggle("show", !projectNameValid && fields.projectName.value !== "");
  document
    .getElementById("company-name-error")
    .classList.toggle("show", !companyNameValid && fields.companyName.value !== "");
  document
    .getElementById("project-budget-error")
    .classList.toggle("show", !budgetValid && fields.budget.value !== "");
  document
    .getElementById("employee-capacity-error")
    .classList.toggle("show", !capacityValid && fields.capacity.value !== "");

  dom.projectSubmitBtn.disabled = !(
    projectNameValid &&
    companyNameValid &&
    budgetValid &&
    capacityValid
  );
}

export { validateEmployeeForm, validateProjectForm };
