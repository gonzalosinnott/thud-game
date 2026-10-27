/* Traducciones embebidas para usar como respaldo si falla la carga de los .properties.
   Se generan desde resources/i18n/es.properties y en.properties.
   Ejecutar: node resources/i18n/generate-embedded.mjs */
export const THUD_EMBEDDED_PROPERTIES = {
  es: `# ---------------------------------------------------------------
# Thud — Traducciones al castellano
# ---------------------------------------------------------------
app.title=Thud — Enanos y Trolls
lang.switch=Cambiar idioma
help.open=Cómo se juega

board.aria=Tablero de Thud
log.aria=Registro de la partida
log.title=Registro

side.dwarfs=Enanos
side.trolls=Trolls
unit.dwarfs=enanos
unit.trolls=trolls
unit.pts=pts

turn.dwarfs=Turno de los Enanos
turn.trolls=Turno de los Trolls

btn.endTurn=Terminar turno
btn.captureRequired=Captura obligatoria
btn.finalize=Finalizar batalla
btn.newBattle=Nueva batalla
btn.restart=Reiniciar
btn.cancel=Cancelar
btn.confirm=Confirmar

legend.dwarf=Enano · 1 pt
legend.troll=Troll · 4 pts
legend.thudstone=Thudstone

status.selectDwarf=Selecciona un enano para mover o lanzar.
status.selectTroll=Selecciona un troll para mover o empujar.
status.noMoves=Esa pieza no tiene jugadas legales. Selecciona otra.
status.targets.one={n} destino disponible.
status.targets.other={n} destinos disponibles.
status.hurls.one={n} lanzamiento posible.
status.hurls.other={n} lanzamientos posibles.
status.shoves.one={n} empuje posible.
status.shoves.other={n} empujes posibles.
status.shoveRequired=Empuje: debes capturar al menos un enano adyacente. Luego termina el turno.
status.captureOptional=Captura opcional: pulsa los enanos adyacentes que quieras eliminar.
status.over=La batalla ha terminado. Pulsa «Nueva batalla» para jugar otra.

confirm.title=Confirmar
confirm.finalize.title=Finalizar batalla
confirm.finalize.text=¿Finalizar la batalla y contar los puntos?
confirm.new.title=Nueva batalla
confirm.new.text=¿Reiniciar la batalla actual? Se perderá el progreso de esta partida.

result.battle=<strong>Fin de la batalla</strong><br>Enanos: {dwarfs} piezas vivas → {dwarfPts} pts<br>Trolls: {trolls} piezas vivas → {trollPts} pts<br><strong>{verdict}</strong>
result.trollLead.one=Ventaja de los trolls por {diff} punto.
result.trollLead.other=Ventaja de los trolls por {diff} puntos.
result.dwarfLead.one=Ventaja de los enanos por {diff} punto.
result.dwarfLead.other=Ventaja de los enanos por {diff} puntos.
result.draw=Empate.

log.battleStart=Comienza la batalla. Los enanos mueven primero.
log.dwarfMove=Enano {from} → {to}.
log.trollMove=Troll {from} → {to}.
log.hurl=Lanzamiento: enano de {from} captura un troll en {to}.
log.shove=Empuje: trolls empujan, troll de {from} → {to}.
log.capture=Troll captura un enano en {cell}.
log.turnDwarfs=Turno de los enanos.
log.turnTrolls=Turno de los trolls.
log.battleEnd=Fin de la batalla — enanos: {dwarfPts} pts ({dwarfs}), trolls: {trollPts} pts ({trolls}). {verdict}

help.title=Cómo se juega
help.objective=<b>Objetivo:</b> capturar el máximo de piezas rivales. Los enanos puntúan 1 por pieza viva; los trolls, 4.
help.dwarfsTitle=Enanos <span>(mueven primero)</span>
help.dwarfsMove=<b>Mover:</b> como una dama de ajedrez, a casillas vacías, sin saltar piezas.
help.dwarfsHurl=<b>Lanzar:</b> en una línea recta de enanos adyacentes se lanza el enano frontal hasta tantas casillas como enanos tenga la línea. Debe caer sobre un troll para capturarlo.
help.trollsTitle=Trolls
help.trollsMove=<b>Mover:</b> como un rey del ajedrez, una casilla a una casilla vacía. Después puede capturar enanos adyacentes (opcional).
help.trollsShove=<b>Empujar:</b> una línea de trolls adyacentes empuja al troll del extremo hasta tantas casillas como trolls tenga la línea, sin ocupar casillas. Debe capturar al menos un enano adyacente al destino.
help.controlsTitle=Controles
help.controls1=Haz clic o arrastra una pieza propia para ver sus destinos posibles.
help.controls2=Haz clic en un destino resaltado, o suelta la pieza sobre él, para ejecutar la jugada.
help.controls3=Vuelve a hacer clic en la pieza seleccionada para deseleccionarla.
help.end=<b>Fin:</b> la batalla acaba cuando un bando se queda sin jugadas legales (o ambos acuerdan que no hay más capturas). Se comparan los puntos.

modal.close=Cerrar

# ---------------------------------------------------------------
# Selección de versión y Valle de Koom
# ---------------------------------------------------------------
mode.title=Elige un modo de juego
mode.version=Versión
mode.opponent=Oponente
mode.opponent.human=Otro humano
mode.opponent.ai=Máquina
mode.side=Jugás como
mode.side.dwarfs=Enanos
mode.side.trolls=Trolls
mode.start=Comenzar batalla
mode.classic.name=Thud tradicional
mode.classic.desc=32 enanos contra 8 trolls. Captura piezas y suma puntos por cada pieza no eliminada.
mode.koom.name=Valle de Koom
mode.koom.desc=Para ganar, los enanos deben llevar la roca al otro lado del valle, hasta cualquiera de las cinco casillas del lado opuesto del tablero, contra el que está sentado el comandante enano. Para ganar, los trolls deben capturar la roca colocando tres trolls adyacentes a ella (en cualquier dirección, incluidas las diagonales). Si ningún bando puede alcanzar su objetivo, la partida termina en empate.

legend.dwarf.koom=Enano
legend.troll.koom=Troll
legend.rock=Roca
matchup.ai=Vos: {human} · Máquina: {ai}

status.koomSelectDwarf=Lleva la roca a la fila dorada. Selecciona un enano o la roca.
status.koomSelectTroll=Rodea la roca con tres trolls. Selecciona un troll para mover o pisotear.
status.koomTrample=Puedes seguir pisoteando enanos o terminar el turno.
status.koomRockSelected=Roca seleccionada: debe terminar junto a un enano.
status.aiTurn=La máquina está jugando…
status.aiThinking=La máquina está pensando…
status.tramples.one={n} pisotón posible.
status.tramples.other={n} pisotones posibles.

confirm.finalize.koom.text=¿Finalizar la batalla? Si no se alcanzó ningún objetivo, se declarará un empate.

result.koom.dwarfs=<strong>Victoria de los Enanos</strong><br>La roca llegó a la fila dorada del valle.
result.koom.dwarfs.elimination=<strong>Victoria de los Enanos</strong><br>Todos los trolls fueron eliminados.
result.koom.trolls=<strong>Victoria de los Trolls</strong><br>Tres trolls rodearon la roca.
result.koom.trolls.elimination=<strong>Victoria de los Trolls</strong><br>Todos los enanos fueron eliminados.
result.koom.draw=<strong>Empate</strong><br>Ningún bando alcanzó su objetivo.

log.koomStart=Comienza la batalla por el Valle de Koom. Los enanos mueven primero.
log.koomRock=La roca se mueve de {from} a {to}.
log.koomTrap=Enano atrapa un troll en {cell}.
log.koomTrample=Troll pisotea un enano en {cell} ({from} → {to}).
log.koomPassDwarfs=Los enanos no tienen jugadas y pasan.
log.koomPassTrolls=Los trolls no tienen jugadas y pasan.
log.koomEndDwarfs=Fin de la batalla: victoria de los enanos. La roca llegó al otro lado.
log.koomEndDwarfsElimination=Fin de la batalla: victoria de los enanos. Todos los trolls fueron eliminados.
log.koomEndTrolls=Fin de la batalla: victoria de los trolls. La roca quedó rodeada.
log.koomEndTrollsElimination=Fin de la batalla: victoria de los trolls. Todos los enanos fueron eliminados.
log.koomDraw=Fin de la batalla: empate.

help.koom.objective=<b>Objetivo:</b> los enanos deben llevar la roca a una de las cinco casillas doradas del lado opuesto. Los trolls ganan si tres trolls quedan adyacentes a la roca.
help.koom.dwarfsTitle=Enanos <span>(mueven primero)</span>
help.koom.dwarfsMove=<b>Mover:</b> como una dama de ajedrez, a casillas vacías, sin saltar piezas.
help.koom.rock=<b>Mover la roca:</b> una casilla en cualquier dirección. La roca debe empezar y terminar junto a un enano.
help.koom.trap=<b>Capturar:</b> al mover un enano, captura los trolls que queden atrapados entre ese enano y otro enano en línea recta.
help.koom.trollsTitle=Trolls
help.koom.trollsMove=<b>Mover:</b> hasta tres casillas en línea recta, sin saltar piezas.
help.koom.trample=<b>Pisotear:</b> salta sobre un enano adyacente y aterriza en la casilla vacía inmediatamente posterior. Puede encadenar varios pisotones cambiando de dirección.
help.koom.end=<b>Fin:</b> los enanos ganan si la roca llega a la fila dorada; los trolls, si rodean la roca con tres trolls. Si nadie alcanza su objetivo, la partida termina en empate.
`,
  en: `# ---------------------------------------------------------------
# Thud — English translations
# ---------------------------------------------------------------
app.title=Thud — Dwarfs and Trolls
lang.switch=Switch language
help.open=How to play

board.aria=Thud board
log.aria=Battle log
log.title=Battle log

side.dwarfs=Dwarfs
side.trolls=Trolls
unit.dwarfs=dwarfs
unit.trolls=trolls
unit.pts=pts

turn.dwarfs=Dwarfs' turn
turn.trolls=Trolls' turn

btn.endTurn=End turn
btn.captureRequired=Capture required
btn.finalize=Finish battle
btn.newBattle=New battle
btn.restart=Restart
btn.cancel=Cancel
btn.confirm=Confirm

legend.dwarf=Dwarf · 1 pt
legend.troll=Troll · 4 pts
legend.thudstone=Thudstone

status.selectDwarf=Select a dwarf to move or hurl.
status.selectTroll=Select a troll to move or shove.
status.noMoves=That piece has no legal moves. Select another one.
status.targets.one={n} destination available.
status.targets.other={n} destinations available.
status.hurls.one={n} hurl possible.
status.hurls.other={n} hurls possible.
status.shoves.one={n} shove possible.
status.shoves.other={n} shoves possible.
status.shoveRequired=Shove: you must capture at least one adjacent dwarf. Then the turn ends.
status.captureOptional=Optional capture: click the adjacent dwarfs you want to remove.
status.over=The battle is over. Press "New battle" to play again.

confirm.title=Confirm
confirm.finalize.title=Finish battle
confirm.finalize.text=Finish the battle and count the points?
confirm.new.title=New battle
confirm.new.text=Restart the current battle? The progress of this game will be lost.

result.battle=<strong>Battle over</strong><br>Dwarfs: {dwarfs} pieces alive → {dwarfPts} pts<br>Trolls: {trolls} pieces alive → {trollPts} pts<br><strong>{verdict}</strong>
result.trollLead.one=Trolls lead by {diff} point.
result.trollLead.other=Trolls lead by {diff} points.
result.dwarfLead.one=Dwarfs lead by {diff} point.
result.dwarfLead.other=Dwarfs lead by {diff} points.
result.draw=Draw.

log.battleStart=The battle begins. Dwarfs move first.
log.dwarfMove=Dwarf {from} → {to}.
log.trollMove=Troll {from} → {to}.
log.hurl=Hurl: dwarf from {from} captures a troll at {to}.
log.shove=Shove: trolls push, troll from {from} → {to}.
log.capture=Troll captures a dwarf at {cell}.
log.turnDwarfs=Dwarfs' turn.
log.turnTrolls=Trolls' turn.
log.battleEnd=Battle over — dwarfs: {dwarfPts} pts ({dwarfs}), trolls: {trollPts} pts ({trolls}). {verdict}

help.title=How to play
help.objective=<b>Objective:</b> capture as many enemy pieces as possible. Dwarfs score 1 point per living piece; trolls score 4.
help.dwarfsTitle=Dwarfs <span>(move first)</span>
help.dwarfsMove=<b>Move:</b> like a chess queen, to empty squares, without jumping over pieces.
help.dwarfsHurl=<b>Hurl:</b> from a straight line of adjacent dwarfs, the front dwarf is hurled as many squares as there are dwarfs in the line. It must land on a troll to capture it.
help.trollsTitle=Trolls
help.trollsMove=<b>Move:</b> like a chess king, one square to an empty square. Then it may capture adjacent dwarfs (optional).
help.trollsShove=<b>Shove:</b> a line of adjacent trolls pushes the troll at the far end as many squares as there are trolls in the line, without landing on occupied squares. It must capture at least one dwarf adjacent to the destination.
help.controlsTitle=Controls
help.controls1=Click or drag one of your pieces to see its possible destinations.
help.controls2=Click a highlighted destination, or drop the piece on it, to make the move.
help.controls3=Click the selected piece again to deselect it.
help.end=<b>End:</b> the battle ends when one side has no legal moves left (or both agree that no more captures are possible). Points are then compared.

modal.close=Close

# ---------------------------------------------------------------
# Version selection and Koom Valley
# ---------------------------------------------------------------
mode.title=Choose a game mode
mode.version=Version
mode.opponent=Opponent
mode.opponent.human=Another human
mode.opponent.ai=Computer
mode.side=Play as
mode.side.dwarfs=Dwarfs
mode.side.trolls=Trolls
mode.start=Start battle
mode.classic.name=Classic Thud
mode.classic.desc=32 dwarfs against 8 trolls. Capture pieces and score points for each surviving piece.
mode.koom.name=Koom Valley
mode.koom.desc=For the dwarfs to win they must move the rock to the far side of the valley - onto any of the five squares on the opposite side of the board against which the dwarf commander is sitting. For the trolls to win they must capture the rock by placing three trolls adjacent to it (in any direction including diagonally). If neither side can achieve their objective the game is drawn.

legend.dwarf.koom=Dwarf
legend.troll.koom=Troll
legend.rock=Rock
matchup.ai=You: {human} · Computer: {ai}

status.koomSelectDwarf=Take the rock to the golden row. Select a dwarf or the rock.
status.koomSelectTroll=Surround the rock with three trolls. Select a troll to move or trample.
status.koomTrample=You may keep trampling dwarfs or end the turn.
status.koomRockSelected=Rock selected: it must end next to a dwarf.
status.aiTurn=The computer is playing…
status.aiThinking=The computer is thinking…
status.tramples.one={n} trample available.
status.tramples.other={n} tramples available.

confirm.finalize.koom.text=Finish the battle? If neither objective was reached, it will be a draw.

result.koom.dwarfs=<strong>Dwarfs win</strong><br>The rock reached the golden row of the valley.
result.koom.dwarfs.elimination=<strong>Dwarfs win</strong><br>All trolls were eliminated.
result.koom.trolls=<strong>Trolls win</strong><br>Three trolls surrounded the rock.
result.koom.trolls.elimination=<strong>Trolls win</strong><br>All dwarfs were eliminated.
result.koom.draw=<strong>Draw</strong><br>Neither side reached its objective.

log.koomStart=The battle for Koom Valley begins. Dwarfs move first.
log.koomRock=The rock moves from {from} to {to}.
log.koomTrap=A dwarf traps a troll at {cell}.
log.koomTrample=A troll tramples a dwarf at {cell} ({from} → {to}).
log.koomPassDwarfs=Dwarfs have no legal moves and pass.
log.koomPassTrolls=Trolls have no legal moves and pass.
log.koomEndDwarfs=Battle over: dwarfs win. The rock reached the far side.
log.koomEndDwarfsElimination=Battle over: dwarfs win. All trolls were eliminated.
log.koomEndTrolls=Battle over: trolls win. The rock was surrounded.
log.koomEndTrollsElimination=Battle over: trolls win. All dwarfs were eliminated.
log.koomDraw=Battle over: draw.

help.koom.objective=<b>Objective:</b> the dwarfs must take the rock to one of the five golden squares on the opposite side. The trolls win if three trolls end up adjacent to the rock.
help.koom.dwarfsTitle=Dwarfs <span>(move first)</span>
help.koom.dwarfsMove=<b>Move:</b> like a chess queen, to empty squares, without jumping over pieces.
help.koom.rock=<b>Move the rock:</b> one square in any direction. The rock must start and end next to a dwarf.
help.koom.trap=<b>Capture:</b> when a dwarf moves, it captures trolls trapped between that dwarf and another dwarf in a straight line.
help.koom.trollsTitle=Trolls
help.koom.trollsMove=<b>Move:</b> up to three squares in a straight line, without jumping over pieces.
help.koom.trample=<b>Trample:</b> jump over an adjacent dwarf and land on the empty square immediately beyond. You may chain several tramples, changing direction between them.
help.koom.end=<b>End:</b> dwarfs win if the rock reaches the golden row; trolls win if they surround the rock with three trolls. If neither objective is reached, it is a draw.
`
};
