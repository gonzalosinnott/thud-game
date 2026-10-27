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
- `modals.js`: modales, incluida la elección de modo, oponente y bando.
- `app.js`: eventos e inicialización.
- `ai/rules.js`: simulación de jugadas sobre una copia de la partida.
- `ai/evaluate.js`: evaluación heurística de posiciones.
- `ai/choose.js`: elección de la mejor jugada.
- `ai/index.js`: orquestación del turno de la máquina.

## Modos y oponente

Al abrir la página se elige la versión (Thud tradicional o Valle de Koom) y el
oponente. Contra la máquina también se elige si la persona juega con enanos o
con trolls; la máquina toma el bando contrario. La selección vale solo para la
partida actual y se vuelve a pedir en cada recarga. “Nueva batalla” vuelve a
abrir esta selección y pide confirmación si hay una partida en curso.

En el Valle de Koom, además de los objetivos con la roca, gana el bando que
elimine por completo al rival: los enanos ganan si no queda ningún troll y los
trolls ganan si no queda ningún enano.

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
