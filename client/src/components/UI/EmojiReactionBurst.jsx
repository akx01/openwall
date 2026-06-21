import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * Fires an emoji burst animation at (x, y) screen coordinates.
 * Call: fireEmojiReaction(emoji, clientX, clientY)
 */

let _fireRef = null;

export function fireEmojiReaction(emoji, x, y) {
  _fireRef?.(emoji, x, y);
}

export default function EmojiReactionBurst() {
  const ref = useRef(null);

  useEffect(() => {
    _fireRef = (emoji, x, y) => {
      const count = 8;
      for (let i = 0; i < count; i++) {
        const el = document.createElement("span");
        el.className = "emoji-burst-particle";
        el.textContent = emoji;

        // Random direction & arc
        const angle = (360 / count) * i + (Math.random() - 0.5) * 25;
        const dist = 70 + Math.random() * 80;
        const rad = (angle * Math.PI) / 180;
        const tx = Math.cos(rad) * dist;
        const ty = Math.sin(rad) * dist - 30; // bias upward
        const rot = (Math.random() - 0.5) * 200;
        const size = 16 + Math.random() * 14;
        const dur = 0.65 + Math.random() * 0.45;
        const delay = Math.random() * 0.1;
        const scaleEnd = 0.5 + Math.random() * 0.6;

        el.style.cssText = `
          left: ${x}px;
          top: ${y}px;
          --tx: ${tx}px;
          --ty: ${ty}px;
          --rot: ${rot}deg;
          --size: ${size}px;
          --dur: ${dur}s;
          --scale-end: ${scaleEnd};
          animation-delay: ${delay}s;
        `;

        document.body.appendChild(el);
        // Clean up after animation ends
        setTimeout(() => el.remove(), (dur + delay + 0.1) * 1000);
      }
    };

    return () => {
      _fireRef = null;
    };
  }, []);

  // No visible DOM — particles are appended to body
  return null;
}
