/* Animación de movimientos. */

import { key } from "../domain/geometry.js";
import { playSound, stopSound } from "./audio.js";
import { pieceEl } from "./boardView.js";
import { cells } from "./dom.js";

let current = null;

export const animation = {
  isAnimating() {
    return !!current;
  },

  cancel() {
    if (!current) return;
    const active = current;
    current = null;
    if (active.timer) clearTimeout(active.timer);
    stopSound("move");
    if (active.animation) {
      try { active.animation.cancel(); } catch (err) { /* ya terminó */ }
    }
    active.ghost.remove();
    if (active.sourceEl) active.sourceEl.classList.remove("move-origin");
    active.resolve(false);
  },

  play(descriptor) {
    if (!descriptor || current) return Promise.resolve(false);

    const { from, to } = descriptor;
    const sourceCell = cells.get(key(from.r, from.c));
    const targetCell = cells.get(key(to.r, to.c));
    const sourceEl = sourceCell ? sourceCell.querySelector(".piece") : null;
    if (!sourceCell || !targetCell || !sourceEl) return Promise.resolve(true);

    const sourceRect = sourceEl.getBoundingClientRect();
    const targetRect = targetCell.getBoundingClientRect();
    const sourceX = sourceRect.left + sourceRect.width / 2;
    const sourceY = sourceRect.top + sourceRect.height / 2;
    const targetX = targetRect.left + targetRect.width / 2;
    const targetY = targetRect.top + targetRect.height / 2;
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const distance = Math.hypot(dx, dy);
    const lift = Math.min(40, 22 + distance * 0.1);

    const sourceStyle = getComputedStyle(sourceEl);
    const ghost = pieceEl({ type: descriptor.pieceType || sourceEl.classList[1] });
    ghost.classList.add("move-ghost");
    ghost.style.width = sourceStyle.width;
    ghost.style.height = sourceStyle.height;
    ghost.style.fontSize = sourceStyle.fontSize;
    ghost.style.left = sourceX + "px";
    ghost.style.top = sourceY + "px";
    document.body.appendChild(ghost);
    playSound("move", { loop: true });
    sourceEl.classList.add("move-origin");

    const duration = Math.min(560, 340 + distance * 1.2);

    return new Promise(resolve => {
      let settled = false;
      let animation = null;
      let timer = null;

      const settle = value => {
        if (settled) return;
        settled = true;
        if (timer) clearTimeout(timer);
        resolve(value);
      };

      const finish = value => {
        if (settled) return;
        if (current && current.animation === animation) current = null;
        stopSound("move");
        ghost.remove();
        sourceEl.classList.remove("move-origin");
        settle(value);
      };

      animation = ghost.animate([
        { transform: "translate(-50%, -50%) scale(1) rotate(0deg)" },
        {
          transform: "translate(calc(-50% + " + (dx * 0.52) + "px), calc(-50% + " + (dy * 0.52 - lift) + "px)) scale(1.22) rotate(-4deg)",
          offset: 0.55
        },
        { transform: "translate(calc(-50% + " + dx + "px), calc(-50% + " + dy + "px)) scale(1) rotate(0deg)" }
      ], {
        duration,
        easing: "cubic-bezier(.22,.75,.28,1)"
      });

      // En pestañas ocultas el navegador puede congelar las animaciones.
      // El temporizador garantiza que la partida nunca quede bloqueada.
      timer = setTimeout(() => {
        if (current && current.animation === animation) current = null;
        try { animation.cancel(); } catch (err) { /* ya terminó */ }
        finish(true);
      }, duration + 150);

      current = { ghost, sourceEl, animation, timer, resolve: settle };

      animation.finished.then(() => finish(true)).catch(err => {
        if (!err || err.name !== "AbortError") {
          console.error("Error al completar la animación:", err);
        }
        finish(false);
      });
    });
  }
};
