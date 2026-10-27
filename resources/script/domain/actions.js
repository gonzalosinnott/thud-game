/* Contratos de acciones y utilidades para compararlas/clonarlas. */

export const ActionType = Object.freeze({
  MOVE: "move",
  HURL: "hurl",
  SHOVE: "shove",
  MOVE_ROCK: "moveRock",
  TRAMPLE: "trample",
  CAPTURE: "capture",
  END_TURN: "endTurn"
});

export function sameCoord(a, b) {
  return !!a && !!b && a.r === b.r && a.c === b.c;
}

export function sameAction(a, b) {
  if (!a || !b || a.type !== b.type) return false;
  if (a.type === ActionType.END_TURN) return true;
  if (a.type === ActionType.CAPTURE) return sameCoord(a.cell, b.cell);
  if (a.type === ActionType.HURL) {
    return sameCoord(a.from, b.from) && sameCoord(a.lead, b.lead) && sameCoord(a.to, b.to);
  }
  return sameCoord(a.from, b.from) && sameCoord(a.to, b.to);
}

export function sameFrom(action, from) {
  return !!action && action.type !== ActionType.CAPTURE &&
    action.type !== ActionType.END_TURN && sameCoord(action.from, from);
}

export function cloneAction(action) {
  if (!action) return action;
  const copy = { type: action.type };
  if (action.from) copy.from = { ...action.from };
  if (action.to) copy.to = { ...action.to };
  if (action.lead) copy.lead = { ...action.lead };
  if (action.cell) copy.cell = { ...action.cell };
  if (action.victim) copy.victim = { ...action.victim };
  if (action.captured) copy.captured = { ...action.captured };
  if (action.captures) copy.captures = action.captures.map(p => ({ ...p }));
  if (action.line != null) copy.line = action.line;
  return copy;
}
