/* Fachada de internacionalización. */

import { applyTranslations } from "./dom.js";
import { loadLocale } from "./loader.js";
import {
  LANGUAGE_CHANGE_EVENT,
  getLang,
  persistLanguage,
  preferredLanguage,
  t
} from "./store.js";

export {
  LANGUAGE_CHANGE_EVENT,
  applyTranslations,
  getLang,
  loadLocale,
  preferredLanguage,
  t
};

export async function switchLanguage(lang) {
  if (lang === getLang()) return;

  const button = document.getElementById("langBtn");
  if (button) button.disabled = true;

  try {
    await loadLocale(lang);
    persistLanguage(lang);
    applyTranslations();
    document.dispatchEvent(new CustomEvent(LANGUAGE_CHANGE_EVENT));
  } catch (err) {
    console.error("No se pudo cambiar el idioma:", err);
  } finally {
    if (button) button.disabled = false;
  }
}
