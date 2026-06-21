import { useMemo } from "react";

/**
 * PostThemeLayer — renders dynamic animated elements for specific themes.
 * Sits as an absolute overlay inside the post card.
 */
export default function PostThemeLayer({ theme }) {
  // Pre-generate star positions (stable across renders)
  const stars = useMemo(() => {
    if (theme !== "starfield") return [];
    return Array.from({ length: 90 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() < 0.08 ? 2.5 : Math.random() < 0.3 ? 1.5 : 1,
      delay: Math.random() * 5,
      duration: 2.5 + Math.random() * 3.5,
      opacity: 0.4 + Math.random() * 0.6,
    }));
  }, [theme]);

  // Glitch scan lines
  const glitchLines = useMemo(() => {
    if (theme !== "glitch") return [];
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      y: 10 + i * 18 + Math.random() * 10,
      delay: Math.random() * 4,
      duration: 0.08 + Math.random() * 0.1,
    }));
  }, [theme]);

  if (theme === "starfield") {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animation: `star-twinkle ${star.duration}s ${star.delay}s ease-in-out infinite alternate`,
            }}
          />
        ))}
        {/* Shooting star */}
        <div className="absolute shooting-star" />
      </div>
    );
  }

  if (theme === "glitch") {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
        {glitchLines.map((line) => (
          <div
            key={line.id}
            className="absolute left-0 right-0"
            style={{
              top: `${line.y}%`,
              height: "2px",
              background: "rgba(0,255,255,0.15)",
              animation: `glitch-line ${line.duration}s ${line.delay}s step-end infinite`,
            }}
          />
        ))}
      </div>
    );
  }

  return null;
}
