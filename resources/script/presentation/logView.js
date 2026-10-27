/* Registro de la partida. */

import { t } from "../i18n/index.js";
import { resultVerdict } from "./verdict.js";

const MAX_LOG = 60;
const VISIBLE_LOG = 9;

export function addLog(store, key, params, highlight) {
  store.ui.log.push({ key, params: params || null, highlight: !!highlight });
  if (store.ui.log.length > MAX_LOG) store.ui.log.shift();
  renderLog(store);
}

export function renderLog(store) {
  const list = document.getElementById("log");
  if (!list) return;

  list.innerHTML = "";
  for (const entry of store.ui.log.slice(-VISIBLE_LOG)) {
    const item = document.createElement("li");
    const params = Object.assign({}, entry.params);
    if (entry.key === "log.battleEnd") {
      params.verdict = resultVerdict(params.dwarfPts, params.trollPts);
    }
    item.textContent = t(entry.key, params);
    if (entry.highlight) item.className = "hl";
    list.appendChild(item);
  }
  list.scrollTop = list.scrollHeight;
}
