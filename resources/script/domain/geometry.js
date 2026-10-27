/* Geometría del tablero octagonal. */

import { KOOM_GOAL_COLS, KOOM_GOAL_ROW, N, SIDES } from "./constants.js";

export function inBoard(r, c) {
  return r >= 0 && r < N && c >= 0 && c < N &&
    r + c >= 5 &&
    r + (N - 1 - c) >= 5 &&
    (N - 1 - r) + c >= 5 &&
    (N - 1 - r) + (N - 1 - c) >= 5;
}

export function isPerimeter(r, c) {
  return !inBoard(r - 1, c) || !inBoard(r + 1, c) ||
    !inBoard(r, c - 1) || !inBoard(r, c + 1);
}

export const key = (r, c) => r + "," + c;
export const coord = p => String.fromCharCode(65 + p.c) + (p.r + 1);
export const otherSide = side => side === SIDES.DWARFS ? SIDES.TROLLS : SIDES.DWARFS;

export function isKoomGoal(r, c) {
  return r === KOOM_GOAL_ROW && KOOM_GOAL_COLS.includes(c);
}
