import assert from "node:assert/strict";
import test from "node:test";

import { chooseAction, simulateAction } from "../resources/script/ai/choose.js";
import { evaluate } from "../resources/script/ai/evaluate.js";
import { ActionType } from "../resources/script/domain/actions.js";
import { MODES, PIECES, SIDES } from "../resources/script/domain/constants.js";
import { applyAction, createGame, getLegalActions } from "../resources/script/domain/game.js";
import { createEmptyBoard } from "../resources/script/domain/pieces.js";

test("la IA elige una acción legal sin mutar la partida", () => {
  const game = createGame(MODES.CLASSIC);
  const before = JSON.stringify(game);

  const action = chooseAction(game, SIDES.DWARFS);
  assert.ok(action);
  assert.ok(getLegalActions(game).some(candidate =>
    candidate.type === action.type &&
    JSON.stringify(candidate) === JSON.stringify(action)
  ));
  assert.equal(JSON.stringify(game), before);
});

test("la simulación de la IA resuelve capturas y devuelve una partida nueva", () => {
  const game = createGame(MODES.CLASSIC);
  const action = getLegalActions(game)[0];
  const next = simulateAction(game, action);

  assert.notEqual(next, game);
  assert.equal(JSON.stringify(game), JSON.stringify(createGame(MODES.CLASSIC)));
  assert.ok(evaluate(next, SIDES.DWARFS) !== undefined);
});

test("la IA captura en cuanto se abre la fase de captura", () => {
  const game = createGame(MODES.CLASSIC);
  game.board = createEmptyBoard();
  game.turn = SIDES.TROLLS;
  game.board[7][7] = { type: PIECES.TROLL, owner: SIDES.TROLLS };
  game.board[7][8] = { type: PIECES.DWARF, owner: SIDES.DWARFS };
  game.board[6][8] = { type: PIECES.DWARF, owner: SIDES.DWARFS };

  const move = getLegalActions(game).find(action =>
    action.type === ActionType.MOVE &&
    action.from.r === 7 && action.from.c === 7 &&
    action.to.r === 6 && action.to.c === 7
  );
  assert.ok(move);

  const afterMove = applyAction(game, move).game;
  assert.equal(afterMove.phase, "capture");

  const action = chooseAction(afterMove, SIDES.TROLLS);
  assert.ok(action);
  assert.equal(action.type, ActionType.CAPTURE);
});
