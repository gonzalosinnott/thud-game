/* Modales: seleccion de modo, ayuda y confirmaciones */

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

export function chooseMode(mode){
  if (activeModal !== modeModal) return;
  closeModal(modeModal);
  setupBoard(mode);
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
