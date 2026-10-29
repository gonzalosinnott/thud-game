/* Modales: selección de partida, ayuda y confirmaciones. */

import { MODES, SIDES } from "../domain/constants.js";

export const modeModal = document.getElementById("modeModal");
export const helpModal = document.getElementById("helpModal");
export const confirmModal = document.getElementById("confirmModal");

const confirmTitleEl = document.getElementById("confirmTitle");
const confirmTextEl = document.getElementById("confirmText");
const confirmOkEl = document.getElementById("confirmOk");

export let activeModal = null;
let lastFocused = null;
let confirmResolver = null;
let selection = { mode: MODES.CLASSIC, opponent: "human", side: SIDES.DWARFS };

export function openModal(modal) {
  if (!modal || activeModal) return;
  lastFocused = document.activeElement;
  activeModal = modal;
  modal.hidden = false;
  document.body.classList.add("modal-open");
  setBackgroundInert(true);
  const focusable = modal.querySelector(".mode-option, .modal-close, .modal-actions .btn");
  if (focusable) focusable.focus();
}

export function closeModal(modal) {
  if (!modal || modal !== activeModal) return;
  modal.hidden = true;
  activeModal = null;
  document.body.classList.remove("modal-open");
  setBackgroundInert(false);
  if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  lastFocused = null;
}

function setBackgroundInert(value) {
  for (const selector of [".head", ".layout"]) {
    const element = document.querySelector(selector);
    if (element) element.inert = value;
  }
}

// Mantiene el foco dentro del diálogo abierto.
const FOCUSABLE = "a[href], button:not([disabled]), input:not([disabled]), " +
  "select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

document.addEventListener("keydown", event => {
  if (event.key !== "Tab" || !activeModal) return;

  const focusable = Array.from(activeModal.querySelectorAll(FOCUSABLE))
    .filter(element => element.getClientRects().length > 0);
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const current = document.activeElement;

  if (event.shiftKey && (current === first || !activeModal.contains(current))) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (current === last || !activeModal.contains(current))) {
    event.preventDefault();
    first.focus();
  }
});

export function openModeModal(initial = {}) {
  selection = {
    mode: initial.mode === MODES.KOOM ? MODES.KOOM : MODES.CLASSIC,
    opponent: initial.opponent === "ai" ? "ai" : "human",
    side: initial.side === SIDES.TROLLS ? SIDES.TROLLS : SIDES.DWARFS
  };
  renderModeSelection();
  openModal(modeModal);
}

export function getSelection() {
  return { ...selection };
}

export function selectMode(mode) {
  if (activeModal !== modeModal) return;
  selection.mode = mode === MODES.KOOM ? MODES.KOOM : MODES.CLASSIC;
  renderModeSelection();
}

export function selectOpponent(opponent) {
  if (activeModal !== modeModal) return;
  selection.opponent = opponent === "ai" ? "ai" : "human";
  renderModeSelection();
}

export function selectSide(side) {
  if (activeModal !== modeModal) return;
  selection.side = side === SIDES.TROLLS ? SIDES.TROLLS : SIDES.DWARFS;
  renderModeSelection();
}

function renderModeSelection() {
  setSelected("modeClassic", selection.mode === MODES.CLASSIC);
  setSelected("modeKoom", selection.mode === MODES.KOOM);
  setSelected("opponentHuman", selection.opponent === "human");
  setSelected("opponentAi", selection.opponent === "ai");
  setSelected("sideDwarfs", selection.side === SIDES.DWARFS);
  setSelected("sideTrolls", selection.side === SIDES.TROLLS);

  const sideSection = document.getElementById("sideSection");
  if (sideSection) sideSection.hidden = selection.opponent !== "ai";
}

function setSelected(id, selected) {
  const element = document.getElementById(id);
  if (!element) return;
  element.classList.toggle("selected", selected);
  element.setAttribute("aria-pressed", String(selected));
}

export function askConfirm(title, text, okLabel) {
  if (activeModal) return Promise.resolve(false);

  confirmTitleEl.textContent = title;
  confirmTextEl.textContent = text;
  confirmOkEl.textContent = okLabel || "Confirmar";
  openModal(confirmModal);
  return new Promise(resolve => {
    confirmResolver = resolve;
  });
}

export function settleConfirm(value) {
  if (!confirmResolver) return;
  const resolve = confirmResolver;
  confirmResolver = null;
  closeModal(confirmModal);
  resolve(value);
}
