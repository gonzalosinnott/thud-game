/* Reglas puras para que la IA pueda simular jugadas sin tocar la partida real. */

import { N, empty, state } from "../core.js";
import {
  adjacentDwarfs,
  dwarfTargets,
  rockOnGoal,
  trappedTrollsFrom,
  trollsAdjacentToRock,
  trollTargets,
  trollTargetsKoom
} from "../movement.js";

export function cloneGame(game = state){
  return {
    mode: game.mode,
    board: game.board.map(row =>
      row ? row.map(p => p ? { type: p.type, owner: p.owner } : p) : row
    ),
    turn: game.turn,
    phase: game.phase,
    selected: game.selected ? { ...game.selected } : null,
    targets: (game.targets || []).map(target => ({
      ...target,
      from: target.from ? { ...target.from } : undefined,
      captured: target.captured ? { ...target.captured } : undefined,
      caps: target.caps ? target.caps.map(p => ({ ...p })) : undefined
    })),
    captureCells: (game.captureCells || []).map(p => ({ ...p })),
    mustCapture: !!game.mustCapture,
    captured: game.captured || 0,
    over: !!game.over,
    winner: game.winner || null,
    koomWinner: game.koomWinner || null
  };
}

export function getActions(game = state){
  if (game.over) return [];

  if (game.phase === "capture"){
    const actions = game.captureCells.map(cell => ({
      type: "capture",
      cell: { r: cell.r, c: cell.c }
    }));
    if (!game.mustCapture || game.captured > 0){
      actions.push({ type: "endTurn" });
    }
    return actions;
  }

  if (game.phase === "trample"){
    return game.targets
      .filter(target => target.kind === "trample")
      .map(target => ({
        type: "target",
        from: game.selected ? { ...game.selected } : null,
        target: cloneTarget(target)
      }))
      .concat([{ type: "endTurn" }]);
  }

  const actions = [];
  for (let r = 0; r < N; r++){
    for (let c = 0; c < N; c++){
      const piece = game.board[r][c];
      if (!piece || piece.owner !== game.turn) continue;
      if (piece.type === "thudstone" && game.mode !== "koom") continue;

      const targets = game.turn === "dwarfs"
        ? dwarfTargets(r, c, game)
        : trollTargets(r, c, game);

      for (const target of targets){
        actions.push({
          type: "target",
          from: { r, c },
          target: cloneTarget(target)
        });
      }
    }
  }
  return actions;
}

export function simulateTurn(game, action){
  let next = applyAction(game, action);
  let guard = 0;

  while (!next.over && next.phase === "capture" && guard++ < 100){
    if (next.captureCells.length){
      next = applyAction(next, { type: "capture", cell: next.captureCells[0] });
    } else {
      next = applyAction(next, { type: "endTurn" });
    }
  }

  guard = 0;
  while (!next.over && next.phase === "trample" && guard++ < 100){
    const tramples = next.targets.filter(target => target.kind === "trample");
    if (!tramples.length){
      next = applyAction(next, { type: "endTurn" });
      break;
    }
    next = applyAction(next, {
      type: "target",
      from: next.selected,
      target: cloneTarget(tramples[0])
    });
  }

  return next;
}

function applyAction(game, action){
  const next = cloneGame(game);

  if (action.type === "endTurn"){
    switchTurn(next);
    return next;
  }

  if (action.type === "capture"){
    const { r, c } = action.cell;
    const piece = next.board[r][c];
    if (piece && piece.type === "dwarf") next.board[r][c] = empty();
    next.captureCells = next.captureCells.filter(p => !(p.r === r && p.c === c));
    next.captured++;
    if (!next.captureCells.length) switchTurn(next);
    return next;
  }

  if (action.type !== "target") return next;

  const from = action.from || next.selected;
  if (!from) return next;
  const target = action.target;

  if (next.mode === "koom"){
    simApplyKoomTarget(next, target, from);
    return next;
  }

  if (next.turn === "dwarfs"){
    if (target.kind === "move"){
      simMovePiece(next, from, target);
      switchTurn(next);
      return next;
    }

    // Lanzamiento: el enano frontal vuela y ocupa la casilla del troll.
    const lead = target.from;
    next.board[target.r][target.c] = empty();
    next.board[lead.r][lead.c] = empty();
    next.board[target.r][target.c] = { type: "dwarf", owner: "dwarfs" };
    switchTurn(next);
    return next;
  }

  simMovePiece(next, from, target);
  const captures = adjacentDwarfs(target.r, target.c, next);
  if (captures.length){
    next.phase = "capture";
    next.selected = null;
    next.targets = [];
    next.captureCells = captures;
    next.mustCapture = target.kind === "empujar";
    next.captured = 0;
  } else {
    switchTurn(next);
  }
  return next;
}

function simApplyKoomTarget(game, target, from){
  const piece = game.board[from.r][from.c];

  if (game.turn === "dwarfs"){
    simMovePiece(game, from, target);
    if (piece && piece.type === "thudstone"){
      if (rockOnGoal(game)) finish(game, "dwarfs");
      else switchTurn(game);
      return;
    }

    const trapped = trappedTrollsFrom(target, game);
    for (const troll of trapped) game.board[troll.r][troll.c] = empty();
    game.captured += trapped.length;
    switchTurn(game);
    return;
  }

  simMovePiece(game, from, target);

  if (target.kind === "trample"){
    if (target.captured) game.board[target.captured.r][target.captured.c] = empty();
    game.captured++;

    if (trollsAdjacentToRock(game) >= 3){
      finish(game, "trolls");
      return;
    }

    const next = trollTargetsKoom(target.r, target.c, game)
      .filter(t => t.kind === "trample");
    if (next.length){
      game.phase = "trample";
      game.selected = { r: target.r, c: target.c };
      game.targets = next;
      game.mustCapture = false;
      game.captureCells = [];
    } else {
      switchTurn(game);
    }
    return;
  }

  if (trollsAdjacentToRock(game) >= 3) finish(game, "trolls");
  else switchTurn(game);
}

function switchTurn(game){
  game.phase = "normal";
  game.selected = null;
  game.targets = [];
  game.captureCells = [];
  game.mustCapture = false;
  game.captured = 0;

  game.turn = game.turn === "dwarfs" ? "trolls" : "dwarfs";

  if (game.mode === "koom"){
    const elimination = simEliminationWinner(game);
    if (elimination){
      finish(game, elimination);
      return;
    }

    const other = game.turn === "dwarfs" ? "trolls" : "dwarfs";
    const nextCanMove = simHasAnyMove(game, game.turn);
    const otherCanMove = simHasAnyMove(game, other);
    if (!nextCanMove && !otherCanMove){
      finish(game, "draw");
      return;
    }
    if (!nextCanMove && otherCanMove) game.turn = other;
    return;
  }

  const dwarfs = simCountPieces(game, "dwarf");
  const trolls = simCountPieces(game, "troll");
  if (dwarfs === 0 || trolls === 0){
    finish(game, dwarfs === 0 ? "trolls" : "dwarfs");
    return;
  }

  if (!simHasAnyMove(game, game.turn)){
    const dwarfPts = dwarfs;
    const trollPts = trolls * 4;
    finish(game, dwarfPts > trollPts ? "dwarfs" : trollPts > dwarfPts ? "trolls" : "draw");
  }
}

function finish(game, winner){
  game.over = true;
  game.winner = winner;
  game.koomWinner = game.mode === "koom" ? winner : null;
  game.phase = "normal";
  game.selected = null;
  game.targets = [];
  game.captureCells = [];
  game.mustCapture = false;
  game.captured = 0;
}

function simEliminationWinner(game){
  const dwarfs = simCountPieces(game, "dwarf");
  const trolls = simCountPieces(game, "troll");
  if (dwarfs === 0 && trolls === 0) return "draw";
  if (trolls === 0) return "dwarfs";
  if (dwarfs === 0) return "trolls";
  return null;
}

function simHasAnyMove(game, player){
  for (let r = 0; r < N; r++){
    for (let c = 0; c < N; c++){
      const piece = game.board[r][c];
      if (!piece || piece.owner !== player) continue;
      const targets = player === "dwarfs"
        ? dwarfTargets(r, c, game)
        : trollTargets(r, c, game);
      if (targets.length) return true;
    }
  }
  return false;
}

function simCountPieces(game, type){
  let n = 0;
  for (let r = 0; r < N; r++){
    for (let c = 0; c < N; c++){
      const piece = game.board[r][c];
      if (piece && piece.type === type) n++;
    }
  }
  return n;
}

function simMovePiece(game, from, to){
  game.board[to.r][to.c] = game.board[from.r][from.c];
  game.board[from.r][from.c] = empty();
}

function cloneTarget(target){
  return {
    ...target,
    from: target.from ? { ...target.from } : undefined,
    captured: target.captured ? { ...target.captured } : undefined,
    caps: target.caps ? target.caps.map(p => ({ ...p })) : undefined
  };
}
