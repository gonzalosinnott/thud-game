/* Interaccion: seleccion, clics y arrastre de piezas */

import { state, key, cells, playSound, stopSound } from "./core.js";
import { pieceEl, render } from "./board.js";
import { dwarfTargets, trollTargets } from "./movement.js";
import { doCapture } from "./moves.js";
import { executeTarget, animatingMove } from "./animation.js";
import { updateUI } from "./ui.js";

/* ---------- INTERACCIÓN ---------- */
function selectPiece(r, c){
  state.selected = { r, c };
  state.targets = state.turn === "dwarfs"
    ? dwarfTargets(r, c)
    : trollTargets(r, c);
  playSound("pickup");
  render();
  updateUI();
}

export function onCellClick(r, c){
  if (state.over || animatingMove) return;

  // Fase de captura de los trolls: clic en enanos adyacentes para eliminarlos
  if (state.phase === "capture"){
    if (state.captureCells.some(p => p.r === r && p.c === c)){
      doCapture(r, c);
    }
    return;
  }

  // Koom: tras un pisotón, se pueden encadenar más pisotones.
  if (state.phase === "trample"){
    const tgt = state.targets.find(t => t.r === r && t.c === c);
    if (tgt) executeTarget(tgt);
    return;
  }

  const piece = state.board[r][c];

  // Volver a pulsar la pieza seleccionada la deselecciona
  if (state.selected && state.selected.r === r && state.selected.c === c){
    clearSelection();
    return;
  }

  // Ejecutar un destino marcado
  const tgt = state.targets.find(t => t.r === r && t.c === c);
  if (tgt){
    executeTarget(tgt);
    return;
  }

  // Seleccionar una pieza propia
  if (piece && piece.type && piece.owner === state.turn){
    selectPiece(r, c);
    return;
  }

  clearSelection();
}

function clearSelection(){
  const hadSelection = !!state.selected;
  state.selected = null;
  state.targets = [];
  render();
  updateUI();
  if (hadSelection) playSound("putdown");
}

/* ---------- ARRASTRAR PIEZAS ---------- */
let drag = null;
const DRAG_THRESHOLD = 6;

function cellFromPoint(x, y){
  const el = document.elementFromPoint(x, y);
  return el && el.closest ? el.closest(".cell") : null;
}

function targetAt(x, y){
  const cell = cellFromPoint(x, y);
  if (!cell) return null;
  const r = Number(cell.dataset.r);
  const c = Number(cell.dataset.c);
  return state.targets.find(t => t.r === r && t.c === c) || null;
}

export function onPointerDown(e){
  if (e.button !== 0 || e.pointerType === "touch") return;
  if (state.over || animatingMove || state.phase !== "normal") return;

  const cell = e.target.closest(".cell");
  if (!cell) return;
  const r = Number(cell.dataset.r);
  const c = Number(cell.dataset.c);
  const p = state.board[r][c];
  if (!p || p.owner !== state.turn) return;
  if (p.type === "thudstone" && state.mode !== "koom") return;

  drag = {
    pointerId: e.pointerId,
    startX: e.clientX,
    startY: e.clientY,
    from: { r, c },
    active: false,
    ghost: null,
    sourceEl: null,
    hoverCell: null,
    moveSoundStarted: false,
    moveSoundTimer: null
  };
}

function startDrag(e){
  drag.active = true;
  document.body.classList.add("dragging");
  selectPiece(drag.from.r, drag.from.c);

  const sourceCell = cells.get(key(drag.from.r, drag.from.c));
  const sourceEl = sourceCell ? sourceCell.querySelector(".piece") : null;
  const sourceStyle = sourceEl ? getComputedStyle(sourceEl) : null;

  const ghost = pieceEl(state.board[drag.from.r][drag.from.c]);
  ghost.classList.add("drag-ghost");
  if (sourceStyle){
    ghost.style.width = sourceStyle.width;
    ghost.style.height = sourceStyle.height;
    ghost.style.fontSize = sourceStyle.fontSize;
    sourceEl.classList.add("drag-origin");
  }

  document.body.appendChild(ghost);
  drag.ghost = ghost;
  drag.sourceEl = sourceEl;
  moveGhost(e);
}

function moveGhost(e){
  drag.ghost.style.left = e.clientX + "px";
  drag.ghost.style.top = e.clientY + "px";
}

function startDragMovementSound(){
  if (!drag || drag.moveSoundStarted) return;
  drag.moveSoundStarted = true;
  drag.moveSoundTimer = setTimeout(() => {
    drag.moveSoundTimer = null;
    if (drag && drag.active) playSound("move", { loop: true });
  }, 120);
}

function updateDragHover(e){
  const cell = cellFromPoint(e.clientX, e.clientY);
  if (drag.hoverCell && drag.hoverCell !== cell){
    drag.hoverCell.classList.remove("drop-hover");
  }
  drag.hoverCell = null;
  if (!cell) return;

  const r = Number(cell.dataset.r);
  const c = Number(cell.dataset.c);
  if (state.targets.some(t => t.r === r && t.c === c)){
    cell.classList.add("drop-hover");
    drag.hoverCell = cell;
  }
}

export function onPointerMove(e){
  if (!drag || e.pointerId !== drag.pointerId) return;

  if (!drag.active){
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (dx * dx + dy * dy < DRAG_THRESHOLD * DRAG_THRESHOLD) return;
    startDrag(e);
    startDragMovementSound();
  }

  e.preventDefault();
  moveGhost(e);
  updateDragHover(e);
}

function cleanupDrag(){
  if (!drag) return;
  if (drag.moveSoundTimer) clearTimeout(drag.moveSoundTimer);
  if (drag.moveSoundStarted) stopSound("move");
  if (drag.ghost) drag.ghost.remove();
  if (drag.hoverCell) drag.hoverCell.classList.remove("drop-hover");
  if (drag.sourceEl) drag.sourceEl.classList.remove("drag-origin");
  document.body.classList.remove("dragging");
  drag = null;
}

function suppressNextClick(sourceCell, dropCell){
  const handler = ev => {
    const clickedCell = ev.target.closest ? ev.target.closest(".cell") : null;

    // Un clic real en otra casilla (por ejemplo, una captura) debe funcionar.
    if (clickedCell && clickedCell !== sourceCell && clickedCell !== dropCell){
      remove();
      return;
    }

    ev.stopPropagation();
    ev.preventDefault();
    remove();
  };
  const remove = () => document.removeEventListener("click", handler, true);

  document.addEventListener("click", handler, true);
  setTimeout(remove, 250);
}

export function onPointerUp(e){
  if (!drag || e.pointerId !== drag.pointerId) return;

  const active = drag.active;
  const target = active ? targetAt(e.clientX, e.clientY) : null;
  const sourceCell = drag.sourceEl ? drag.sourceEl.closest(".cell") : null;
  const dropCell = active ? cellFromPoint(e.clientX, e.clientY) : null;

  cleanupDrag();
  if (!active) return;

  suppressNextClick(sourceCell, dropCell);
  if (target){
    executeTarget(target, false);
  } else {
    render();
    playSound("putdown");
  }
}

export function cancelDrag(){
  if (!drag) return;
  const active = drag.active;
  cleanupDrag();
  if (active){
    render();
    playSound("putdown");
  }
}

export function onPointerCancel(e){
  if (!drag || e.pointerId !== drag.pointerId) return;
  cancelDrag();
}
