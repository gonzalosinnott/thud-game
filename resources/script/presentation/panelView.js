/* Panel lateral: turno, marcador, estado y botones. */

import { PIECES } from "../domain/constants.js";
import { countPieces } from "../domain/pieces.js";
import { isAiTurn } from "../application/selectors.js";
import { t } from "../i18n/index.js";

export function renderPanel(store) {
  const { game, session, ui } = store;
  const dwarfs = countPieces(game.board, PIECES.DWARF);
  const trolls = countPieces(game.board, PIECES.TROLL);
  const aiTurn = isAiTurn(session, game);

  setText("dwarfCount", dwarfs);
  setText("trollCount", trolls);
  setText("dwarfPts", dwarfs);
  setText("trollPts", trolls * 4);

  document.querySelectorAll(".score-card .points").forEach(element => {
    element.hidden = game.mode === "koom";
  });

  setText("modeBadge", t(game.mode === "koom" ? "mode.koom.name" : "mode.classic.name"));
  renderMatchup(session);

  setText("legendDwarf", t(game.mode === "koom" ? "legend.dwarf.koom" : "legend.dwarf"));
  setText("legendTroll", t(game.mode === "koom" ? "legend.troll.koom" : "legend.troll"));
  setText("legendStone", t(game.mode === "koom" ? "legend.rock" : "legend.thudstone"));

  document.querySelectorAll("[data-help-mode]").forEach(element => {
    element.hidden = element.dataset.helpMode !== game.mode;
  });

  const turnElement = document.getElementById("turn");
  const turnLabel = document.getElementById("turnLabel");
  turnLabel.textContent = game.turn === "dwarfs" ? t("turn.dwarfs") : t("turn.trolls");
  turnElement.className = "turn " + (game.turn === "dwarfs" ? "dwarfs" : "trolls");

  const statusElement = document.getElementById("status");
  statusElement.textContent = getStatusText(store, aiTurn);

  const endTurnButton = document.getElementById("endTurnBtn");
  const showEndTurn = (game.phase === "capture" || game.phase === "trample") &&
    !game.result && !aiTurn;
  const mustCaptureNow = game.phase === "capture" &&
    game.pending && game.pending.mustCapture && game.pending.captured === 0;

  endTurnButton.hidden = !showEndTurn;
  endTurnButton.disabled = mustCaptureNow || aiTurn || ui.busy;
  endTurnButton.textContent = mustCaptureNow ? t("btn.captureRequired") : t("btn.endTurn");
  turnElement.classList.toggle("has-action", showEndTurn);
  turnLabel.hidden = showEndTurn;

  const finalizeButton = document.getElementById("finalizeBtn");
  finalizeButton.hidden = !!game.result;
  finalizeButton.disabled = aiTurn || ui.busy;
}

function getStatusText(store, aiTurn) {
  const { game, session, ui } = store;

  if (game.result) return t("status.over");
  if (aiTurn) return t(store.ai.thinking ? "status.aiThinking" : "status.aiTurn");

  if (game.phase === "capture" && game.pending) {
    return game.pending.mustCapture && game.pending.captured === 0
      ? t("status.shoveRequired")
      : t("status.captureOptional");
  }

  if (game.phase === "trample") return t("status.koomTrample");

  if (ui.selected) {
    const count = ui.targets.length;
    if (!count) return t("status.noMoves");

    if (game.mode === "koom") {
      let text = t(count === 1 ? "status.targets.one" : "status.targets.other", { n: count });
      const tramples = ui.targets.filter(target => target.kind === "trample").length;
      if (tramples) {
        text += " " + t(tramples === 1 ? "status.tramples.one" : "status.tramples.other", { n: tramples });
      }

      const selectedPiece = game.board[ui.selected.r][ui.selected.c];
      if (game.turn === "dwarfs" && selectedPiece && selectedPiece.type === PIECES.THUDSTONE) {
        text = t("status.koomRockSelected") + " " + text;
      }
      return text;
    }

    const hurls = ui.targets.filter(target => target.kind === "lanzar").length;
    const shoves = ui.targets.filter(target => target.kind === "empujar").length;
    let text = t(count === 1 ? "status.targets.one" : "status.targets.other", { n: count });
    if (hurls) text += " " + t(hurls === 1 ? "status.hurls.one" : "status.hurls.other", { n: hurls });
    if (shoves) text += " " + t(shoves === 1 ? "status.shoves.one" : "status.shoves.other", { n: shoves });
    return text;
  }

  if (game.mode === "koom") {
    return game.turn === "dwarfs" ? t("status.koomSelectDwarf") : t("status.koomSelectTroll");
  }
  return game.turn === "dwarfs" ? t("status.selectDwarf") : t("status.selectTroll");
}

function renderMatchup(session) {
  const element = document.getElementById("matchupBadge");
  if (!element) return;

  if (session.opponent === "ai" && session.humanSide && session.aiSide) {
    element.hidden = false;
    element.textContent = t("matchup.ai", {
      human: t(session.humanSide === "dwarfs" ? "side.dwarfs" : "side.trolls"),
      ai: t(session.aiSide === "dwarfs" ? "side.dwarfs" : "side.trolls")
    });
  } else {
    element.hidden = true;
  }
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}
