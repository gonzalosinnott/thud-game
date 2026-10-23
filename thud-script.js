"use strict";

/* ---------- INTERNACIONALIZACIÓN ---------- */
const LOCALES = ["es", "en"];
let currentLang = "es";
let messages = {};

function parseProperties(text){
  const out = {};
  for (const rawLine of text.split(/\r?\n/)){
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || line.startsWith("!")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    value = value.replace(/\\n/g, "\n").replace(/\\t/g, "\t");
    out[key] = value;
  }
  return out;
}

async function loadLocale(lang){
  const embedded = (window.THUD_EMBEDDED_PROPERTIES || {})[lang];

  // file:// bloquea fetch por CORS. En ese caso usamos la copia embebida.
  if (location.protocol === "file:"){
    if (!embedded) throw new Error("No hay traducciones embebidas para " + lang);
    messages = parseProperties(embedded);
    currentLang = lang;
    return;
  }

  try {
    const res = await fetch("resources/i18n/" + lang + ".properties", { cache: "no-store" });
    if (!res.ok) throw new Error("No se pudo cargar " + lang + ".properties (HTTP " + res.status + ")");
    messages = parseProperties(await res.text());
    currentLang = lang;
  } catch (err) {
    // Si el servidor no tiene los .properties, seguimos funcionando con la copia embebida.
    if (!embedded) throw err;
    console.warn("No se pudo cargar " + lang + ".properties; se usan las traducciones embebidas.", err);
    messages = parseProperties(embedded);
    currentLang = lang;
  }
}

function t(key, params){
  let text = Object.prototype.hasOwnProperty.call(messages, key) ? messages[key] : key;
  if (params){
    text = text.replace(/\{(\w+)\}/g, (match, name) =>
      Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match
    );
  }
  return text;
}

function applyTranslations(){
  document.documentElement.lang = currentLang;
  document.title = t("app.title");

  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-html]").forEach(el => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  document.querySelectorAll("[data-i18n-aria]").forEach(el => {
    el.setAttribute("aria-label", t(el.dataset.i18nAria));
  });
  document.querySelectorAll("[data-i18n-title]").forEach(el => {
    el.setAttribute("title", t(el.dataset.i18nTitle));
  });

  const langBtn = document.getElementById("langBtn");
  langBtn.textContent = currentLang.toUpperCase();
  langBtn.setAttribute("aria-label", t("lang.switch"));
  langBtn.setAttribute("title", t("lang.switch"));
}

function preferredLanguage(){
  try {
    const saved = localStorage.getItem("thud.lang");
    if (LOCALES.includes(saved)) return saved;
  } catch (err) { /* localStorage puede no estar disponible */ }
  return "es";
}

async function switchLanguage(lang){
  if (lang === currentLang) return;
  const btn = document.getElementById("langBtn");
  btn.disabled = true;
  try {
    await loadLocale(lang);
    try { localStorage.setItem("thud.lang", lang); } catch (err) { /* sin persistencia */ }
    applyTranslations();
    updateUI();
    renderLog();
    if (state.over) renderResult(countType("dwarf"), countType("troll"));
  } catch (err) {
    console.error("No se pudo cambiar el idioma:", err);
  } finally {
    btn.disabled = false;
  }
}

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
  mode: "classic",        // classic | koom
  board: [],
  turn: "dwarfs",
  phase: "normal",        // normal | capture | trample
  selected: null,         // {r,c}
  targets: [],            // {r,c,kind,from?,line?}
  captureCells: [],       // enanos capturables tras mover un troll
  mustCapture: false,
  captured: 0,
  over: false,
  koomWinner: null,       // dwarfs | trolls | draw
  log: [],
  totals: { dwarfs: 0, trolls: 0 },
  battles: 0
};

const boardEl = document.getElementById("board");
const cells = new Map();

/* ---------- SONIDOS ---------- */
const SOUND_VOLUME = { pickup: .55, putdown: .6, move: .32, thud: .7 };
const soundPlayers = {
  pickup: new Audio("resources/assets/pick-up.mp3"),
  putdown: new Audio("resources/assets/put-down.mp3"),
  move: new Audio("resources/assets/piece-movement.mp3"),
  thud: new Audio("resources/assets/thud.mp3")
};

for (const [name, audio] of Object.entries(soundPlayers)){
  audio.preload = "auto";
  audio.volume = SOUND_VOLUME[name];
}

function playSound(name, { loop = false } = {}){
  const audio = soundPlayers[name];
  if (!audio) return;
  audio.loop = loop;
  try {
    audio.currentTime = 0;
    const playback = audio.play();
    if (playback && typeof playback.catch === "function"){
      playback.catch(() => { /* el navegador bloqueó el audio */ });
    }
  } catch (err) {
    /* audio no disponible */
  }
}

function stopSound(name){
  const audio = soundPlayers[name];
  if (!audio || audio.paused) return;
  try {
    audio.pause();
    audio.currentTime = 0;
  } catch (err) {
    /* audio no disponible */
  }
}

function pieceEl(p){
  const el = document.createElement("div");
  el.className = "piece " + p.type;
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

      if (state.mode === "koom" && r === 0 && c >= 5 && c <= 9){
        el.classList.add("koom-goal");
      }

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

      const canDrag = !state.over && state.phase === "normal" &&
        p && (p.type !== "thudstone" || state.mode === "koom") &&
        p.owner === state.turn;
      if (canDrag) el.classList.add("draggable");
    }
  }
}

/* ---------- PREPARACIÓN ---------- */
function setupBoard(mode = state.mode){
  cancelMoveAnimation();
  state.mode = mode === "koom" ? "koom" : "classic";

  state.board = [];
  for (let r = 0; r < N; r++){
    state.board[r] = [];
    for (let c = 0; c < N; c++){
      state.board[r][c] = inBoard(r, c) ? empty() : null;
    }
  }

  if (state.mode === "koom") setupKoomPieces();
  else setupClassicPieces();

  state.turn = "dwarfs";
  state.phase = "normal";
  state.selected = null;
  state.targets = [];
  state.captureCells = [];
  state.mustCapture = false;
  state.captured = 0;
  state.over = false;
  state.koomWinner = null;
  state.log = [];
  document.getElementById("result").hidden = true;

  log(state.mode === "koom" ? "log.koomStart" : "log.battleStart");
  render();
  updateUI();
}

function setupClassicPieces(){
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
}

/* Valle de Koom: la roca empieza en el centro, los trolls forman una cuña
   cerca del lado objetivo y los enanos defienden la mitad inferior. */
function setupKoomPieces(){
  state.board[7][7] = { type:"thudstone", owner:"dwarfs" };

  const trolls = [
    [1,5], [1,7], [1,9],
    [2,4], [2,5], [2,7], [2,9], [2,10]
  ];
  for (const [r, c] of trolls){
    state.board[r][c] = { type:"troll", owner:"trolls" };
  }

  const dwarfs = [
    [8,7],
    [9,0], [9,14],
    [10,1], [10,13],
    [11,2], [11,12],
    [12,3], [12,11],
    [13,4], [13,10],
    [14,5], [14,6], [14,7], [14,8], [14,9]
  ];
  for (const [r, c] of dwarfs){
    state.board[r][c] = { type:"dwarf", owner:"dwarfs" };
  }
  console.assert(trolls.length === 8 && dwarfs.length === 16, "Piezas de Koom:", trolls.length, dwarfs.length);
}

/* ---------- MOVIMIENTOS POSIBLES ---------- */
function dwarfTargets(r, c){
  if (state.mode === "koom"){
    const p = state.board[r][c];
    if (p && p.type === "thudstone") return rockTargets(r, c);
    return dwarfTargetsKoom(r, c);
  }
  return dwarfTargetsClassic(r, c);
}

function trollTargets(r, c){
  return state.mode === "koom" ? trollTargetsKoom(r, c) : trollTargetsClassic(r, c);
}

function dwarfTargetsClassic(r, c){
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

  // Lanzar: línea de enanos adyacentes; se lanza el enano frontal.
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
        out.push({ r:rr, c:cc, kind:"lanzar", from:{ r:lr, c:lc }, line });
      }
      break;                                     // cualquier otra pieza bloquea
    }
  }
  return out;
}

function trollTargetsClassic(r, c){
  const out = [];

  // Mover como rey: una casilla, a casilla vacía
  for (const [dr, dc] of DIRS){
    const rr = r + dr, cc = c + dc;
    if (inBoard(rr, cc) && !state.board[rr][cc].type){
      out.push({ r:rr, c:cc, kind:"move" });
    }
  }

  // Empujar: línea de trolls por detrás; el troll del extremo avanza hasta L casillas
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
        out.push({ r:rr, c:cc, kind:"empujar", caps, line });
      }
    }
  }
  return out;
}

/* Koom: los enanos mueven como dama, sin lanzar. */
function dwarfTargetsKoom(r, c){
  const out = [];
  for (const [dr, dc] of DIRS){
    let rr = r + dr, cc = c + dc;
    while (inBoard(rr, cc)){
      if (state.board[rr][cc].type) break;
      out.push({ r:rr, c:cc, kind:"move" });
      rr += dr; cc += dc;
    }
  }
  return out;
}

/* Koom: la roca se mueve una casilla y debe empezar y terminar junto a un enano. */
function rockTargets(r, c){
  const out = [];
  if (!adjacentDwarfs(r, c).length) return out;

  for (const [dr, dc] of DIRS){
    const rr = r + dr, cc = c + dc;
    if (!inBoard(rr, cc) || state.board[rr][cc].type) continue;
    if (adjacentDwarfs(rr, cc).length){
      out.push({ r:rr, c:cc, kind:"move" });
    }
  }
  return out;
}

/* Koom: los trolls avanzan hasta 3 casillas o pisotean a un enano adyacente. */
function trollTargetsKoom(r, c){
  const out = [];

  for (const [dr, dc] of DIRS){
    for (let k = 1; k <= 3; k++){
      const rr = r + dr * k, cc = c + dc * k;
      if (!inBoard(rr, cc)) break;
      if (state.board[rr][cc].type) break;
      out.push({ r:rr, c:cc, kind:"move" });
    }
  }

  for (const [dr, dc] of DIRS){
    const tr = r + dr, tc = c + dc;
    const lr = r + dr * 2, lc = c + dc * 2;
    if (!inBoard(tr, tc) || !inBoard(lr, lc)) continue;
    if (state.board[tr][tc].type === "dwarf" && !state.board[lr][lc].type){
      out.push({
        r:lr, c:lc, kind:"trample",
        captured:{ r:tr, c:tc }
      });
    }
  }
  return out;
}

function findRock(){
  for (let r = 0; r < N; r++){
    for (let c = 0; c < N; c++){
      const p = state.board[r][c];
      if (p && p.type === "thudstone") return { r, c };
    }
  }
  return null;
}

function rockOnGoal(){
  const rock = findRock();
  return !!rock && rock.r === 0 && rock.c >= 5 && rock.c <= 9;
}

function trollsAdjacentToRock(){
  const rock = findRock();
  if (!rock) return 0;
  let n = 0;
  for (const [dr, dc] of DIRS){
    const rr = rock.r + dr, cc = rock.c + dc;
    if (inBoard(rr, cc) && state.board[rr][cc].type === "troll") n++;
  }
  return n;
}

/* Koom: un troll queda atrapado si el enano movido y otro enano lo
   flanquean en línea recta (incluidas las diagonales). */
function trappedTrollsFrom(pos){
  const out = [];
  for (const [dr, dc] of DIRS){
    const tr = pos.r + dr, tc = pos.c + dc;
    const br = pos.r + dr * 2, bc = pos.c + dc * 2;
    if (!inBoard(tr, tc) || !inBoard(br, bc)) continue;
    if (state.board[tr][tc].type === "troll" &&
        state.board[br][bc].type === "dwarf"){
      out.push({ r:tr, c:tc });
    }
  }
  return out;
}

function captureTrappedTrolls(pos){
  const trapped = trappedTrollsFrom(pos);
  for (const p of trapped){
    state.board[p.r][p.c] = empty();
    log("log.koomTrap", { cell: coord(p) }, true);
  }
  return trapped.length > 0;
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
function selectPiece(r, c){
  state.selected = { r, c };
  state.targets = state.turn === "dwarfs"
    ? dwarfTargets(r, c)
    : trollTargets(r, c);
  playSound("pickup");
  render();
  updateUI();
}

function onCellClick(r, c){
  if (state.over || animatingMove) return;

  // Fase de captura de los trolls: clic en enanos adyacentes para eliminarlos
  if (state.phase === "capture"){
    if (state.captureCells.some(p => p.r === r && p.c === c)){
      doCapture(r, c);
    }
    return;
  }

  // Koom: tras un pisotón, se pueden encadenar más pisotones.
  if (state.phase === "trample"){
    const tgt = state.targets.find(t => t.r === r && t.c === c);
    if (tgt) executeTarget(tgt);
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
    selectPiece(r, c);
    return;
  }

  clearSelection();
}

function clearSelection(){
  const hadSelection = !!state.selected;
  state.selected = null;
  state.targets = [];
  render();
  updateUI();
  if (hadSelection) playSound("putdown");
}

/* ---------- ARRASTRAR PIEZAS ---------- */
let drag = null;
const DRAG_THRESHOLD = 6;

function cellFromPoint(x, y){
  const el = document.elementFromPoint(x, y);
  return el && el.closest ? el.closest(".cell") : null;
}

function targetAt(x, y){
  const cell = cellFromPoint(x, y);
  if (!cell) return null;
  const r = Number(cell.dataset.r);
  const c = Number(cell.dataset.c);
  return state.targets.find(t => t.r === r && t.c === c) || null;
}

function onPointerDown(e){
  if (e.button !== 0 || e.pointerType === "touch") return;
  if (state.over || animatingMove || state.phase !== "normal") return;

  const cell = e.target.closest(".cell");
  if (!cell) return;
  const r = Number(cell.dataset.r);
  const c = Number(cell.dataset.c);
  const p = state.board[r][c];
  if (!p || p.owner !== state.turn) return;
  if (p.type === "thudstone" && state.mode !== "koom") return;

  drag = {
    pointerId: e.pointerId,
    startX: e.clientX,
    startY: e.clientY,
    from: { r, c },
    active: false,
    ghost: null,
    sourceEl: null,
    hoverCell: null,
    moveSoundStarted: false,
    moveSoundTimer: null
  };
}

function startDrag(e){
  drag.active = true;
  document.body.classList.add("dragging");
  selectPiece(drag.from.r, drag.from.c);

  const sourceCell = cells.get(key(drag.from.r, drag.from.c));
  const sourceEl = sourceCell ? sourceCell.querySelector(".piece") : null;
  const sourceStyle = sourceEl ? getComputedStyle(sourceEl) : null;

  const ghost = pieceEl(state.board[drag.from.r][drag.from.c]);
  ghost.classList.add("drag-ghost");
  if (sourceStyle){
    ghost.style.width = sourceStyle.width;
    ghost.style.height = sourceStyle.height;
    ghost.style.fontSize = sourceStyle.fontSize;
    sourceEl.classList.add("drag-origin");
  }

  document.body.appendChild(ghost);
  drag.ghost = ghost;
  drag.sourceEl = sourceEl;
  moveGhost(e);
}

function moveGhost(e){
  drag.ghost.style.left = e.clientX + "px";
  drag.ghost.style.top = e.clientY + "px";
}

function startDragMovementSound(){
  if (!drag || drag.moveSoundStarted) return;
  drag.moveSoundStarted = true;
  drag.moveSoundTimer = setTimeout(() => {
    drag.moveSoundTimer = null;
    if (drag && drag.active) playSound("move", { loop: true });
  }, 120);
}

function updateDragHover(e){
  const cell = cellFromPoint(e.clientX, e.clientY);
  if (drag.hoverCell && drag.hoverCell !== cell){
    drag.hoverCell.classList.remove("drop-hover");
  }
  drag.hoverCell = null;
  if (!cell) return;

  const r = Number(cell.dataset.r);
  const c = Number(cell.dataset.c);
  if (state.targets.some(t => t.r === r && t.c === c)){
    cell.classList.add("drop-hover");
    drag.hoverCell = cell;
  }
}

function onPointerMove(e){
  if (!drag || e.pointerId !== drag.pointerId) return;

  if (!drag.active){
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (dx * dx + dy * dy < DRAG_THRESHOLD * DRAG_THRESHOLD) return;
    startDrag(e);
    startDragMovementSound();
  }

  e.preventDefault();
  moveGhost(e);
  updateDragHover(e);
}

function cleanupDrag(){
  if (!drag) return;
  if (drag.moveSoundTimer) clearTimeout(drag.moveSoundTimer);
  if (drag.moveSoundStarted) stopSound("move");
  if (drag.ghost) drag.ghost.remove();
  if (drag.hoverCell) drag.hoverCell.classList.remove("drop-hover");
  if (drag.sourceEl) drag.sourceEl.classList.remove("drag-origin");
  document.body.classList.remove("dragging");
  drag = null;
}

function suppressNextClick(sourceCell, dropCell){
  const handler = ev => {
    const clickedCell = ev.target.closest ? ev.target.closest(".cell") : null;

    // Un clic real en otra casilla (por ejemplo, una captura) debe funcionar.
    if (clickedCell && clickedCell !== sourceCell && clickedCell !== dropCell){
      remove();
      return;
    }

    ev.stopPropagation();
    ev.preventDefault();
    remove();
  };
  const remove = () => document.removeEventListener("click", handler, true);

  document.addEventListener("click", handler, true);
  setTimeout(remove, 250);
}

function onPointerUp(e){
  if (!drag || e.pointerId !== drag.pointerId) return;

  const active = drag.active;
  const target = active ? targetAt(e.clientX, e.clientY) : null;
  const sourceCell = drag.sourceEl ? drag.sourceEl.closest(".cell") : null;
  const dropCell = active ? cellFromPoint(e.clientX, e.clientY) : null;

  cleanupDrag();
  if (!active) return;

  suppressNextClick(sourceCell, dropCell);
  if (target){
    executeTarget(target, false);
  } else {
    render();
    playSound("putdown");
  }
}

function cancelDrag(){
  if (!drag) return;
  const active = drag.active;
  cleanupDrag();
  if (active){
    render();
    playSound("putdown");
  }
}

function onPointerCancel(e){
  if (!drag || e.pointerId !== drag.pointerId) return;
  cancelDrag();
}

let moveAnimation = null;
let animatingMove = false;

function cancelMoveAnimation(){
  stopSound("move");
  if (!moveAnimation) return;
  const { ghost, sourceEl, animation } = moveAnimation;
  if (animation){
    try { animation.cancel(); } catch (err) { /* ya terminó */ }
  }
  ghost.remove();
  if (sourceEl) sourceEl.classList.remove("move-origin");
  moveAnimation = null;
  animatingMove = false;
}

function executeTarget(tgt, animate = true){
  if (animate && animateMove(tgt)) return;
  finishMove(tgt);
}

function finishMove(tgt){
  stopSound("move");
  const captured = applyTarget(tgt);
  playSound(captured ? "thud" : "putdown");
}

function animateMove(tgt){
  if (animatingMove) return true;

  // En el lanzamiento vuela el enano frontal; en el resto, la pieza seleccionada.
  const from = (state.turn === "dwarfs" && tgt.kind === "lanzar")
    ? tgt.from
    : state.selected;
  if (!from) return false;

  const piece = state.board[from.r][from.c];
  if (!piece || (piece.type === "thudstone" && state.mode !== "koom")) return false;

  const sourceCell = cells.get(key(from.r, from.c));
  const targetCell = cells.get(key(tgt.r, tgt.c));
  const sourceEl = sourceCell ? sourceCell.querySelector(".piece") : null;
  if (!sourceCell || !targetCell || !sourceEl) return false;

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
  const ghost = pieceEl(piece);
  ghost.classList.add("move-ghost");
  ghost.style.width = sourceStyle.width;
  ghost.style.height = sourceStyle.height;
  ghost.style.fontSize = sourceStyle.fontSize;
  ghost.style.left = sourceX + "px";
  ghost.style.top = sourceY + "px";
  document.body.appendChild(ghost);
  playSound("move", { loop: true });

  sourceEl.classList.add("move-origin");
  animatingMove = true;

  const animation = ghost.animate([
    { transform: "translate(-50%, -50%) scale(1) rotate(0deg)" },
    {
      transform: "translate(calc(-50% + " + (dx * 0.52) + "px), calc(-50% + " + (dy * 0.52 - lift) + "px)) scale(1.22) rotate(-4deg)",
      offset: 0.55
    },
    { transform: "translate(calc(-50% + " + dx + "px), calc(-50% + " + dy + "px)) scale(1) rotate(0deg)" }
  ], {
    duration: Math.min(560, 340 + distance * 1.2),
    easing: "cubic-bezier(.22,.75,.28,1)"
  });

  moveAnimation = { ghost, sourceEl, animation };

  animation.finished.then(() => {
    if (!moveAnimation || moveAnimation.animation !== animation) return;
    ghost.remove();
    sourceEl.classList.remove("move-origin");
    moveAnimation = null;
    animatingMove = false;
    finishMove(tgt);
  }).catch(() => { /* animación cancelada */ });

  return true;
}

function applyTarget(tgt){
  const from = state.selected;

  if (state.mode === "koom") return applyKoomTarget(tgt, from);

  if (state.turn === "dwarfs"){
    if (tgt.kind === "move"){
      movePiece(from, tgt);
      log("log.dwarfMove", { from: coord(from), to: coord(tgt) });
      endTurn();
      return false;
    } else {
      // Lanzar: el enano frontal vuela, el troll desaparece y el enano ocupa su casilla
      const lead = tgt.from;
      state.board[tgt.r][tgt.c] = empty();
      state.board[lead.r][lead.c] = empty();
      state.board[tgt.r][tgt.c] = { type:"dwarf", owner:"dwarfs" };
      log("log.hurl", { from: coord(lead), to: coord(tgt) }, true);
      endTurn();
      return true;
    }
  }

  if (tgt.kind === "move"){
    movePiece(from, tgt);
    log("log.trollMove", { from: coord(from), to: coord(tgt) });
    startCapture(false, tgt);
  } else {
    movePiece(from, tgt);
    log("log.shove", { from: coord(from), to: coord(tgt) }, true);
    startCapture(true, tgt);
  }
  return false;
}

function applyKoomTarget(tgt, from){
  if (!from) return false;
  const piece = state.board[from.r][from.c];

  if (state.turn === "dwarfs"){
    // La roca se mueve una casilla, sin capturar por sí misma.
    if (piece && piece.type === "thudstone"){
      movePiece(from, tgt);
      log("log.koomRock", { from: coord(from), to: coord(tgt) });
      if (rockOnGoal()){
        finishKoomBattle("dwarfs");
        return false;
      }
      endTurn();
      return false;
    }

    // Los enanos capturan trolls atrapados al terminar el movimiento.
    movePiece(from, tgt);
    log("log.dwarfMove", { from: coord(from), to: coord(tgt) });
    const captured = captureTrappedTrolls(tgt);
    endTurn();
    return captured;
  }

  if (tgt.kind === "trample"){
    const victim = tgt.captured;
    movePiece(from, tgt);
    if (victim) state.board[victim.r][victim.c] = empty();
    state.captured++;
    log("log.koomTrample", {
      from: coord(from),
      to: coord(tgt),
      cell: victim ? coord(victim) : coord(tgt)
    }, true);

    if (trollsAdjacentToRock() >= 3){
      finishKoomBattle("trolls");
      return true;
    }

    const next = trollTargetsKoom(tgt.r, tgt.c).filter(t => t.kind === "trample");
    if (next.length){
      state.selected = { r: tgt.r, c: tgt.c };
      state.targets = next;
      state.phase = "trample";
      state.mustCapture = false;
      state.captureCells = [];
      render();
      updateUI();
    } else {
      endTurn();
    }
    return true;
  }

  // Movimiento normal del troll: hasta 3 casillas, sin capturas encadenadas.
  movePiece(from, tgt);
  log("log.trollMove", { from: coord(from), to: coord(tgt) });
  if (trollsAdjacentToRock() >= 3){
    finishKoomBattle("trolls");
    return false;
  }
  endTurn();
  return false;
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
  playSound("thud");
  log("log.capture", { cell: coord({ r, c }) });

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

  if (state.mode === "koom"){
    const other = state.turn === "dwarfs" ? "trolls" : "dwarfs";
    const nextCanMove = hasAnyMove(state.turn);
    const otherCanMove = hasAnyMove(other);
    if (!nextCanMove && !otherCanMove){
      render();
      finishKoomBattle("draw");
      return;
    }
    if (!nextCanMove && otherCanMove){
      // Si un bando no puede actuar, el otro sigue jugando.
      log(state.turn === "dwarfs" ? "log.koomPassDwarfs" : "log.koomPassTrolls");
      state.turn = other;
    }
  }

  render();

  if (checkBattleOver()) return;

  log(state.turn === "dwarfs" ? "log.turnDwarfs" : "log.turnTrolls");
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
  if (state.over) return true;

  if (state.mode === "koom"){
    if (!hasAnyMove("dwarfs") && !hasAnyMove("trolls")){
      finishKoomBattle("draw");
      return true;
    }
    return false;
  }

  const dwarfs = countType("dwarf");
  const trolls = countType("troll");
  if (dwarfs === 0 || trolls === 0 || !hasAnyMove(state.turn)){
    finishBattle(dwarfs, trolls);
    return true;
  }
  return false;
}

function resultVerdict(dwarfPts, trollPts){
  const diff = trollPts - dwarfPts;
  if (diff > 0){
    return t(diff === 1 ? "result.trollLead.one" : "result.trollLead.other", { diff });
  }
  if (diff < 0){
    return t(diff === -1 ? "result.dwarfLead.one" : "result.dwarfLead.other", { diff: -diff });
  }
  return t("result.draw");
}

function renderResult(dwarfs, trolls, verdict){
  const result = document.getElementById("result");
  result.hidden = false;

  if (state.mode === "koom"){
    result.innerHTML = t("result.koom." + (state.koomWinner || "draw"));
    return;
  }

  const dwarfPts = dwarfs;          // 1 punto por enano vivo
  const trollPts = trolls * 4;      // 4 puntos por troll vivo
  const finalVerdict = verdict || resultVerdict(dwarfPts, trollPts);
  result.innerHTML = t("result.battle", {
    dwarfs,
    dwarfPts,
    trolls,
    trollPts,
    verdict: finalVerdict
  });
}

function finishBattle(dwarfs, trolls){
  state.over = true;
  const dwarfPts = dwarfs;
  const trollPts = trolls * 4;

  state.totals.dwarfs += dwarfPts;
  state.totals.trolls += trollPts;
  state.battles++;

  const verdict = resultVerdict(dwarfPts, trollPts);

  log("log.battleEnd", {
    dwarfPts,
    dwarfs,
    trollPts,
    trolls
  }, true);

  renderResult(dwarfs, trolls, verdict);

  render();
  updateUI();
}

function finishKoomBattle(winner){
  if (state.over) return;
  state.over = true;
  state.koomWinner = winner;
  state.phase = "normal";
  state.selected = null;
  state.targets = [];
  state.captureCells = [];
  state.mustCapture = false;
  state.captured = 0;

  log(
    winner === "dwarfs" ? "log.koomEndDwarfs" :
    winner === "trolls" ? "log.koomEndTrolls" :
    "log.koomDraw",
    null,
    true
  );

  renderResult(countType("dwarf"), countType("troll"));
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

  document.querySelectorAll(".score-card .points").forEach(el => {
    el.hidden = state.mode === "koom";
  });

  document.getElementById("modeBadge").textContent =
    t(state.mode === "koom" ? "mode.koom.name" : "mode.classic.name");

  document.getElementById("legendDwarf").textContent =
    t(state.mode === "koom" ? "legend.dwarf.koom" : "legend.dwarf");
  document.getElementById("legendTroll").textContent =
    t(state.mode === "koom" ? "legend.troll.koom" : "legend.troll");
  document.getElementById("legendStone").textContent =
    t(state.mode === "koom" ? "legend.rock" : "legend.thudstone");

  document.querySelectorAll("[data-help-mode]").forEach(el => {
    el.hidden = el.dataset.helpMode !== state.mode;
  });

  const turnEl = document.getElementById("turn");
  document.getElementById("turnLabel").textContent = state.turn === "dwarfs" ? t("turn.dwarfs") : t("turn.trolls");
  turnEl.className = "turn " + (state.turn === "dwarfs" ? "dwarfs" : "trolls");

  const statusEl = document.getElementById("status");
  if (state.over){
    statusEl.textContent = t("status.over");
  } else if (state.phase === "capture"){
    statusEl.textContent = (state.mustCapture && state.captured === 0)
      ? t("status.shoveRequired")
      : t("status.captureOptional");
  } else if (state.phase === "trample"){
    statusEl.textContent = t("status.koomTrample");
  } else if (state.selected){
    const n = state.targets.length;
    if (!n){
      statusEl.textContent = t("status.noMoves");
    } else if (state.mode === "koom"){
      let txt = t(n === 1 ? "status.targets.one" : "status.targets.other", { n });
      const tramples = state.targets.filter(target => target.kind === "trample").length;
      if (tramples){
        txt += " " + t(tramples === 1 ? "status.tramples.one" : "status.tramples.other", { n: tramples });
      }
      const selectedPiece = state.board[state.selected.r][state.selected.c];
      if (state.turn === "dwarfs" && selectedPiece && selectedPiece.type === "thudstone"){
        txt = t("status.koomRockSelected") + " " + txt;
      }
      statusEl.textContent = txt;
    } else {
      const lanzamientos = state.targets.filter(target => target.kind === "lanzar").length;
      const empujes = state.targets.filter(target => target.kind === "empujar").length;
      let txt = t(n === 1 ? "status.targets.one" : "status.targets.other", { n });
      if (lanzamientos) txt += " " + t(lanzamientos === 1 ? "status.hurls.one" : "status.hurls.other", { n: lanzamientos });
      if (empujes) txt += " " + t(empujes === 1 ? "status.shoves.one" : "status.shoves.other", { n: empujes });
      statusEl.textContent = txt;
    }
  } else {
    if (state.mode === "koom"){
      statusEl.textContent = state.turn === "dwarfs"
        ? t("status.koomSelectDwarf")
        : t("status.koomSelectTroll");
    } else {
      statusEl.textContent = state.turn === "dwarfs" ? t("status.selectDwarf") : t("status.selectTroll");
    }
  }

  const btn = document.getElementById("endTurnBtn");
  const show = (state.phase === "capture" || state.phase === "trample") && !state.over;
  const mustCaptureNow = state.phase === "capture" && state.mustCapture && state.captured === 0;
  btn.hidden = !show;
  btn.disabled = mustCaptureNow;
  btn.textContent = mustCaptureNow ? t("btn.captureRequired") : t("btn.endTurn");
  turnEl.classList.toggle("has-action", show);
  document.getElementById("turnLabel").hidden = show;

  document.getElementById("finalizeBtn").hidden = state.over;

  const totalsEl = document.getElementById("totals");
  if (state.mode === "classic" && state.battles > 0){
    totalsEl.hidden = false;
    const title = state.battles === 1
      ? t("totals.title.one")
      : t("totals.title.other", { n: state.battles });
    totalsEl.innerHTML =
      "<strong>" + title + "</strong><br>" +
      t("totals.line", { dwarfs: state.totals.dwarfs, trolls: state.totals.trolls });
  } else {
    totalsEl.hidden = true;
  }
}

function log(key, params, highlight){
  state.log.push({ key, params: params || null, highlight: !!highlight });
  if (state.log.length > 60) state.log.shift();
  renderLog();
}

function renderLog(){
  const ol = document.getElementById("log");
  ol.innerHTML = "";
  const items = state.log.slice(-9);
  for (const entry of items){
    const li = document.createElement("li");
    const params = Object.assign({}, entry.params);
    if (entry.key === "log.battleEnd"){
      params.verdict = resultVerdict(params.dwarfPts, params.trollPts);
    }
    li.textContent = t(entry.key, params);
    if (entry.highlight) li.className = "hl";
    ol.appendChild(li);
  }
  ol.scrollTop = ol.scrollHeight;
}

/* ---------- MODALES ---------- */
const modeModal = document.getElementById("modeModal");
const helpModal = document.getElementById("helpModal");
const confirmModal = document.getElementById("confirmModal");
const confirmTitleEl = document.getElementById("confirmTitle");
const confirmTextEl = document.getElementById("confirmText");
const confirmOkEl = document.getElementById("confirmOk");

let activeModal = null;
let lastFocused = null;
let confirmResolver = null;

function openModal(modal){
  if (!modal || activeModal) return;
  lastFocused = document.activeElement;
  activeModal = modal;
  modal.hidden = false;
  document.body.classList.add("modal-open");
  const focusable = modal.querySelector(".mode-option, .modal-close, .modal-actions .btn");
  if (focusable) focusable.focus();
}

function closeModal(modal){
  if (!modal || modal !== activeModal) return;
  modal.hidden = true;
  activeModal = null;
  document.body.classList.remove("modal-open");
  if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  lastFocused = null;
}

function chooseMode(mode){
  if (activeModal !== modeModal) return;
  closeModal(modeModal);
  setupBoard(mode);
}

function askConfirm(title, text, okLabel){
  confirmTitleEl.textContent = title;
  confirmTextEl.textContent = text;
  confirmOkEl.textContent = okLabel || "Confirmar";
  openModal(confirmModal);
  return new Promise(resolve => { confirmResolver = resolve; });
}

function settleConfirm(value){
  if (!confirmResolver) return;
  const resolve = confirmResolver;
  confirmResolver = null;
  closeModal(confirmModal);
  resolve(value);
}

document.getElementById("modeClassic").addEventListener("click", () => chooseMode("classic"));
document.getElementById("modeKoom").addEventListener("click", () => chooseMode("koom"));
document.getElementById("helpBtn").addEventListener("click", () => openModal(helpModal));
document.getElementById("confirmOk").addEventListener("click", () => settleConfirm(true));
document.getElementById("confirmCancel").addEventListener("click", () => settleConfirm(false));

document.querySelectorAll(".modal [data-close]").forEach(el => {
  el.addEventListener("click", () => {
    const modal = el.closest(".modal");
    if (modal === confirmModal) settleConfirm(false);
    else closeModal(modal);
  });
});

document.addEventListener("keydown", e => {
  if (e.key !== "Escape" || !activeModal) return;
  if (activeModal === modeModal) return;   // la versión debe elegirse sí o sí
  if (activeModal === confirmModal) settleConfirm(false);
  else closeModal(activeModal);
});

/* ---------- BOTONES ---------- */
document.getElementById("langBtn").addEventListener("click", () => {
  switchLanguage(currentLang === "es" ? "en" : "es");
});

document.getElementById("endTurnBtn").addEventListener("click", () => {
  if (state.over || animatingMove) return;
  if (state.phase !== "capture" && state.phase !== "trample") return;
  if (state.phase === "capture" && state.mustCapture && state.captured === 0) return;
  endTurn();
});

document.getElementById("finalizeBtn").addEventListener("click", async () => {
  if (state.over || animatingMove) return;
  const ok = await askConfirm(
    t("confirm.finalize.title"),
    t(state.mode === "koom" ? "confirm.finalize.koom.text" : "confirm.finalize.text"),
    t("btn.finalize")
  );
  if (!ok || state.over) return;
  if (state.mode === "koom"){
    finishKoomBattle("draw");
  } else {
    finishBattle(countType("dwarf"), countType("troll"));
  }
});

document.getElementById("newBattleBtn").addEventListener("click", async () => {
  if (animatingMove) return;
  if (!state.over){
    const ok = await askConfirm(
      t("confirm.new.title"),
      t("confirm.new.text"),
      t("btn.restart")
    );
    if (!ok) return;
  }
  setupBoard(state.mode);
});

/* ---------- ARRANQUE ---------- */
async function init(){
  buildGrid();
  boardEl.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove, { passive: false });
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerCancel);
  window.addEventListener("blur", cancelDrag);
  try {
    await loadLocale(preferredLanguage());
  } catch (err) {
    console.error("No se pudieron cargar las traducciones:", err);
    document.getElementById("status").textContent =
      "No se pudieron cargar las traducciones. Revisá resources/i18n/. / " +
      "Could not load translations. Check resources/i18n/.";
    return;
  }
  applyTranslations();
  setupBoard("classic");
  openModal(modeModal);
}

init();
