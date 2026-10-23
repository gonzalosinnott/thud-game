# Thud

Juego de Thud (Terry Pratchett) en HTML, CSS y JavaScript.

## Ejecutar

### Con servidor local

Recomendado para desarrollo:

```bash
py -m http.server 8000
```

Abrir `http://localhost:8000/thud-game.html`.

### Abriendo el archivo directamente

También se puede abrir `thud-game.html` con doble clic. En ese caso `main.js` carga `thud.bundle.js`, porque Chrome y Edge bloquean los módulos ES desde `file://`.

## Estructura de scripts

- `resources/script/main.js`: bootstrap; elige módulos ES o bundle clásico según el protocolo.
- `module.js`: punto de entrada de los módulos ES.
- `thud.bundle.js`: bundle clásico generado para `file://`.
- `core.js`: constantes, estado, utilidades, DOM y sonidos.
- `i18n.js`: internacionalización.
- `board.js`: tablero y renderizado.
- `setup.js`: preparación de partidas.
- `movement.js`: movimientos legales y reglas de Koom.
- `interaction.js`: clics y arrastre.
- `animation.js`: animaciones.
- `moves.js`: aplicación de movimientos y capturas.
- `turns.js`: turnos y fin de batalla.
- `verdict.js`: veredicto de la batalla clásica.
- `ui.js`: panel y registro.
- `modals.js`: modales.
- `app.js`: eventos e inicialización.

## Estilos

- `resources/style/thud-style.css`: estilos del tablero, panel y modales.

## Generar archivos derivados

Después de modificar los módulos, regenerar el bundle para `file://`:

```bash
node resources/script/build-classic.mjs
```

Después de modificar las traducciones, regenerar la copia embebida:

```bash
node resources/i18n/generate-embedded.mjs
```
