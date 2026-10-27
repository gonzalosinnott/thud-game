/* Construcción y renderizado del tablero. */

import { N, PIECES } from "../domain/constants.js";
import { inBoard, isKoomGoal, key } from "../domain/geometry.js";
import { isAiTurn } from "../application/selectors.js";
import { boardEl, cells } from "./dom.js";

export function pieceEl(piece) {
  const element = document.createElement("div");
  element.className = "piece " + piece.type;
  return element;
}

export function buildGrid() {
  boardEl.innerHTML = "";
  cells.clear();

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (!inBoard(r, c)) continue;
      const element = document.createElement("div");
      element.className = "cell";
      element.style.gridRow = String(r + 1);
      element.style.gridColumn = String(c + 1);
      element.dataset.r = String(r);
      element.dataset.c = String(c);
      boardEl.appendChild(element);
      cells.set(key(r, c), element);
    }
  }
}

export function renderBoard(store) {
  const { game, session, ui } = store;
  const aiTurn = isAiTurn(session, game);

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (!inBoard(r, c)) continue;
      const element = cells.get(key(r, c));
      if (!element) continue;

      element.className = "cell";
      if (game.mode === "koom" && isKoomGoal(r, c)) {
        element.classList.add("koom-goal");
      }
      if (ui.selected && ui.selected.r === r && ui.selected.c === c) {
        element.classList.add("selected");
      }

      const target = ui.targets.find(item => item.r === r && item.c === c);
      if (target) element.classList.add("tgt-" + target.kind);

      if (game.pending && game.pending.type === "capture" &&
          game.pending.cells.some(cell => cell.r === r && cell.c === c)) {
        element.classList.add("capture");
      }

      element.innerHTML = "";
      const piece = game.board[r][c];
      if (piece && piece.type) element.appendChild(pieceEl(piece));

      const canDrag = !game.result && !ui.busy && !aiTurn && game.phase === "normal" &&
        piece && (piece.type !== PIECES.THUDSTONE || game.mode === "koom") &&
        piece.owner === game.turn;
      if (canDrag) element.classList.add("draggable");
    }
  }
}
