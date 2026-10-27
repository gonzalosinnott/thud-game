/* Constantes del dominio de Thud. No dependen del navegador ni de la interfaz. */

export const N = 15;

export const DIRS = Object.freeze([
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],            [0, 1],
  [1, -1],  [1, 0],   [1, 1]
]);

export const SIDES = Object.freeze({
  DWARFS: "dwarfs",
  TROLLS: "trolls"
});

export const MODES = Object.freeze({
  CLASSIC: "classic",
  KOOM: "koom"
});

export const PIECES = Object.freeze({
  DWARF: "dwarf",
  TROLL: "troll",
  THUDSTONE: "thudstone"
});

export const TROLL_POINTS = 4;
export const KOOM_GOAL_ROW = 0;
export const KOOM_GOAL_COLS = Object.freeze([5, 6, 7, 8, 9]);
