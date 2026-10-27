/* Eleccion de jugada: una capa de busqueda con evaluacion heuristica. */

import { state } from "../core.js";
import { evaluate } from "./evaluate.js";
import { getActions, simulateTurn } from "./rules.js";

export function chooseAction(game = state, aiSide = game.ai && game.ai.side ? game.ai.side : game.turn){
  const actions = getActions(game);
  if (!actions.length) return null;

  let bestAction = null;
  let bestScore = -Infinity;

  for (const action of actions){
    const next = simulateTurn(game, action);
    const score = evaluate(next, aiSide);
    if (score > bestScore){
      bestScore = score;
      bestAction = action;
    }
  }

  return bestAction;
}
