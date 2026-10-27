/* Nucleo: constantes, estado, utilidades, referencias DOM y sonidos */

export const N = 15;
export const DIRS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

/* Tablero octagonal: 15x15 menos un triángulo de 15 casillas (5+4+3+2+1)
   en cada esquina. Equivale a exigir r+c>=5, r+(14-c)>=5, etc. */
export function inBoard(r, c){
  return r >= 0 && r < N && c >= 0 && c < N &&
         r + c >= 5 &&
         r + (N - 1 - c) >= 5 &&
         (N - 1 - r) + c >= 5 &&
         (N - 1 - r) + (N - 1 - c) >= 5;
}

/* Casilla del borde exterior: algún vecino ortogonal no pertenece al tablero. */
export function isPerimeter(r, c){
  return !inBoard(r-1,c) || !inBoard(r+1,c) || !inBoard(r,c-1) || !inBoard(r,c+1);
}

export const empty = () => ({ type:null, owner:null });
export const key = (r, c) => r + "," + c;
export const coord = p => String.fromCharCode(65 + p.c) + (p.r + 1);
export const otherSide = side => side === "dwarfs" ? "trolls" : "dwarfs";

export const GAME_STATE_EVENT = "thud:gamestate";

export const state = {
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

export function isAiTurn(){
  return !!state.ai.enabled && state.ai.side === state.turn;
}

export function notifyGameState(){
  document.dispatchEvent(new CustomEvent(GAME_STATE_EVENT));
}

export function countType(type){
  let n = 0;
  for (let r = 0; r < N; r++){
    for (let c = 0; c < N; c++){
      const p = state.board[r][c];
      if (p && p.type === type) n++;
    }
  }
  return n;
}

export const boardEl = document.getElementById("board");
export const cells = new Map();

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

export function playSound(name, { loop = false } = {}){
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

export function stopSound(name){
  const audio = soundPlayers[name];
  if (!audio || audio.paused) return;
  try {
    audio.pause();
    audio.currentTime = 0;
  } catch (err) {
    /* audio no disponible */
  }
}
