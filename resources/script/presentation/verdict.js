/* Veredicto de la batalla clásica. */

import { t } from "../i18n/index.js";

export function resultVerdict(dwarfPts, trollPts) {
  const diff = trollPts - dwarfPts;
  if (diff > 0) {
    return t(diff === 1 ? "result.trollLead.one" : "result.trollLead.other", { diff });
  }
  if (diff < 0) {
    return t(diff === -1 ? "result.dwarfLead.one" : "result.dwarfLead.other", { diff: -diff });
  }
  return t("result.draw");
}
