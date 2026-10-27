/* Heurística de evaluación de posiciones. */

import { MODES, PIECES, SIDES } from "../domain/constants.js";
import { getActionsForSide } from "../domain/game.js";
import { adjacentDwarfs, countPieces } from "../domain/pieces.js";
import { findRock, trollsAdjacentToRock } from "../domain/variants/koom.js";

const WIN_SCORE = 10000000;

export function evaluate(game, aiSide) {
  if (game.result) {
    const winner = game.result.winner;
    if (winner === aiSide) return WIN_SCORE;
    if (winner === "draw") return 0;
    return -WIN_SCORE;
  }

  return game.mode === MODES.KOOM
    ? evaluateKoom(game, aiSide)
    : evaluateClassic(game, aiSide);
}

function evaluateClassic(game, aiSide) {
  const dwarfs = countPieces(game.board, PIECES.DWARF);
  const trolls = countPieces(game.board, PIECES.TROLL);
  const dwarfScore = dwarfs + countMoves(game, SIDES.DWARFS) * 0.04;
  const trollScore = trolls * 4 + countMoves(game, SIDES.TROLLS) * 0.04;

  return aiSide === SIDES.DWARFS
    ? dwarfScore - trollScore
    : trollScore - dwarfScore;
}

function evaluateKoom(game, aiSide) {
  const dwarfs = countPieces(game.board, PIECES.DWARF);
  const trolls = countPieces(game.board, PIECES.TROLL);

  if (dwarfs === 0 || trolls === 0) {
    if (dwarfs === 0 && trolls === 0) return 0;
    const winner = dwarfs === 0 ? SIDES.TROLLS : SIDES.DWARFS;
    return winner === aiSide ? WIN_SCORE : -WIN_SCORE;
  }

  const rock = findRock(game.board);
  let dwarfScore = dwarfs + countMoves(game, SIDES.DWARFS) * 0.02;
  let trollScore = trolls * 4 + countMoves(game, SIDES.TROLLS) * 0.02;

  if (rock) {
    const columnDistance = rock.c < 5 ? 5 - rock.c : rock.c > 9 ? rock.c - 9 : 0;
    const goalDistance = rock.r + columnDistance;
    dwarfScore += (14 - goalDistance) * 6;
    dwarfScore += adjacentDwarfs(game.board, rock.r, rock.c).length * 3;
    trollScore += trollsAdjacentToRock(game.board) * 30;
  }

  return aiSide === SIDES.DWARFS
    ? dwarfScore - trollScore
    : trollScore - dwarfScore;
}

function countMoves(game, side) {
  return getActionsForSide(game, side).length;
}
