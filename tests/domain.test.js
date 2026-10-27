import assert from "node:assert/strict";
import test from "node:test";

import { ActionType } from "../resources/script/domain/actions.js";
import { MODES, PIECES, SIDES } from "../resources/script/domain/constants.js";
import {
  applyAction,
  createGame,
  finalizeGame,
  getLegalActions
} from "../resources/script/domain/game.js";
import { createEmptyBoard } from "../resources/script/domain/pieces.js";

function customGame(mode, pieces, turn = SIDES.DWARFS) {
  const game = createGame(mode);
  game.board = createEmptyBoard();
  game.turn = turn;
  for (const [r, c, type, owner] of pieces) {
    game.board[r][c] = { type, owner };
  }
  return game;
}

function findAction(game, predicate) {
  return getLegalActions(game).find(predicate);
}

test("la configuración clásica tiene 32 enanos, 8 trolls y una roca", () => {
  const game = createGame(MODES.CLASSIC);
  let dwarfs = 0;
  let trolls = 0;
  let stones = 0;

  for (const row of game.board) {
    for (const piece of row) {
      if (!piece) continue;
      if (piece.type === PIECES.DWARF) dwarfs++;
      if (piece.type === PIECES.TROLL) trolls++;
      if (piece.type === PIECES.THUDSTONE) stones++;
    }
  }

  assert.equal(dwarfs, 32);
  assert.equal(trolls, 8);
  assert.equal(stones, 1);
  assert.equal(game.turn, SIDES.DWARFS);
  assert.equal(game.result, null);
});

test("la configuración de Koom tiene 16 enanos, 8 trolls y una roca", () => {
  const game = createGame(MODES.KOOM);
  let dwarfs = 0;
  let trolls = 0;
  let stones = 0;

  for (const row of game.board) {
    for (const piece of row) {
      if (!piece) continue;
      if (piece.type === PIECES.DWARF) dwarfs++;
      if (piece.type === PIECES.TROLL) trolls++;
      if (piece.type === PIECES.THUDSTONE) stones++;
    }
  }

  assert.equal(dwarfs, 16);
  assert.equal(trolls, 8);
  assert.equal(stones, 1);
});

test("el lanzamiento clásico captura al troll y mueve al enano frontal", () => {
  const game = customGame(MODES.CLASSIC, [
    [7, 7, PIECES.DWARF, SIDES.DWARFS],
    [7, 8, PIECES.DWARF, SIDES.DWARFS],
    [7, 9, PIECES.TROLL, SIDES.TROLLS]
  ]);

  const hurl = findAction(game, action =>
    action.type === ActionType.HURL &&
    action.from.r === 7 && action.from.c === 7 &&
    action.to.r === 7 && action.to.c === 9
  );
  assert.ok(hurl);

  const before = JSON.stringify(game);
  const { game: next, events } = applyAction(game, hurl);

  assert.equal(JSON.stringify(game), before, "applyAction no debe mutar la partida original");
  assert.equal(next.board[7][9].type, PIECES.DWARF);
  assert.equal(next.board[7][8].type, null);
  assert.equal(next.board[7][7].type, PIECES.DWARF);
  assert.ok(events.some(event => event.type === "hurl"));
});

test("mover un troll clásico abre la fase de captura opcional", () => {
  const game = customGame(MODES.CLASSIC, [
    [7, 7, PIECES.TROLL, SIDES.TROLLS],
    [7, 8, PIECES.DWARF, SIDES.DWARFS],
    [8, 8, PIECES.DWARF, SIDES.DWARFS]
  ], SIDES.TROLLS);

  const move = findAction(game, action =>
    action.type === ActionType.MOVE &&
    action.from.r === 7 && action.from.c === 7 &&
    action.to.r === 6 && action.to.c === 7
  );
  assert.ok(move);

  const { game: afterMove } = applyAction(game, move);
  assert.equal(afterMove.phase, "capture");
  assert.deepEqual(afterMove.pending.cells, [{ r: 7, c: 8 }]);
  assert.equal(afterMove.pending.mustCapture, false);

  const capture = findAction(afterMove, action =>
    action.type === ActionType.CAPTURE && action.cell.r === 7 && action.cell.c === 8
  );
  assert.ok(capture);

  const { game: afterCapture } = applyAction(afterMove, capture);
  assert.equal(afterCapture.board[7][8].type, null);
  assert.equal(afterCapture.turn, SIDES.DWARFS);
  assert.equal(afterCapture.phase, "normal");
});

test("Koom: llevar la roca a la fila dorada gana para los enanos", () => {
  const game = customGame(MODES.KOOM, [
    [1, 7, PIECES.THUDSTONE, SIDES.DWARFS],
    [1, 6, PIECES.DWARF, SIDES.DWARFS]
  ]);

  const moveRock = findAction(game, action =>
    action.type === ActionType.MOVE_ROCK &&
    action.to.r === 0 && action.to.c === 7
  );
  assert.ok(moveRock);

  const { game: next } = applyAction(game, moveRock);
  assert.ok(next.result);
  assert.equal(next.result.winner, SIDES.DWARFS);
  assert.equal(next.result.reason, "rock");
});

test("Koom: eliminar al último troll gana por eliminación", () => {
  const game = customGame(MODES.KOOM, [
    [6, 6, PIECES.DWARF, SIDES.DWARFS],
    [7, 9, PIECES.DWARF, SIDES.DWARFS],
    [7, 8, PIECES.TROLL, SIDES.TROLLS]
  ]);

  const move = findAction(game, action =>
    action.type === ActionType.MOVE &&
    action.from.r === 6 && action.from.c === 6 &&
    action.to.r === 7 && action.to.c === 7
  );
  assert.ok(move);

  const { game: next, events } = applyAction(game, move);
  assert.ok(events.some(event => event.type === "trollTrapped"));
  assert.ok(next.result);
  assert.equal(next.result.winner, SIDES.DWARFS);
  assert.equal(next.result.reason, "elimination");
});

test("Koom: el pisotón encadena mientras haya enanos detrás", () => {
  const game = customGame(MODES.KOOM, [
    [7, 7, PIECES.TROLL, SIDES.TROLLS],
    [7, 8, PIECES.DWARF, SIDES.DWARFS],
    [7, 10, PIECES.DWARF, SIDES.DWARFS]
  ], SIDES.TROLLS);

  const first = findAction(game, action =>
    action.type === ActionType.TRAMPLE &&
    action.to.r === 7 && action.to.c === 9
  );
  assert.ok(first);

  const { game: afterFirst } = applyAction(game, first);
  assert.equal(afterFirst.phase, "trample");
  assert.deepEqual(afterFirst.pending.from, { r: 7, c: 9 });

  const second = findAction(afterFirst, action =>
    action.type === ActionType.TRAMPLE &&
    action.to.r === 7 && action.to.c === 11
  );
  assert.ok(second);

  const { game: afterSecond } = applyAction(afterFirst, second);
  assert.ok(afterSecond.result);
  assert.equal(afterSecond.result.winner, SIDES.TROLLS);
  assert.equal(afterSecond.result.reason, "elimination");
});

test("Koom: tres trolls junto a la roca ganan para los trolls", () => {
  const game = customGame(MODES.KOOM, [
    [7, 7, PIECES.THUDSTONE, SIDES.DWARFS],
    [7, 6, PIECES.TROLL, SIDES.TROLLS],
    [7, 8, PIECES.TROLL, SIDES.TROLLS],
    [6, 6, PIECES.TROLL, SIDES.TROLLS]
  ], SIDES.TROLLS);

  const move = findAction(game, action =>
    action.type === ActionType.MOVE &&
    action.from.r === 6 && action.from.c === 6 &&
    action.to.r === 6 && action.to.c === 7
  );
  assert.ok(move);

  const { game: next } = applyAction(game, move);
  assert.ok(next.result);
  assert.equal(next.result.winner, SIDES.TROLLS);
  assert.equal(next.result.reason, "surrounded");
});

test("finalizar una partida clásica cuenta los puntos", () => {
  const game = customGame(MODES.CLASSIC, [
    [7, 7, PIECES.DWARF, SIDES.DWARFS],
    [8, 8, PIECES.TROLL, SIDES.TROLLS]
  ]);

  const { game: next } = finalizeGame(game);
  assert.ok(next.result);
  assert.equal(next.result.scores.dwarfs, 1);
  assert.equal(next.result.scores.trolls, 1);
  assert.equal(next.result.scores.dwarfPts, 1);
  assert.equal(next.result.scores.trollPts, 4);
  assert.equal(next.result.winner, SIDES.TROLLS);
});

test("si el bando clasico en turno no tiene jugadas, se cuentan los puntos", () => {
  const pieces = [[7, 7, PIECES.TROLL, SIDES.TROLLS]];
  for (const [dr, dc] of [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]) {
    pieces.push([7 + dr, 7 + dc, PIECES.DWARF, SIDES.DWARFS]);
  }

  const game = customGame(MODES.CLASSIC, pieces);
  const { game: next } = applyAction(game, { type: ActionType.END_TURN });

  assert.ok(next.result);
  assert.equal(next.result.winner, SIDES.DWARFS);
  assert.equal(next.result.reason, "points");
});

test("Koom: si un bando no puede mover, el otro continua", () => {
  const pieces = [[7, 7, PIECES.TROLL, SIDES.TROLLS]];
  for (const [dr, dc] of [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]) {
    pieces.push([7 + dr, 7 + dc, PIECES.DWARF, SIDES.DWARFS]);
  }
  for (const [dr, dc] of [[-2, -2], [-2, -1], [-2, 0], [-2, 1], [-2, 2], [-1, -2], [-1, 2], [0, -2], [0, 2], [1, -2], [1, 2], [2, -2], [2, -1], [2, 0], [2, 1], [2, 2]]) {
    pieces.push([7 + dr, 7 + dc, PIECES.DWARF, SIDES.DWARFS]);
  }

  const game = customGame(MODES.KOOM, pieces);
  const { game: next, events } = applyAction(game, { type: ActionType.END_TURN });

  assert.equal(next.result, null);
  assert.equal(next.turn, SIDES.DWARFS);
  assert.ok(events.some(event => event.type === "turnPassed"));
});

test("Koom: mover la roca junto a tres trolls no termina la partida por si solo", () => {
  const game = customGame(MODES.KOOM, [
    [7, 7, PIECES.THUDSTONE, SIDES.DWARFS],
    [7, 5, PIECES.DWARF, SIDES.DWARFS],
    [7, 8, PIECES.DWARF, SIDES.DWARFS],
    [6, 5, PIECES.TROLL, SIDES.TROLLS],
    [6, 6, PIECES.TROLL, SIDES.TROLLS],
    [6, 7, PIECES.TROLL, SIDES.TROLLS]
  ]);

  const rockMove = findAction(game, action =>
    action.type === ActionType.MOVE_ROCK &&
    action.from.r === 7 && action.from.c === 7 &&
    action.to.r === 7 && action.to.c === 6
  );
  assert.ok(rockMove);

  const { game: next } = applyAction(game, rockMove);
  assert.equal(next.result, null);
  assert.equal(next.turn, SIDES.TROLLS);
});
