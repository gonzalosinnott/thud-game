/* Controlador de aplicación: coordina dominio, presentación, sesión e IA. */

import { ActionType, sameAction, sameFrom } from "../domain/actions.js";
import { MODES, PIECES, SIDES } from "../domain/constants.js";
import { coord, otherSide } from "../domain/geometry.js";
import {
  applyAction,
  createGame,
  finalizeGame,
  getLegalActions
} from "../domain/game.js";
import { createAiScheduler } from "../ai/scheduler.js";
import { animation } from "../presentation/animation.js";
import { playSound } from "../presentation/audio.js";
import { renderBoard } from "../presentation/boardView.js";
import { addLog, renderLog } from "../presentation/logView.js";
import { renderPanel } from "../presentation/panelView.js";
import { renderResult } from "../presentation/resultView.js";
import { isAiTurn } from "./selectors.js";
import { store } from "./store.js";

class GameController {
  constructor() {
    this.scheduler = createAiScheduler({
      getGame: () => store.game,
      getSession: () => store.session,
      isAiTurn: () => this.isAiTurn(),
      dispatch: (action, options) => this.dispatch(action, options),
      refresh: () => this.refresh(),
      setThinking: value => {
        store.ai.thinking = value;
        this.refresh();
      }
    });
  }

  get game() {
    return store.game;
  }

  get session() {
    return store.session;
  }

  get ui() {
    return store.ui;
  }

  getState() {
    return store;
  }

  isAiTurn() {
    return isAiTurn(store.session, store.game);
  }

  isBusy() {
    return store.ui.busy || animation.isAnimating();
  }

  canHumanInteract() {
    return !this.isBusy() && !store.game.result && !this.isAiTurn();
  }

  canStartDrag(r, c) {
    if (!this.canHumanInteract() || store.game.phase !== "normal") return false;
    const piece = store.game.board[r][c];
    if (!piece || piece.owner !== store.game.turn) return false;
    return piece.type !== PIECES.THUDSTONE || store.game.mode === MODES.KOOM;
  }

  startGame(config = {}) {
    const mode = config.mode === MODES.KOOM ? MODES.KOOM : MODES.CLASSIC;
    const opponent = config.opponent === "ai" ? "ai" : "human";
    const humanSide = opponent === "ai"
      ? (config.humanSide === SIDES.TROLLS ? SIDES.TROLLS : SIDES.DWARFS)
      : null;

    this.scheduler.cancel();
    animation.cancel();

    store.game = createGame(mode);
    store.session = {
      opponent,
      humanSide,
      aiSide: opponent === "ai" ? otherSide(humanSide) : null
    };
    store.ui.selected = null;
    store.ui.targets = [];
    store.ui.busy = false;
    store.ui.log = [];
    store.ai.thinking = false;

    this.refresh();
    addLog(store, mode === MODES.KOOM ? "log.koomStart" : "log.battleStart");
    this.scheduler.schedule();
  }

  cancel() {
    this.scheduler.cancel();
    animation.cancel();
    store.ui.busy = false;
    this.refresh();
  }

  refresh() {
    renderBoard(store);
    renderPanel(store);
    renderLog(store);
    renderResult(store);
  }

  getTargetAt(r, c) {
    return store.ui.targets.find(target => target.r === r && target.c === c) || null;
  }

  selectPiece(r, c) {
    if (!this.canHumanInteract() || store.game.phase !== "normal") return false;
    const piece = store.game.board[r][c];
    if (!piece || piece.owner !== store.game.turn) return false;
    if (piece.type === PIECES.THUDSTONE && store.game.mode !== MODES.KOOM) return false;

    store.ui.selected = { r, c };
    store.ui.targets = getLegalActions(store.game)
      .filter(action => sameFrom(action, { r, c }))
      .map(targetFromAction)
      .filter(Boolean);

    playSound("pickup");
    this.refresh();
    return true;
  }

  clearSelection(sound = true) {
    const hadSelection = !!store.ui.selected;
    store.ui.selected = null;
    store.ui.targets = [];
    if (sound && hadSelection) playSound("putdown");
    this.refresh();
  }

  onCellClick(r, c) {
    if (!this.canHumanInteract()) return;

    if (store.game.phase === "capture") {
      const action = getLegalActions(store.game).find(item =>
        item.type === ActionType.CAPTURE && item.cell.r === r && item.cell.c === c
      );
      if (action) void this.dispatch(action);
      return;
    }

    if (store.game.phase === "trample") {
      const target = this.getTargetAt(r, c);
      if (target) void this.dispatch(target.action);
      return;
    }

    if (store.ui.selected && store.ui.selected.r === r && store.ui.selected.c === c) {
      this.clearSelection();
      return;
    }

    const target = this.getTargetAt(r, c);
    if (target) {
      void this.dispatch(target.action);
      return;
    }

    const piece = store.game.board[r][c];
    if (piece && piece.owner === store.game.turn) {
      this.selectPiece(r, c);
      return;
    }

    this.clearSelection();
  }

  async dispatch(action, { source = "human" } = {}) {
    if (!action || store.ui.busy || store.game.result) return false;
    if (source === "human" && !this.canHumanInteract()) return false;
    if (source === "ai" && !this.isAiTurn()) return false;

    const legal = getLegalActions(store.game).some(candidate => sameAction(candidate, action));
    if (!legal) return false;

    store.ui.selected = null;
    store.ui.targets = [];
    store.ui.busy = true;
    this.refresh();

    const descriptor = describeAnimation(store.game, action);
    if (descriptor) {
      const completed = await animation.play(descriptor);
      if (!completed) {
        store.ui.busy = false;
        this.refresh();
        return false;
      }
    }

    const { game, events } = applyAction(store.game, action);
    store.game = game;
    this.processEvents(events);

    store.ui.busy = false;
    this.syncUiToGame();
    this.refresh();
    this.scheduler.schedule();
    return true;
  }

  endTurn() {
    if (!this.canHumanInteract()) return;
    if (store.game.phase !== "capture" && store.game.phase !== "trample") return;
    if (store.game.phase === "capture" && store.game.pending &&
        store.game.pending.mustCapture && store.game.pending.captured === 0) {
      return;
    }
    void this.dispatch({ type: ActionType.END_TURN });
  }

  finalize() {
    if (!this.canHumanInteract()) return;
    const { game, events } = finalizeGame(store.game);
    store.game = game;
    this.processEvents(events);
    this.syncUiToGame();
    this.refresh();
  }

  syncUiToGame() {
    if (store.game.result) {
      store.ui.selected = null;
      store.ui.targets = [];
      return;
    }

    if (store.game.phase === "capture") {
      store.ui.selected = null;
      store.ui.targets = [];
      return;
    }

    if (store.game.phase === "trample") {
      store.ui.selected = { ...store.game.pending.from };
      store.ui.targets = store.game.pending.targets
        .map(targetFromAction)
        .filter(Boolean);
      return;
    }

    if (store.ui.selected) {
      const actions = getLegalActions(store.game)
        .filter(action => sameFrom(action, store.ui.selected));
      if (!actions.length) {
        store.ui.selected = null;
        store.ui.targets = [];
      } else {
        store.ui.targets = actions.map(targetFromAction).filter(Boolean);
      }
    }
  }

  processEvents(events) {
    const hadMove = events.some(event =>
      event.type === "pieceMoved" || event.type === "hurl" ||
      event.type === "shove" || event.type === "trample" ||
      event.type === "trollTrapped"
    );
    const hadCapture = events.some(event =>
      event.type === "captured" || event.type === "hurl" ||
      event.type === "trample" || event.type === "trollTrapped"
    );

    for (const event of events) {
      switch (event.type) {
        case "pieceMoved":
          this.logPieceMoved(event);
          break;
        case "hurl":
          addLog(store, "log.hurl", {
            from: coord(event.from),
            to: coord(event.to)
          }, true);
          break;
        case "shove":
          addLog(store, "log.shove", {
            from: coord(event.from),
            to: coord(event.to)
          }, true);
          break;
        case "trample":
          addLog(store, "log.koomTrample", {
            from: coord(event.from),
            to: coord(event.to),
            cell: event.victim ? coord(event.victim) : coord(event.to)
          }, true);
          break;
        case "captured":
          addLog(store, "log.capture", { cell: coord(event.cell) });
          break;
        case "trollTrapped":
          addLog(store, "log.koomTrap", { cell: coord(event.cell) }, true);
          break;
        case "turnPassed":
          addLog(store, event.side === SIDES.DWARFS ? "log.koomPassDwarfs" : "log.koomPassTrolls");
          break;
        case "turnChanged":
          addLog(store, event.turn === SIDES.DWARFS ? "log.turnDwarfs" : "log.turnTrolls");
          break;
        case "gameEnded":
          this.logGameEnd(event.result);
          break;
        default:
          break;
      }
    }

    if (hadCapture) playSound("thud");
    else if (hadMove) playSound("putdown");
  }

  logPieceMoved(event) {
    const from = coord(event.from);
    const to = coord(event.to);
    if (event.pieceType === PIECES.DWARF) {
      addLog(store, "log.dwarfMove", { from, to });
    } else if (event.pieceType === PIECES.THUDSTONE) {
      addLog(store, "log.koomRock", { from, to });
    } else {
      addLog(store, "log.trollMove", { from, to });
    }
  }

  logGameEnd(result) {
    if (store.game.mode === MODES.KOOM) {
      let key = "log.koomDraw";
      if (result.winner === SIDES.DWARFS) {
        key = result.reason === "elimination"
          ? "log.koomEndDwarfsElimination"
          : "log.koomEndDwarfs";
      } else if (result.winner === SIDES.TROLLS) {
        key = result.reason === "elimination"
          ? "log.koomEndTrollsElimination"
          : "log.koomEndTrolls";
      }
      addLog(store, key, null, true);
      return;
    }

    addLog(store, "log.battleEnd", {
      dwarfPts: result.scores.dwarfPts,
      dwarfs: result.scores.dwarfs,
      trollPts: result.scores.trollPts,
      trolls: result.scores.trolls
    }, true);
  }
}

function targetFromAction(action) {
  switch (action.type) {
    case ActionType.MOVE:
    case ActionType.MOVE_ROCK:
      return { r: action.to.r, c: action.to.c, kind: "move", action };
    case ActionType.HURL:
      return {
        r: action.to.r,
        c: action.to.c,
        kind: "lanzar",
        from: action.lead,
        line: action.line,
        action
      };
    case ActionType.SHOVE:
      return {
        r: action.to.r,
        c: action.to.c,
        kind: "empujar",
        caps: action.captures,
        action
      };
    case ActionType.TRAMPLE:
      return {
        r: action.to.r,
        c: action.to.c,
        kind: "trample",
        captured: action.victim,
        action
      };
    case ActionType.CAPTURE:
      return {
        r: action.cell.r,
        c: action.cell.c,
        kind: "capture",
        action
      };
    default:
      return null;
  }
}

function describeAnimation(game, action) {
  if (!action.to) return null;
  const from = action.type === ActionType.HURL ? action.lead : action.from;
  if (!from) return null;

  const piece = game.board[from.r][from.c];
  if (!piece || !piece.type) return null;

  return { from, to: action.to, pieceType: piece.type };
}

export const controller = new GameController();
