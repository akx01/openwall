import { useEffect, useRef } from "react";

const COLORS = [
  "#7C3AED","#6366f1","#f59e0b","#ec4899","#06b6d4",
  "#10b981","#f97316","#a78bfa","#fbbf24","#34d399",
];
const SHAPES = ["circle", "square", "triangle"];

function randBetween(a, b) {
  return a + Math.random() * (b - a);
}

export default function Confetti({ active, onDone }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Spawn particles
    particlesRef.current = Array.from({ length: 120 }, () => ({
      x: randBetween(canvas.width * 0.2, canvas.width * 0.8),
      y: randBetween(-20, -60),
      vx: randBetween(-4, 4),
      vy: randBetween(3, 9),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      size: randBetween(6, 14),
      rotation: randBetween(0, Math.PI * 2),
      rotationSpeed: randBetween(-0.15, 0.15),
      gravity: randBetween(0.12, 0.25),
      opacity: 1,
    }));

    let startTime = null;
    const DURATION = 3500;

    function draw(ts) {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.99;
        p.rotation += p.rotationSpeed;
        if (elapsed > DURATION * 0.6) {
          p.opacity = Math.max(0, 1 - (elapsed - DURATION * 0.6) / (DURATION * 0.4));
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.beginPath();

        if (p.shape === "circle") {
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        } else if (p.shape === "square") {
          ctx.rect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else {
          // triangle
          ctx.moveTo(0, -p.size / 2);
          ctx.lineTo(p.size / 2, p.size / 2);
          ctx.lineTo(-p.size / 2, p.size / 2);
          ctx.closePath();
        }
        ctx.fill();
        ctx.restore();
      });

      if (elapsed < DURATION) {
        animRef.current = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onDone?.();
      }
    }

    animRef.current = requestAnimationFrame(draw);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[200] pointer-events-none"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}
