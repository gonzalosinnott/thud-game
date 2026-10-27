/* Resultado final de la partida. */

import { t } from "../i18n/index.js";
import { resultVerdict } from "./verdict.js";

export function renderResult(store) {
  const element = document.getElementById("result");
  if (!element) return;

  const { game } = store;
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
