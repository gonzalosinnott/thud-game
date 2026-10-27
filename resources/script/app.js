/* Eventos y arranque de la aplicacion */

import { state, boardEl, countType, GAME_STATE_EVENT, isAiTurn } from "./core.js";
import {
  LANGUAGE_CHANGE_EVENT,
  applyTranslations,
  currentLang,
  loadLocale,
  preferredLanguage,
  switchLanguage,
  t
} from "./i18n.js";
import { buildGrid } from "./board.js";
import {
  cancelDrag,
  onCellClick,
  onPointerCancel,
  onPointerDown,
  onPointerMove,
  onPointerUp
} from "./interaction.js";
import { animatingMove } from "./animation.js";
import { endTurn, finishBattle, finishKoomBattle, renderResult } from "./turns.js";
import { renderLog, updateUI } from "./ui.js";
import {
  activeModal,
  askConfirm,
  closeModal,
  confirmModal,
  helpModal,
  modeModal,
  openModal,
  openModeModal,
  selectMode,
  selectOpponent,
  selectSide,
  settleConfirm,
  startSelectedGame
} from "./modals.js";
import { scheduleAiTurn } from "./ai/index.js";
import { setupBoard } from "./setup.js";

export function bindEvents(){
  document.getElementById("modeClassic").addEventListener("click", () => selectMode("classic"));
  document.getElementById("modeKoom").addEventListener("click", () => selectMode("koom"));
  document.getElementById("opponentHuman").addEventListener("click", () => selectOpponent("human"));
  document.getElementById("opponentAi").addEventListener("click", () => selectOpponent("ai"));
  document.getElementById("sideDwarfs").addEventListener("click", () => selectSide("dwarfs"));
  document.getElementById("sideTrolls").addEventListener("click", () => selectSide("trolls"));
  document.getElementById("startGameBtn").addEventListener("click", () => startSelectedGame());
  document.getElementById("helpBtn").addEventListener("click", () => openModal(helpModal));
  document.getElementById("confirmOk").addEventListener("click", () => settleConfirm(true));
  document.getElementById("confirmCancel").addEventListener("click", () => settleConfirm(false));

  document.querySelectorAll(".modal [data-close]").forEach(el => {
    el.addEventListener("click", () => {
      const modal = el.closest(".modal");
      if (modal === confirmModal) settleConfirm(false);
      else closeModal(modal);
    });
  });

  document.addEventListener("keydown", e => {
    if (e.key !== "Escape" || !activeModal) return;
    if (activeModal === modeModal) return;   // la versión debe elegirse sí o sí
    if (activeModal === confirmModal) settleConfirm(false);
    else closeModal(activeModal);
  });

  document.addEventListener(LANGUAGE_CHANGE_EVENT, () => {
    updateUI();
    renderLog();
    if (state.over) renderResult(countType("dwarf"), countType("troll"));
  });

  document.addEventListener(GAME_STATE_EVENT, () => {
    scheduleAiTurn();
  });

  /* ---------- BOTONES ---------- */
  document.getElementById("langBtn").addEventListener("click", () => {
    switchLanguage(currentLang === "es" ? "en" : "es");
  });

  document.getElementById("endTurnBtn").addEventListener("click", () => {
    if (state.over || animatingMove || isAiTurn()) return;
    if (state.phase !== "capture" && state.phase !== "trample") return;
    if (state.phase === "capture" && state.mustCapture && state.captured === 0) return;
    endTurn();
  });

  document.getElementById("finalizeBtn").addEventListener("click", async () => {
    if (state.over || animatingMove || isAiTurn()) return;
    const ok = await askConfirm(
      t("confirm.finalize.title"),
      t(state.mode === "koom" ? "confirm.finalize.koom.text" : "confirm.finalize.text"),
      t("btn.finalize")
    );
    if (!ok || state.over) return;
    if (state.mode === "koom"){
      finishKoomBattle("draw");
    } else {
      finishBattle(countType("dwarf"), countType("troll"));
    }
  });

  document.getElementById("newBattleBtn").addEventListener("click", async () => {
    if (animatingMove) return;
    if (!state.over){
      const ok = await askConfirm(
        t("confirm.new.title"),
        t("confirm.new.text"),
        t("btn.restart")
      );
      if (!ok) return;
    }
    openModeModal();
  });
}

/* ---------- ARRANQUE ---------- */
export async function init(){
  buildGrid();
  boardEl.addEventListener("click", e => {
    const cell = e.target.closest ? e.target.closest(".cell") : null;
    if (!cell) return;
    onCellClick(Number(cell.dataset.r), Number(cell.dataset.c));
  });
  boardEl.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove, { passive: false });
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerCancel);
  window.addEventListener("blur", cancelDrag);
  try {
    await loadLocale(preferredLanguage());
  } catch (err) {
    console.error("No se pudieron cargar las traducciones:", err);
    document.getElementById("status").textContent =
      "No se pudieron cargar las traducciones. Revisá resources/i18n/. / " +
      "Could not load translations. Check resources/i18n/.";
    return;
  }
  applyTranslations();
  setupBoard("classic");
  openModeModal();
}
