// 3 Premium Animated Post Templates
// All use 4:3 aspect ratio (400px × 300px rendered)

export const POST_THEMES = [
  {
    id: "default",
    label: "Default",
    css: "post-theme-default",
    preview: "#ffffff",
    dark: false,
    icon: "⬜",
    font: null,
    align: "left",
  },

  // ─── PREMIUM ANIMATED TEMPLATES ───────────────────────────────

  {
    id: "starfield",
    label: "Starfield",
    css: "post-theme-starfield",
    preview: "#000000",
    dark: true,
    icon: "✨",
    font: null,
    align: "center",
    animated: true,
    description: "Deep black with animated twinkling stars",
  },
  {
    id: "glitch",
    label: "Glitch",
    css: "post-theme-glitch",
    preview: "#0a0a0a",
    dark: true,
    icon: "📺",
    font: "'Courier New', monospace",
    align: "left",
    animated: true,
    description: "Cyberpunk RGB glitch distortion",
  },
  {
    id: "polaroid",
    label: "Polaroid",
    css: "post-theme-polaroid",
    preview: "#f8f4ef",
    dark: false,
    icon: "📸",
    font: "'Georgia', serif",
    align: "center",
    animated: false,
    description: "Vintage polaroid photo with film grain",
  },
];

export function getTheme(id) {
  return POST_THEMES.find((t) => t.id === id) || POST_THEMES[0];
}
