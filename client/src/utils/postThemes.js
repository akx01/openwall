// Post themes — each has a CSS class, a label, a preview gradient, and a text-safe flag
export const POST_THEMES = [
  {
    id: "default",
    label: "Default",
    css: "post-theme-default",
    preview: "bg-white dark:bg-navy-700",
    dark: false,
    icon: "⬜",
  },
  {
    id: "ocean",
    label: "Ocean",
    css: "post-theme-ocean",
    preview: "bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]",
    dark: true,
    icon: "🌊",
  },
  {
    id: "sunset",
    label: "Sunset",
    css: "post-theme-sunset",
    preview: "bg-gradient-to-br from-[#f7971e] via-[#ffd200] to-[#ff512f]",
    dark: false,
    icon: "🌅",
  },
  {
    id: "forest",
    label: "Forest",
    css: "post-theme-forest",
    preview: "bg-gradient-to-br from-[#134e5e] to-[#71b280]",
    dark: true,
    icon: "🌿",
  },
  {
    id: "midnight",
    label: "Midnight",
    css: "post-theme-midnight",
    preview: "bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]",
    dark: true,
    icon: "🌙",
  },
  {
    id: "rose",
    label: "Rose",
    css: "post-theme-rose",
    preview: "bg-gradient-to-br from-[#f953c6] to-[#b91d73]",
    dark: true,
    icon: "🌸",
  },
  {
    id: "aurora",
    label: "Aurora",
    css: "post-theme-aurora",
    preview: "bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]",
    dark: true,
    icon: "🔮",
  },
];

export function getTheme(id) {
  return POST_THEMES.find((t) => t.id === id) || POST_THEMES[0];
}
