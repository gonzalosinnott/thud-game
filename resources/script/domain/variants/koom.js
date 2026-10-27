/* Reglas del Valle de Koom. */

import { ActionType } from "../actions.js";
import { DIRS, MODES, PIECES, SIDES } from "../constants.js";
import { inBoard, isKoomGoal } from "../geometry.js";
import {
  adjacentDwarfs,
  adjacentPieces,
  countPieces,
  createEmptyBoard,
  findPiece,
  movePiece,
  removePiece
} from "../pieces.js";

export const koom = {
  mode: MODES.KOOM,
  passesWhenBlocked: true,
  eliminationReason: "elimination",
  createBoard: createKoomBoard,
  getPieceActions: getKoomPieceActions,
  applyNormalAction: applyKoomAction,
  applyTrampleAction: applyKoomTrample,
  getNoMovesResult: () => ({ winner: "draw", reason: "draw" }),
  getScore: getKoomScore
};

export function createKoomBoard() {
  const board = createEmptyBoard();
  board[7][7] = { type: PIECES.THUDSTONE, owner: SIDES.DWARFS };

  const trolls = [
    [1, 5], [1, 7], [1, 9],
    [2, 4], [2, 5], [2, 7], [2, 9], [2, 10]
  ];
  for (const [r, c] of trolls) {
    board[r][c] = { type: PIECES.TROLL, owner: SIDES.TROLLS };
  }

  const dwarfs = [
    [8, 7],
    [9, 0], [9, 14],
    [10, 1], [10, 13],
    [11, 2], [11, 12],
    [12, 3], [12, 11],
    [13, 4], [13, 10],
    [14, 5], [14, 6], [14, 7], [14, 8], [14, 9]
  ];
  for (const [r, c] of dwarfs) {
    board[r][c] = { type: PIECES.DWARF, owner: SIDES.DWARFS };
  }

  if (trolls.length !== 8 || dwarfs.length !== 16) {
    throw new Error("Configuración de Koom inválida");
  }
  return board;
}

function getKoomPieceActions(game, r, c) {
  const piece = game.board[r][c];
  if (!piece || piece.owner !== game.turn) return [];

  if (game.turn === SIDES.DWARFS) {
    return piece.type === PIECES.THUDSTONE
      ? rockActions(game, r, c)
      : dwarfActions(game, r, c);
  }

  return trollActions(game, r, c);
}

function dwarfActions(game, r, c) {
  const actions = [];
  const from = { r, c };
  for (const [dr, dc] of DIRS) {
    let rr = r + dr;
    let cc = c + dc;
    while (inBoard(rr, cc)) {
      if (game.board[rr][cc].type) break;
      actions.push({ type: ActionType.MOVE, from, to: { r: rr, c: cc } });
      rr += dr;
      cc += dc;
    }
  }
  return actions;
}

function rockActions(game, r, c) {
  if (!adjacentDwarfs(game.board, r, c).length) return [];

  const actions = [];
  const from = { r, c };
  for (const [dr, dc] of DIRS) {
    const rr = r + dr;
    const cc = c + dc;
    if (!inBoard(rr, cc) || game.board[rr][cc].type) continue;
    if (adjacentDwarfs(game.board, rr, cc).length) {
      actions.push({ type: ActionType.MOVE_ROCK, from, to: { r: rr, c: cc } });
    }
  }
  return actions;
}

function trollActions(game, r, c) {
  const actions = [];
  const from = { r, c };

  // Mover hasta tres casillas en línea recta, sin saltar piezas.
  for (const [dr, dc] of DIRS) {
    for (let k = 1; k <= 3; k++) {
      const rr = r + dr * k;
      const cc = c + dc * k;
      if (!inBoard(rr, cc)) break;
      if (game.board[rr][cc].type) break;
      actions.push({ type: ActionType.MOVE, from, to: { r: rr, c: cc } });
    }
  }

  // Pisotear: saltar un enano adyacente y aterrizar en la casilla siguiente.
  actions.push(...trampleActions(game, r, c));
  return actions;
}

export function trampleActions(game, r, c) {
  const actions = [];
  const from = { r, c };
  for (const [dr, dc] of DIRS) {
    const victim = { r: r + dr, c: c + dc };
    const landing = { r: r + dr * 2, c: c + dc * 2 };
    if (!inBoard(victim.r, victim.c) || !inBoard(landing.r, landing.c)) continue;
    if (game.board[victim.r][victim.c].type === PIECES.DWARF &&
        !game.board[landing.r][landing.c].type) {
      actions.push({
        type: ActionType.TRAMPLE,
        from,
        to: landing,
        victim
      });
    }
  }
  return actions;
}

export function trappedTrollsFrom(board, pos) {
  const trapped = [];
  for (const [dr, dc] of DIRS) {
    const troll = { r: pos.r + dr, c: pos.c + dc };
    const dwarf = { r: pos.r + dr * 2, c: pos.c + dc * 2 };
    if (!inBoard(troll.r, troll.c) || !inBoard(dwarf.r, dwarf.c)) continue;
    if (board[troll.r][troll.c].type === PIECES.TROLL &&
        board[dwarf.r][dwarf.c].type === PIECES.DWARF) {
      trapped.push(troll);
    }
  }
  return trapped;
}

function applyKoomAction(game, action, events) {
  if (action.type === ActionType.MOVE_ROCK) {
    const piece = game.board[action.from.r][action.from.c];
    movePiece(game.board, action.from, action.to);
    events.push({
      type: "pieceMoved",
      from: action.from,
      to: action.to,
      pieceType: piece ? piece.type : PIECES.THUDSTONE
    });

    const objective = rockGoalResult(game.board);
    return objective ? { result: objective } : { turn: true };
  }

  if (action.type === ActionType.TRAMPLE) {
    return applyKoomTrample(game, action, events);
  }

  const piece = game.board[action.from.r][action.from.c];
  movePiece(game.board, action.from, action.to);
  events.push({
    type: "pieceMoved",
    from: action.from,
    to: action.to,
    pieceType: piece ? piece.type : null
  });

  if (game.turn === SIDES.DWARFS) {
    const trapped = trappedTrollsFrom(game.board, action.to);
    for (const troll of trapped) {
      removePiece(game.board, troll);
      events.push({ type: "trollTrapped", cell: troll });
    }
    return { turn: true };
  }

  const objective = trollsSurroundRockResult(game.board);
  return objective ? { result: objective } : { turn: true };
}

function applyKoomTrample(game, action, events) {
  const piece = game.board[action.from.r][action.from.c];
  movePiece(game.board, action.from, action.to);
  if (action.victim) removePiece(game.board, action.victim);

  events.push({
    type: "trample",
    from: action.from,
    to: action.to,
    victim: action.victim,
    pieceType: piece ? piece.type : PIECES.TROLL
  });

  const objective = trollsSurroundRockResult(game.board);
  if (objective) return { result: objective };

  const next = trampleActions(game, action.to.r, action.to.c);
  if (next.length) return { trample: { from: action.to, targets: next } };
  return { turn: true };
}

export function findRock(board) {
  return findPiece(board, PIECES.THUDSTONE);
}

export function rockOnGoal(board) {
  const rock = findRock(board);
  return !!rock && isKoomGoal(rock.r, rock.c);
}

export function trollsAdjacentToRock(board) {
  const rock = findRock(board);
  return rock ? adjacentPieces(board, rock.r, rock.c, PIECES.TROLL).length : 0;
}

export function rockGoalResult(board) {
  return rockOnGoal(board)
    ? { winner: SIDES.DWARFS, reason: "rock" }
    : null;
}

export function trollsSurroundRockResult(board) {
  return trollsAdjacentToRock(board) >= 3
    ? { winner: SIDES.TROLLS, reason: "surrounded" }
    : null;
}

function getKoomScore(game) {
  return {
    dwarfs: countPieces(game.board, PIECES.DWARF),
    trolls: countPieces(game.board, PIECES.TROLL),
    dwarfPts: 0,
    trollPts: 0
  };
}
