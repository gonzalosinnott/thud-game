/* Estado del idioma y traducción. */

import { THUD_EMBEDDED_PROPERTIES } from "../../i18n/embedded.js";
import { formatMessage, parseProperties } from "./messages.js";

const LOCALES = ["es", "en"];
export const LANGUAGE_CHANGE_EVENT = "thud:languagechange";

let currentLang = "es";
let messages = {};

export function getLang() {
  return currentLang;
}

export function isSupportedLang(lang) {
  return LOCALES.includes(lang);
}

export function setLocale(lang, text) {
  currentLang = lang;
  messages = parseProperties(text);
}

export function getEmbeddedLocale(lang) {
  return THUD_EMBEDDED_PROPERTIES[lang];
}

export function t(key, params) {
  const text = Object.prototype.hasOwnProperty.call(messages, key) ? messages[key] : key;
  return formatMessage(text, params);
}

export function preferredLanguage() {
  try {
    const saved = localStorage.getItem("thud.lang");
    if (LOCALES.includes(saved)) return saved;
  } catch (err) {
    /* localStorage puede no estar disponible */
  }
  return "es";
}

export function persistLanguage(lang) {
  try {
    localStorage.setItem("thud.lang", lang);
  } catch (err) {
    /* sin persistencia */
  }
}
