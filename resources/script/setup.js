/* Preparacion de la partida y colocacion inicial de piezas */

import { N, DIRS, inBoard, isPerimeter, empty, state } from "./core.js";
import { cancelMoveAnimation } from "./animation.js";
import { render } from "./board.js";
import { log, updateUI } from "./ui.js";

/* ---------- PREPARACIÓN ---------- */
export function setupBoard(mode = state.mode){
  cancelMoveAnimation();
  state.mode = mode === "koom" ? "koom" : "classic";

  state.board = [];
  for (let r = 0; r < N; r++){
    state.board[r] = [];
    for (let c = 0; c < N; c++){
      state.board[r][c] = inBoard(r, c) ? empty() : null;
    }
  }

  if (state.mode === "koom") setupKoomPieces();
  else setupClassicPieces();

  state.turn = "dwarfs";
  state.phase = "normal";
  state.selected = null;
  state.targets = [];
  state.captureCells = [];
  state.mustCapture = false;
  state.captured = 0;
  state.over = false;
  state.koomWinner = null;
  state.log = [];
  document.getElementById("result").hidden = true;

  log(state.mode === "koom" ? "log.koomStart" : "log.battleStart");
  render();
  updateUI();
}

function setupClassicPieces(){
  // Thudstone en el centro
  state.board[7][7] = { type:"thudstone", owner:null };

  // 8 trolls en las casillas ortogonal y diagonalmente adyacentes al centro
  for (const [dr, dc] of DIRS){
    state.board[7 + dr][7 + dc] = { type:"troll", owner:"trolls" };
  }

  // 32 enanos en el borde exterior, salvo las 4 casillas alineadas con el centro
  let placed = 0;
  for (let r = 0; r < N; r++){
    for (let c = 0; c < N; c++){
      if (!inBoard(r, c) || !isPerimeter(r, c)) continue;
      const aligned = (r === 7 && (c === 0 || c === 14)) ||
                      (c === 7 && (r === 0 || r === 14));
      if (aligned) continue;
      state.board[r][c] = { type:"dwarf", owner:"dwarfs" };
      placed++;
    }
  }
  console.assert(placed === 32, "Enanos colocados:", placed);
}

/* Valle de Koom: la roca empieza en el centro, los trolls forman una cuña
   cerca del lado objetivo y los enanos defienden la mitad inferior. */
function setupKoomPieces(){
  state.board[7][7] = { type:"thudstone", owner:"dwarfs" };

  const trolls = [
    [1,5], [1,7], [1,9],
    [2,4], [2,5], [2,7], [2,9], [2,10]
  ];
  for (const [r, c] of trolls){
    state.board[r][c] = { type:"troll", owner:"trolls" };
  }

  const dwarfs = [
    [8,7],
    [9,0], [9,14],
    [10,1], [10,13],
    [11,2], [11,12],
    [12,3], [12,11],
    [13,4], [13,10],
    [14,5], [14,6], [14,7], [14,8], [14,9]
  ];
  for (const [r, c] of dwarfs){
    state.board[r][c] = { type:"dwarf", owner:"dwarfs" };
  }
  console.assert(trolls.length === 8 && dwarfs.length === 16, "Piezas de Koom:", trolls.length, dwarfs.length);
}
