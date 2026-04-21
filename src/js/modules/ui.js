import { dom } from "../state/appState.js";

function closePanels() {
  dom.addEmployeePanel.classList.remove("open");
  dom.addProjectPanel.classList.remove("open");
}

export {
  closePanels,
};
