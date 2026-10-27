/* Reglas del Thud clásico. */

import { ActionType } from "../actions.js";
import { DIRS, MODES, N, PIECES, SIDES } from "../constants.js";
import { inBoard, isPerimeter, key } from "../geometry.js";
import {
  adjacentDwarfs,
  countPieces,
  createEmptyBoard,
  empty,
  movePiece
} from "../pieces.js";

export const classic = {
  mode: MODES.CLASSIC,
  passesWhenBlocked: false,
  eliminationReason: "points",
  createBoard: createClassicBoard,
  getPieceActions: getClassicPieceActions,
  applyNormalAction: applyClassicAction,
  getNoMovesResult: getClassicPointsResult,
  getScore: getClassicScore
};

export function createClassicBoard() {
  const board = createEmptyBoard();
  board[7][7] = { type: PIECES.THUDSTONE, owner: null };

  for (const [dr, dc] of DIRS) {
    board[7 + dr][7 + dc] = { type: PIECES.TROLL, owner: SIDES.TROLLS };
  }

  let placed = 0;
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (!inBoard(r, c) || !isPerimeter(r, c)) continue;
      const aligned = (r === 7 && (c === 0 || c === 14)) ||
        (c === 7 && (r === 0 || r === 14));
      if (aligned) continue;
      board[r][c] = { type: PIECES.DWARF, owner: SIDES.DWARFS };
      placed++;
    }
  }

  if (placed !== 32) throw new Error("Configuración clásica inválida: " + placed + " enanos");
  return board;
}

function getClassicPieceActions(game, r, c) {
  const piece = game.board[r][c];
  if (!piece || piece.owner !== game.turn || piece.type === PIECES.THUDSTONE) return [];
  return game.turn === SIDES.DWARFS
    ? dwarfActions(game, r, c)
    : trollActions(game, r, c);
}

function dwarfActions(game, r, c) {
  const actions = [];
  const from = { r, c };

  // Mover como dama: solo a casillas vacías.
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

  // Lanzar al enano frontal de una línea de enanos.
  for (const [dr, dc] of DIRS) {
    let forward = 0;
    while (true) {
      const rr = r + (forward + 1) * dr;
      const cc = c + (forward + 1) * dc;
      if (!inBoard(rr, cc) || game.board[rr][cc].type !== PIECES.DWARF) break;
      forward++;
    }

    let backward = 0;
    while (true) {
      const rr = r - (backward + 1) * dr;
      const cc = c - (backward + 1) * dc;
      if (!inBoard(rr, cc) || game.board[rr][cc].type !== PIECES.DWARF) break;
      backward++;
    }

    const line = forward + backward + 1;
    const lead = { r: r + forward * dr, c: c + forward * dc };

    for (let k = 1; k <= line; k++) {
      const rr = lead.r + k * dr;
      const cc = lead.c + k * dc;
      if (!inBoard(rr, cc)) break;
      const cell = game.board[rr][cc];
      if (!cell.type) continue;
      if (cell.type === PIECES.TROLL) {
        actions.push({
          type: ActionType.HURL,
          from,
          lead,
          to: { r: rr, c: cc },
          line
        });
      }
      break;
    }
  }

  return actions;
}

function trollActions(game, r, c) {
  const actions = [];
  const from = { r, c };
  const moveKeys = new Set();

  // Mover como rey: una casilla a una casilla vacía.
  for (const [dr, dc] of DIRS) {
    const rr = r + dr;
    const cc = c + dc;
    if (inBoard(rr, cc) && !game.board[rr][cc].type) {
      actions.push({ type: ActionType.MOVE, from, to: { r: rr, c: cc } });
      moveKeys.add(key(rr, cc));
    }
  }

  // Empujar: una línea de trolls detrás permite avanzar al troll del extremo.
  for (const [dr, dc] of DIRS) {
    let behind = 0;
    while (true) {
      const rr = r - (behind + 1) * dr;
      const cc = c - (behind + 1) * dc;
      if (!inBoard(rr, cc) || game.board[rr][cc].type !== PIECES.TROLL) break;
      behind++;
    }
    if (behind < 1) continue;

    const line = behind + 1;
    for (let k = 1; k <= line; k++) {
      const rr = r + k * dr;
      const cc = c + k * dc;
      if (!inBoard(rr, cc)) break;
      if (game.board[rr][cc].type) break;
      if (moveKeys.has(key(rr, cc))) continue;

      const captures = adjacentDwarfs(game.board, rr, cc);
      if (captures.length) {
        actions.push({
          type: ActionType.SHOVE,
          from,
          to: { r: rr, c: cc },
          captures,
          line
        });
      }
    }
  }

  return actions;
}

function applyClassicAction(game, action, events) {
  if (action.type === ActionType.HURL) {
    const leadPiece = game.board[action.lead.r][action.lead.c];
    if (leadPiece && leadPiece.type === PIECES.DWARF) {
      game.board[action.lead.r][action.lead.c] = empty();
    }
    game.board[action.to.r][action.to.c] = empty();
    game.board[action.to.r][action.to.c] = { type: PIECES.DWARF, owner: SIDES.DWARFS };
    events.push({
      type: "hurl",
      from: action.lead,
      to: action.to,
      captured: { ...action.to }
    });
    return { turn: true };
  }

  const piece = game.board[action.from.r][action.from.c];
  movePiece(game.board, action.from, action.to);

  if (action.type === ActionType.SHOVE) {
    events.push({ type: "shove", from: action.from, to: action.to });
  } else {
    events.push({
      type: "pieceMoved",
      from: action.from,
      to: action.to,
      pieceType: piece ? piece.type : null
    });
  }

  if (game.turn === SIDES.DWARFS) return { turn: true };

  const captures = adjacentDwarfs(game.board, action.to.r, action.to.c);
  if (captures.length) {
    return {
      capture: {
        cells: captures,
        mustCapture: action.type === ActionType.SHOVE
      }
    };
  }
  return { turn: true };
}

function getClassicScore(game) {
  const dwarfs = countPieces(game.board, PIECES.DWARF);
  const trolls = countPieces(game.board, PIECES.TROLL);
  return {
    dwarfs,
    trolls,
    dwarfPts: dwarfs,
    trollPts: trolls * 4
  };
}

function getClassicPointsResult(game) {
  const score = getClassicScore(game);
  const winner = score.dwarfPts > score.trollPts
    ? SIDES.DWARFS
    : score.trollPts > score.dwarfPts
      ? SIDES.TROLLS
      : "draw";
  return { winner, reason: "points" };
}
