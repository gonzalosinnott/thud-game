/* Operaciones puras sobre el tablero y las piezas. */

import { DIRS, N, PIECES } from "./constants.js";
import { inBoard } from "./geometry.js";

export const empty = () => ({ type: null, owner: null });

export function createEmptyBoard() {
  const board = [];
  for (let r = 0; r < N; r++) {
    board[r] = [];
    for (let c = 0; c < N; c++) {
      board[r][c] = inBoard(r, c) ? empty() : null;
    }
  }
  return board;
}

export function cloneBoard(board) {
  return board.map(row => row
    ? row.map(piece => piece ? { type: piece.type, owner: piece.owner } : piece)
    : row
  );
}

export function countPieces(board, type) {
  let count = 0;
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const piece = board[r][c];
      if (piece && piece.type === type) count++;
    }
  }
  return count;
}

export function countOwner(board, owner) {
  let count = 0;
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const piece = board[r][c];
      if (piece && piece.owner === owner) count++;
    }
  }
  return count;
}

export function findPiece(board, type) {
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const piece = board[r][c];
      if (piece && piece.type === type) return { r, c };
    }
  }
  return null;
}

export function adjacentPieces(board, r, c, type) {
  const found = [];
  for (const [dr, dc] of DIRS) {
    const rr = r + dr;
    const cc = c + dc;
    if (inBoard(rr, cc) && board[rr][cc].type === type) {
      found.push({ r: rr, c: cc });
    }
  }
  return found;
}

export function adjacentDwarfs(board, r, c) {
  return adjacentPieces(board, r, c, PIECES.DWARF);
}

export function movePiece(board, from, to) {
  board[to.r][to.c] = board[from.r][from.c];
  board[from.r][from.c] = empty();
}

export function removePiece(board, pos) {
  board[pos.r][pos.c] = empty();
}
