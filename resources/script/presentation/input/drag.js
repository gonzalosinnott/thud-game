/* Arrastre de piezas. */

import { key } from "../../domain/geometry.js";
import { playSound, stopSound } from "../audio.js";
import { pieceEl } from "../boardView.js";
import { cells } from "../dom.js";

const DRAG_THRESHOLD = 6;

export function bindDrag(controller) {
  let drag = null;

  function cellFromPoint(x, y) {
    const element = document.elementFromPoint(x, y);
    return element && element.closest ? element.closest(".cell") : null;
  }

  function targetAt(x, y) {
    const cell = cellFromPoint(x, y);
    if (!cell) return null;
    return controller.getTargetAt(Number(cell.dataset.r), Number(cell.dataset.c));
  }

  function startDrag(event) {
    drag.active = true;
    document.body.classList.add("dragging");
    controller.selectPiece(drag.from.r, drag.from.c);

    const sourceCell = cells.get(key(drag.from.r, drag.from.c));
    const sourceEl = sourceCell ? sourceCell.querySelector(".piece") : null;
    const sourceStyle = sourceEl ? getComputedStyle(sourceEl) : null;
    const piece = controller.getState().game.board[drag.from.r][drag.from.c];

    if (!piece || !sourceEl) {
      drag.active = false;
      return;
    }

    const ghost = pieceEl(piece);
    ghost.classList.add("drag-ghost");
    if (sourceStyle) {
      ghost.style.width = sourceStyle.width;
      ghost.style.height = sourceStyle.height;
      ghost.style.fontSize = sourceStyle.fontSize;
      sourceEl.classList.add("drag-origin");
    }

    document.body.appendChild(ghost);
    drag.ghost = ghost;
    drag.sourceEl = sourceEl;
    moveGhost(event);
  }

  function moveGhost(event) {
    if (!drag.ghost) return;
    drag.ghost.style.left = event.clientX + "px";
    drag.ghost.style.top = event.clientY + "px";
  }

  function startDragMovementSound() {
    if (!drag || drag.moveSoundStarted) return;
    drag.moveSoundStarted = true;
    drag.moveSoundTimer = setTimeout(() => {
      drag.moveSoundTimer = null;
      if (drag && drag.active) playSound("move", { loop: true });
    }, 120);
  }

  function updateDragHover(event) {
    const cell = cellFromPoint(event.clientX, event.clientY);
    if (drag.hoverCell && drag.hoverCell !== cell) {
      drag.hoverCell.classList.remove("drop-hover");
    }
    drag.hoverCell = null;
    if (!cell) return;

    const target = controller.getTargetAt(Number(cell.dataset.r), Number(cell.dataset.c));
    if (target) {
      cell.classList.add("drop-hover");
      drag.hoverCell = cell;
    }
  }

  function cleanupDrag() {
    if (!drag) return;
    if (drag.moveSoundTimer) clearTimeout(drag.moveSoundTimer);
    if (drag.moveSoundStarted) stopSound("move");
    if (drag.ghost) drag.ghost.remove();
    if (drag.hoverCell) drag.hoverCell.classList.remove("drop-hover");
    if (drag.sourceEl) drag.sourceEl.classList.remove("drag-origin");
    document.body.classList.remove("dragging");
    drag = null;
  }

  function suppressNextClick(sourceCell, dropCell) {
    const handler = event => {
      const clickedCell = event.target.closest ? event.target.closest(".cell") : null;

      if (clickedCell && clickedCell !== sourceCell && clickedCell !== dropCell) {
        remove();
        return;
      }

      event.stopPropagation();
      event.preventDefault();
      remove();
    };
    const remove = () => document.removeEventListener("click", handler, true);

    document.addEventListener("click", handler, true);
    setTimeout(remove, 250);
  }

  function onPointerDown(event) {
    if (event.button !== 0 || event.pointerType === "touch") return;

    const cell = event.target.closest ? event.target.closest(".cell") : null;
    if (!cell) return;

    const r = Number(cell.dataset.r);
    const c = Number(cell.dataset.c);
    if (!controller.canStartDrag(r, c)) return;

    drag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      from: { r, c },
      active: false,
      ghost: null,
      sourceEl: null,
      hoverCell: null,
      moveSoundStarted: false,
      moveSoundTimer: null
    };
  }

  function onPointerMove(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;

    if (!drag.active) {
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      if (dx * dx + dy * dy < DRAG_THRESHOLD * DRAG_THRESHOLD) return;
      startDrag(event);
      startDragMovementSound();
    }

    if (!drag.active) return;
    event.preventDefault();
    moveGhost(event);
    updateDragHover(event);
  }

  function onPointerUp(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;

    const active = drag.active;
    const target = active ? targetAt(event.clientX, event.clientY) : null;
    const sourceCell = drag.sourceEl ? drag.sourceEl.closest(".cell") : null;
    const dropCell = active ? cellFromPoint(event.clientX, event.clientY) : null;

    cleanupDrag();
    if (!active) return;

    suppressNextClick(sourceCell, dropCell);
    if (target) {
      void controller.dispatch(target.action);
    } else {
      controller.clearSelection(false);
      playSound("putdown");
    }
  }

  function cancelDrag() {
    if (!drag) return;
    const active = drag.active;
    cleanupDrag();
    if (active) {
      controller.clearSelection(false);
      playSound("putdown");
    }
  }

  function onPointerCancel(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    cancelDrag();
  }

  window.addEventListener("pointerdown", onPointerDown, true);
  window.addEventListener("pointermove", onPointerMove, { passive: false });
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerCancel);
  window.addEventListener("blur", cancelDrag);

  return { cancelDrag };
}
