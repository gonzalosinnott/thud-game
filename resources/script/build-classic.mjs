/* Genera resources/script/thud.bundle.js para abrir el juego con file://. */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

// Orden topologico: cada modulo aparece despues de sus dependencias.
const order = [
  "../i18n/embedded.js",
  "core.js",
  "i18n.js",
  "verdict.js",
  "board.js",
  "ui.js",
  "movement.js",
  "turns.js",
  "moves.js",
  "animation.js",
  "interaction.js",
  "ai/evaluate.js",
  "ai/rules.js",
  "ai/choose.js",
  "ai/index.js",
  "setup.js",
  "modals.js",
  "app.js",
  "module.js"
];

// El bundle comparte un unico ámbito, así que dos módulos no pueden declarar
// el mismo símbolo en el nivel superior.
const declared = new Map();
for (const name of order){
  const source = readFileSync(join(here, name), "utf8");
  const pattern = /^(?:export\s+)?(?:async\s+)?(?:function|const|let|var)\s+([A-Za-z_$][\w$]*)/gm;
  for (const match of source.matchAll(pattern)){
    const symbol = match[1];
    if (declared.has(symbol)){
      throw new Error(
        `Colisión de símbolos en el bundle: "${symbol}" está en ` +
        `${declared.get(symbol)} y en ${name}`
      );
    }
    declared.set(symbol, name);
  }
}

function stripModuleSyntax(source){
  return source
    .replace(/^import\s+[\s\S]*?\s+from\s+["'][^"']+["'];?\s*/gm, "")
    .replace(/^import\s+["'][^"']+["'];?\s*/gm, "")
    .replace(/^export\s+/gm, "");
}

const chunks = order.map(name => {
  const source = readFileSync(join(here, name), "utf8");
  const code = stripModuleSyntax(source).trim();
  if (/^\s*(?:import|export)\s/m.test(code)){
    throw new Error("Quedaron imports/exports sin resolver en " + name);
  }
  return `/* ---- ${name} ---- */\n${code}\n`;
});

const output =
  "/* GENERADO AUTOMATICAMENTE por build-classic.mjs. No editar a mano. */\n" +
  "(() => {\n" +
  '"use strict";\n\n' +
  chunks.join("\n") +
  "\n})();\n";

writeFileSync(join(here, "thud.bundle.js"), output, "utf8");
console.log("thud.bundle.js actualizado");
