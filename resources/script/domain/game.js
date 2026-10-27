/* Motor puro de Thud: creación, acciones legales, aplicación y resultado.
   No conoce el DOM, la IA ni la interfaz. */

import { ActionType, cloneAction } from "./actions.js";
import { MODES, PIECES, SIDES } from "./constants.js";
import { otherSide } from "./geometry.js";
import { cloneBoard, countPieces, empty } from "./pieces.js";
import { classic } from "./variants/classic.js";
import { koom } from "./variants/koom.js";

const VARIANTS = {
  [MODES.CLASSIC]: classic,
  [MODES.KOOM]: koom
};

export function getVariant(game) {
  return VARIANTS[game.mode] || classic;
}

export function createGame(mode = MODES.CLASSIC) {
  const variant = VARIANTS[mode] || classic;
  return {
    mode: variant.mode,
    board: variant.createBoard(),
    turn: SIDES.DWARFS,
    phase: "normal",
    pending: null,
    result: null
  };
}

export function cloneGame(game) {
  return {
    mode: game.mode,
    board: cloneBoard(game.board),
    turn: game.turn,
    phase: game.phase,
    pending: clonePending(game.pending),
    result: game.result ? cloneResult(game.result) : null
  };
}

function clonePending(pending) {
  if (!pending) return null;
  if (pending.type === "capture") {
    return {
      type: "capture",
      cells: pending.cells.map(cell => ({ ...cell })),
      mustCapture: !!pending.mustCapture,
      captured: pending.captured || 0
    };
  }
  return {
    type: "trample",
    from: { ...pending.from },
    targets: pending.targets.map(cloneAction)
  };
}

function cloneResult(result) {
  return {
    over: true,
    winner: result.winner,
    reason: result.reason,
    scores: { ...result.scores }
  };
}

export function getLegalActions(game) {
  if (game.result) return [];

  if (game.phase === "capture" && game.pending) {
    const actions = game.pending.cells.map(cell => ({
      type: ActionType.CAPTURE,
      cell: { ...cell }
    }));
    if (!game.pending.mustCapture || game.pending.captured > 0) {
      actions.push({ type: ActionType.END_TURN });
    }
    return actions;
  }

  if (game.phase === "trample" && game.pending) {
    return game.pending.targets
      .map(cloneAction)
      .concat([{ type: ActionType.END_TURN }]);
  }

  return getActionsForSide(game, game.turn);
}

export function getActionsForSide(game, side) {
  if (game.result) return [];
  const variant = getVariant(game);
  const probe = { ...game, turn: side, phase: "normal", pending: null };
  const actions = [];

  for (let r = 0; r < game.board.length; r++) {
    for (let c = 0; c < game.board[r].length; c++) {
      const piece = game.board[r][c];
      if (!piece || piece.owner !== side) continue;
      actions.push(...variant.getPieceActions(probe, r, c));
    }
  }
  return actions;
}

export function hasAnyMove(game, side) {
  return getActionsForSide(game, side).length > 0;
}

export function applyAction(game, action) {
  const next = cloneGame(game);
  const events = [];
  if (next.result) return { game: next, events };

  if (action.type === ActionType.END_TURN) {
    advanceTurn(next, events);
    return { game: next, events };
  }

  if (next.phase === "capture" && action.type === ActionType.CAPTURE) {
    applyCapture(next, action, events);
    return { game: next, events };
  }

  const variant = getVariant(next);

  if (next.phase === "trample" && action.type === ActionType.TRAMPLE) {
    const outcome = variant.applyTrampleAction(next, action, events);
    applyOutcome(next, outcome, events);
    return { game: next, events };
  }

  const outcome = variant.applyNormalAction(next, action, events);
  applyOutcome(next, outcome, events);
  return { game: next, events };
}

function applyCapture(game, action, events) {
  const { r, c } = action.cell;
  const piece = game.board[r][c];

  if (piece && piece.type === PIECES.DWARF) {
    game.board[r][c] = empty();
    events.push({
      type: "captured",
      cell: { r, c },
      pieceType: PIECES.DWARF,
      by: SIDES.TROLLS
    });
  }

  game.pending.cells = game.pending.cells.filter(cell => cell.r !== r || cell.c !== c);
  game.pending.captured++;

  if (game.pending.cells.length) {
    events.push({
      type: "capturePhase",
      cells: game.pending.cells.map(cell => ({ ...cell })),
      mustCapture: game.pending.mustCapture,
      captured: game.pending.captured
    });
    return;
  }

  advanceTurn(game, events);
}

function applyOutcome(game, outcome, events) {
  if (!outcome) {
    advanceTurn(game, events);
    return;
  }

  if (outcome.result) {
    finish(game, makeResult(game, outcome.result.winner, outcome.result.reason), events);
    return;
  }

  if (outcome.capture) {
    game.phase = "capture";
    game.pending = {
      type: "capture",
      cells: outcome.capture.cells.map(cell => ({ ...cell })),
      mustCapture: !!outcome.capture.mustCapture,
      captured: 0
    };
    events.push({
      type: "capturePhase",
      cells: game.pending.cells.map(cell => ({ ...cell })),
      mustCapture: game.pending.mustCapture,
      captured: 0
    });
    return;
  }

  if (outcome.trample) {
    game.phase = "trample";
    game.pending = {
      type: "trample",
      from: { ...outcome.trample.from },
      targets: outcome.trample.targets.map(cloneAction)
    };
    events.push({
      type: "tramplePhase",
      from: { ...game.pending.from },
      targets: game.pending.targets.map(cloneAction)
    });
    return;
  }

  advanceTurn(game, events);
}

function advanceTurn(game, events) {
  game.phase = "normal";
  game.pending = null;
  game.turn = otherSide(game.turn);

  const variant = getVariant(game);
  const elimination = eliminationResult(game, variant);
  if (elimination) {
    finish(game, makeResult(game, elimination.winner, elimination.reason), events);
    return;
  }

  const nextCanMove = hasAnyMove(game, game.turn);

  if (!nextCanMove) {
    if (!variant.passesWhenBlocked) {
      const result = variant.getNoMovesResult(game);
      finish(game, makeResult(game, result.winner, result.reason), events);
      return;
    }

    const otherCanMove = hasAnyMove(game, otherSide(game.turn));
    if (!otherCanMove) {
      const result = variant.getNoMovesResult(game);
      finish(game, makeResult(game, result.winner, result.reason), events);
      return;
    }

    events.push({ type: "turnPassed", side: game.turn });
    game.turn = otherSide(game.turn);
  }

  events.push({ type: "turnChanged", turn: game.turn });
}

function eliminationResult(game, variant) {
  const dwarfs = countPieces(game.board, PIECES.DWARF);
  const trolls = countPieces(game.board, PIECES.TROLL);

  if (dwarfs === 0 && trolls === 0) return { winner: "draw", reason: "draw" };
  if (trolls === 0) return { winner: SIDES.DWARFS, reason: variant.eliminationReason };
  if (dwarfs === 0) return { winner: SIDES.TROLLS, reason: variant.eliminationReason };
  return null;
}

function makeResult(game, winner, reason) {
  return {
    over: true,
    winner,
    reason,
    scores: getVariant(game).getScore(game)
  };
}

function finish(game, result, events) {
  game.result = result;
  game.phase = "normal";
  game.pending = null;
  events.push({ type: "gameEnded", result: cloneResult(result) });
}

export function finalizeGame(game) {
  const next = cloneGame(game);
  const events = [];
  if (next.result) return { game: next, events };

  const variant = getVariant(next);
  const elimination = eliminationResult(next, variant);
  let result;

  if (elimination) {
    result = makeResult(next, elimination.winner, elimination.reason);
  } else if (next.mode === MODES.KOOM) {
    result = makeResult(next, "draw", "draw");
  } else {
    const noMoves = variant.getNoMovesResult(next);
    result = makeResult(next, noMoves.winner, noMoves.reason);
  }

  finish(next, result, events);
  return { game: next, events };
}

export function getScore(game) {
  return getVariant(game).getScore(game);
}
