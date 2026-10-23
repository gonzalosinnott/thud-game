/* Genera resources/i18n/embedded.js a partir de es.properties y en.properties. */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const es = readFileSync(join(here, "es.properties"), "utf8");
const en = readFileSync(join(here, "en.properties"), "utf8");

const escapeTemplate = text => text
  .replace(/\\/g, "\\\\")
  .replace(/`/g, "\\`")
  .replace(/\$\{/g, "\\${");

const output =
  "/* Traducciones embebidas para usar como respaldo si falla la carga de los .properties.\n" +
  "   Se generan desde resources/i18n/es.properties y en.properties.\n" +
  "   Ejecutar: node resources/i18n/generate-embedded.mjs */\n" +
  "export const THUD_EMBEDDED_PROPERTIES = {\n" +
  "  es: `" + escapeTemplate(es) + "`,\n" +
  "  en: `" + escapeTemplate(en) + "`\n" +
  "};\n";

writeFileSync(join(here, "embedded.js"), output, "utf8");
console.log("embedded.js actualizado");
