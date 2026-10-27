/* Orquestacion del turno de la IA. */

import { state, isAiTurn } from "../core.js";
import { animatingMove } from "../animation.js";
import { onCellClick } from "../interaction.js";
import { endTurn } from "../turns.js";
import { updateUI } from "../ui.js";
import { chooseAction } from "./choose.js";

let timer = null;
let generation = 0;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export function cancelAiTurn(){
  generation++;
  if (timer !== null){
    clearTimeout(timer);
    timer = null;
  }
  state.ai.thinking = false;
}

export function scheduleAiTurn(delay = 420){
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
