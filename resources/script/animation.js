/* Animacion de movimientos y ejecucion de destinos */

import { state, cells, key, playSound, stopSound } from "./core.js";
import { pieceEl } from "./board.js";
import { applyTarget } from "./moves.js";

let moveAnimation = null;
export let animatingMove = false;

export function cancelMoveAnimation(){
  stopSound("move");
  if (!moveAnimation) return;
  const { ghost, sourceEl, animation } = moveAnimation;
  if (animation){
    try { animation.cancel(); } catch (err) { /* ya terminó */ }
  }
  ghost.remove();
  if (sourceEl) sourceEl.classList.remove("move-origin");
  moveAnimation = null;
  animatingMove = false;
}

export function executeTarget(tgt, animate = true){
  if (animate && animateMove(tgt)) return;
  finishMove(tgt);
}

function finishMove(tgt){
  stopSound("move");
  const captured = applyTarget(tgt);
  playSound(captured ? "thud" : "putdown");
}

function animateMove(tgt){
  if (animatingMove) return true;

  // En el lanzamiento vuela el enano frontal; en el resto, la pieza seleccionada.
  const from = (state.turn === "dwarfs" && tgt.kind === "lanzar")
    ? tgt.from
    : state.selected;
  if (!from) return false;

  const piece = state.board[from.r][from.c];
  if (!piece || (piece.type === "thudstone" && state.mode !== "koom")) return false;

  const sourceCell = cells.get(key(from.r, from.c));
  const targetCell = cells.get(key(tgt.r, tgt.c));
  const sourceEl = sourceCell ? sourceCell.querySelector(".piece") : null;
  if (!sourceCell || !targetCell || !sourceEl) return false;

  const sourceRect = sourceEl.getBoundingClientRect();
  const targetRect = targetCell.getBoundingClientRect();
  const sourceX = sourceRect.left + sourceRect.width / 2;
  const sourceY = sourceRect.top + sourceRect.height / 2;
  const targetX = targetRect.left + targetRect.width / 2;
  const targetY = targetRect.top + targetRect.height / 2;
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const distance = Math.hypot(dx, dy);
  const lift = Math.min(40, 22 + distance * 0.1);

  const sourceStyle = getComputedStyle(sourceEl);
  const ghost = pieceEl(piece);
  ghost.classList.add("move-ghost");
  ghost.style.width = sourceStyle.width;
  ghost.style.height = sourceStyle.height;
  ghost.style.fontSize = sourceStyle.fontSize;
  ghost.style.left = sourceX + "px";
  ghost.style.top = sourceY + "px";
  document.body.appendChild(ghost);
  playSound("move", { loop: true });

  sourceEl.classList.add("move-origin");
  animatingMove = true;

  const animation = ghost.animate([
    { transform: "translate(-50%, -50%) scale(1) rotate(0deg)" },
    {
      transform: "translate(calc(-50% + " + (dx * 0.52) + "px), calc(-50% + " + (dy * 0.52 - lift) + "px)) scale(1.22) rotate(-4deg)",
      offset: 0.55
    },
    { transform: "translate(calc(-50% + " + dx + "px), calc(-50% + " + dy + "px)) scale(1) rotate(0deg)" }
  ], {
    duration: Math.min(560, 340 + distance * 1.2),
    easing: "cubic-bezier(.22,.75,.28,1)"
  });

  moveAnimation = { ghost, sourceEl, animation };

  animation.finished.then(() => {
    if (!moveAnimation || moveAnimation.animation !== animation) return;
    ghost.remove();
    sourceEl.classList.remove("move-origin");
    moveAnimation = null;
    animatingMove = false;
    finishMove(tgt);
  }).catch(() => { /* animación cancelada */ });

  return true;
}
