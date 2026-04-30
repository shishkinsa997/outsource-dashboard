import { dom, uiState } from "../state/appState.js";

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

export {
  closeFilterPopup,
  closePanels,
};
