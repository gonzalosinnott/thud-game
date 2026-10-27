/* Genera resources/script/thud.bundle.js para abrir el juego con file://. */

import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

await build({
  entryPoints: [join(here, "module.js")],
  outfile: join(here, "thud.bundle.js"),
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["es2020"],
  legalComments: "none",
  sourcemap: false,
  minify: false,
  banner: {
    js: "/* GENERADO AUTOMATICAMENTE por build-classic.mjs. No editar a mano. */"
  }
});

console.log("thud.bundle.js actualizado");
