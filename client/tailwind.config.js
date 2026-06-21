/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#7C3AED",
          light: "#A78BFA",
          dark: "#5B21B6",
          glow: "rgba(124,58,237,0.35)",
        },
        surface: {
          DEFAULT: "#ffffff",
          dark: "#0B0B0B",
        },
        navy: {
          900: "#080808",
          800: "#121212",
          700: "#1A1A1A",
          600: "#262626",
        },
      },
      fontFamily: {
        sans: ["Space Grotesk", "sans-serif"],
        display: ["Syne", "sans-serif"],
      },
      backgroundImage: {
        "aurora-light":
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,58,237,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 90% 80%, rgba(6,182,212,0.08) 0%, transparent 55%), radial-gradient(ellipse 50% 60% at 0% 60%, rgba(217,70,239,0.06) 0%, transparent 50%)",
        "aurora-dark":
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,58,237,0.22) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 90% 80%, rgba(6,182,212,0.12) 0%, transparent 55%), radial-gradient(ellipse 50% 60% at 0% 60%, rgba(217,70,239,0.1) 0%, transparent 50%)",
      },
      animation: {
        "fade-slide": "fade-slide-in 0.3s cubic-bezier(0.16,1,0.3,1) both",
        "slide-up": "slide-up 0.35s cubic-bezier(0.16,1,0.3,1) both",
        "scale-in": "scale-in 0.25s cubic-bezier(0.34,1.56,0.64,1) both",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        shimmer: "shimmer 1.8s linear infinite",
        float: "float 6s ease-in-out infinite",
        "bounce-dot": "bounce-dot 1.2s infinite ease-in-out both",
        "confetti-fall": "confetti-fall 1s ease-in forwards",
        "aurora-shift": "aurora-shift 12s ease-in-out infinite alternate",
        "ping-slow": "ping 2s cubic-bezier(0,0,0.2,1) infinite",
        "message-in-left": "message-in-left 0.25s cubic-bezier(0.16,1,0.3,1) both",
        "message-in-right": "message-in-right 0.25s cubic-bezier(0.16,1,0.3,1) both",
      },
      keyframes: {
        "fade-slide-in": {
          from: { opacity: 0, transform: "translateY(10px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: 0, transform: "translateY(16px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: 0, transform: "scale(0.92)" },
          to: { opacity: 1, transform: "scale(1)" },
        },
        "glow-pulse": {
          "0%,100%": { boxShadow: "0 0 20px rgba(124,58,237,0.15)" },
          "50%": { boxShadow: "0 0 40px rgba(124,58,237,0.35)" },
        },
        shimmer: {
          from: { backgroundPosition: "-200% 0" },
          to: { backgroundPosition: "200% 0" },
        },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "bounce-dot": {
          "0%,80%,100%": { transform: "scale(0.6)", opacity: 0.4 },
          "40%": { transform: "scale(1.1)", opacity: 1 },
        },
        "confetti-fall": {
          from: { transform: "translateY(-20px) rotate(0deg)", opacity: 1 },
          to: { transform: "translateY(80px) rotate(720deg)", opacity: 0 },
        },
        "aurora-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" },
        },
        "message-in-left": {
          from: { opacity: 0, transform: "translateX(-10px) scale(0.97)" },
          to: { opacity: 1, transform: "translateX(0) scale(1)" },
        },
        "message-in-right": {
          from: { opacity: 0, transform: "translateX(10px) scale(0.97)" },
          to: { opacity: 1, transform: "translateX(0) scale(1)" },
        },
      },
      boxShadow: {
        "glow-brand": "0 0 0 1px rgba(124,58,237,0.3), 0 4px 24px rgba(124,58,237,0.2)",
        "glow-brand-lg": "0 0 0 2px rgba(124,58,237,0.4), 0 8px 40px rgba(124,58,237,0.3)",
        "card-hover": "0 8px 30px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
        "dark-card": "0 4px 24px rgba(0,0,0,0.4)",
        "dark-card-hover": "0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,58,237,0.15)",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};