/* Orquestación asíncrona del turno de la máquina. */

import { chooseAction } from "./choose.js";

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export function createAiScheduler({
  getGame,
  getSession,
  isAiTurn,
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
    if (!isAiTurn() || getGame().result || thinking || timer !== null) return;

    const token = generation;
    timer = setTimeout(() => {
      timer = null;
      void run(token);
    }, wait);
  }

  async function run(token) {
    if (token !== generation || !isAiTurn() || getGame().result) return;

    thinking = true;
    setThinking(true);
    refresh();
    let failed = false;
    let stalled = false;

    try {
      let guard = 0;
      while (token === generation && isAiTurn() && !getGame().result && guard++ < 200) {
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
        if (!failed && !stalled && isAiTurn() && !getGame().result) schedule(300);
      }
    }
  }

  return {
    schedule,
    cancel,
    isThinking: () => thinking
  };
}
