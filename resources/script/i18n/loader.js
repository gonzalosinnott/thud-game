/* Carga de traducciones desde HTTP con respaldo embebido para file://. */

import { getEmbeddedLocale, setLocale } from "./store.js";

export async function loadLocale(lang) {
  const embedded = getEmbeddedLocale(lang);

  if (location.protocol === "file:") {
    if (!embedded) throw new Error("No hay traducciones embebidas para " + lang);
    setLocale(lang, embedded);
    return;
  }

  try {
    const response = await fetch("resources/i18n/" + lang + ".properties", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("No se pudo cargar " + lang + ".properties (HTTP " + response.status + ")");
    }
    setLocale(lang, await response.text());
  } catch (err) {
    if (!embedded) throw err;
    console.warn("No se pudo cargar " + lang + ".properties; se usan las traducciones embebidas.", err);
    setLocale(lang, embedded);
  }
}
