/* GENERADO AUTOMATICAMENTE por build-classic.mjs. No editar a mano. */
(() => {
  // resources/script/domain/constants.js
  var N = 15;
  var DIRS = Object.freeze([
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1]
  ]);
  var SIDES = Object.freeze({
    DWARFS: "dwarfs",
    TROLLS: "trolls"
  });
  var MODES = Object.freeze({
    CLASSIC: "classic",
    KOOM: "koom"
  });
  var PIECES = Object.freeze({
    DWARF: "dwarf",
    TROLL: "troll",
    THUDSTONE: "thudstone"
  });
  var KOOM_GOAL_ROW = 0;
  var KOOM_GOAL_COLS = Object.freeze([5, 6, 7, 8, 9]);

  // resources/script/domain/actions.js
  var ActionType = Object.freeze({
    MOVE: "move",
    HURL: "hurl",
    SHOVE: "shove",
    MOVE_ROCK: "moveRock",
    TRAMPLE: "trample",
    CAPTURE: "capture",
    END_TURN: "endTurn"
  });
  function sameCoord(a, b) {
    return !!a && !!b && a.r === b.r && a.c === b.c;
  }
  function sameAction(a, b) {
    if (!a || !b || a.type !== b.type) return false;
    if (a.type === ActionType.END_TURN) return true;
    if (a.type === ActionType.CAPTURE) return sameCoord(a.cell, b.cell);
    if (a.type === ActionType.HURL) {
      return sameCoord(a.from, b.from) && sameCoord(a.lead, b.lead) && sameCoord(a.to, b.to);
    }
    return sameCoord(a.from, b.from) && sameCoord(a.to, b.to);
  }
  function sameFrom(action, from) {
    return !!action && action.type !== ActionType.CAPTURE && action.type !== ActionType.END_TURN && sameCoord(action.from, from);
  }
  function cloneAction(action) {
    if (!action) return action;
    const copy = { type: action.type };
    if (action.from) copy.from = { ...action.from };
    if (action.to) copy.to = { ...action.to };
    if (action.lead) copy.lead = { ...action.lead };
    if (action.cell) copy.cell = { ...action.cell };
    if (action.victim) copy.victim = { ...action.victim };
    if (action.captured) copy.captured = { ...action.captured };
    if (action.captures) copy.captures = action.captures.map((p) => ({ ...p }));
    if (action.line != null) copy.line = action.line;
    return copy;
  }

  // resources/script/domain/geometry.js
  function inBoard(r, c) {
    return r >= 0 && r < N && c >= 0 && c < N && r + c >= 5 && r + (N - 1 - c) >= 5 && N - 1 - r + c >= 5 && N - 1 - r + (N - 1 - c) >= 5;
  }
  function isPerimeter(r, c) {
    return !inBoard(r - 1, c) || !inBoard(r + 1, c) || !inBoard(r, c - 1) || !inBoard(r, c + 1);
  }
  var key = (r, c) => r + "," + c;
  var coord = (p) => String.fromCharCode(65 + p.c) + (p.r + 1);
  var otherSide = (side) => side === SIDES.DWARFS ? SIDES.TROLLS : SIDES.DWARFS;
  function isKoomGoal(r, c) {
    return r === KOOM_GOAL_ROW && KOOM_GOAL_COLS.includes(c);
  }

  // resources/script/domain/pieces.js
  var empty = () => ({ type: null, owner: null });
  function createEmptyBoard() {
    const board = [];
    for (let r = 0; r < N; r++) {
      board[r] = [];
      for (let c = 0; c < N; c++) {
        board[r][c] = inBoard(r, c) ? empty() : null;
      }
    }
    return board;
  }
  function cloneBoard(board) {
    return board.map(
      (row) => row ? row.map((piece) => piece ? { type: piece.type, owner: piece.owner } : piece) : row
    );
  }
  function countPieces(board, type) {
    let count = 0;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const piece = board[r][c];
        if (piece && piece.type === type) count++;
      }
    }
    return count;
  }
  function findPiece(board, type) {
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const piece = board[r][c];
        if (piece && piece.type === type) return { r, c };
      }
    }
    return null;
  }
  function adjacentPieces(board, r, c, type) {
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
  function adjacentDwarfs(board, r, c) {
    return adjacentPieces(board, r, c, PIECES.DWARF);
  }
  function movePiece(board, from, to) {
    board[to.r][to.c] = board[from.r][from.c];
    board[from.r][from.c] = empty();
  }
  function removePiece(board, pos) {
    board[pos.r][pos.c] = empty();
  }

  // resources/script/domain/variants/classic.js
  var classic = {
    mode: MODES.CLASSIC,
    passesWhenBlocked: false,
    eliminationReason: "points",
    createBoard: createClassicBoard,
    getPieceActions: getClassicPieceActions,
    applyNormalAction: applyClassicAction,
    getNoMovesResult: getClassicPointsResult,
    getScore: getClassicScore
  };
  function createClassicBoard() {
    const board = createEmptyBoard();
    board[7][7] = { type: PIECES.THUDSTONE, owner: null };
    for (const [dr, dc] of DIRS) {
      board[7 + dr][7 + dc] = { type: PIECES.TROLL, owner: SIDES.TROLLS };
    }
    let placed = 0;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (!inBoard(r, c) || !isPerimeter(r, c)) continue;
        const aligned = r === 7 && (c === 0 || c === 14) || c === 7 && (r === 0 || r === 14);
        if (aligned) continue;
        board[r][c] = { type: PIECES.DWARF, owner: SIDES.DWARFS };
        placed++;
      }
    }
    if (placed !== 32) throw new Error("Configuraci\xF3n cl\xE1sica inv\xE1lida: " + placed + " enanos");
    return board;
  }
  function getClassicPieceActions(game, r, c) {
    const piece = game.board[r][c];
    if (!piece || piece.owner !== game.turn || piece.type === PIECES.THUDSTONE) return [];
    return game.turn === SIDES.DWARFS ? dwarfActions(game, r, c) : trollActions(game, r, c);
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
    const moveKeys = /* @__PURE__ */ new Set();
    for (const [dr, dc] of DIRS) {
      const rr = r + dr;
      const cc = c + dc;
      if (inBoard(rr, cc) && !game.board[rr][cc].type) {
        actions.push({ type: ActionType.MOVE, from, to: { r: rr, c: cc } });
        moveKeys.add(key(rr, cc));
      }
    }
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
    const winner = score.dwarfPts > score.trollPts ? SIDES.DWARFS : score.trollPts > score.dwarfPts ? SIDES.TROLLS : "draw";
    return { winner, reason: "points" };
  }

  // resources/script/domain/variants/koom.js
  var koom = {
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
  function createKoomBoard() {
    const board = createEmptyBoard();
    board[7][7] = { type: PIECES.THUDSTONE, owner: SIDES.DWARFS };
    const trolls = [
      [1, 5],
      [1, 7],
      [1, 9],
      [2, 4],
      [2, 5],
      [2, 7],
      [2, 9],
      [2, 10]
    ];
    for (const [r, c] of trolls) {
      board[r][c] = { type: PIECES.TROLL, owner: SIDES.TROLLS };
    }
    const dwarfs = [
      [8, 7],
      [9, 0],
      [9, 14],
      [10, 1],
      [10, 13],
      [11, 2],
      [11, 12],
      [12, 3],
      [12, 11],
      [13, 4],
      [13, 10],
      [14, 5],
      [14, 6],
      [14, 7],
      [14, 8],
      [14, 9]
    ];
    for (const [r, c] of dwarfs) {
      board[r][c] = { type: PIECES.DWARF, owner: SIDES.DWARFS };
    }
    if (trolls.length !== 8 || dwarfs.length !== 16) {
      throw new Error("Configuraci\xF3n de Koom inv\xE1lida");
    }
    return board;
  }
  function getKoomPieceActions(game, r, c) {
    const piece = game.board[r][c];
    if (!piece || piece.owner !== game.turn) return [];
    if (game.turn === SIDES.DWARFS) {
      return piece.type === PIECES.THUDSTONE ? rockActions(game, r, c) : dwarfActions2(game, r, c);
    }
    return trollActions2(game, r, c);
  }
  function dwarfActions2(game, r, c) {
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
  function trollActions2(game, r, c) {
    const actions = [];
    const from = { r, c };
    for (const [dr, dc] of DIRS) {
      for (let k = 1; k <= 3; k++) {
        const rr = r + dr * k;
        const cc = c + dc * k;
        if (!inBoard(rr, cc)) break;
        if (game.board[rr][cc].type) break;
        actions.push({ type: ActionType.MOVE, from, to: { r: rr, c: cc } });
      }
    }
    actions.push(...trampleActions(game, r, c));
    return actions;
  }
  function trampleActions(game, r, c) {
    const actions = [];
    const from = { r, c };
    for (const [dr, dc] of DIRS) {
      const victim = { r: r + dr, c: c + dc };
      const landing = { r: r + dr * 2, c: c + dc * 2 };
      if (!inBoard(victim.r, victim.c) || !inBoard(landing.r, landing.c)) continue;
      if (game.board[victim.r][victim.c].type === PIECES.DWARF && !game.board[landing.r][landing.c].type) {
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
  function trappedTrollsFrom(board, pos) {
    const trapped = [];
    for (const [dr, dc] of DIRS) {
      const troll = { r: pos.r + dr, c: pos.c + dc };
      const dwarf = { r: pos.r + dr * 2, c: pos.c + dc * 2 };
      if (!inBoard(troll.r, troll.c) || !inBoard(dwarf.r, dwarf.c)) continue;
      if (board[troll.r][troll.c].type === PIECES.TROLL && board[dwarf.r][dwarf.c].type === PIECES.DWARF) {
        trapped.push(troll);
      }
    }
    return trapped;
  }
  function applyKoomAction(game, action, events) {
    if (action.type === ActionType.MOVE_ROCK) {
      const piece2 = game.board[action.from.r][action.from.c];
      movePiece(game.board, action.from, action.to);
      events.push({
        type: "pieceMoved",
        from: action.from,
        to: action.to,
        pieceType: piece2 ? piece2.type : PIECES.THUDSTONE
      });
      const objective2 = rockGoalResult(game.board);
      return objective2 ? { result: objective2 } : { turn: true };
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
  function findRock(board) {
    return findPiece(board, PIECES.THUDSTONE);
  }
  function rockOnGoal(board) {
    const rock = findRock(board);
    return !!rock && isKoomGoal(rock.r, rock.c);
  }
  function trollsAdjacentToRock(board) {
    const rock = findRock(board);
    return rock ? adjacentPieces(board, rock.r, rock.c, PIECES.TROLL).length : 0;
  }
  function rockGoalResult(board) {
    return rockOnGoal(board) ? { winner: SIDES.DWARFS, reason: "rock" } : null;
  }
  function trollsSurroundRockResult(board) {
    return trollsAdjacentToRock(board) >= 3 ? { winner: SIDES.TROLLS, reason: "surrounded" } : null;
  }
  function getKoomScore(game) {
    return {
      dwarfs: countPieces(game.board, PIECES.DWARF),
      trolls: countPieces(game.board, PIECES.TROLL),
      dwarfPts: 0,
      trollPts: 0
    };
  }

  // resources/script/domain/game.js
  var VARIANTS = {
    [MODES.CLASSIC]: classic,
    [MODES.KOOM]: koom
  };
  function getVariant(game) {
    return VARIANTS[game.mode] || classic;
  }
  function createGame(mode = MODES.CLASSIC) {
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
  function cloneGame(game) {
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
        cells: pending.cells.map((cell) => ({ ...cell })),
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
  function getLegalActions(game) {
    if (game.result) return [];
    if (game.phase === "capture" && game.pending) {
      const actions = game.pending.cells.map((cell) => ({
        type: ActionType.CAPTURE,
        cell: { ...cell }
      }));
      if (!game.pending.mustCapture || game.pending.captured > 0) {
        actions.push({ type: ActionType.END_TURN });
      }
      return actions;
    }
    if (game.phase === "trample" && game.pending) {
      return game.pending.targets.map(cloneAction).concat([{ type: ActionType.END_TURN }]);
    }
    return getActionsForSide(game, game.turn);
  }
  function getActionsForSide(game, side) {
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
  function hasAnyMove(game, side) {
    return getActionsForSide(game, side).length > 0;
  }
  function applyAction(game, action) {
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
      const outcome2 = variant.applyTrampleAction(next, action, events);
      applyOutcome(next, outcome2, events);
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
    game.pending.cells = game.pending.cells.filter((cell) => cell.r !== r || cell.c !== c);
    game.pending.captured++;
    if (game.pending.cells.length) {
      events.push({
        type: "capturePhase",
        cells: game.pending.cells.map((cell) => ({ ...cell })),
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
        cells: outcome.capture.cells.map((cell) => ({ ...cell })),
        mustCapture: !!outcome.capture.mustCapture,
        captured: 0
      };
      events.push({
        type: "capturePhase",
        cells: game.pending.cells.map((cell) => ({ ...cell })),
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
  function finalizeGame(game) {
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

  // resources/script/ai/evaluate.js
  var WIN_SCORE = 1e7;
  function evaluate(game, aiSide) {
    if (game.result) {
      const winner = game.result.winner;
      if (winner === aiSide) return WIN_SCORE;
      if (winner === "draw") return 0;
      return -WIN_SCORE;
    }
    return game.mode === MODES.KOOM ? evaluateKoom(game, aiSide) : evaluateClassic(game, aiSide);
  }
  function evaluateClassic(game, aiSide) {
    const dwarfs = countPieces(game.board, PIECES.DWARF);
    const trolls = countPieces(game.board, PIECES.TROLL);
    const dwarfScore = dwarfs + countMoves(game, SIDES.DWARFS) * 0.04;
    const trollScore = trolls * 4 + countMoves(game, SIDES.TROLLS) * 0.04;
    return aiSide === SIDES.DWARFS ? dwarfScore - trollScore : trollScore - dwarfScore;
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
    return aiSide === SIDES.DWARFS ? dwarfScore - trollScore : trollScore - dwarfScore;
  }
  function countMoves(game, side) {
    return getActionsForSide(game, side).length;
  }

  // resources/script/ai/choose.js
  function chooseAction(game, aiSide) {
    const actions = getLegalActions(game);
    if (!actions.length) return null;
    if (game.phase === "capture") {
      return actions.find((action) => action.type === ActionType.CAPTURE) || actions.find((action) => action.type === ActionType.END_TURN) || null;
    }
    let bestAction = null;
    let bestScore = -Infinity;
    for (const action of actions) {
      const next = simulateAction(game, action);
      const score = evaluate(next, aiSide);
      if (score > bestScore) {
        bestScore = score;
        bestAction = action;
      }
    }
    return bestAction;
  }
  function simulateAction(game, action) {
    let next = applyAction(game, action).game;
    let guard = 0;
    while (!next.result && next.phase === "capture" && guard++ < 100) {
      const capture = getLegalActions(next).find((item) => item.type === ActionType.CAPTURE);
      next = applyAction(next, capture || { type: ActionType.END_TURN }).game;
    }
    guard = 0;
    while (!next.result && next.phase === "trample" && guard++ < 100) {
      const trample = getLegalActions(next).find((item) => item.type === ActionType.TRAMPLE);
      if (!trample) {
        next = applyAction(next, { type: ActionType.END_TURN }).game;
        break;
      }
      next = applyAction(next, trample).game;
    }
    return next;
  }

  // resources/script/ai/scheduler.js
  var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  function createAiScheduler({
    getGame,
    getSession,
    isAiTurn: isAiTurn2,
    dispatch,
    refresh,
    setThinking,
    delay = 420
  }) {
    let timer = null;
    let generation = 0;
    let thinking = false;
    function cancel() {
      generation++;
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      thinking = false;
      setThinking(false);
    }
    function schedule(wait = delay) {
      if (!isAiTurn2() || getGame().result || thinking || timer !== null) return;
      const token = generation;
      timer = setTimeout(() => {
        timer = null;
        void run(token);
      }, wait);
    }
    async function run(token) {
      if (token !== generation || !isAiTurn2() || getGame().result) return;
      thinking = true;
      setThinking(true);
      refresh();
      let failed = false;
      let stalled = false;
      try {
        let guard = 0;
        while (token === generation && isAiTurn2() && !getGame().result && guard++ < 200) {
          const action = chooseAction(getGame(), getSession().aiSide);
          if (!action) {
            stalled = true;
            break;
          }
          const applied = await dispatch(action, { source: "ai" });
          if (!applied) {
            stalled = true;
            break;
          }
          if (action.type === "capture") {
            await sleep(260);
          }
        }
      } catch (err) {
        failed = true;
        console.error("Error en el turno de la IA:", err);
      } finally {
        if (token === generation) {
          thinking = false;
          setThinking(false);
          refresh();
          if (!failed && !stalled && isAiTurn2() && !getGame().result) schedule(300);
        }
      }
    }
    return {
      schedule,
      cancel,
      isThinking: () => thinking
    };
  }

  // resources/script/presentation/audio.js
  var SOUND_VOLUME = { pickup: 0.55, putdown: 0.6, move: 0.32, thud: 0.7 };
  var soundPlayers = {
    pickup: new Audio("resources/assets/pick-up.mp3"),
    putdown: new Audio("resources/assets/put-down.mp3"),
    move: new Audio("resources/assets/piece-movement.mp3"),
    thud: new Audio("resources/assets/thud.mp3")
  };
  for (const [name, audio] of Object.entries(soundPlayers)) {
    audio.preload = "auto";
    audio.volume = SOUND_VOLUME[name];
  }
  function playSound(name, { loop = false } = {}) {
    const audio = soundPlayers[name];
    if (!audio) return;
    audio.loop = loop;
    try {
      audio.currentTime = 0;
      const playback = audio.play();
      if (playback && typeof playback.catch === "function") {
        playback.catch(() => {
        });
      }
    } catch (err) {
    }
  }
  function stopSound(name) {
    const audio = soundPlayers[name];
    if (!audio || audio.paused) return;
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch (err) {
    }
  }

  // resources/script/application/selectors.js
  function isAiTurn(session, game) {
    return session.opponent === "ai" && session.aiSide === game.turn;
  }

  // resources/script/presentation/dom.js
  var boardEl = document.getElementById("board");
  var cells = /* @__PURE__ */ new Map();

  // resources/script/presentation/boardView.js
  function pieceEl(piece) {
    const element = document.createElement("div");
    element.className = "piece " + piece.type;
    return element;
  }
  function buildGrid() {
    boardEl.innerHTML = "";
    cells.clear();
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (!inBoard(r, c)) continue;
        const element = document.createElement("div");
        element.className = "cell";
        element.style.gridRow = String(r + 1);
        element.style.gridColumn = String(c + 1);
        element.dataset.r = String(r);
        element.dataset.c = String(c);
        boardEl.appendChild(element);
        cells.set(key(r, c), element);
      }
    }
  }
  function renderBoard(store2) {
    const { game, session, ui } = store2;
    const aiTurn = isAiTurn(session, game);
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (!inBoard(r, c)) continue;
        const element = cells.get(key(r, c));
        if (!element) continue;
        element.className = "cell";
        if (game.mode === "koom" && isKoomGoal(r, c)) {
          element.classList.add("koom-goal");
        }
        if (ui.selected && ui.selected.r === r && ui.selected.c === c) {
          element.classList.add("selected");
        }
        const target = ui.targets.find((item) => item.r === r && item.c === c);
        if (target) element.classList.add("tgt-" + target.kind);
        if (game.pending && game.pending.type === "capture" && game.pending.cells.some((cell) => cell.r === r && cell.c === c)) {
          element.classList.add("capture");
        }
        element.innerHTML = "";
        const piece = game.board[r][c];
        if (piece && piece.type) element.appendChild(pieceEl(piece));
        const canDrag = !game.result && !ui.busy && !aiTurn && game.phase === "normal" && piece && (piece.type !== PIECES.THUDSTONE || game.mode === "koom") && piece.owner === game.turn;
        if (canDrag) element.classList.add("draggable");
      }
    }
  }

  // resources/script/presentation/animation.js
  var current = null;
  var animation = {
    isAnimating() {
      return !!current;
    },
    cancel() {
      if (!current) return;
      const active = current;
      current = null;
      if (active.timer) clearTimeout(active.timer);
      stopSound("move");
      if (active.animation) {
        try {
          active.animation.cancel();
        } catch (err) {
        }
      }
      active.ghost.remove();
      if (active.sourceEl) active.sourceEl.classList.remove("move-origin");
      active.resolve(false);
    },
    play(descriptor) {
      if (!descriptor || current) return Promise.resolve(false);
      const { from, to } = descriptor;
      const sourceCell = cells.get(key(from.r, from.c));
      const targetCell = cells.get(key(to.r, to.c));
      const sourceEl = sourceCell ? sourceCell.querySelector(".piece") : null;
      if (!sourceCell || !targetCell || !sourceEl) return Promise.resolve(true);
      const sourceRect = sourceEl.getBoundingClientRect();
      const targetRect = targetCell.getBoundingClientRect();
      const sourceX = sourceRect.left + sourceRect.width / 2;
      const sourceY = sourceRect.top + sourceRect.height / 2;
      const targetX = targetRect.left + targetRect.width / 2;
      const targetY = targetRect.top + targetRect.height / 2;
      const dx = targetX - sourceX;
      const dy = targetY - sourceY;
      const distance = Math.hypot(dx, dy);
      const lift = Math.min(40, 22 + distance * 0.1);
      const sourceStyle = getComputedStyle(sourceEl);
      const ghost = pieceEl({ type: descriptor.pieceType || sourceEl.classList[1] });
      ghost.classList.add("move-ghost");
      ghost.style.width = sourceStyle.width;
      ghost.style.height = sourceStyle.height;
      ghost.style.fontSize = sourceStyle.fontSize;
      ghost.style.left = sourceX + "px";
      ghost.style.top = sourceY + "px";
      document.body.appendChild(ghost);
      playSound("move", { loop: true });
      sourceEl.classList.add("move-origin");
      const duration = Math.min(560, 340 + distance * 1.2);
      return new Promise((resolve) => {
        let settled = false;
        let animation2 = null;
        let timer = null;
        const settle = (value) => {
          if (settled) return;
          settled = true;
          if (timer) clearTimeout(timer);
          resolve(value);
        };
        const finish2 = (value) => {
          if (settled) return;
          if (current && current.animation === animation2) current = null;
          stopSound("move");
          ghost.remove();
          sourceEl.classList.remove("move-origin");
          settle(value);
        };
        animation2 = ghost.animate([
          { transform: "translate(-50%, -50%) scale(1) rotate(0deg)" },
          {
            transform: "translate(calc(-50% + " + dx * 0.52 + "px), calc(-50% + " + (dy * 0.52 - lift) + "px)) scale(1.22) rotate(-4deg)",
            offset: 0.55
          },
          { transform: "translate(calc(-50% + " + dx + "px), calc(-50% + " + dy + "px)) scale(1) rotate(0deg)" }
        ], {
          duration,
          easing: "cubic-bezier(.22,.75,.28,1)"
        });
        timer = setTimeout(() => {
          if (current && current.animation === animation2) current = null;
          try {
            animation2.cancel();
          } catch (err) {
          }
          finish2(true);
        }, duration + 150);
        current = { ghost, sourceEl, animation: animation2, timer, resolve: settle };
        animation2.finished.then(() => finish2(true)).catch((err) => {
          if (!err || err.name !== "AbortError") {
            console.error("Error al completar la animaci\xF3n:", err);
          }
          finish2(false);
        });
      });
    }
  };

  // resources/i18n/embedded.js
  var THUD_EMBEDDED_PROPERTIES = {
    es: `# ---------------------------------------------------------------
# Thud \u2014 Traducciones al castellano
# ---------------------------------------------------------------
app.title=Thud \u2014 Enanos y Trolls
app.tagline=Un juego de enanos y trolls
lang.switch=Cambiar idioma
help.open=C\xF3mo se juega

board.aria=Tablero de Thud
board.caption=El campo de batalla
panel.aria=Panel de la partida
panel.colophon=Registro de Combate
log.aria=Registro de la partida
log.title=Registro

side.dwarfs=Enanos
side.trolls=Trolls
unit.dwarfs=enanos
unit.trolls=trolls
unit.pts=pts

turn.dwarfs=Turno de los Enanos
turn.trolls=Turno de los Trolls

btn.endTurn=Terminar turno
btn.captureRequired=Captura obligatoria
btn.finalize=Finalizar batalla
btn.newBattle=Nueva batalla
btn.restart=Reiniciar
btn.cancel=Cancelar
btn.confirm=Confirmar

legend.dwarf=Enano \xB7 1 pt
legend.troll=Troll \xB7 4 pts
legend.thudstone=Thudstone

status.selectDwarf=Selecciona un enano para mover o lanzar.
status.selectTroll=Selecciona un troll para mover o empujar.
status.noMoves=Esa pieza no tiene jugadas legales. Selecciona otra.
status.targets.one={n} destino disponible.
status.targets.other={n} destinos disponibles.
status.hurls.one={n} lanzamiento posible.
status.hurls.other={n} lanzamientos posibles.
status.shoves.one={n} empuje posible.
status.shoves.other={n} empujes posibles.
status.shoveRequired=Empuje: debes capturar al menos un enano adyacente. Luego termina el turno.
status.captureOptional=Captura opcional: pulsa los enanos adyacentes que quieras eliminar.
status.over=La batalla ha terminado. Pulsa \xABNueva batalla\xBB para jugar otra.

confirm.title=Confirmar
confirm.finalize.title=Finalizar batalla
confirm.finalize.text=\xBFFinalizar la batalla y contar los puntos?
confirm.new.title=Nueva batalla
confirm.new.text=\xBFReiniciar la batalla actual? Se perder\xE1 el progreso de esta partida.

result.battle=<strong>Fin de la batalla</strong><br>Enanos: {dwarfs} piezas vivas \u2192 {dwarfPts} pts<br>Trolls: {trolls} piezas vivas \u2192 {trollPts} pts<br><strong>{verdict}</strong>
result.trollLead.one=Ventaja de los trolls por {diff} punto.
result.trollLead.other=Ventaja de los trolls por {diff} puntos.
result.dwarfLead.one=Ventaja de los enanos por {diff} punto.
result.dwarfLead.other=Ventaja de los enanos por {diff} puntos.
result.draw=Empate.

log.battleStart=Comienza la batalla. Los enanos mueven primero.
log.dwarfMove=Enano {from} \u2192 {to}.
log.trollMove=Troll {from} \u2192 {to}.
log.hurl=Lanzamiento: enano de {from} captura un troll en {to}.
log.shove=Empuje: trolls empujan, troll de {from} \u2192 {to}.
log.capture=Troll captura un enano en {cell}.
log.turnDwarfs=Turno de los enanos.
log.turnTrolls=Turno de los trolls.
log.battleEnd=Fin de la batalla \u2014 enanos: {dwarfPts} pts ({dwarfs}), trolls: {trollPts} pts ({trolls}). {verdict}

help.title=C\xF3mo se juega
help.objective=<b>Objetivo:</b> capturar el m\xE1ximo de piezas rivales. Los enanos punt\xFAan 1 por pieza viva; los trolls, 4.
help.dwarfsTitle=Enanos <span>(mueven primero)</span>
help.dwarfsMove=<b>Mover:</b> como una dama de ajedrez, a casillas vac\xEDas, sin saltar piezas.
help.dwarfsHurl=<b>Lanzar:</b> en una l\xEDnea recta de enanos adyacentes se lanza el enano frontal hasta tantas casillas como enanos tenga la l\xEDnea. Debe caer sobre un troll para capturarlo.
help.trollsTitle=Trolls
help.trollsMove=<b>Mover:</b> como un rey del ajedrez, una casilla a una casilla vac\xEDa. Despu\xE9s puede capturar enanos adyacentes (opcional).
help.trollsShove=<b>Empujar:</b> una l\xEDnea de trolls adyacentes empuja al troll del extremo hasta tantas casillas como trolls tenga la l\xEDnea, sin ocupar casillas. Debe capturar al menos un enano adyacente al destino.
help.controlsTitle=Controles
help.controls1=Haz clic o arrastra una pieza propia para ver sus destinos posibles.
help.controls2=Haz clic en un destino resaltado, o suelta la pieza sobre \xE9l, para ejecutar la jugada.
help.controls3=Vuelve a hacer clic en la pieza seleccionada para deseleccionarla.
help.end=<b>Fin:</b> la batalla acaba cuando un bando se queda sin jugadas legales (o ambos acuerdan que no hay m\xE1s capturas). Se comparan los puntos.

modal.close=Cerrar

# ---------------------------------------------------------------
# Selecci\xF3n de versi\xF3n y Valle de Koom
# ---------------------------------------------------------------
mode.title=Elige un modo de juego
mode.version=Versi\xF3n
mode.opponent=Oponente
mode.opponent.human=Otro humano
mode.opponent.ai=M\xE1quina
mode.side=Jug\xE1s como
mode.side.dwarfs=Enanos
mode.side.trolls=Trolls
mode.start=Comenzar batalla
mode.classic.name=Thud tradicional
mode.classic.desc=32 enanos contra 8 trolls. Captura piezas y suma puntos por cada pieza no eliminada.
mode.koom.name=Valle de Koom
mode.koom.desc=Los enanos deben llevar la roca hasta la fila dorada del lado opuesto. Los trolls ganan si tres trolls quedan adyacentes a la roca. Si nadie alcanza su objetivo, la partida termina en empate.

legend.dwarf.koom=Enano
legend.troll.koom=Troll
legend.rock=Roca
matchup.ai=Vos: {human} \xB7 M\xE1quina: {ai}

status.koomSelectDwarf=Lleva la roca a la fila dorada. Selecciona un enano o la roca.
status.koomSelectTroll=Rodea la roca con tres trolls. Selecciona un troll para mover o pisotear.
status.koomTrample=Puedes seguir pisoteando enanos o terminar el turno.
status.koomRockSelected=Roca seleccionada: debe terminar junto a un enano.
status.aiTurn=La m\xE1quina est\xE1 jugando\u2026
status.aiThinking=La m\xE1quina est\xE1 pensando\u2026
status.tramples.one={n} pisot\xF3n posible.
status.tramples.other={n} pisotones posibles.

confirm.finalize.koom.text=\xBFFinalizar la batalla? Si no se alcanz\xF3 ning\xFAn objetivo, se declarar\xE1 un empate.

result.koom.dwarfs=<strong>Victoria de los Enanos</strong><br>La roca lleg\xF3 a la fila dorada del valle.
result.koom.dwarfs.elimination=<strong>Victoria de los Enanos</strong><br>Todos los trolls fueron eliminados.
result.koom.trolls=<strong>Victoria de los Trolls</strong><br>Tres trolls rodearon la roca.
result.koom.trolls.elimination=<strong>Victoria de los Trolls</strong><br>Todos los enanos fueron eliminados.
result.koom.draw=<strong>Empate</strong><br>Ning\xFAn bando alcanz\xF3 su objetivo.

log.koomStart=Comienza la batalla por el Valle de Koom. Los enanos mueven primero.
log.koomRock=La roca se mueve de {from} a {to}.
log.koomTrap=Enano atrapa un troll en {cell}.
log.koomTrample=Troll pisotea un enano en {cell} ({from} \u2192 {to}).
log.koomPassDwarfs=Los enanos no tienen jugadas y pasan.
log.koomPassTrolls=Los trolls no tienen jugadas y pasan.
log.koomEndDwarfs=Fin de la batalla: victoria de los enanos. La roca lleg\xF3 al otro lado.
log.koomEndDwarfsElimination=Fin de la batalla: victoria de los enanos. Todos los trolls fueron eliminados.
log.koomEndTrolls=Fin de la batalla: victoria de los trolls. La roca qued\xF3 rodeada.
log.koomEndTrollsElimination=Fin de la batalla: victoria de los trolls. Todos los enanos fueron eliminados.
log.koomDraw=Fin de la batalla: empate.

help.koom.objective=<b>Objetivo:</b> los enanos deben llevar la roca a una de las cinco casillas doradas del lado opuesto. Los trolls ganan si tres trolls quedan adyacentes a la roca.
help.koom.dwarfsTitle=Enanos <span>(mueven primero)</span>
help.koom.dwarfsMove=<b>Mover:</b> como una dama de ajedrez, a casillas vac\xEDas, sin saltar piezas.
help.koom.rock=<b>Mover la roca:</b> una casilla en cualquier direcci\xF3n. La roca debe empezar y terminar junto a un enano.
help.koom.trap=<b>Capturar:</b> al mover un enano, captura los trolls que queden atrapados entre ese enano y otro enano en l\xEDnea recta.
help.koom.trollsTitle=Trolls
help.koom.trollsMove=<b>Mover:</b> hasta tres casillas en l\xEDnea recta, sin saltar piezas.
help.koom.trample=<b>Pisotear:</b> salta sobre un enano adyacente y aterriza en la casilla vac\xEDa inmediatamente posterior. Puede encadenar varios pisotones cambiando de direcci\xF3n.
help.koom.end=<b>Fin:</b> los enanos ganan si la roca llega a la fila dorada; los trolls, si rodean la roca con tres trolls. Si nadie alcanza su objetivo, la partida termina en empate.
`,
    en: `# ---------------------------------------------------------------
# Thud \u2014 English translations
# ---------------------------------------------------------------
app.title=Thud \u2014 Dwarfs and Trolls
app.tagline=A game of dwarfs and trolls
lang.switch=Switch language
help.open=How to play

board.aria=Thud board
board.caption=The field of battle
panel.aria=Game panel
panel.colophon=Battle Log
log.aria=Battle log
log.title=Battle log

side.dwarfs=Dwarfs
side.trolls=Trolls
unit.dwarfs=dwarfs
unit.trolls=trolls
unit.pts=pts

turn.dwarfs=Dwarfs' turn
turn.trolls=Trolls' turn

btn.endTurn=End turn
btn.captureRequired=Capture required
btn.finalize=Finish battle
btn.newBattle=New battle
btn.restart=Restart
btn.cancel=Cancel
btn.confirm=Confirm

legend.dwarf=Dwarf \xB7 1 pt
legend.troll=Troll \xB7 4 pts
legend.thudstone=Thudstone

status.selectDwarf=Select a dwarf to move or hurl.
status.selectTroll=Select a troll to move or shove.
status.noMoves=That piece has no legal moves. Select another one.
status.targets.one={n} destination available.
status.targets.other={n} destinations available.
status.hurls.one={n} hurl possible.
status.hurls.other={n} hurls possible.
status.shoves.one={n} shove possible.
status.shoves.other={n} shoves possible.
status.shoveRequired=Shove: you must capture at least one adjacent dwarf. Then the turn ends.
status.captureOptional=Optional capture: click the adjacent dwarfs you want to remove.
status.over=The battle is over. Press "New battle" to play again.

confirm.title=Confirm
confirm.finalize.title=Finish battle
confirm.finalize.text=Finish the battle and count the points?
confirm.new.title=New battle
confirm.new.text=Restart the current battle? The progress of this game will be lost.

result.battle=<strong>Battle over</strong><br>Dwarfs: {dwarfs} pieces alive \u2192 {dwarfPts} pts<br>Trolls: {trolls} pieces alive \u2192 {trollPts} pts<br><strong>{verdict}</strong>
result.trollLead.one=Trolls lead by {diff} point.
result.trollLead.other=Trolls lead by {diff} points.
result.dwarfLead.one=Dwarfs lead by {diff} point.
result.dwarfLead.other=Dwarfs lead by {diff} points.
result.draw=Draw.

log.battleStart=The battle begins. Dwarfs move first.
log.dwarfMove=Dwarf {from} \u2192 {to}.
log.trollMove=Troll {from} \u2192 {to}.
log.hurl=Hurl: dwarf from {from} captures a troll at {to}.
log.shove=Shove: trolls push, troll from {from} \u2192 {to}.
log.capture=Troll captures a dwarf at {cell}.
log.turnDwarfs=Dwarfs' turn.
log.turnTrolls=Trolls' turn.
log.battleEnd=Battle over \u2014 dwarfs: {dwarfPts} pts ({dwarfs}), trolls: {trollPts} pts ({trolls}). {verdict}

help.title=How to play
help.objective=<b>Objective:</b> capture as many enemy pieces as possible. Dwarfs score 1 point per living piece; trolls score 4.
help.dwarfsTitle=Dwarfs <span>(move first)</span>
help.dwarfsMove=<b>Move:</b> like a chess queen, to empty squares, without jumping over pieces.
help.dwarfsHurl=<b>Hurl:</b> from a straight line of adjacent dwarfs, the front dwarf is hurled as many squares as there are dwarfs in the line. It must land on a troll to capture it.
help.trollsTitle=Trolls
help.trollsMove=<b>Move:</b> like a chess king, one square to an empty square. Then it may capture adjacent dwarfs (optional).
help.trollsShove=<b>Shove:</b> a line of adjacent trolls pushes the troll at the far end as many squares as there are trolls in the line, without landing on occupied squares. It must capture at least one dwarf adjacent to the destination.
help.controlsTitle=Controls
help.controls1=Click or drag one of your pieces to see its possible destinations.
help.controls2=Click a highlighted destination, or drop the piece on it, to make the move.
help.controls3=Click the selected piece again to deselect it.
help.end=<b>End:</b> the battle ends when one side has no legal moves left (or both agree that no more captures are possible). Points are then compared.

modal.close=Close

# ---------------------------------------------------------------
# Version selection and Koom Valley
# ---------------------------------------------------------------
mode.title=Choose a game mode
mode.version=Version
mode.opponent=Opponent
mode.opponent.human=Another human
mode.opponent.ai=Computer
mode.side=Play as
mode.side.dwarfs=Dwarfs
mode.side.trolls=Trolls
mode.start=Start battle
mode.classic.name=Classic Thud
mode.classic.desc=32 dwarfs against 8 trolls. Capture pieces and score points for each surviving piece.
mode.koom.name=Koom Valley
mode.koom.desc=Dwarfs must carry the rock to the golden row on the far side. Trolls win if three trolls end up adjacent to the rock. If neither side reaches its objective, the battle is a draw.

legend.dwarf.koom=Dwarf
legend.troll.koom=Troll
legend.rock=Rock
matchup.ai=You: {human} \xB7 Computer: {ai}

status.koomSelectDwarf=Take the rock to the golden row. Select a dwarf or the rock.
status.koomSelectTroll=Surround the rock with three trolls. Select a troll to move or trample.
status.koomTrample=You may keep trampling dwarfs or end the turn.
status.koomRockSelected=Rock selected: it must end next to a dwarf.
status.aiTurn=The computer is playing\u2026
status.aiThinking=The computer is thinking\u2026
status.tramples.one={n} trample available.
status.tramples.other={n} tramples available.

confirm.finalize.koom.text=Finish the battle? If neither objective was reached, it will be a draw.

result.koom.dwarfs=<strong>Dwarfs win</strong><br>The rock reached the golden row of the valley.
result.koom.dwarfs.elimination=<strong>Dwarfs win</strong><br>All trolls were eliminated.
result.koom.trolls=<strong>Trolls win</strong><br>Three trolls surrounded the rock.
result.koom.trolls.elimination=<strong>Trolls win</strong><br>All dwarfs were eliminated.
result.koom.draw=<strong>Draw</strong><br>Neither side reached its objective.

log.koomStart=The battle for Koom Valley begins. Dwarfs move first.
log.koomRock=The rock moves from {from} to {to}.
log.koomTrap=A dwarf traps a troll at {cell}.
log.koomTrample=A troll tramples a dwarf at {cell} ({from} \u2192 {to}).
log.koomPassDwarfs=Dwarfs have no legal moves and pass.
log.koomPassTrolls=Trolls have no legal moves and pass.
log.koomEndDwarfs=Battle over: dwarfs win. The rock reached the far side.
log.koomEndDwarfsElimination=Battle over: dwarfs win. All trolls were eliminated.
log.koomEndTrolls=Battle over: trolls win. The rock was surrounded.
log.koomEndTrollsElimination=Battle over: trolls win. All dwarfs were eliminated.
log.koomDraw=Battle over: draw.

help.koom.objective=<b>Objective:</b> the dwarfs must take the rock to one of the five golden squares on the opposite side. The trolls win if three trolls end up adjacent to the rock.
help.koom.dwarfsTitle=Dwarfs <span>(move first)</span>
help.koom.dwarfsMove=<b>Move:</b> like a chess queen, to empty squares, without jumping over pieces.
help.koom.rock=<b>Move the rock:</b> one square in any direction. The rock must start and end next to a dwarf.
help.koom.trap=<b>Capture:</b> when a dwarf moves, it captures trolls trapped between that dwarf and another dwarf in a straight line.
help.koom.trollsTitle=Trolls
help.koom.trollsMove=<b>Move:</b> up to three squares in a straight line, without jumping over pieces.
help.koom.trample=<b>Trample:</b> jump over an adjacent dwarf and land on the empty square immediately beyond. You may chain several tramples, changing direction between them.
help.koom.end=<b>End:</b> dwarfs win if the rock reaches the golden row; trolls win if they surround the rock with three trolls. If neither objective is reached, it is a draw.
`
  };

  // resources/script/i18n/messages.js
  function parseProperties(text) {
    const messages2 = {};
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#") || line.startsWith("!")) continue;
      const separator = line.indexOf("=");
      if (separator === -1) continue;
      const key2 = line.slice(0, separator).trim();
      const value = line.slice(separator + 1).trim().replace(/\\n/g, "\n").replace(/\\t/g, "	");
      messages2[key2] = value;
    }
    return messages2;
  }
  function formatMessage(text, params) {
    if (!params) return text;
    return text.replace(
      /\{(\w+)\}/g,
      (match, name) => Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match
    );
  }

  // resources/script/i18n/store.js
  var LOCALES = ["es", "en"];
  var LANGUAGE_CHANGE_EVENT = "thud:languagechange";
  var currentLang = "es";
  var messages = {};
  function getLang() {
    return currentLang;
  }
  function setLocale(lang, text) {
    currentLang = lang;
    messages = parseProperties(text);
  }
  function getEmbeddedLocale(lang) {
    return THUD_EMBEDDED_PROPERTIES[lang];
  }
  function t(key2, params) {
    const text = Object.prototype.hasOwnProperty.call(messages, key2) ? messages[key2] : key2;
    return formatMessage(text, params);
  }
  function preferredLanguage() {
    try {
      const saved = localStorage.getItem("thud.lang");
      if (LOCALES.includes(saved)) return saved;
    } catch (err) {
    }
    return "es";
  }
  function persistLanguage(lang) {
    try {
      localStorage.setItem("thud.lang", lang);
    } catch (err) {
    }
  }

  // resources/script/i18n/dom.js
  function applyTranslations() {
    document.documentElement.lang = getLang();
    document.title = t("app.title");
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      el.innerHTML = t(el.dataset.i18nHtml);
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      el.setAttribute("aria-label", t(el.dataset.i18nAria));
    });
    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      el.setAttribute("title", t(el.dataset.i18nTitle));
    });
    const langBtn = document.getElementById("langBtn");
    if (langBtn) {
      const code = getLang().toUpperCase();
      const label = `${t("lang.switch")} (${code})`;
      langBtn.textContent = code;
      langBtn.setAttribute("aria-label", label);
      langBtn.setAttribute("title", label);
    }
  }

  // resources/script/i18n/loader.js
  async function loadLocale(lang) {
    const embedded = getEmbeddedLocale(lang);
    if (location.protocol === "file:") {
      if (!embedded) throw new Error("No hay traducciones embebidas para " + lang);
      setLocale(lang, embedded);
      return;
    }
    try {
      const response = await fetch("resources/i18n/" + lang + ".properties", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("No se pudo cargar " + lang + ".properties (HTTP " + response.status + ")");
      }
      setLocale(lang, await response.text());
    } catch (err) {
      if (!embedded) throw err;
      console.warn("No se pudo cargar " + lang + ".properties; se usan las traducciones embebidas.", err);
      setLocale(lang, embedded);
    }
  }

  // resources/script/i18n/index.js
  async function switchLanguage(lang) {
    if (lang === getLang()) return;
    const button = document.getElementById("langBtn");
    if (button) button.disabled = true;
    try {
      await loadLocale(lang);
      persistLanguage(lang);
      applyTranslations();
      document.dispatchEvent(new CustomEvent(LANGUAGE_CHANGE_EVENT));
    } catch (err) {
      console.error("No se pudo cambiar el idioma:", err);
    } finally {
      if (button) button.disabled = false;
    }
  }

  // resources/script/presentation/verdict.js
  function resultVerdict(dwarfPts, trollPts) {
    const diff = trollPts - dwarfPts;
    if (diff > 0) {
      return t(diff === 1 ? "result.trollLead.one" : "result.trollLead.other", { diff });
    }
    if (diff < 0) {
      return t(diff === -1 ? "result.dwarfLead.one" : "result.dwarfLead.other", { diff: -diff });
    }
    return t("result.draw");
  }

  // resources/script/presentation/logView.js
  var MAX_LOG = 60;
  var VISIBLE_LOG = 9;
  function addLog(store2, key2, params, highlight) {
    store2.ui.log.push({ key: key2, params: params || null, highlight: !!highlight });
    if (store2.ui.log.length > MAX_LOG) store2.ui.log.shift();
    renderLog(store2);
  }
  function renderLog(store2) {
    const list = document.getElementById("log");
    if (!list) return;
    list.innerHTML = "";
    for (const entry of store2.ui.log.slice(-VISIBLE_LOG)) {
      const item = document.createElement("li");
      const params = Object.assign({}, entry.params);
      if (entry.key === "log.battleEnd") {
        params.verdict = resultVerdict(params.dwarfPts, params.trollPts);
      }
      item.textContent = t(entry.key, params);
      if (entry.highlight) item.className = "hl";
      list.appendChild(item);
    }
    list.scrollTop = list.scrollHeight;
  }

  // resources/script/presentation/panelView.js
  function renderPanel(store2) {
    const { game, session, ui } = store2;
    const dwarfs = countPieces(game.board, PIECES.DWARF);
    const trolls = countPieces(game.board, PIECES.TROLL);
    const aiTurn = isAiTurn(session, game);
    setText("dwarfCount", dwarfs);
    setText("trollCount", trolls);
    setText("dwarfPts", dwarfs);
    setText("trollPts", trolls * 4);
    document.querySelectorAll(".score-card .points").forEach((element) => {
      element.hidden = game.mode === "koom";
    });
    setText("modeBadge", t(game.mode === "koom" ? "mode.koom.name" : "mode.classic.name"));
    renderMatchup(session);
    setText("legendDwarf", t(game.mode === "koom" ? "legend.dwarf.koom" : "legend.dwarf"));
    setText("legendTroll", t(game.mode === "koom" ? "legend.troll.koom" : "legend.troll"));
    setText("legendStone", t(game.mode === "koom" ? "legend.rock" : "legend.thudstone"));
    document.querySelectorAll("[data-help-mode]").forEach((element) => {
      element.hidden = element.dataset.helpMode !== game.mode;
    });
    const turnElement = document.getElementById("turn");
    const turnLabel = document.getElementById("turnLabel");
    turnLabel.textContent = game.turn === "dwarfs" ? t("turn.dwarfs") : t("turn.trolls");
    turnElement.className = "turn " + (game.turn === "dwarfs" ? "dwarfs" : "trolls");
    const statusElement = document.getElementById("status");
    statusElement.textContent = getStatusText(store2, aiTurn);
    const endTurnButton = document.getElementById("endTurnBtn");
    const showEndTurn = (game.phase === "capture" || game.phase === "trample") && !game.result && !aiTurn;
    const mustCaptureNow = game.phase === "capture" && game.pending && game.pending.mustCapture && game.pending.captured === 0;
    endTurnButton.hidden = !showEndTurn;
    endTurnButton.disabled = mustCaptureNow || aiTurn || ui.busy;
    endTurnButton.textContent = mustCaptureNow ? t("btn.captureRequired") : t("btn.endTurn");
    turnElement.classList.toggle("has-action", showEndTurn);
    turnLabel.hidden = showEndTurn;
    const finalizeButton = document.getElementById("finalizeBtn");
    finalizeButton.hidden = !!game.result;
    finalizeButton.disabled = aiTurn || ui.busy;
  }
  function getStatusText(store2, aiTurn) {
    const { game, session, ui } = store2;
    if (game.result) return t("status.over");
    if (aiTurn) return t(store2.ai.thinking ? "status.aiThinking" : "status.aiTurn");
    if (game.phase === "capture" && game.pending) {
      return game.pending.mustCapture && game.pending.captured === 0 ? t("status.shoveRequired") : t("status.captureOptional");
    }
    if (game.phase === "trample") return t("status.koomTrample");
    if (ui.selected) {
      const count = ui.targets.length;
      if (!count) return t("status.noMoves");
      if (game.mode === "koom") {
        let text2 = t(count === 1 ? "status.targets.one" : "status.targets.other", { n: count });
        const tramples = ui.targets.filter((target) => target.kind === "trample").length;
        if (tramples) {
          text2 += " " + t(tramples === 1 ? "status.tramples.one" : "status.tramples.other", { n: tramples });
        }
        const selectedPiece = game.board[ui.selected.r][ui.selected.c];
        if (game.turn === "dwarfs" && selectedPiece && selectedPiece.type === PIECES.THUDSTONE) {
          text2 = t("status.koomRockSelected") + " " + text2;
        }
        return text2;
      }
      const hurls = ui.targets.filter((target) => target.kind === "lanzar").length;
      const shoves = ui.targets.filter((target) => target.kind === "empujar").length;
      let text = t(count === 1 ? "status.targets.one" : "status.targets.other", { n: count });
      if (hurls) text += " " + t(hurls === 1 ? "status.hurls.one" : "status.hurls.other", { n: hurls });
      if (shoves) text += " " + t(shoves === 1 ? "status.shoves.one" : "status.shoves.other", { n: shoves });
      return text;
    }
    if (game.mode === "koom") {
      return game.turn === "dwarfs" ? t("status.koomSelectDwarf") : t("status.koomSelectTroll");
    }
    return game.turn === "dwarfs" ? t("status.selectDwarf") : t("status.selectTroll");
  }
  function renderMatchup(session) {
    const element = document.getElementById("matchupBadge");
    if (!element) return;
    if (session.opponent === "ai" && session.humanSide && session.aiSide) {
      element.hidden = false;
      element.textContent = t("matchup.ai", {
        human: t(session.humanSide === "dwarfs" ? "side.dwarfs" : "side.trolls"),
        ai: t(session.aiSide === "dwarfs" ? "side.dwarfs" : "side.trolls")
      });
    } else {
      element.hidden = true;
    }
  }
  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  // resources/script/presentation/resultView.js
  function renderResult(store2) {
    const element = document.getElementById("result");
    if (!element) return;
    const { game } = store2;
    if (!game.result) {
      element.hidden = true;
      element.innerHTML = "";
      return;
    }
    element.hidden = false;
    const { winner, reason, scores } = game.result;
    if (game.mode === "koom") {
      const suffix = winner !== "draw" && reason === "elimination" ? ".elimination" : "";
      element.innerHTML = t("result.koom." + winner + suffix);
      return;
    }
    element.innerHTML = t("result.battle", {
      dwarfs: scores.dwarfs,
      dwarfPts: scores.dwarfPts,
      trolls: scores.trolls,
      trollPts: scores.trollPts,
      verdict: resultVerdict(scores.dwarfPts, scores.trollPts)
    });
  }

  // resources/script/application/store.js
  var store = {
    game: createGame(MODES.CLASSIC),
    session: {
      opponent: "human",
      humanSide: null,
      aiSide: null
    },
    ui: {
      selected: null,
      targets: [],
      busy: false,
      log: []
    },
    ai: {
      thinking: false
    }
  };

  // resources/script/application/gameController.js
  var GameController = class {
    constructor() {
      this.scheduler = createAiScheduler({
        getGame: () => store.game,
        getSession: () => store.session,
        isAiTurn: () => this.isAiTurn(),
        dispatch: (action, options) => this.dispatch(action, options),
        refresh: () => this.refresh(),
        setThinking: (value) => {
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
      const humanSide = opponent === "ai" ? config.humanSide === SIDES.TROLLS ? SIDES.TROLLS : SIDES.DWARFS : null;
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
      return store.ui.targets.find((target) => target.r === r && target.c === c) || null;
    }
    selectPiece(r, c) {
      if (!this.canHumanInteract() || store.game.phase !== "normal") return false;
      const piece = store.game.board[r][c];
      if (!piece || piece.owner !== store.game.turn) return false;
      if (piece.type === PIECES.THUDSTONE && store.game.mode !== MODES.KOOM) return false;
      store.ui.selected = { r, c };
      store.ui.targets = getLegalActions(store.game).filter((action) => sameFrom(action, { r, c })).map(targetFromAction).filter(Boolean);
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
        const action = getLegalActions(store.game).find(
          (item) => item.type === ActionType.CAPTURE && item.cell.r === r && item.cell.c === c
        );
        if (action) void this.dispatch(action);
        return;
      }
      if (store.game.phase === "trample") {
        const target2 = this.getTargetAt(r, c);
        if (target2) void this.dispatch(target2.action);
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
      const legal = getLegalActions(store.game).some((candidate) => sameAction(candidate, action));
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
      if (store.game.phase === "capture" && store.game.pending && store.game.pending.mustCapture && store.game.pending.captured === 0) {
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
        store.ui.targets = store.game.pending.targets.map(targetFromAction).filter(Boolean);
        return;
      }
      if (store.ui.selected) {
        const actions = getLegalActions(store.game).filter((action) => sameFrom(action, store.ui.selected));
        if (!actions.length) {
          store.ui.selected = null;
          store.ui.targets = [];
        } else {
          store.ui.targets = actions.map(targetFromAction).filter(Boolean);
        }
      }
    }
    processEvents(events) {
      const hadMove = events.some(
        (event) => event.type === "pieceMoved" || event.type === "hurl" || event.type === "shove" || event.type === "trample" || event.type === "trollTrapped"
      );
      const hadCapture = events.some(
        (event) => event.type === "captured" || event.type === "hurl" || event.type === "trample" || event.type === "trollTrapped"
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
        let key2 = "log.koomDraw";
        if (result.winner === SIDES.DWARFS) {
          key2 = result.reason === "elimination" ? "log.koomEndDwarfsElimination" : "log.koomEndDwarfs";
        } else if (result.winner === SIDES.TROLLS) {
          key2 = result.reason === "elimination" ? "log.koomEndTrollsElimination" : "log.koomEndTrolls";
        }
        addLog(store, key2, null, true);
        return;
      }
      addLog(store, "log.battleEnd", {
        dwarfPts: result.scores.dwarfPts,
        dwarfs: result.scores.dwarfs,
        trollPts: result.scores.trollPts,
        trolls: result.scores.trolls
      }, true);
    }
  };
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
  var controller = new GameController();

  // resources/script/presentation/input/selection.js
  function bindClicks(controller2) {
    boardEl.addEventListener("click", (event) => {
      const cell = event.target.closest ? event.target.closest(".cell") : null;
      if (!cell) return;
      controller2.onCellClick(Number(cell.dataset.r), Number(cell.dataset.c));
    });
  }

  // resources/script/presentation/input/drag.js
  var DRAG_THRESHOLD = 6;
  function bindDrag(controller2) {
    let drag = null;
    function cellFromPoint(x, y) {
      const element = document.elementFromPoint(x, y);
      return element && element.closest ? element.closest(".cell") : null;
    }
    function targetAt(x, y) {
      const cell = cellFromPoint(x, y);
      if (!cell) return null;
      return controller2.getTargetAt(Number(cell.dataset.r), Number(cell.dataset.c));
    }
    function startDrag(event) {
      drag.active = true;
      document.body.classList.add("dragging");
      controller2.selectPiece(drag.from.r, drag.from.c);
      const sourceCell = cells.get(key(drag.from.r, drag.from.c));
      const sourceEl = sourceCell ? sourceCell.querySelector(".piece") : null;
      const sourceStyle = sourceEl ? getComputedStyle(sourceEl) : null;
      const piece = controller2.getState().game.board[drag.from.r][drag.from.c];
      if (!piece || !sourceEl) {
        drag.active = false;
        return;
      }
      const ghost = pieceEl(piece);
      ghost.classList.add("drag-ghost");
      if (sourceStyle) {
        ghost.style.width = sourceStyle.width;
        ghost.style.height = sourceStyle.height;
        ghost.style.fontSize = sourceStyle.fontSize;
        sourceEl.classList.add("drag-origin");
      }
      document.body.appendChild(ghost);
      drag.ghost = ghost;
      drag.sourceEl = sourceEl;
      moveGhost(event);
    }
    function moveGhost(event) {
      if (!drag.ghost) return;
      drag.ghost.style.left = event.clientX + "px";
      drag.ghost.style.top = event.clientY + "px";
    }
    function startDragMovementSound() {
      if (!drag || drag.moveSoundStarted) return;
      drag.moveSoundStarted = true;
      drag.moveSoundTimer = setTimeout(() => {
        drag.moveSoundTimer = null;
        if (drag && drag.active) playSound("move", { loop: true });
      }, 120);
    }
    function updateDragHover(event) {
      const cell = cellFromPoint(event.clientX, event.clientY);
      if (drag.hoverCell && drag.hoverCell !== cell) {
        drag.hoverCell.classList.remove("drop-hover");
      }
      drag.hoverCell = null;
      if (!cell) return;
      const target = controller2.getTargetAt(Number(cell.dataset.r), Number(cell.dataset.c));
      if (target) {
        cell.classList.add("drop-hover");
        drag.hoverCell = cell;
      }
    }
    function cleanupDrag() {
      if (!drag) return;
      if (drag.moveSoundTimer) clearTimeout(drag.moveSoundTimer);
      if (drag.moveSoundStarted) stopSound("move");
      if (drag.ghost) drag.ghost.remove();
      if (drag.hoverCell) drag.hoverCell.classList.remove("drop-hover");
      if (drag.sourceEl) drag.sourceEl.classList.remove("drag-origin");
      document.body.classList.remove("dragging");
      drag = null;
    }
    function suppressNextClick(sourceCell, dropCell) {
      const handler = (event) => {
        const clickedCell = event.target.closest ? event.target.closest(".cell") : null;
        if (clickedCell && clickedCell !== sourceCell && clickedCell !== dropCell) {
          remove();
          return;
        }
        event.stopPropagation();
        event.preventDefault();
        remove();
      };
      const remove = () => document.removeEventListener("click", handler, true);
      document.addEventListener("click", handler, true);
      setTimeout(remove, 250);
    }
    function onPointerDown(event) {
      if (event.button !== 0 || event.pointerType === "touch") return;
      const cell = event.target.closest ? event.target.closest(".cell") : null;
      if (!cell) return;
      const r = Number(cell.dataset.r);
      const c = Number(cell.dataset.c);
      if (!controller2.canStartDrag(r, c)) return;
      drag = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        from: { r, c },
        active: false,
        ghost: null,
        sourceEl: null,
        hoverCell: null,
        moveSoundStarted: false,
        moveSoundTimer: null
      };
    }
    function onPointerMove(event) {
      if (!drag || event.pointerId !== drag.pointerId) return;
      if (!drag.active) {
        const dx = event.clientX - drag.startX;
        const dy = event.clientY - drag.startY;
        if (dx * dx + dy * dy < DRAG_THRESHOLD * DRAG_THRESHOLD) return;
        startDrag(event);
        startDragMovementSound();
      }
      if (!drag.active) return;
      event.preventDefault();
      moveGhost(event);
      updateDragHover(event);
    }
    function onPointerUp(event) {
      if (!drag || event.pointerId !== drag.pointerId) return;
      const active = drag.active;
      const target = active ? targetAt(event.clientX, event.clientY) : null;
      const sourceCell = drag.sourceEl ? drag.sourceEl.closest(".cell") : null;
      const dropCell = active ? cellFromPoint(event.clientX, event.clientY) : null;
      cleanupDrag();
      if (!active) return;
      suppressNextClick(sourceCell, dropCell);
      if (target) {
        void controller2.dispatch(target.action);
      } else {
        controller2.clearSelection(false);
        playSound("putdown");
      }
    }
    function cancelDrag() {
      if (!drag) return;
      const active = drag.active;
      cleanupDrag();
      if (active) {
        controller2.clearSelection(false);
        playSound("putdown");
      }
    }
    function onPointerCancel(event) {
      if (!drag || event.pointerId !== drag.pointerId) return;
      cancelDrag();
    }
    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerCancel);
    window.addEventListener("blur", cancelDrag);
    return { cancelDrag };
  }

  // resources/script/presentation/input/index.js
  function bindInput(controller2) {
    bindClicks(controller2);
    return bindDrag(controller2);
  }

  // resources/script/presentation/modals.js
  var modeModal = document.getElementById("modeModal");
  var helpModal = document.getElementById("helpModal");
  var confirmModal = document.getElementById("confirmModal");
  var confirmTitleEl = document.getElementById("confirmTitle");
  var confirmTextEl = document.getElementById("confirmText");
  var confirmOkEl = document.getElementById("confirmOk");
  var activeModal = null;
  var lastFocused = null;
  var confirmResolver = null;
  var selection = { mode: MODES.CLASSIC, opponent: "human", side: SIDES.DWARFS };
  function openModal(modal) {
    if (!modal || activeModal) return;
    lastFocused = document.activeElement;
    activeModal = modal;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    setBackgroundInert(true);
    const focusable = modal.querySelector(".mode-option, .modal-close, .modal-actions .btn");
    if (focusable) focusable.focus();
  }
  function closeModal(modal) {
    if (!modal || modal !== activeModal) return;
    modal.hidden = true;
    activeModal = null;
    document.body.classList.remove("modal-open");
    setBackgroundInert(false);
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    lastFocused = null;
  }
  function setBackgroundInert(value) {
    for (const selector of [".head", ".layout"]) {
      const element = document.querySelector(selector);
      if (element) element.inert = value;
    }
  }
  var FOCUSABLE = "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Tab" || !activeModal) return;
    const focusable = Array.from(activeModal.querySelectorAll(FOCUSABLE)).filter((element) => element.getClientRects().length > 0);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const current2 = document.activeElement;
    if (event.shiftKey && (current2 === first || !activeModal.contains(current2))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (current2 === last || !activeModal.contains(current2))) {
      event.preventDefault();
      first.focus();
    }
  });
  function openModeModal(initial = {}) {
    selection = {
      mode: initial.mode === MODES.KOOM ? MODES.KOOM : MODES.CLASSIC,
      opponent: initial.opponent === "ai" ? "ai" : "human",
      side: initial.side === SIDES.TROLLS ? SIDES.TROLLS : SIDES.DWARFS
    };
    renderModeSelection();
    openModal(modeModal);
  }
  function getSelection() {
    return { ...selection };
  }
  function selectMode(mode) {
    if (activeModal !== modeModal) return;
    selection.mode = mode === MODES.KOOM ? MODES.KOOM : MODES.CLASSIC;
    renderModeSelection();
  }
  function selectOpponent(opponent) {
    if (activeModal !== modeModal) return;
    selection.opponent = opponent === "ai" ? "ai" : "human";
    renderModeSelection();
  }
  function selectSide(side) {
    if (activeModal !== modeModal) return;
    selection.side = side === SIDES.TROLLS ? SIDES.TROLLS : SIDES.DWARFS;
    renderModeSelection();
  }
  function renderModeSelection() {
    setSelected("modeClassic", selection.mode === MODES.CLASSIC);
    setSelected("modeKoom", selection.mode === MODES.KOOM);
    setSelected("opponentHuman", selection.opponent === "human");
    setSelected("opponentAi", selection.opponent === "ai");
    setSelected("sideDwarfs", selection.side === SIDES.DWARFS);
    setSelected("sideTrolls", selection.side === SIDES.TROLLS);
    const sideSection = document.getElementById("sideSection");
    if (sideSection) sideSection.hidden = selection.opponent !== "ai";
  }
  function setSelected(id, selected) {
    const element = document.getElementById(id);
    if (!element) return;
    element.classList.toggle("selected", selected);
    element.setAttribute("aria-pressed", String(selected));
  }
  function askConfirm(title, text, okLabel) {
    if (activeModal) return Promise.resolve(false);
    confirmTitleEl.textContent = title;
    confirmTextEl.textContent = text;
    confirmOkEl.textContent = okLabel || "Confirmar";
    openModal(confirmModal);
    return new Promise((resolve) => {
      confirmResolver = resolve;
    });
  }
  function settleConfirm(value) {
    if (!confirmResolver) return;
    const resolve = confirmResolver;
    confirmResolver = null;
    closeModal(confirmModal);
    resolve(value);
  }

  // resources/script/app.js
  function bindEvents() {
    document.getElementById("modeClassic").addEventListener("click", () => selectMode(MODES.CLASSIC));
    document.getElementById("modeKoom").addEventListener("click", () => selectMode(MODES.KOOM));
    document.getElementById("opponentHuman").addEventListener("click", () => selectOpponent("human"));
    document.getElementById("opponentAi").addEventListener("click", () => selectOpponent("ai"));
    document.getElementById("sideDwarfs").addEventListener("click", () => selectSide("dwarfs"));
    document.getElementById("sideTrolls").addEventListener("click", () => selectSide("trolls"));
    document.getElementById("startGameBtn").addEventListener("click", () => {
      if (activeModal !== modeModal) return;
      const selection2 = getSelection();
      closeModal(modeModal);
      controller.startGame({
        mode: selection2.mode,
        opponent: selection2.opponent,
        humanSide: selection2.side
      });
    });
    document.getElementById("helpBtn").addEventListener("click", () => openModal(helpModal));
    document.getElementById("confirmOk").addEventListener("click", () => settleConfirm(true));
    document.getElementById("confirmCancel").addEventListener("click", () => settleConfirm(false));
    document.querySelectorAll(".modal [data-close]").forEach((element) => {
      element.addEventListener("click", () => {
        const modal = element.closest(".modal");
        if (modal === confirmModal) settleConfirm(false);
        else closeModal(modal);
      });
    });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !activeModal) return;
      if (activeModal === modeModal) return;
      if (activeModal === confirmModal) settleConfirm(false);
      else closeModal(activeModal);
    });
    document.addEventListener(LANGUAGE_CHANGE_EVENT, () => {
      controller.refresh();
    });
    document.getElementById("langBtn").addEventListener("click", () => {
      void switchLanguage(getLang() === "es" ? "en" : "es");
    });
    document.getElementById("endTurnBtn").addEventListener("click", () => {
      if (activeModal) return;
      controller.endTurn();
    });
    document.getElementById("finalizeBtn").addEventListener("click", async () => {
      if (activeModal || !controller.canHumanInteract()) return;
      const ok = await askConfirm(
        t("confirm.finalize.title"),
        t(store.game.mode === MODES.KOOM ? "confirm.finalize.koom.text" : "confirm.finalize.text"),
        t("btn.finalize")
      );
      if (!ok || store.game.result) return;
      controller.finalize();
    });
    document.getElementById("newBattleBtn").addEventListener("click", async () => {
      if (activeModal || controller.isBusy()) return;
      if (!store.game.result) {
        const ok = await askConfirm(
          t("confirm.new.title"),
          t("confirm.new.text"),
          t("btn.restart")
        );
        if (!ok) return;
      }
      controller.cancel();
      openModeModal({
        mode: store.game.mode,
        opponent: store.session.opponent,
        side: store.session.humanSide || "dwarfs"
      });
    });
  }
  async function init() {
    buildGrid();
    bindInput(controller);
    try {
      await loadLocale(preferredLanguage());
    } catch (err) {
      console.error("No se pudieron cargar las traducciones:", err);
      document.getElementById("status").textContent = "No se pudieron cargar las traducciones. Revis\xE1 resources/i18n/. / Could not load translations. Check resources/i18n/.";
      return;
    }
    applyTranslations();
    controller.startGame({ mode: MODES.CLASSIC, opponent: "human" });
    openModeModal({
      mode: store.game.mode,
      opponent: store.session.opponent,
      side: store.session.humanSide || "dwarfs"
    });
  }

  // resources/script/module.js
  bindEvents();
  init();
})();
