/* Entrada del tablero: clics y arrastre. */

import { bindClicks } from "./selection.js";
import { bindDrag } from "./drag.js";

export function bindInput(controller) {
  bindClicks(controller);
  return bindDrag(controller);
}
