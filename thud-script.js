"use strict";

const N = 15;
const DIRS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

/* Tablero octagonal: 15x15 menos un triángulo de 15 casillas (5+4+3+2+1)
   en cada esquina. Equivale a exigir r+c>=5, r+(14-c)>=5, etc. */
function inBoard(r, c){
  return r >= 0 && r < N && c >= 0 && c < N &&
         r + c >= 5 &&
         r + (N - 1 - c) >= 5 &&
         (N - 1 - r) + c >= 5 &&
         (N - 1 - r) + (N - 1 - c) >= 5;
}

/* Casilla del borde exterior: algún vecino ortogonal no pertenece al tablero. */
function isPerimeter(r, c){
  return !inBoard(r-1,c) || !inBoard(r+1,c) || !inBoard(r,c-1) || !inBoard(r,c+1);
}

const empty = () => ({ type:null, owner:null });
const key = (r, c) => r + "," + c;
const coord = p => String.fromCharCode(65 + p.c) + (p.r + 1);

const state = {
  board: [],
  turn: "dwarfs",
  phase: "normal",        // normal | capture
  selected: null,         // {r,c}
  targets: [],            // {r,c,kind,from?,line?}
  captureCells: [],       // enanos capturables tras mover un troll
  mustCapture: false,
  captured: 0,
  over: false,
  log: [],
  totals: { dwarfs: 0, trolls: 0 },
  battles: 0
};

const boardEl = document.getElementById("board");
const cells = new Map();

function pieceEl(p){
  const el = document.createElement("div");
  el.className = "piece " + p.type;
  if (p.type === "dwarf") el.textContent = "d";
  else if (p.type === "troll") el.textContent = "T";
  else if (p.type === "thudstone"){
    const s = document.createElement("span");
    s.textContent = "X";
    el.appendChild(s);
  }
  return el;
}

function buildGrid(){
  boardEl.innerHTML = "";
  cells.clear();
  for (let r = 0; r < N; r++){
    for (let c = 0; c < N; c++){
      if (!inBoard(r, c)) continue;
      const el = document.createElement("div");
      el.className = "cell";
      el.style.gridRow = String(r + 1);
      el.style.gridColumn = String(c + 1);
      el.dataset.r = String(r);
      el.dataset.c = String(c);
      el.addEventListener("click", () => onCellClick(r, c));
      boardEl.appendChild(el);
      cells.set(key(r, c), el);
    }
  }
}

function render(){
  for (let r = 0; r < N; r++){
    for (let c = 0; c < N; c++){
      if (!inBoard(r, c)) continue;
      const el = cells.get(key(r, c));
      el.className = "cell";

      if (state.selected && state.selected.r === r && state.selected.c === c){
        el.classList.add("selected");
      }

      const tgt = state.targets.find(t => t.r === r && t.c === c);
      if (tgt) el.classList.add("tgt-" + tgt.kind);

      if (state.phase === "capture" &&
          state.captureCells.some(p => p.r === r && p.c === c)){
        el.classList.add("capture");
      }

      el.innerHTML = "";
      const p = state.board[r][c];
      if (p && p.type) el.appendChild(pieceEl(p));
    }
  }
}

/* ---------- PREPARACIÓN ---------- */
function setupBoard(){
  state.board = [];
  for (let r = 0; r < N; r++){
    state.board[r] = [];
    for (let c = 0; c < N; c++){
      state.board[r][c] = inBoard(r, c) ? empty() : null;
    }
  }

  // Thudstone en el centro
  state.board[7][7] = { type:"thudstone", owner:null };

  // 8 trolls en las casillas ortogonal y diagonalmente adyacentes al centro
  for (const [dr, dc] of DIRS){
    state.board[7 + dr][7 + dc] = { type:"troll", owner:"trolls" };
  }

  // 32 enanos en el borde exterior, salvo las 4 casillas alineadas con el centro
  let placed = 0;
  for (let r = 0; r < N; r++){
    for (let c = 0; c < N; c++){
      if (!inBoard(r, c) || !isPerimeter(r, c)) continue;
      const aligned = (r === 7 && (c === 0 || c === 14)) ||
                      (c === 7 && (r === 0 || r === 14));
      if (aligned) continue;
      state.board[r][c] = { type:"dwarf", owner:"dwarfs" };
      placed++;
    }
  }
  console.assert(placed === 32, "Enanos colocados:", placed);

  state.turn = "dwarfs";
  state.phase = "normal";
  state.selected = null;
  state.targets = [];
  state.captureCells = [];
  state.mustCapture = false;
  state.captured = 0;
  state.over = false;
  state.log = [];
  document.getElementById("result").hidden = true;

  log("Comienza la batalla. Los enanos mueven primero.");
  render();
  updateUI();
}

/* ---------- MOVIMIENTOS POSIBLES ---------- */
function dwarfTargets(r, c){
  const out = [];

  // Mover como dama: solo a casillas vacías (no captura al mover)
  for (const [dr, dc] of DIRS){
    let rr = r + dr, cc = c + dc;
    while (inBoard(rr, cc)){
      if (state.board[rr][cc].type) break;
      out.push({ r:rr, c:cc, kind:"move" });
      rr += dr; cc += dc;
    }
  }

  // Hurl: línea de enanos adyacentes; se lanza el enano frontal.
  // Distancia máxima = número de enanos de la línea (L).
  for (const [dr, dc] of DIRS){
    let fd = 0;
    while (true){
      const rr = r + (fd + 1) * dr, cc = c + (fd + 1) * dc;
      if (!inBoard(rr, cc) || state.board[rr][cc].type !== "dwarf") break;
      fd++;
    }
    let bd = 0;
    while (true){
      const rr = r - (bd + 1) * dr, cc = c - (bd + 1) * dc;
      if (!inBoard(rr, cc) || state.board[rr][cc].type !== "dwarf") break;
      bd++;
    }
    const line = fd + bd + 1;
    const lr = r + fd * dr, lc = c + fd * dc;   // enano frontal
    for (let k = 1; k <= line; k++){
      const rr = lr + k * dr, cc = lc + k * dc;
      if (!inBoard(rr, cc)) break;
      const cell = state.board[rr][cc];
      if (!cell.type) continue;                  // casilla vacía: sigue volando
      if (cell.type === "troll"){
        out.push({ r:rr, c:cc, kind:"hurl", from:{ r:lr, c:lc }, line });
      }
      break;                                     // cualquier otra pieza bloquea
    }
  }
  return out;
}

function trollTargets(r, c){
  const out = [];

  // Mover como rey: una casilla, a casilla vacía
  for (const [dr, dc] of DIRS){
    const rr = r + dr, cc = c + dc;
    if (inBoard(rr, cc) && !state.board[rr][cc].type){
      out.push({ r:rr, c:cc, kind:"move" });
    }
  }

  // Shove: línea de trolls por detrás; el troll del extremo avanza hasta L casillas
  const moveKeys = new Set(out.map(t => key(t.r, t.c)));
  for (const [dr, dc] of DIRS){
    let b = 0;
    while (true){
      const rr = r - (b + 1) * dr, cc = c - (b + 1) * dc;
      if (!inBoard(rr, cc) || state.board[rr][cc].type !== "troll") break;
      b++;
    }
    if (b < 1) continue;                         // hace falta una línea de trolls
    const line = b + 1;
    for (let k = 1; k <= line; k++){
      const rr = r + k * dr, cc = c + k * dc;
      if (!inBoard(rr, cc)) break;
      if (state.board[rr][cc].type) break;       // no puede aterrizar sobre una pieza
      if (moveKeys.has(key(rr, cc))) continue;   // ya ofrecido como movimiento normal
      const caps = adjacentDwarfs(rr, cc);
      if (caps.length){
        out.push({ r:rr, c:cc, kind:"shove", caps, line });
      }
    }
  }
  return out;
}

function adjacentDwarfs(r, c){
  const out = [];
  for (const [dr, dc] of DIRS){
    const rr = r + dr, cc = c + dc;
    if (inBoard(rr, cc) && state.board[rr][cc].type === "dwarf"){
      out.push({ r:rr, c:cc });
    }
  }
  return out;
}

/* ---------- INTERACCIÓN ---------- */
function onCellClick(r, c){
  if (state.over) return;

  // Fase de captura de los trolls: clic en enanos adyacentes para eliminarlos
  if (state.phase === "capture"){
    if (state.captureCells.some(p => p.r === r && p.c === c)){
      doCapture(r, c);
    }
    return;
  }

  const piece = state.board[r][c];

  // Volver a pulsar la pieza seleccionada la deselecciona
  if (state.selected && state.selected.r === r && state.selected.c === c){
    clearSelection();
    return;
  }

  // Ejecutar un destino marcado
  const tgt = state.targets.find(t => t.r === r && t.c === c);
  if (tgt){
    executeTarget(tgt);
    return;
  }

  // Seleccionar una pieza propia
  if (piece && piece.type && piece.owner === state.turn){
    state.selected = { r, c };
    state.targets = state.turn === "dwarfs"
      ? dwarfTargets(r, c)
      : trollTargets(r, c);
    render();
    updateUI();
    return;
  }

  clearSelection();
}

function clearSelection(){
  state.selected = null;
  state.targets = [];
  render();
  updateUI();
}

function executeTarget(tgt){
  const from = state.selected;

  if (state.turn === "dwarfs"){
    if (tgt.kind === "move"){
      movePiece(from, tgt);
      log("Enano " + coord(from) + " \u2192 " + coord(tgt) + ".");
      endTurn();
    } else {
      // Hurl: el enano frontal vuela, el troll desaparece y el enano ocupa su casilla
      const lead = tgt.from;
      state.board[tgt.r][tgt.c] = empty();
      state.board[lead.r][lead.c] = empty();
      state.board[tgt.r][tgt.c] = { type:"dwarf", owner:"dwarfs" };
      log("Hurl: enano de " + coord(lead) + " captura un troll en " + coord(tgt) + ".", true);
      endTurn();
    }
    return;
  }

  if (tgt.kind === "move"){
    movePiece(from, tgt);
    log("Troll " + coord(from) + " \u2192 " + coord(tgt) + ".");
    startCapture(false, tgt);
  } else {
    movePiece(from, tgt);
    log("Shove: trolls empujan, troll de " + coord(from) + " \u2192 " + coord(tgt) + ".", true);
    startCapture(true, tgt);
  }
}

function movePiece(from, to){
  state.board[to.r][to.c] = state.board[from.r][from.c];
  state.board[from.r][from.c] = empty();
}

/* Tras mover un troll, se abre la fase de captura de enanos adyacentes. */
function startCapture(required, pos){
  state.selected = null;
  state.targets = [];
  state.phase = "capture";
  state.captureCells = adjacentDwarfs(pos.r, pos.c);
  state.mustCapture = required;
  state.captured = 0;

  if (state.captureCells.length === 0){
    endTurn();                     // sin enanos adyacentes: el turno acaba
    return;
  }
  render();
  updateUI();
}

function doCapture(r, c){
  state.board[r][c] = empty();
  state.captureCells = state.captureCells.filter(p => !(p.r === r && p.c === c));
  state.captured++;
  log("Troll captura un enano en " + coord({ r, c }) + ".");

  if (state.captureCells.length === 0){
    endTurn();                     // no quedan capturas posibles
  } else {
    render();
    updateUI();
  }
}

/* ---------- TURNOS Y FIN DE BATALLA ---------- */
function endTurn(){
  state.phase = "normal";
  state.selected = null;
  state.targets = [];
  state.captureCells = [];
  state.mustCapture = false;
  state.captured = 0;

  state.turn = state.turn === "dwarfs" ? "trolls" : "dwarfs";

  render();

  if (checkBattleOver()) return;

  log("Turno de los " + (state.turn === "dwarfs" ? "enanos." : "trolls."));
  updateUI();
}

function countType(type){
  let n = 0;
  for (let r = 0; r < N; r++){
    for (let c = 0; c < N; c++){
      const p = state.board[r][c];
      if (p && p.type === type) n++;
    }
  }
  return n;
}

function hasAnyMove(player){
  for (let r = 0; r < N; r++){
    for (let c = 0; c < N; c++){
      const p = state.board[r][c];
      if (!p || p.owner !== player) continue;
      const list = player === "dwarfs" ? dwarfTargets(r, c) : trollTargets(r, c);
      if (list.length) return true;
    }
  }
  return false;
}

function checkBattleOver(){
  const dwarfs = countType("dwarf");
  const trolls = countType("troll");
  if (dwarfs === 0 || trolls === 0 || !hasAnyMove(state.turn)){
    finishBattle(dwarfs, trolls);
    return true;
  }
  return false;
}

function finishBattle(dwarfs, trolls){
  state.over = true;
  const dwarfPts = dwarfs;          // 1 punto por enano vivo
  const trollPts = trolls * 4;      // 4 puntos por troll vivo

  state.totals.dwarfs += dwarfPts;
  state.totals.trolls += trollPts;
  state.battles++;

  const diff = trollPts - dwarfPts;
  let verdict;
  if (diff > 0) verdict = "Ventaja de los trolls por " + diff + (diff === 1 ? " punto." : " puntos.");
  else if (diff < 0) verdict = "Ventaja de los enanos por " + (-diff) + (diff === -1 ? " punto." : " puntos.");
  else verdict = "Empate.";

  log("Fin de la batalla \u2014 enanos: " + dwarfPts + " pts (" + dwarfs +
      "), trolls: " + trollPts + " pts (" + trolls + "). " + verdict, true);

  const result = document.getElementById("result");
  result.hidden = false;
  result.innerHTML =
    "<strong>Fin de la batalla</strong><br>" +
    "Enanos: " + dwarfs + " piezas vivas \u2192 " + dwarfPts + " pts<br>" +
    "Trolls: " + trolls + " piezas vivas \u2192 " + trollPts + " pts<br>" +
    "<strong>" + verdict + "</strong>";

  render();
  updateUI();
}

/* ---------- INTERFAZ ---------- */
function updateUI(){
  const dwarfs = countType("dwarf");
  const trolls = countType("troll");

  document.getElementById("dwarfCount").textContent = dwarfs;
  document.getElementById("trollCount").textContent = trolls;
  document.getElementById("dwarfPts").textContent = dwarfs;
  document.getElementById("trollPts").textContent = trolls * 4;

  const turnEl = document.getElementById("turn");
  turnEl.textContent = state.turn === "dwarfs" ? "Turno de los Enanos" : "Turno de los Trolls";
  turnEl.className = "turn " + (state.turn === "dwarfs" ? "dwarfs" : "trolls");

  const statusEl = document.getElementById("status");
  if (state.over){
    statusEl.textContent = "La batalla ha terminado. Pulsa \u00abNueva batalla\u00bb para jugar otra.";
  } else if (state.phase === "capture"){
    statusEl.textContent = state.mustCapture
      ? "Shove: debes capturar al menos un enano adyacente. Luego termina el turno."
      : "Captura opcional: pulsa los enanos adyacentes que quieras eliminar.";
  } else if (state.selected){
    const n = state.targets.length;
    const hurls = state.targets.filter(t => t.kind === "hurl").length;
    const shoves = state.targets.filter(t => t.kind === "shove").length;
    if (!n){
      statusEl.textContent = "Esa pieza no tiene jugadas legales. Selecciona otra.";
    } else {
      let txt = n + (n === 1 ? " destino disponible." : " destinos disponibles.");
      if (hurls) txt += " " + hurls + (hurls === 1 ? " hurl" : " hurls") + " posible" + (hurls === 1 ? "" : "s") + ".";
      if (shoves) txt += " " + shoves + (shoves === 1 ? " shove" : " shoves") + " posible" + (shoves === 1 ? "" : "s") + ".";
      statusEl.textContent = txt;
    }
  } else {
    statusEl.textContent = state.turn === "dwarfs"
      ? "Selecciona un enano para mover o lanzar (hurl)."
      : "Selecciona un troll para mover o empujar (shove).";
  }

  const btn = document.getElementById("endTurnBtn");
  const show = state.phase === "capture" && !state.over;
  btn.hidden = !show;
  btn.disabled = state.mustCapture && state.captured === 0;
  btn.textContent = (state.mustCapture && state.captured === 0)
    ? "Captura obligatoria"
    : "Terminar turno";

  document.getElementById("finalizeBtn").hidden = state.over;

  const totalsEl = document.getElementById("totals");
  if (state.battles > 0){
    totalsEl.hidden = false;
    totalsEl.innerHTML =
      "<strong>Acumulado en " + state.battles +
      (state.battles === 1 ? " batalla" : " batallas") + "</strong><br>" +
      "Enanos: " + state.totals.dwarfs + " pts \u00b7 Trolls: " + state.totals.trolls + " pts";
  } else {
    totalsEl.hidden = true;
  }
}

function log(text, highlight){
  state.log.push({ text, highlight: !!highlight });
  if (state.log.length > 60) state.log.shift();
  renderLog();
}

function renderLog(){
  const ol = document.getElementById("log");
  ol.innerHTML = "";
  const items = state.log.slice(-9);
  for (const entry of items){
    const li = document.createElement("li");
    li.textContent = entry.text;
    if (entry.highlight) li.className = "hl";
    ol.appendChild(li);
  }
  ol.scrollTop = ol.scrollHeight;
}

/* ---------- BOTONES ---------- */
document.getElementById("endTurnBtn").addEventListener("click", () => {
  if (state.over) return;
  if (state.phase !== "capture") return;
  if (state.mustCapture && state.captured === 0) return;
  endTurn();
});

document.getElementById("finalizeBtn").addEventListener("click", () => {
  if (state.over) return;
  if (!confirm("\u00bfFinalizar la batalla y contar los puntos?")) return;
  finishBattle(countType("dwarf"), countType("troll"));
});

document.getElementById("newBattleBtn").addEventListener("click", () => {
  if (!state.over && !confirm("\u00bfReiniciar la batalla actual?")) return;
  setupBoard();
});

/* ---------- ARRANQUE ---------- */
buildGrid();
setupBoard();
