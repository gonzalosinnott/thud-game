/* Aplicación de traducciones al documento. */

import { getLang, t } from "./store.js";

export function applyTranslations() {
  document.documentElement.lang = getLang();
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
  if (langBtn) {
    langBtn.textContent = getLang().toUpperCase();
    langBtn.setAttribute("aria-label", t("lang.switch"));
    langBtn.setAttribute("title", t("lang.switch"));
  }
}
