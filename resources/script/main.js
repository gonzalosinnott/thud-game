/* Punto de entrada: carga los modulos ES por HTTP o el bundle clasico en file://. */

(() => {
  "use strict";

  const current = document.currentScript;
  const base = current
    ? new URL(".", current.src)
    : new URL("resources/script/", document.baseURI);

  function fail(src){
    const status = document.getElementById("status");
    if (status) status.textContent = "No se pudieron cargar los scripts del juego.";
    console.error("No se pudo cargar " + src);
  }

  function load(src, type, onError){
    const script = document.createElement("script");
    script.src = new URL(src, base).href;
    if (type) script.type = type;
    script.onerror = onError;
    document.head.appendChild(script);
  }

  if (location.protocol === "file:"){
    // Chrome y Edge bloquean los módulos ES desde file://; usamos el bundle.
    load("thud.bundle.js", "", () => fail("thud.bundle.js"));
  } else {
    load("module.js", "module", () => load("thud.bundle.js", "", () => fail("thud.bundle.js")));
  }
})();
