/* Sonidos del juego. */

const SOUND_VOLUME = { pickup: 0.55, putdown: 0.6, move: 0.32, thud: 0.7 };

const soundPlayers = {
  pickup: new Audio("resources/assets/pick-up.mp3"),
  putdown: new Audio("resources/assets/put-down.mp3"),
  move: new Audio("resources/assets/piece-movement.mp3"),
  thud: new Audio("resources/assets/thud.mp3")
};

for (const [name, audio] of Object.entries(soundPlayers)) {
  audio.preload = "auto";
  audio.volume = SOUND_VOLUME[name];
}

export function playSound(name, { loop = false } = {}) {
  const audio = soundPlayers[name];
  if (!audio) return;

  audio.loop = loop;
  try {
    audio.currentTime = 0;
    const playback = audio.play();
    if (playback && typeof playback.catch === "function") {
      playback.catch(() => { /* el navegador bloqueó el audio */ });
    }
  } catch (err) {
    /* audio no disponible */
  }
}

export function stopSound(name) {
  const audio = soundPlayers[name];
  if (!audio || audio.paused) return;

  try {
    audio.pause();
    audio.currentTime = 0;
  } catch (err) {
    /* audio no disponible */
  }
}
