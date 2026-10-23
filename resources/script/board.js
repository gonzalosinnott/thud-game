/* Tablero: creacion de casillas, piezas y renderizado */

import { N, inBoard, state, boardEl, cells, key } from "./core.js";

export function pieceEl(p){
  const el = document.createElement("div");
  el.className = "piece " + p.type;
  return el;
}

export function buildGrid(){
  boardEl.innerHTML = "";
  cells.clear();
  for (let r = 0; r < N; r++){
    for (let c = 0; c < N; c++){
      if (!inBoard(r, c)) continue;
      const el = document.createElement("div");
      el.className = "cell";
      el.style.gridRow = String(r + 1);
      el.style.gridColumn = String(c + 1);
      el.dataset.r = String(r);
      el.dataset.c = String(c);
      boardEl.appendChild(el);
      cells.set(key(r, c), el);
    }
  }
}

export function render(){
  for (let r = 0; r < N; r++){
    for (let c = 0; c < N; c++){
      if (!inBoard(r, c)) continue;
      const el = cells.get(key(r, c));
      el.className = "cell";

      if (state.mode === "koom" && r === 0 && c >= 5 && c <= 9){
        el.classList.add("koom-goal");
      }

      if (state.selected && state.selected.r === r && state.selected.c === c){
        el.classList.add("selected");
      }

      const tgt = state.targets.find(t => t.r === r && t.c === c);
      if (tgt) el.classList.add("tgt-" + tgt.kind);

      if (state.phase === "capture" &&
          state.captureCells.some(p => p.r === r && p.c === c)){
        el.classList.add("capture");
      }

      el.innerHTML = "";
      const p = state.board[r][c];
      if (p && p.type) el.appendChild(pieceEl(p));

      const canDrag = !state.over && state.phase === "normal" &&
        p && (p.type !== "thudstone" || state.mode === "koom") &&
        p.owner === state.turn;
      if (canDrag) el.classList.add("draggable");
    }
  }
}
