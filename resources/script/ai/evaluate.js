/* Heuristica de evaluacion de posiciones para la IA. */

import { N } from "../core.js";
import {
  adjacentDwarfs,
  dwarfTargets,
  findRock,
  trollsAdjacentToRock,
  trollTargets
} from "../movement.js";

const WIN_SCORE = 10000000;

export function evaluate(game, aiSide){
  if (game.over){
    const winner = game.winner || game.koomWinner;
    if (winner === aiSide) return WIN_SCORE;
    if (winner === "draw") return 0;
    return -WIN_SCORE;
  }

  return game.mode === "koom"
    ? evaluateKoom(game, aiSide)
    : evaluateClassic(game, aiSide);
}

function evaluateClassic(game, aiSide){
  const dwarfs = countPieces(game, "dwarf");
  const trolls = countPieces(game, "troll");
  const dwarfScore = dwarfs + countMoves(game, "dwarfs") * 0.04;
  const trollScore = trolls * 4 + countMoves(game, "trolls") * 0.04;

  return aiSide === "dwarfs"
    ? dwarfScore - trollScore
    : trollScore - dwarfScore;
}

function evaluateKoom(game, aiSide){
  const dwarfs = countPieces(game, "dwarf");
  const trolls = countPieces(game, "troll");
  if (dwarfs === 0 || trolls === 0){
    if (dwarfs === 0 && trolls === 0) return 0;
    const winner = dwarfs === 0 ? "trolls" : "dwarfs";
    return winner === aiSide ? WIN_SCORE : -WIN_SCORE;
  }

  const rock = findRock(game);

  let dwarfScore = dwarfs + countMoves(game, "dwarfs") * 0.02;
  let trollScore = trolls * 4 + countMoves(game, "trolls") * 0.02;

  if (rock){
    const columnDistance = rock.c < 5 ? 5 - rock.c : rock.c > 9 ? rock.c - 9 : 0;
    const goalDistance = rock.r + columnDistance;
    dwarfScore += (14 - goalDistance) * 6;
    dwarfScore += adjacentDwarfs(rock.r, rock.c, game).length * 3;
    trollScore += trollsAdjacentToRock(game) * 30;
  }

  return aiSide === "dwarfs"
    ? dwarfScore - trollScore
    : trollScore - dwarfScore;
}

function countPieces(game, type){
  let n = 0;
  for (let r = 0; r < N; r++){
    for (let c = 0; c < N; c++){
      const piece = game.board[r][c];
      if (piece && piece.type === type) n++;
    }
  }
  return n;
}

function countMoves(game, player){
  let n = 0;
  for (let r = 0; r < N; r++){
    for (let c = 0; c < N; c++){
      const piece = game.board[r][c];
      if (!piece || piece.owner !== player) continue;
      const targets = player === "dwarfs"
        ? dwarfTargets(r, c, game)
        : trollTargets(r, c, game);
      n += targets.length;
    }
  }
  return n;
}
