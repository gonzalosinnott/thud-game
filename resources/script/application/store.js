/* Estado de aplicación separado por responsabilidades. */

import { MODES } from "../domain/constants.js";
import { createGame } from "../domain/game.js";

export const store = {
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
