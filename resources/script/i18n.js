/* Internacionalizacion: carga de textos, traducciones y cambio de idioma */

import { THUD_EMBEDDED_PROPERTIES } from "../i18n/embedded.js";

const LOCALES = ["es", "en"];
export const LANGUAGE_CHANGE_EVENT = "thud:languagechange";
export let currentLang = "es";
let messages = {};

function parseProperties(text){
  const out = {};
  for (const rawLine of text.split(/\r?\n/)){
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || line.startsWith("!")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    value = value.replace(/\\n/g, "\n").replace(/\\t/g, "\t");
    out[key] = value;
  }
  return out;
}

export async function loadLocale(lang){
  const embedded = THUD_EMBEDDED_PROPERTIES[lang];

  // file:// bloquea fetch por CORS. En ese caso usamos la copia embebida.
  if (location.protocol === "file:"){
    if (!embedded) throw new Error("No hay traducciones embebidas para " + lang);
    messages = parseProperties(embedded);
    currentLang = lang;
    return;
  }

  try {
    const res = await fetch("resources/i18n/" + lang + ".properties", { cache: "no-store" });
    if (!res.ok) throw new Error("No se pudo cargar " + lang + ".properties (HTTP " + res.status + ")");
    messages = parseProperties(await res.text());
    currentLang = lang;
  } catch (err) {
    // Si el servidor no tiene los .properties, seguimos funcionando con la copia embebida.
    if (!embedded) throw err;
    console.warn("No se pudo cargar " + lang + ".properties; se usan las traducciones embebidas.", err);
    messages = parseProperties(embedded);
    currentLang = lang;
  }
}

export function t(key, params){
  let text = Object.prototype.hasOwnProperty.call(messages, key) ? messages[key] : key;
  if (params){
    text = text.replace(/\{(\w+)\}/g, (match, name) =>
      Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match
    );
  }
  return text;
}

export function applyTranslations(){
  document.documentElement.lang = currentLang;
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
  langBtn.textContent = currentLang.toUpperCase();
  langBtn.setAttribute("aria-label", t("lang.switch"));
  langBtn.setAttribute("title", t("lang.switch"));
}

export function preferredLanguage(){
  try {
    const saved = localStorage.getItem("thud.lang");
    if (LOCALES.includes(saved)) return saved;
  } catch (err) { /* localStorage puede no estar disponible */ }
  return "es";
}

export async function switchLanguage(lang){
  if (lang === currentLang) return;
  const btn = document.getElementById("langBtn");
  btn.disabled = true;
  try {
    await loadLocale(lang);
    try { localStorage.setItem("thud.lang", lang); } catch (err) { /* sin persistencia */ }
    applyTranslations();
    document.dispatchEvent(new CustomEvent(LANGUAGE_CHANGE_EVENT));
  } catch (err) {
    console.error("No se pudo cambiar el idioma:", err);
  } finally {
    btn.disabled = false;
  }
}
