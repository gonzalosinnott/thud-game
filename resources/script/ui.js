/* Interfaz: panel, estado y registro de la partida */

import { state, countType } from "./core.js";
import { t } from "./i18n.js";
import { resultVerdict } from "./verdict.js";

export function updateUI(){
  const dwarfs = countType("dwarf");
  const trolls = countType("troll");

  document.getElementById("dwarfCount").textContent = dwarfs;
  document.getElementById("trollCount").textContent = trolls;
  document.getElementById("dwarfPts").textContent = dwarfs;
  document.getElementById("trollPts").textContent = trolls * 4;

  document.querySelectorAll(".score-card .points").forEach(el => {
    el.hidden = state.mode === "koom";
  });

  document.getElementById("modeBadge").textContent =
    t(state.mode === "koom" ? "mode.koom.name" : "mode.classic.name");

  document.getElementById("legendDwarf").textContent =
    t(state.mode === "koom" ? "legend.dwarf.koom" : "legend.dwarf");
  document.getElementById("legendTroll").textContent =
    t(state.mode === "koom" ? "legend.troll.koom" : "legend.troll");
  document.getElementById("legendStone").textContent =
    t(state.mode === "koom" ? "legend.rock" : "legend.thudstone");

  document.querySelectorAll("[data-help-mode]").forEach(el => {
    el.hidden = el.dataset.helpMode !== state.mode;
  });

  const turnEl = document.getElementById("turn");
  document.getElementById("turnLabel").textContent = state.turn === "dwarfs" ? t("turn.dwarfs") : t("turn.trolls");
  turnEl.className = "turn " + (state.turn === "dwarfs" ? "dwarfs" : "trolls");

  const statusEl = document.getElementById("status");
  if (state.over){
    statusEl.textContent = t("status.over");
  } else if (state.phase === "capture"){
    statusEl.textContent = (state.mustCapture && state.captured === 0)
      ? t("status.shoveRequired")
      : t("status.captureOptional");
  } else if (state.phase === "trample"){
    statusEl.textContent = t("status.koomTrample");
  } else if (state.selected){
    const n = state.targets.length;
    if (!n){
      statusEl.textContent = t("status.noMoves");
    } else if (state.mode === "koom"){
      let txt = t(n === 1 ? "status.targets.one" : "status.targets.other", { n });
      const tramples = state.targets.filter(target => target.kind === "trample").length;
      if (tramples){
        txt += " " + t(tramples === 1 ? "status.tramples.one" : "status.tramples.other", { n: tramples });
      }
      const selectedPiece = state.board[state.selected.r][state.selected.c];
      if (state.turn === "dwarfs" && selectedPiece && selectedPiece.type === "thudstone"){
        txt = t("status.koomRockSelected") + " " + txt;
      }
      statusEl.textContent = txt;
    } else {
      const lanzamientos = state.targets.filter(target => target.kind === "lanzar").length;
      const empujes = state.targets.filter(target => target.kind === "empujar").length;
      let txt = t(n === 1 ? "status.targets.one" : "status.targets.other", { n });
      if (lanzamientos) txt += " " + t(lanzamientos === 1 ? "status.hurls.one" : "status.hurls.other", { n: lanzamientos });
      if (empujes) txt += " " + t(empujes === 1 ? "status.shoves.one" : "status.shoves.other", { n: empujes });
      statusEl.textContent = txt;
    }
  } else {
    if (state.mode === "koom"){
      statusEl.textContent = state.turn === "dwarfs"
        ? t("status.koomSelectDwarf")
        : t("status.koomSelectTroll");
    } else {
      statusEl.textContent = state.turn === "dwarfs" ? t("status.selectDwarf") : t("status.selectTroll");
    }
  }

  const btn = document.getElementById("endTurnBtn");
  const show = (state.phase === "capture" || state.phase === "trample") && !state.over;
  const mustCaptureNow = state.phase === "capture" && state.mustCapture && state.captured === 0;
  btn.hidden = !show;
  btn.disabled = mustCaptureNow;
  btn.textContent = mustCaptureNow ? t("btn.captureRequired") : t("btn.endTurn");
  turnEl.classList.toggle("has-action", show);
  document.getElementById("turnLabel").hidden = show;

  document.getElementById("finalizeBtn").hidden = state.over;
}

export function log(key, params, highlight){
  state.log.push({ key, params: params || null, highlight: !!highlight });
  if (state.log.length > 60) state.log.shift();
  renderLog();
}

export function renderLog(){
  const ol = document.getElementById("log");
  ol.innerHTML = "";
  const items = state.log.slice(-9);
  for (const entry of items){
    const li = document.createElement("li");
    const params = Object.assign({}, entry.params);
    if (entry.key === "log.battleEnd"){
      params.verdict = resultVerdict(params.dwarfPts, params.trollPts);
    }
    li.textContent = t(entry.key, params);
    if (entry.highlight) li.className = "hl";
    ol.appendChild(li);
  }
  ol.scrollTop = ol.scrollHeight;
}
