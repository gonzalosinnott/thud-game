# Thud

Juego de Thud (Terry Pratchett) en HTML, CSS y JavaScript, con los modos
Thud tradicional y Valle de Koom, juego local para dos personas y oponente
controlado por la máquina.

## Ejecutar

### Con servidor local

Recomendado para desarrollo:

```bash
py -m http.server 8000
```

Abrir `http://localhost:8000/thud-game.html`.

### Abriendo el archivo directamente

También se puede abrir `thud-game.html` con doble clic. En ese caso `main.js`
carga `thud.bundle.js`, porque Chrome y Edge bloquean los módulos ES desde
`file://`.

## Desarrollo

El proyecto usa Node.js únicamente para tests y para generar los archivos
derivados. No hay dependencias de ejecución para el juego.

```bash
npm install
npm test
npm run build
```

- `npm test`: tests del dominio y de la IA con el runner integrado de Node.
- `npm run build`: regenera `thud.bundle.js` y `embedded.js`.
- `npm run check`: ejecuta tests y build.

## Arquitectura

La lógica está separada por responsabilidades:

- `resources/script/domain/`: motor puro de reglas. No conoce el DOM, la IA ni
  la interfaz.
  - `game.js`: creación de partidas, acciones legales, aplicación de acciones,
    turnos y resultados.
  - `variants/classic.js`: reglas del Thud tradicional.
  - `variants/koom.js`: reglas del Valle de Koom.
  - `pieces.js`, `geometry.js`, `constants.js`, `actions.js`: tablero, piezas,
    coordenadas y contratos de acciones.
- `resources/script/application/`: coordinación de la aplicación.
  - `gameController.js`: controlador; conecta dominio, presentación, sesión e IA.
  - `store.js`: estado de partida, sesión, interfaz e IA.
  - `selectors.js`: consultas derivadas de la sesión.
- `resources/script/presentation/`: DOM, tablero, panel, registro, resultado,
  modales, animaciones, sonido y entrada.
- `resources/script/ai/`: toda la lógica específica de la máquina.
  - `evaluate.js`: evaluación heurística.
  - `choose.js`: elección de jugada y simulación de turnos.
  - `scheduler.js`: programación asíncrona del turno de la IA.
- `resources/script/i18n/`: carga de traducciones, estado del idioma y aplicación
  al documento.
- `resources/script/app.js`: composición de eventos e inicialización.
- `resources/script/main.js`: bootstrap; elige módulos ES o bundle clásico según
  el protocolo.
- `resources/script/module.js`: punto de entrada de los módulos ES.
- `resources/script/thud.bundle.js`: bundle generado para `file://`.

## Modos y oponente

Al abrir la página se elige la versión (Thud tradicional o Valle de Koom) y el
oponente. Contra la máquina también se elige si la persona juega con enanos o
con trolls; la máquina toma el bando contrario. La selección vale solo para esta
sesión y se vuelve a pedir en cada recarga. «Nueva batalla» vuelve a
abrir esta selección y pide confirmación si hay una partida en curso.

En el Valle de Koom, además de los objetivos con la roca, gana el bando que
elimine por completo al rival: los enanos ganan si no queda ningún troll y los
trolls ganan si no queda ningún enano.

## Estilos

- `resources/style/thud-style.css`: estilos del tablero, panel y modales.
- `resources/assets/fonts/`: Grenze Gotisch y Alegreya (SIL OFL), incluidas para
  que la interfaz conserve su tipografía también sin conexión.

## Generar archivos derivados

Después de modificar los módulos o las traducciones:

```bash
npm run build
```

El comando regenera primero `resources/i18n/embedded.js` y después
`resources/script/thud.bundle.js`, de modo que el bundle para `file://` incluya
las traducciones actuales. El bundle se genera con esbuild como dependencia de
desarrollo. El HTML solo carga `resources/script/main.js`; el CSS permanece en
`resources/style`.
