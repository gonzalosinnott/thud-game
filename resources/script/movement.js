/* Movimientos legales, capturas de Koom y objetivos */

import { N, DIRS, inBoard, empty, key, coord, state } from "./core.js";
import { log } from "./ui.js";

/* ---------- MOVIMIENTOS POSIBLES ---------- */
export function dwarfTargets(r, c){
  if (state.mode === "koom"){
    const p = state.board[r][c];
    if (p && p.type === "thudstone") return rockTargets(r, c);
    return dwarfTargetsKoom(r, c);
  }
  return dwarfTargetsClassic(r, c);
}

export function trollTargets(r, c){
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
export function trollTargetsKoom(r, c){
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

export function rockOnGoal(){
  const rock = findRock();
  return !!rock && rock.r === 0 && rock.c >= 5 && rock.c <= 9;
}

export function trollsAdjacentToRock(){
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

export function captureTrappedTrolls(pos){
  const trapped = trappedTrollsFrom(pos);
  for (const p of trapped){
    state.board[p.r][p.c] = empty();
    log("log.koomTrap", { cell: coord(p) }, true);
  }
  return trapped.length > 0;
}

export function adjacentDwarfs(r, c){
  const out = [];
  for (const [dr, dc] of DIRS){
    const rr = r + dr, cc = c + dc;
    if (inBoard(rr, cc) && state.board[rr][cc].type === "dwarf"){
      out.push({ r:rr, c:cc });
    }
  }
  return out;
}
