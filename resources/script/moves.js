/* Aplicacion de movimientos, capturas y pisotones */

import { state, empty, coord, playSound, notifyGameState } from "./core.js";
import { render } from "./board.js";
import { log, updateUI } from "./ui.js";
import {
  adjacentDwarfs,
  captureTrappedTrolls,
  rockOnGoal,
  trollsAdjacentToRock,
  trollTargetsKoom
} from "./movement.js";
import { endTurn, finishKoomBattle } from "./turns.js";

export function applyTarget(tgt){
  const from = state.selected;

  if (state.mode === "koom") return applyKoomTarget(tgt, from);

  if (state.turn === "dwarfs"){
    if (tgt.kind === "move"){
      movePiece(from, tgt);
      log("log.dwarfMove", { from: coord(from), to: coord(tgt) });
      endTurn();
      return false;
    } else {
      // Lanzar: el enano frontal vuela, el troll desaparece y el enano ocupa su casilla
      const lead = tgt.from;
      state.board[tgt.r][tgt.c] = empty();
      state.board[lead.r][lead.c] = empty();
      state.board[tgt.r][tgt.c] = { type:"dwarf", owner:"dwarfs" };
      log("log.hurl", { from: coord(lead), to: coord(tgt) }, true);
      endTurn();
      return true;
    }
  }

  if (tgt.kind === "move"){
    movePiece(from, tgt);
    log("log.trollMove", { from: coord(from), to: coord(tgt) });
    startCapture(false, tgt);
  } else {
    movePiece(from, tgt);
    log("log.shove", { from: coord(from), to: coord(tgt) }, true);
    startCapture(true, tgt);
  }
  return false;
}

function applyKoomTarget(tgt, from){
  if (!from) return false;
  const piece = state.board[from.r][from.c];

  if (state.turn === "dwarfs"){
    // La roca se mueve una casilla, sin capturar por sí misma.
    if (piece && piece.type === "thudstone"){
      movePiece(from, tgt);
      log("log.koomRock", { from: coord(from), to: coord(tgt) });
      if (rockOnGoal()){
        finishKoomBattle("dwarfs");
        return false;
      }
      endTurn();
      return false;
    }

    // Los enanos capturan trolls atrapados al terminar el movimiento.
    movePiece(from, tgt);
    log("log.dwarfMove", { from: coord(from), to: coord(tgt) });
    const captured = captureTrappedTrolls(tgt);
    endTurn();
    return captured;
  }

  if (tgt.kind === "trample"){
    const victim = tgt.captured;
    movePiece(from, tgt);
    if (victim) state.board[victim.r][victim.c] = empty();
    state.captured++;
    log("log.koomTrample", {
      from: coord(from),
      to: coord(tgt),
      cell: victim ? coord(victim) : coord(tgt)
    }, true);

    if (trollsAdjacentToRock() >= 3){
      finishKoomBattle("trolls");
      return true;
    }

    const next = trollTargetsKoom(tgt.r, tgt.c).filter(t => t.kind === "trample");
    if (next.length){
      state.selected = { r: tgt.r, c: tgt.c };
      state.targets = next;
      state.phase = "trample";
      state.mustCapture = false;
      state.captureCells = [];
      render();
      updateUI();
      notifyGameState();
    } else {
      endTurn();
    }
    return true;
  }

  // Movimiento normal del troll: hasta 3 casillas, sin capturas encadenadas.
  movePiece(from, tgt);
  log("log.trollMove", { from: coord(from), to: coord(tgt) });
  if (trollsAdjacentToRock() >= 3){
    finishKoomBattle("trolls");
    return false;
  }
  endTurn();
  return false;
}

function movePiece(from, to){
  state.board[to.r][to.c] = state.board[from.r][from.c];
  state.board[from.r][from.c] = empty();
}

/* Tras mover un troll, se abre la fase de captura de enanos adyacentes. */
function startCapture(required, pos){
  state.selected = null;
  state.targets = [];
  state.phase = "capture";
  state.captureCells = adjacentDwarfs(pos.r, pos.c);
  state.mustCapture = required;
  state.captured = 0;

  if (state.captureCells.length === 0){
    endTurn();                     // sin enanos adyacentes: el turno acaba
    return;
  }
  render();
  updateUI();
  notifyGameState();
}

export function doCapture(r, c){
  state.board[r][c] = empty();
  state.captureCells = state.captureCells.filter(p => !(p.r === r && p.c === c));
  state.captured++;
  playSound("thud");
  log("log.capture", { cell: coord({ r, c }) });

  if (state.captureCells.length === 0){
    endTurn();                     // no quedan capturas posibles
  } else {
    render();
    updateUI();
    notifyGameState();
  }
}
