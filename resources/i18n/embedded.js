/* Traducciones embebidas para poder abrir thud-game.html con file://.
   Se generan desde resources/i18n/es.properties y en.properties.
   Si editás esos archivos, regenerá o actualizá también este archivo. */
window.THUD_EMBEDDED_PROPERTIES = {
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

totals.title.one=Acumulado en 1 batalla
totals.title.other=Acumulado en {n} batallas
totals.line=Enanos: {dwarfs} pts · Trolls: {trolls} pts

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

totals.title.one=Total after 1 battle
totals.title.other=Total after {n} battles
totals.line=Dwarfs: {dwarfs} pts · Trolls: {trolls} pts

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
`
};
