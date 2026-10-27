/* Turnos, fin de batalla y resultados */

import { N, state, countType, notifyGameState } from "./core.js";
import { t } from "./i18n.js";
import { render } from "./board.js";
import { dwarfTargets, trollTargets } from "./movement.js";
import { log, updateUI } from "./ui.js";
import { resultVerdict } from "./verdict.js";

/* ---------- TURNOS Y FIN DE BATALLA ---------- */
export function endTurn(){
  if (state.mode === "koom"){
    const winner = koomEliminationWinner();
    if (winner){
      finishKoomBattle(winner, "elimination");
      return;
    }
  }

  state.phase = "normal";
  state.selected = null;
  state.targets = [];
  state.captureCells = [];
  state.mustCapture = false;
  state.captured = 0;

  state.turn = state.turn === "dwarfs" ? "trolls" : "dwarfs";

  if (state.mode === "koom"){
    const other = state.turn === "dwarfs" ? "trolls" : "dwarfs";
    const nextCanMove = hasAnyMove(state.turn);
    const otherCanMove = hasAnyMove(other);
    if (!nextCanMove && !otherCanMove){
      render();
      finishKoomBattle("draw");
      return;
    }
    if (!nextCanMove && otherCanMove){
      // Si un bando no puede actuar, el otro sigue jugando.
      log(state.turn === "dwarfs" ? "log.koomPassDwarfs" : "log.koomPassTrolls");
      state.turn = other;
    }
  }

  render();

  if (checkBattleOver()) return;

  log(state.turn === "dwarfs" ? "log.turnDwarfs" : "log.turnTrolls");
  updateUI();
  notifyGameState();
}

function koomEliminationWinner(){
  const dwarfs = countType("dwarf");
  const trolls = countType("troll");
  if (dwarfs === 0 && trolls === 0) return "draw";
  if (trolls === 0) return "dwarfs";
  if (dwarfs === 0) return "trolls";
  return null;
}

function hasAnyMove(player){
  for (let r = 0; r < N; r++){
    for (let c = 0; c < N; c++){
      const p = state.board[r][c];
      if (!p || p.owner !== player) continue;
      const list = player === "dwarfs" ? dwarfTargets(r, c) : trollTargets(r, c);
      if (list.length) return true;
    }
  }
  return false;
}

function checkBattleOver(){
  if (state.over) return true;

  if (state.mode === "koom"){
    const winner = koomEliminationWinner();
    if (winner){
      finishKoomBattle(winner, "elimination");
      return true;
    }
    if (!hasAnyMove("dwarfs") && !hasAnyMove("trolls")){
      finishKoomBattle("draw");
      return true;
    }
    return false;
  }

  const dwarfs = countType("dwarf");
  const trolls = countType("troll");
  if (dwarfs === 0 || trolls === 0 || !hasAnyMove(state.turn)){
    finishBattle(dwarfs, trolls);
    return true;
  }
  return false;
}

export function renderResult(dwarfs, trolls, verdict){
  const result = document.getElementById("result");
  result.hidden = false;

  if (state.mode === "koom"){
    const winner = state.koomWinner || "draw";
    const suffix = winner !== "draw" && state.koomReason === "elimination"
      ? ".elimination"
      : "";
    result.innerHTML = t("result.koom." + winner + suffix);
    return;
  }

  const dwarfPts = dwarfs;          // 1 punto por enano vivo
  const trollPts = trolls * 4;      // 4 puntos por troll vivo
  const finalVerdict = verdict || resultVerdict(dwarfPts, trollPts);
  result.innerHTML = t("result.battle", {
    dwarfs,
    dwarfPts,
    trolls,
    trollPts,
    verdict: finalVerdict
  });
}

export function finishBattle(dwarfs, trolls){
  state.over = true;
  const dwarfPts = dwarfs;
  const trollPts = trolls * 4;

  const verdict = resultVerdict(dwarfPts, trollPts);

  log("log.battleEnd", {
    dwarfPts,
    dwarfs,
    trollPts,
    trolls
  }, true);

  renderResult(dwarfs, trolls, verdict);

  render();
  updateUI();
  notifyGameState();
}

export function finishKoomBattle(winner, reason = "objective"){
  if (state.over) return;

  if (winner === "draw"){
    const elimination = koomEliminationWinner();
    if (elimination && elimination !== "draw"){
      winner = elimination;
      reason = "elimination";
    }
  }

  state.over = true;
  state.koomWinner = winner;
  state.koomReason = winner === "draw" ? null : reason;
  state.phase = "normal";
  state.selected = null;
  state.targets = [];
  state.captureCells = [];
  state.mustCapture = false;
  state.captured = 0;

  let logKey = "log.koomDraw";
  if (winner === "dwarfs"){
    logKey = reason === "elimination" ? "log.koomEndDwarfsElimination" : "log.koomEndDwarfs";
  } else if (winner === "trolls"){
    logKey = reason === "elimination" ? "log.koomEndTrollsElimination" : "log.koomEndTrolls";
  }
  log(logKey, null, true);

  renderResult(countType("dwarf"), countType("troll"));
  render();
  updateUI();
  notifyGameState();
}
