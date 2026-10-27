/* GENERADO AUTOMATICAMENTE por build-classic.mjs. No editar a mano. */
(() => {
"use strict";

/* ---- ../i18n/embedded.js ---- */
/* Traducciones embebidas para usar como respaldo si falla la carga de los .properties.
   Se generan desde resources/i18n/es.properties y en.properties.
   Ejecutar: node resources/i18n/generate-embedded.mjs */
const THUD_EMBEDDED_PROPERTIES = {
  es: `# ---------------------------------------------------------------
# Thud — Traducciones al castellano
# ---------------------------------------------------------------
app.title=Thud — Enanos y Trolls
lang.switch=Cambiar idioma
help.open=Cómo se juega

board.aria=Tablero de Thud
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

legend.dwarf=Enano · 1 pt
legend.troll=Troll · 4 pts
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
status.over=La batalla ha terminado. Pulsa «Nueva batalla» para jugar otra.

confirm.title=Confirmar
confirm.finalize.title=Finalizar batalla
confirm.finalize.text=¿Finalizar la batalla y contar los puntos?
confirm.new.title=Nueva batalla
confirm.new.text=¿Reiniciar la batalla actual? Se perderá el progreso de esta partida.

result.battle=<strong>Fin de la batalla</strong><br>Enanos: {dwarfs} piezas vivas → {dwarfPts} pts<br>Trolls: {trolls} piezas vivas → {trollPts} pts<br><strong>{verdict}</strong>
result.trollLead.one=Ventaja de los trolls por {diff} punto.
result.trollLead.other=Ventaja de los trolls por {diff} puntos.
result.dwarfLead.one=Ventaja de los enanos por {diff} punto.
result.dwarfLead.other=Ventaja de los enanos por {diff} puntos.
result.draw=Empate.

log.battleStart=Comienza la batalla. Los enanos mueven primero.
log.dwarfMove=Enano {from} → {to}.
log.trollMove=Troll {from} → {to}.
log.hurl=Lanzamiento: enano de {from} captura un troll en {to}.
log.shove=Empuje: trolls empujan, troll de {from} → {to}.
log.capture=Troll captura un enano en {cell}.
log.turnDwarfs=Turno de los enanos.
log.turnTrolls=Turno de los trolls.
log.battleEnd=Fin de la batalla — enanos: {dwarfPts} pts ({dwarfs}), trolls: {trollPts} pts ({trolls}). {verdict}

help.title=Cómo se juega
help.objective=<b>Objetivo:</b> capturar el máximo de piezas rivales. Los enanos puntúan 1 por pieza viva; los trolls, 4.
help.dwarfsTitle=Enanos <span>(mueven primero)</span>
help.dwarfsMove=<b>Mover:</b> como una dama de ajedrez, a casillas vacías, sin saltar piezas.
help.dwarfsHurl=<b>Lanzar:</b> en una línea recta de enanos adyacentes se lanza el enano frontal hasta tantas casillas como enanos tenga la línea. Debe caer sobre un troll para capturarlo.
help.trollsTitle=Trolls
help.trollsMove=<b>Mover:</b> como un rey del ajedrez, una casilla a una casilla vacía. Después puede capturar enanos adyacentes (opcional).
help.trollsShove=<b>Empujar:</b> una línea de trolls adyacentes empuja al troll del extremo hasta tantas casillas como trolls tenga la línea, sin ocupar casillas. Debe capturar al menos un enano adyacente al destino.
help.controlsTitle=Controles
help.controls1=Haz clic o arrastra una pieza propia para ver sus destinos posibles.
help.controls2=Haz clic en un destino resaltado, o suelta la pieza sobre él, para ejecutar la jugada.
help.controls3=Vuelve a hacer clic en la pieza seleccionada para deseleccionarla.
help.end=<b>Fin:</b> la batalla acaba cuando un bando se queda sin jugadas legales (o ambos acuerdan que no hay más capturas). Se comparan los puntos.

modal.close=Cerrar

# ---------------------------------------------------------------
# Selección de versión y Valle de Koom
# ---------------------------------------------------------------
mode.title=Elige un modo de juego
mode.version=Versión
mode.opponent=Oponente
mode.opponent.human=Otro humano
mode.opponent.ai=Máquina
mode.side=Jugás como
mode.side.dwarfs=Enanos
mode.side.trolls=Trolls
mode.start=Comenzar batalla
mode.classic.name=Thud tradicional
mode.classic.desc=32 enanos contra 8 trolls. Captura piezas y suma puntos por cada pieza no eliminada.
mode.koom.name=Valle de Koom
mode.koom.desc=Para ganar, los enanos deben llevar la roca al otro lado del valle, hasta cualquiera de las cinco casillas del lado opuesto del tablero, contra el que está sentado el comandante enano. Para ganar, los trolls deben capturar la roca colocando tres trolls adyacentes a ella (en cualquier dirección, incluidas las diagonales). Si ningún bando puede alcanzar su objetivo, la partida termina en empate.

legend.dwarf.koom=Enano
legend.troll.koom=Troll
legend.rock=Roca
matchup.ai=Vos: {human} · Máquina: {ai}

status.koomSelectDwarf=Lleva la roca a la fila dorada. Selecciona un enano o la roca.
status.koomSelectTroll=Rodea la roca con tres trolls. Selecciona un troll para mover o pisotear.
status.koomTrample=Puedes seguir pisoteando enanos o terminar el turno.
status.koomRockSelected=Roca seleccionada: debe terminar junto a un enano.
status.aiTurn=La máquina está jugando…
status.aiThinking=La máquina está pensando…
status.tramples.one={n} pisotón posible.
status.tramples.other={n} pisotones posibles.

confirm.finalize.koom.text=¿Finalizar la batalla? Si no se alcanzó ningún objetivo, se declarará un empate.

result.koom.dwarfs=<strong>Victoria de los Enanos</strong><br>La roca llegó a la fila dorada del valle.
result.koom.dwarfs.elimination=<strong>Victoria de los Enanos</strong><br>Todos los trolls fueron eliminados.
result.koom.trolls=<strong>Victoria de los Trolls</strong><br>Tres trolls rodearon la roca.
result.koom.trolls.elimination=<strong>Victoria de los Trolls</strong><br>Todos los enanos fueron eliminados.
result.koom.draw=<strong>Empate</strong><br>Ningún bando alcanzó su objetivo.

log.koomStart=Comienza la batalla por el Valle de Koom. Los enanos mueven primero.
log.koomRock=La roca se mueve de {from} a {to}.
log.koomTrap=Enano atrapa un troll en {cell}.
log.koomTrample=Troll pisotea un enano en {cell} ({from} → {to}).
log.koomPassDwarfs=Los enanos no tienen jugadas y pasan.
log.koomPassTrolls=Los trolls no tienen jugadas y pasan.
log.koomEndDwarfs=Fin de la batalla: victoria de los enanos. La roca llegó al otro lado.
log.koomEndDwarfsElimination=Fin de la batalla: victoria de los enanos. Todos los trolls fueron eliminados.
log.koomEndTrolls=Fin de la batalla: victoria de los trolls. La roca quedó rodeada.
log.koomEndTrollsElimination=Fin de la batalla: victoria de los trolls. Todos los enanos fueron eliminados.
log.koomDraw=Fin de la batalla: empate.

help.koom.objective=<b>Objetivo:</b> los enanos deben llevar la roca a una de las cinco casillas doradas del lado opuesto. Los trolls ganan si tres trolls quedan adyacentes a la roca.
help.koom.dwarfsTitle=Enanos <span>(mueven primero)</span>
help.koom.dwarfsMove=<b>Mover:</b> como una dama de ajedrez, a casillas vacías, sin saltar piezas.
help.koom.rock=<b>Mover la roca:</b> una casilla en cualquier dirección. La roca debe empezar y terminar junto a un enano.
help.koom.trap=<b>Capturar:</b> al mover un enano, captura los trolls que queden atrapados entre ese enano y otro enano en línea recta.
help.koom.trollsTitle=Trolls
help.koom.trollsMove=<b>Mover:</b> hasta tres casillas en línea recta, sin saltar piezas.
help.koom.trample=<b>Pisotear:</b> salta sobre un enano adyacente y aterriza en la casilla vacía inmediatamente posterior. Puede encadenar varios pisotones cambiando de dirección.
help.koom.end=<b>Fin:</b> los enanos ganan si la roca llega a la fila dorada; los trolls, si rodean la roca con tres trolls. Si nadie alcanza su objetivo, la partida termina en empate.
`,
  en: `# ---------------------------------------------------------------
# Thud — English translations
# ---------------------------------------------------------------
app.title=Thud — Dwarfs and Trolls
lang.switch=Switch language
help.open=How to play

board.aria=Thud board
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

legend.dwarf=Dwarf · 1 pt
legend.troll=Troll · 4 pts
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

result.battle=<strong>Battle over</strong><br>Dwarfs: {dwarfs} pieces alive → {dwarfPts} pts<br>Trolls: {trolls} pieces alive → {trollPts} pts<br><strong>{verdict}</strong>
result.trollLead.one=Trolls lead by {diff} point.
result.trollLead.other=Trolls lead by {diff} points.
result.dwarfLead.one=Dwarfs lead by {diff} point.
result.dwarfLead.other=Dwarfs lead by {diff} points.
result.draw=Draw.

log.battleStart=The battle begins. Dwarfs move first.
log.dwarfMove=Dwarf {from} → {to}.
log.trollMove=Troll {from} → {to}.
log.hurl=Hurl: dwarf from {from} captures a troll at {to}.
log.shove=Shove: trolls push, troll from {from} → {to}.
log.capture=Troll captures a dwarf at {cell}.
log.turnDwarfs=Dwarfs' turn.
log.turnTrolls=Trolls' turn.
log.battleEnd=Battle over — dwarfs: {dwarfPts} pts ({dwarfs}), trolls: {trollPts} pts ({trolls}). {verdict}

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
mode.koom.desc=For the dwarfs to win they must move the rock to the far side of the valley - onto any of the five squares on the opposite side of the board against which the dwarf commander is sitting. For the trolls to win they must capture the rock by placing three trolls adjacent to it (in any direction including diagonally). If neither side can achieve their objective the game is drawn.

legend.dwarf.koom=Dwarf
legend.troll.koom=Troll
legend.rock=Rock
matchup.ai=You: {human} · Computer: {ai}

status.koomSelectDwarf=Take the rock to the golden row. Select a dwarf or the rock.
status.koomSelectTroll=Surround the rock with three trolls. Select a troll to move or trample.
status.koomTrample=You may keep trampling dwarfs or end the turn.
status.koomRockSelected=Rock selected: it must end next to a dwarf.
status.aiTurn=The computer is playing…
status.aiThinking=The computer is thinking…
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
log.koomTrample=A troll tramples a dwarf at {cell} ({from} → {to}).
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

/* ---- core.js ---- */
/* Nucleo: constantes, estado, utilidades, referencias DOM y sonidos */

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
const otherSide = side => side === "dwarfs" ? "trolls" : "dwarfs";

const GAME_STATE_EVENT = "thud:gamestate";

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
  koomReason: null,       // objective | elimination
  ai: {
    enabled: false,
    side: null,           // bando controlado por la maquina
    humanSide: null,      // bando elegido por la persona
    thinking: false
  },
  log: []
};

function isAiTurn(){
  return !!state.ai.enabled && state.ai.side === state.turn;
}

function notifyGameState(){
  document.dispatchEvent(new CustomEvent(GAME_STATE_EVENT));
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

/* ---- i18n.js ---- */
/* Internacionalizacion: carga de textos, traducciones y cambio de idioma */

const LOCALES = ["es", "en"];
const LANGUAGE_CHANGE_EVENT = "thud:languagechange";
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
  const embedded = THUD_EMBEDDED_PROPERTIES[lang];

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
    document.dispatchEvent(new CustomEvent(LANGUAGE_CHANGE_EVENT));
  } catch (err) {
    console.error("No se pudo cambiar el idioma:", err);
  } finally {
    btn.disabled = false;
  }
}

/* ---- verdict.js ---- */
/* Veredicto de la batalla clasica */

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

/* ---- board.js ---- */
/* Tablero: creacion de casillas, piezas y renderizado */

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

      const canDrag = !state.over && !isAiTurn() && state.phase === "normal" &&
        p && (p.type !== "thudstone" || state.mode === "koom") &&
        p.owner === state.turn;
      if (canDrag) el.classList.add("draggable");
    }
  }
}

/* ---- ui.js ---- */
/* Interfaz: panel, estado y registro de la partida */

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

  const matchupEl = document.getElementById("matchupBadge");
  if (matchupEl){
    if (state.ai.enabled && state.ai.humanSide && state.ai.side){
      matchupEl.hidden = false;
      matchupEl.textContent = t("matchup.ai", {
        human: t(state.ai.humanSide === "dwarfs" ? "side.dwarfs" : "side.trolls"),
        ai: t(state.ai.side === "dwarfs" ? "side.dwarfs" : "side.trolls")
      });
    } else {
      matchupEl.hidden = true;
    }
  }

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
  } else if (isAiTurn()){
    statusEl.textContent = t(state.ai.thinking ? "status.aiThinking" : "status.aiTurn");
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
  const aiTurn = isAiTurn();
  const show = (state.phase === "capture" || state.phase === "trample") && !state.over && !aiTurn;
  const mustCaptureNow = state.phase === "capture" && state.mustCapture && state.captured === 0;
  btn.hidden = !show;
  btn.disabled = mustCaptureNow || aiTurn;
  btn.textContent = mustCaptureNow ? t("btn.captureRequired") : t("btn.endTurn");
  turnEl.classList.toggle("has-action", show);
  document.getElementById("turnLabel").hidden = show;

  const finalizeBtn = document.getElementById("finalizeBtn");
  finalizeBtn.hidden = state.over;
  finalizeBtn.disabled = aiTurn;
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

/* ---- movement.js ---- */
/* Movimientos legales, capturas de Koom y objetivos */

/* ---------- MOVIMIENTOS POSIBLES ---------- */
function dwarfTargets(r, c, game = state){
  if (game.mode === "koom"){
    const p = game.board[r][c];
    if (p && p.type === "thudstone") return rockTargets(r, c, game);
    return dwarfTargetsKoom(r, c, game);
  }
  return dwarfTargetsClassic(r, c, game);
}

function trollTargets(r, c, game = state){
  return game.mode === "koom" ? trollTargetsKoom(r, c, game) : trollTargetsClassic(r, c, game);
}

function dwarfTargetsClassic(r, c, game){
  const out = [];

  // Mover como dama: solo a casillas vacías (no captura al mover)
  for (const [dr, dc] of DIRS){
    let rr = r + dr, cc = c + dc;
    while (inBoard(rr, cc)){
      if (game.board[rr][cc].type) break;
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
      if (!inBoard(rr, cc) || game.board[rr][cc].type !== "dwarf") break;
      fd++;
    }
    let bd = 0;
    while (true){
      const rr = r - (bd + 1) * dr, cc = c - (bd + 1) * dc;
      if (!inBoard(rr, cc) || game.board[rr][cc].type !== "dwarf") break;
      bd++;
    }
    const line = fd + bd + 1;
    const lr = r + fd * dr, lc = c + fd * dc;   // enano frontal
    for (let k = 1; k <= line; k++){
      const rr = lr + k * dr, cc = lc + k * dc;
      if (!inBoard(rr, cc)) break;
      const cell = game.board[rr][cc];
      if (!cell.type) continue;                  // casilla vacía: sigue volando
      if (cell.type === "troll"){
        out.push({ r:rr, c:cc, kind:"lanzar", from:{ r:lr, c:lc }, line });
      }
      break;                                     // cualquier otra pieza bloquea
    }
  }
  return out;
}

function trollTargetsClassic(r, c, game){
  const out = [];

  // Mover como rey: una casilla, a casilla vacía
  for (const [dr, dc] of DIRS){
    const rr = r + dr, cc = c + dc;
    if (inBoard(rr, cc) && !game.board[rr][cc].type){
      out.push({ r:rr, c:cc, kind:"move" });
    }
  }

  // Empujar: línea de trolls por detrás; el troll del extremo avanza hasta L casillas
  const moveKeys = new Set(out.map(t => key(t.r, t.c)));
  for (const [dr, dc] of DIRS){
    let b = 0;
    while (true){
      const rr = r - (b + 1) * dr, cc = c - (b + 1) * dc;
      if (!inBoard(rr, cc) || game.board[rr][cc].type !== "troll") break;
      b++;
    }
    if (b < 1) continue;                         // hace falta una línea de trolls
    const line = b + 1;
    for (let k = 1; k <= line; k++){
      const rr = r + k * dr, cc = c + k * dc;
      if (!inBoard(rr, cc)) break;
      if (game.board[rr][cc].type) break;        // no puede aterrizar sobre una pieza
      if (moveKeys.has(key(rr, cc))) continue;   // ya ofrecido como movimiento normal
      const caps = adjacentDwarfs(rr, cc, game);
      if (caps.length){
        out.push({ r:rr, c:cc, kind:"empujar", caps, line });
      }
    }
  }
  return out;
}

/* Koom: los enanos mueven como dama, sin lanzar. */
function dwarfTargetsKoom(r, c, game){
  const out = [];
  for (const [dr, dc] of DIRS){
    let rr = r + dr, cc = c + dc;
    while (inBoard(rr, cc)){
      if (game.board[rr][cc].type) break;
      out.push({ r:rr, c:cc, kind:"move" });
      rr += dr; cc += dc;
    }
  }
  return out;
}

/* Koom: la roca se mueve una casilla y debe empezar y terminar junto a un enano. */
function rockTargets(r, c, game){
  const out = [];
  if (!adjacentDwarfs(r, c, game).length) return out;

  for (const [dr, dc] of DIRS){
    const rr = r + dr, cc = c + dc;
    if (!inBoard(rr, cc) || game.board[rr][cc].type) continue;
    if (adjacentDwarfs(rr, cc, game).length){
      out.push({ r:rr, c:cc, kind:"move" });
    }
  }
  return out;
}

/* Koom: los trolls avanzan hasta 3 casillas o pisotean a un enano adyacente. */
function trollTargetsKoom(r, c, game = state){
  const out = [];

  for (const [dr, dc] of DIRS){
    for (let k = 1; k <= 3; k++){
      const rr = r + dr * k, cc = c + dc * k;
      if (!inBoard(rr, cc)) break;
      if (game.board[rr][cc].type) break;
      out.push({ r:rr, c:cc, kind:"move" });
    }
  }

  for (const [dr, dc] of DIRS){
    const tr = r + dr, tc = c + dc;
    const lr = r + dr * 2, lc = c + dc * 2;
    if (!inBoard(tr, tc) || !inBoard(lr, lc)) continue;
    if (game.board[tr][tc].type === "dwarf" && !game.board[lr][lc].type){
      out.push({
        r:lr, c:lc, kind:"trample",
        captured:{ r:tr, c:tc }
      });
    }
  }
  return out;
}

function findRock(game = state){
  for (let r = 0; r < N; r++){
    for (let c = 0; c < N; c++){
      const p = game.board[r][c];
      if (p && p.type === "thudstone") return { r, c };
    }
  }
  return null;
}

function rockOnGoal(game = state){
  const rock = findRock(game);
  return !!rock && rock.r === 0 && rock.c >= 5 && rock.c <= 9;
}

function trollsAdjacentToRock(game = state){
  const rock = findRock(game);
  if (!rock) return 0;
  let n = 0;
  for (const [dr, dc] of DIRS){
    const rr = rock.r + dr, cc = rock.c + dc;
    if (inBoard(rr, cc) && game.board[rr][cc].type === "troll") n++;
  }
  return n;
}

/* Koom: un troll queda atrapado si el enano movido y otro enano lo
   flanquean en línea recta (incluidas las diagonales). */
function trappedTrollsFrom(pos, game = state){
  const out = [];
  for (const [dr, dc] of DIRS){
    const tr = pos.r + dr, tc = pos.c + dc;
    const br = pos.r + dr * 2, bc = pos.c + dc * 2;
    if (!inBoard(tr, tc) || !inBoard(br, bc)) continue;
    if (game.board[tr][tc].type === "troll" &&
        game.board[br][bc].type === "dwarf"){
      out.push({ r:tr, c:tc });
    }
  }
  return out;
}

function captureTrappedTrolls(pos, game = state){
  const trapped = trappedTrollsFrom(pos, game);
  for (const p of trapped){
    game.board[p.r][p.c] = empty();
    log("log.koomTrap", { cell: coord(p) }, true);
  }
  return trapped.length > 0;
}

function adjacentDwarfs(r, c, game = state){
  const out = [];
  for (const [dr, dc] of DIRS){
    const rr = r + dr, cc = c + dc;
    if (inBoard(rr, cc) && game.board[rr][cc].type === "dwarf"){
      out.push({ r:rr, c:cc });
    }
  }
  return out;
}

/* ---- turns.js ---- */
/* Turnos, fin de batalla y resultados */

/* ---------- TURNOS Y FIN DE BATALLA ---------- */
function endTurn(){
  if (state.mode === "koom"){
    const winner = koomEliminationWinner();
    if (winner){
      finishKoomBattle(winner, "elimination");
      return;
    }
  }

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
  notifyGameState();
}

function koomEliminationWinner(){
  const dwarfs = countType("dwarf");
  const trolls = countType("troll");
  if (dwarfs === 0 && trolls === 0) return "draw";
  if (trolls === 0) return "dwarfs";
  if (dwarfs === 0) return "trolls";
  return null;
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
    const winner = koomEliminationWinner();
    if (winner){
      finishKoomBattle(winner, "elimination");
      return true;
    }
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

function renderResult(dwarfs, trolls, verdict){
  const result = document.getElementById("result");
  result.hidden = false;

  if (state.mode === "koom"){
    const winner = state.koomWinner || "draw";
    const suffix = winner !== "draw" && state.koomReason === "elimination"
      ? ".elimination"
      : "";
    result.innerHTML = t("result.koom." + winner + suffix);
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
  notifyGameState();
}

function finishKoomBattle(winner, reason = "objective"){
  if (state.over) return;

  if (winner === "draw"){
    const elimination = koomEliminationWinner();
    if (elimination && elimination !== "draw"){
      winner = elimination;
      reason = "elimination";
    }
  }

  state.over = true;
  state.koomWinner = winner;
  state.koomReason = winner === "draw" ? null : reason;
  state.phase = "normal";
  state.selected = null;
  state.targets = [];
  state.captureCells = [];
  state.mustCapture = false;
  state.captured = 0;

  let logKey = "log.koomDraw";
  if (winner === "dwarfs"){
    logKey = reason === "elimination" ? "log.koomEndDwarfsElimination" : "log.koomEndDwarfs";
  } else if (winner === "trolls"){
    logKey = reason === "elimination" ? "log.koomEndTrollsElimination" : "log.koomEndTrolls";
  }
  log(logKey, null, true);

  renderResult(countType("dwarf"), countType("troll"));
  render();
  updateUI();
  notifyGameState();
}

/* ---- moves.js ---- */
/* Aplicacion de movimientos, capturas y pisotones */

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
      notifyGameState();
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
  notifyGameState();
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
    notifyGameState();
  }
}

/* ---- animation.js ---- */
/* Animacion de movimientos y ejecucion de destinos */

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
  }).catch(err => {
    if (!err || err.name !== "AbortError"){
      console.error("Error al completar la animación:", err);
    }
  });

  return true;
}

/* ---- interaction.js ---- */
/* Interaccion: seleccion, clics y arrastre de piezas */

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

function onCellClick(r, c, fromAi = false){
  if (state.over || animatingMove) return;
  if (!fromAi && isAiTurn()) return;

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
  if (state.over || animatingMove || isAiTurn() || state.phase !== "normal") return;

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

/* ---- ai/evaluate.js ---- */
/* Heuristica de evaluacion de posiciones para la IA. */

const WIN_SCORE = 10000000;

function evaluate(game, aiSide){
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

/* ---- ai/rules.js ---- */
/* Reglas puras para que la IA pueda simular jugadas sin tocar la partida real. */

function cloneGame(game = state){
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

function getActions(game = state){
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

function simulateTurn(game, action){
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

/* ---- ai/choose.js ---- */
/* Eleccion de jugada: una capa de busqueda con evaluacion heuristica. */

function chooseAction(game = state, aiSide = game.ai && game.ai.side ? game.ai.side : game.turn){
  const actions = getActions(game);
  if (!actions.length) return null;

  let bestAction = null;
  let bestScore = -Infinity;

  for (const action of actions){
    const next = simulateTurn(game, action);
    const score = evaluate(next, aiSide);
    if (score > bestScore){
      bestScore = score;
      bestAction = action;
    }
  }

  return bestAction;
}

/* ---- ai/index.js ---- */
/* Orquestacion del turno de la IA. */

let timer = null;
let generation = 0;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function cancelAiTurn(){
  generation++;
  if (timer !== null){
    clearTimeout(timer);
    timer = null;
  }
  state.ai.thinking = false;
}

function scheduleAiTurn(delay = 420){
  if (!isAiTurn() || state.over || state.ai.thinking || timer !== null) return;

  const token = generation;
  timer = setTimeout(() => {
    timer = null;
    if (token !== generation) return;
    void runAiTurn(token);
  }, delay);
}

async function runAiTurn(token){
  if (token !== generation || !isAiTurn() || state.over) return;

  state.ai.thinking = true;
  updateUI();
  let failed = false;

  try {
    let guard = 0;
    while (token === generation && isAiTurn() && !state.over && guard++ < 200){
      await waitForAnimation(token);
      if (token !== generation || !isAiTurn() || state.over) break;

      if (state.phase === "capture"){
        if (state.captureCells.length){
          const cell = state.captureCells[0];
          onCellClick(cell.r, cell.c, true);
          await sleep(260);
          continue;
        }
        endTurn();
        break;
      }

      if (state.phase === "trample"){
        const action = chooseAction(state, state.ai.side);
        if (!action || action.type === "endTurn"){
          endTurn();
          break;
        }
        onCellClick(action.target.r, action.target.c, true);
        await waitForAnimation(token);
        continue;
      }

      const action = chooseAction(state, state.ai.side);
      if (!action || action.type === "endTurn"){
        endTurn();
        break;
      }

      onCellClick(action.from.r, action.from.c, true);
      await sleep(80);
      onCellClick(action.target.r, action.target.c, true);
      await waitForAnimation(token);
    }
  } catch (err){
    failed = true;
    console.error("Error en el turno de la IA:", err);
  } finally {
    if (token === generation){
      state.ai.thinking = false;
      updateUI();
      if (!failed && isAiTurn() && !state.over) scheduleAiTurn(300);
    }
  }
}

async function waitForAnimation(token){
  await sleep(20);
  while (token === generation && animatingMove){
    await sleep(40);
  }
}

/* ---- setup.js ---- */
/* Preparacion de la partida y colocacion inicial de piezas */

/* ---------- PREPARACIÓN ---------- */
function setupBoard(mode = state.mode){
  cancelAiTurn();
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
  state.koomReason = null;
  state.log = [];
  document.getElementById("result").hidden = true;

  log(state.mode === "koom" ? "log.koomStart" : "log.battleStart");
  render();
  updateUI();
  notifyGameState();
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

/* ---- modals.js ---- */
/* Modales: seleccion de modo, ayuda y confirmaciones */

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

const selection = {
  mode: "classic",
  opponent: "human",
  side: "dwarfs"
};

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

function openModeModal(){
  cancelAiTurn();

  selection.mode = state.mode === "koom" ? "koom" : "classic";
  selection.opponent = state.ai.enabled ? "ai" : "human";
  selection.side = state.ai.humanSide || "dwarfs";

  renderModeSelection();
  openModal(modeModal);
}

function selectMode(mode){
  if (activeModal !== modeModal) return;
  selection.mode = mode === "koom" ? "koom" : "classic";
  renderModeSelection();
}

function selectOpponent(opponent){
  if (activeModal !== modeModal) return;
  selection.opponent = opponent === "ai" ? "ai" : "human";
  renderModeSelection();
}

function selectSide(side){
  if (activeModal !== modeModal) return;
  selection.side = side === "trolls" ? "trolls" : "dwarfs";
  renderModeSelection();
}

function startSelectedGame(){
  if (activeModal !== modeModal) return;

  const vsAi = selection.opponent === "ai";
  state.ai.enabled = vsAi;
  state.ai.humanSide = vsAi ? selection.side : null;
  state.ai.side = vsAi ? otherSide(selection.side) : null;
  state.ai.thinking = false;

  closeModal(modeModal);
  setupBoard(selection.mode);
}

function renderModeSelection(){
  setSelected("modeClassic", selection.mode === "classic");
  setSelected("modeKoom", selection.mode === "koom");
  setSelected("opponentHuman", selection.opponent === "human");
  setSelected("opponentAi", selection.opponent === "ai");
  setSelected("sideDwarfs", selection.side === "dwarfs");
  setSelected("sideTrolls", selection.side === "trolls");

  const sideSection = document.getElementById("sideSection");
  if (sideSection) sideSection.hidden = selection.opponent !== "ai";
}

function setSelected(id, selected){
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle("selected", selected);
  el.setAttribute("aria-pressed", String(selected));
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

/* ---- app.js ---- */
/* Eventos y arranque de la aplicacion */

function bindEvents(){
  document.getElementById("modeClassic").addEventListener("click", () => selectMode("classic"));
  document.getElementById("modeKoom").addEventListener("click", () => selectMode("koom"));
  document.getElementById("opponentHuman").addEventListener("click", () => selectOpponent("human"));
  document.getElementById("opponentAi").addEventListener("click", () => selectOpponent("ai"));
  document.getElementById("sideDwarfs").addEventListener("click", () => selectSide("dwarfs"));
  document.getElementById("sideTrolls").addEventListener("click", () => selectSide("trolls"));
  document.getElementById("startGameBtn").addEventListener("click", () => startSelectedGame());
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

  document.addEventListener(LANGUAGE_CHANGE_EVENT, () => {
    updateUI();
    renderLog();
    if (state.over) renderResult(countType("dwarf"), countType("troll"));
  });

  document.addEventListener(GAME_STATE_EVENT, () => {
    scheduleAiTurn();
  });

  /* ---------- BOTONES ---------- */
  document.getElementById("langBtn").addEventListener("click", () => {
    switchLanguage(currentLang === "es" ? "en" : "es");
  });

  document.getElementById("endTurnBtn").addEventListener("click", () => {
    if (state.over || animatingMove || isAiTurn()) return;
    if (state.phase !== "capture" && state.phase !== "trample") return;
    if (state.phase === "capture" && state.mustCapture && state.captured === 0) return;
    endTurn();
  });

  document.getElementById("finalizeBtn").addEventListener("click", async () => {
    if (state.over || animatingMove || isAiTurn()) return;
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
    openModeModal();
  });
}

/* ---------- ARRANQUE ---------- */
async function init(){
  buildGrid();
  boardEl.addEventListener("click", e => {
    const cell = e.target.closest ? e.target.closest(".cell") : null;
    if (!cell) return;
    onCellClick(Number(cell.dataset.r), Number(cell.dataset.c));
  });
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
  openModeModal();
}

/* ---- module.js ---- */
/* Punto de entrada: modulo principal de la aplicacion. */

bindEvents();
init();

})();
