/* Clics sobre el tablero. */

import { boardEl } from "../dom.js";

export function bindClicks(controller) {
  boardEl.addEventListener("click", event => {
    const cell = event.target.closest ? event.target.closest(".cell") : null;
    if (!cell) return;
    controller.onCellClick(Number(cell.dataset.r), Number(cell.dataset.c));
  });
}
