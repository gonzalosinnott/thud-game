/* Composición de la aplicación: eventos, modales e inicialización. */

import { MODES } from "./domain/constants.js";
import { controller } from "./application/gameController.js";
import { store } from "./application/store.js";
import {
  LANGUAGE_CHANGE_EVENT,
  applyTranslations,
  getLang,
  loadLocale,
  preferredLanguage,
  switchLanguage,
  t
} from "./i18n/index.js";
import { buildGrid } from "./presentation/boardView.js";
import { bindInput } from "./presentation/input/index.js";
import {
  activeModal,
  askConfirm,
  closeModal,
  confirmModal,
  getSelection,
  helpModal,
  modeModal,
  openModeModal,
  openModal,
  selectMode,
  selectOpponent,
  selectSide,
  settleConfirm
} from "./presentation/modals.js";

export function bindEvents() {
  document.getElementById("modeClassic").addEventListener("click", () => selectMode(MODES.CLASSIC));
  document.getElementById("modeKoom").addEventListener("click", () => selectMode(MODES.KOOM));
  document.getElementById("opponentHuman").addEventListener("click", () => selectOpponent("human"));
  document.getElementById("opponentAi").addEventListener("click", () => selectOpponent("ai"));
  document.getElementById("sideDwarfs").addEventListener("click", () => selectSide("dwarfs"));
  document.getElementById("sideTrolls").addEventListener("click", () => selectSide("trolls"));

  document.getElementById("startGameBtn").addEventListener("click", () => {
    if (activeModal !== modeModal) return;
    const selection = getSelection();
    closeModal(modeModal);
    controller.startGame({
      mode: selection.mode,
      opponent: selection.opponent,
      humanSide: selection.side
    });
  });

  document.getElementById("helpBtn").addEventListener("click", () => openModal(helpModal));
  document.getElementById("confirmOk").addEventListener("click", () => settleConfirm(true));
  document.getElementById("confirmCancel").addEventListener("click", () => settleConfirm(false));

  document.querySelectorAll(".modal [data-close]").forEach(element => {
    element.addEventListener("click", () => {
      const modal = element.closest(".modal");
      if (modal === confirmModal) settleConfirm(false);
      else closeModal(modal);
    });
  });

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape" || !activeModal) return;
    if (activeModal === modeModal) return;
    if (activeModal === confirmModal) settleConfirm(false);
    else closeModal(activeModal);
  });

  document.addEventListener(LANGUAGE_CHANGE_EVENT, () => {
    controller.refresh();
  });

  document.getElementById("langBtn").addEventListener("click", () => {
    void switchLanguage(getLang() === "es" ? "en" : "es");
  });

  document.getElementById("endTurnBtn").addEventListener("click", () => {
    if (activeModal) return;
    controller.endTurn();
  });

  document.getElementById("finalizeBtn").addEventListener("click", async () => {
    if (activeModal || !controller.canHumanInteract()) return;

    const ok = await askConfirm(
      t("confirm.finalize.title"),
      t(store.game.mode === MODES.KOOM ? "confirm.finalize.koom.text" : "confirm.finalize.text"),
      t("btn.finalize")
    );
    if (!ok || store.game.result) return;
    controller.finalize();
  });

  document.getElementById("newBattleBtn").addEventListener("click", async () => {
    if (activeModal || controller.isBusy()) return;

    if (!store.game.result) {
      const ok = await askConfirm(
        t("confirm.new.title"),
        t("confirm.new.text"),
        t("btn.restart")
      );
      if (!ok) return;
    }

    controller.cancel();
    openModeModal({
      mode: store.game.mode,
      opponent: store.session.opponent,
      side: store.session.humanSide || "dwarfs"
    });
  });
}

export async function init() {
  buildGrid();
  bindInput(controller);

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
  controller.startGame({ mode: MODES.CLASSIC, opponent: "human" });
  openModeModal({
    mode: store.game.mode,
    opponent: store.session.opponent,
    side: store.session.humanSide || "dwarfs"
  });
}
