import React from "react";
import { motion } from "framer-motion";

export default function BrandLogo({ className = "", size = "md", glow = true }) {
  const isSm = size === "sm";
  const logoSize = isSm ? "w-6 h-6 mr-1" : "w-8 h-8 mr-1.5";
  const fontSize = isSm ? "text-lg font-bold" : "text-2xl font-black";

  // The remaining letters of "Openwall" after replacing "O"
  const letters = "penwall".split("");

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const letterVariants = {
    hidden: { 
      opacity: 0, 
      y: 10,
      filter: "blur(2px)" 
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { 
        type: "spring", 
        stiffness: 140, 
        damping: 10 
      },
    },
    hover: {
      y: -2,
      scale: 1.05,
      color: "#F59E0B", // Accent yellow
      textShadow: "0 0 12px rgba(245,158,11,0.6)",
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 8 
      }
    }
  };

  // 10 Bricks forming the letter "O"
  const bricks = [
    // Top Row
    { id: 1, x: 4, y: 4, w: 7, h: 4, rx: 1, dx: -12, dy: -12, dr: -45 },
    { id: 2, x: 12, y: 4, w: 8, h: 4, rx: 1, dx: 0, dy: -15, dr: 15 },
    { id: 3, x: 21, y: 4, w: 7, h: 4, rx: 1, dx: 12, dy: -12, dr: 45 },
    // Right Column
    { id: 4, x: 24, y: 9, w: 4, h: 6, rx: 1, dx: 16, dy: -4, dr: 60 },
    { id: 5, x: 24, y: 17, w: 4, h: 6, rx: 1, dx: 16, dy: 6, dr: -35 },
    // Bottom Row
    { id: 6, x: 21, y: 24, w: 7, h: 4, rx: 1, dx: 12, dy: 12, dr: 35 },
    { id: 7, x: 12, y: 24, w: 8, h: 4, rx: 1, dx: 0, dy: 15, dr: -25 },
    { id: 8, x: 4, y: 24, w: 7, h: 4, rx: 1, dx: -12, dy: 12, dr: -60 },
    // Left Column
    { id: 9, x: 4, y: 17, w: 4, h: 6, rx: 1, dx: -16, dy: 6, dr: 50 },
    { id: 10, x: 4, y: 9, w: 4, h: 6, rx: 1, dx: -16, dy: -4, dr: -50 },
  ];

  const getBrickVariants = (dx, dy, dr) => ({
    hidden: {
      x: dx * 1.5,
      y: dy * 1.5,
      rotate: dr * 1.2,
      opacity: 0,
    },
    visible: {
      x: 0,
      y: 0,
      rotate: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 110,
        damping: 10,
      },
    },
    hover: {
      x: dx,
      y: dy,
      rotate: dr,
      opacity: 0.9,
      transition: {
        type: "spring",
        stiffness: 180,
        damping: 8,
      },
    },
  });

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={`flex items-center select-none cursor-pointer ${className}`}
    >
      {/* The Brick Wall "O" Letter */}
      <motion.svg
        className={`${logoSize} ${glow ? "drop-shadow-[0_0_8px_rgba(239,68,68,0.55)]" : ""} transition-all duration-300 overflow-visible align-middle`}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoOAccentGrad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="#EF4444" />
            <stop offset="1" stopColor="#F59E0B" />
          </linearGradient>
        </defs>

        {bricks.map((brick) => (
          <motion.rect
            key={brick.id}
            x={brick.x}
            y={brick.y}
            width={brick.w}
            height={brick.h}
            rx={brick.rx}
            fill="url(#logoOAccentGrad)"
            variants={getBrickVariants(brick.dx, brick.dy, brick.dr)}
            style={{ originX: 0.5, originY: 0.5 }}
          />
        ))}
      </motion.svg>

      {/* Animated Text Name "penwall" */}
      <motion.span
        variants={containerVariants}
        className={`${fontSize} tracking-tight font-display text-gray-900 dark:text-white flex items-center leading-none`}
      >
        {letters.map((char, index) => (
          <motion.span
            key={index}
            variants={letterVariants}
            className="inline-block origin-bottom"
            style={{ 
              textShadow: glow ? "0 0 8px rgba(239,68,68,0.15)" : "none"
            }}
          >
            {char}
          </motion.span>
        ))}
      </motion.span>
    </motion.div>
  );
}
