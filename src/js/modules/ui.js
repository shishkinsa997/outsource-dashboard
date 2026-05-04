import { dom, uiState } from "../state/appState.js";

function closeFilterPopup() {
  if (uiState.activeFilterPopup) {
    uiState.activeFilterPopup.remove();
    uiState.activeFilterPopup = null;
  }
}
function closeAssignmentPopup() {
  if (uiState.activeAssignmentPopup) {
    uiState.activeAssignmentPopup.cleanup();
    uiState.activeAssignmentPopup = null;
  }
}

function closePanels() {
  dom.addEmployeePanel.classList.remove("open");
  dom.addProjectPanel.classList.remove("open");
}

function createBackdrop() {
  const backdrop = document.createElement("div");
  backdrop.className = "popup-backdrop";
  document.body.append(backdrop);
  return backdrop;
}

function openDetailsPopup(title, buildContent) {
  const backdrop = createBackdrop();
  const popup = document.createElement("div");
  popup.className = "details-popup";
  popup.innerHTML = `
    <div class="popup-header">
      <h3>${title}</h3>
      <button class="close-popup-btn">×</button>
    </div>
    <div class="popup-content"></div>
  `;
  const content = popup.querySelector(".popup-content");
  buildContent(content, () => {
    popup.remove();
    backdrop.remove();
  });

  const close = () => {
    popup.remove();
    backdrop.remove();
  };
  popup.querySelector(".close-popup-btn").addEventListener("click", close);
  backdrop.addEventListener("click", close);
  popup.addEventListener("click", (event) => event.stopPropagation());
  document.body.append(popup);
}

export {
  closeFilterPopup,
  closeAssignmentPopup,
  closePanels,
  createBackdrop,
  openDetailsPopup,
};
