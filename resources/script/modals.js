/* Modales: seleccion de modo, ayuda y confirmaciones */

import { state, otherSide } from "./core.js";
import { cancelAiTurn } from "./ai/index.js";
import { setupBoard } from "./setup.js";

/* ---------- MODALES ---------- */
export const modeModal = document.getElementById("modeModal");
export const helpModal = document.getElementById("helpModal");
export const confirmModal = document.getElementById("confirmModal");
const confirmTitleEl = document.getElementById("confirmTitle");
const confirmTextEl = document.getElementById("confirmText");
const confirmOkEl = document.getElementById("confirmOk");

export let activeModal = null;
let lastFocused = null;
let confirmResolver = null;

const selection = {
  mode: "classic",
  opponent: "human",
  side: "dwarfs"
};

export function openModal(modal){
  if (!modal || activeModal) return;
  lastFocused = document.activeElement;
  activeModal = modal;
  modal.hidden = false;
  document.body.classList.add("modal-open");
  const focusable = modal.querySelector(".mode-option, .modal-close, .modal-actions .btn");
  if (focusable) focusable.focus();
}

export function closeModal(modal){
  if (!modal || modal !== activeModal) return;
  modal.hidden = true;
  activeModal = null;
  document.body.classList.remove("modal-open");
  if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  lastFocused = null;
}

export function openModeModal(){
  cancelAiTurn();

  selection.mode = state.mode === "koom" ? "koom" : "classic";
  selection.opponent = state.ai.enabled ? "ai" : "human";
  selection.side = state.ai.humanSide || "dwarfs";

  renderModeSelection();
  openModal(modeModal);
}

export function selectMode(mode){
  if (activeModal !== modeModal) return;
  selection.mode = mode === "koom" ? "koom" : "classic";
  renderModeSelection();
}

export function selectOpponent(opponent){
  if (activeModal !== modeModal) return;
  selection.opponent = opponent === "ai" ? "ai" : "human";
  renderModeSelection();
}

export function selectSide(side){
  if (activeModal !== modeModal) return;
  selection.side = side === "trolls" ? "trolls" : "dwarfs";
  renderModeSelection();
}

export function startSelectedGame(){
  if (activeModal !== modeModal) return;

  const vsAi = selection.opponent === "ai";
  state.ai.enabled = vsAi;
  state.ai.humanSide = vsAi ? selection.side : null;
  state.ai.side = vsAi ? otherSide(selection.side) : null;
  state.ai.thinking = false;

  closeModal(modeModal);
  setupBoard(selection.mode);
}

function renderModeSelection(){
  setSelected("modeClassic", selection.mode === "classic");
  setSelected("modeKoom", selection.mode === "koom");
  setSelected("opponentHuman", selection.opponent === "human");
  setSelected("opponentAi", selection.opponent === "ai");
  setSelected("sideDwarfs", selection.side === "dwarfs");
  setSelected("sideTrolls", selection.side === "trolls");

  const sideSection = document.getElementById("sideSection");
  if (sideSection) sideSection.hidden = selection.opponent !== "ai";
}

function setSelected(id, selected){
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle("selected", selected);
  el.setAttribute("aria-pressed", String(selected));
}

export function askConfirm(title, text, okLabel){
  confirmTitleEl.textContent = title;
  confirmTextEl.textContent = text;
  confirmOkEl.textContent = okLabel || "Confirmar";
  openModal(confirmModal);
  return new Promise(resolve => { confirmResolver = resolve; });
}

export function settleConfirm(value){
  if (!confirmResolver) return;
  const resolve = confirmResolver;
  confirmResolver = null;
  closeModal(confirmModal);
  resolve(value);
}
