/* Elección de jugada: búsqueda de una capa con evaluación heurística. */

import { ActionType } from "../domain/actions.js";
import { applyAction, getLegalActions } from "../domain/game.js";
import { evaluate } from "./evaluate.js";

export function chooseAction(game, aiSide) {
  const actions = getLegalActions(game);
  if (!actions.length) return null;

  // La IA clásica captura siempre que puede; solo termina si no quedan capturas.
  if (game.phase === "capture") {
    return actions.find(action => action.type === ActionType.CAPTURE) ||
      actions.find(action => action.type === ActionType.END_TURN) ||
      null;
  }

  let bestAction = null;
  let bestScore = -Infinity;

  for (const action of actions) {
    const next = simulateAction(game, action);
    const score = evaluate(next, aiSide);
    if (score > bestScore) {
      bestScore = score;
      bestAction = action;
    }
  }

  return bestAction;
}

export function simulateAction(game, action) {
  let next = applyAction(game, action).game;
  let guard = 0;

  while (!next.result && next.phase === "capture" && guard++ < 100) {
    const capture = getLegalActions(next).find(item => item.type === ActionType.CAPTURE);
    next = applyAction(next, capture || { type: ActionType.END_TURN }).game;
  }

  guard = 0;
  while (!next.result && next.phase === "trample" && guard++ < 100) {
    const trample = getLegalActions(next).find(item => item.type === ActionType.TRAMPLE);
    if (!trample) {
      next = applyAction(next, { type: ActionType.END_TURN }).game;
      break;
    }
    next = applyAction(next, trample).game;
  }

  return next;
}
