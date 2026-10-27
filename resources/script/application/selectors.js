/* Selectores puros sobre la sesión y la partida. */

export function isAiTurn(session, game) {
  return session.opponent === "ai" && session.aiSide === game.turn;
}

export function isHumanTurn(session, game) {
  return !isAiTurn(session, game);
}
