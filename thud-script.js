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
        p && p.type !== "thudstone" && p.owner === state.turn;
      if (canDrag) el.classList.add("draggable");
    }
  }
}

/* ---------- PREPARACIÓN ---------- */
function setupBoard(){
  cancelMoveAnimation();
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

  log("log.battleStart");
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

function trollTargets(r, c){
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
  if (!p || p.type === "thudstone" || p.owner !== state.turn) return;

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
  const capturesPiece = state.turn === "dwarfs" && tgt.kind === "lanzar";
  applyTarget(tgt);
  playSound(capturesPiece ? "thud" : "putdown");
}

function animateMove(tgt){
  if (animatingMove) return true;

  // En el lanzamiento vuela el enano frontal; en el resto, la pieza seleccionada.
  const from = (state.turn === "dwarfs" && tgt.kind === "lanzar")
    ? tgt.from
    : state.selected;
  if (!from) return false;

  const piece = state.board[from.r][from.c];
  if (!piece || piece.type === "thudstone") return false;

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

  if (state.turn === "dwarfs"){
    if (tgt.kind === "move"){
      movePiece(from, tgt);
      log("log.dwarfMove", { from: coord(from), to: coord(tgt) });
      endTurn();
    } else {
      // Lanzar: el enano frontal vuela, el troll desaparece y el enano ocupa su casilla
      const lead = tgt.from;
      state.board[tgt.r][tgt.c] = empty();
      state.board[lead.r][lead.c] = empty();
      state.board[tgt.r][tgt.c] = { type:"dwarf", owner:"dwarfs" };
      log("log.hurl", { from: coord(lead), to: coord(tgt) }, true);
      endTurn();
    }
    return;
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
  const dwarfPts = dwarfs;          // 1 punto por enano vivo
  const trollPts = trolls * 4;      // 4 puntos por troll vivo
  const finalVerdict = verdict || resultVerdict(dwarfPts, trollPts);
  const result = document.getElementById("result");
  result.hidden = false;
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

/* ---------- INTERFAZ ---------- */
function updateUI(){
  const dwarfs = countType("dwarf");
  const trolls = countType("troll");

  document.getElementById("dwarfCount").textContent = dwarfs;
  document.getElementById("trollCount").textContent = trolls;
  document.getElementById("dwarfPts").textContent = dwarfs;
  document.getElementById("trollPts").textContent = trolls * 4;

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
  } else if (state.selected){
    const n = state.targets.length;
    const lanzamientos = state.targets.filter(target => target.kind === "lanzar").length;
    const empujes = state.targets.filter(target => target.kind === "empujar").length;
    if (!n){
      statusEl.textContent = t("status.noMoves");
    } else {
      let txt = t(n === 1 ? "status.targets.one" : "status.targets.other", { n });
      if (lanzamientos) txt += " " + t(lanzamientos === 1 ? "status.hurls.one" : "status.hurls.other", { n: lanzamientos });
      if (empujes) txt += " " + t(empujes === 1 ? "status.shoves.one" : "status.shoves.other", { n: empujes });
      statusEl.textContent = txt;
    }
  } else {
    statusEl.textContent = state.turn === "dwarfs" ? t("status.selectDwarf") : t("status.selectTroll");
  }

  const btn = document.getElementById("endTurnBtn");
  const show = state.phase === "capture" && !state.over;
  btn.hidden = !show;
  btn.disabled = state.mustCapture && state.captured === 0;
  btn.textContent = (state.mustCapture && state.captured === 0)
    ? t("btn.captureRequired")
    : t("btn.endTurn");
  turnEl.classList.toggle("has-action", show);
  document.getElementById("turnLabel").hidden = show;

  document.getElementById("finalizeBtn").hidden = state.over;

  const totalsEl = document.getElementById("totals");
  if (state.battles > 0){
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
  const focusable = modal.querySelector(".modal-close, .modal-actions .btn");
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
  if (activeModal === confirmModal) settleConfirm(false);
  else closeModal(activeModal);
});

/* ---------- BOTONES ---------- */
document.getElementById("langBtn").addEventListener("click", () => {
  switchLanguage(currentLang === "es" ? "en" : "es");
});

document.getElementById("endTurnBtn").addEventListener("click", () => {
  if (state.over || animatingMove) return;
  if (state.phase !== "capture") return;
  if (state.mustCapture && state.captured === 0) return;
  endTurn();
});

document.getElementById("finalizeBtn").addEventListener("click", async () => {
  if (state.over || animatingMove) return;
  const ok = await askConfirm(
    t("confirm.finalize.title"),
    t("confirm.finalize.text"),
    t("btn.finalize")
  );
  if (!ok || state.over) return;
  finishBattle(countType("dwarf"), countType("troll"));
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
  setupBoard();
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
  setupBoard();
}

init();
