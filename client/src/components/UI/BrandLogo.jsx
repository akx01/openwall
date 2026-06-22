import React, { useState } from "react";
import { motion } from "framer-motion";

export default function BrandLogo({ className = "", size = "md", glow = true }) {
  const [isTapped, setIsTapped] = useState(false);

  const handleTap = () => {
    setIsTapped(true);
    setTimeout(() => setIsTapped(false), 1500);
  };
  const isSm = size === "sm";
  const isLg = size === "lg";
  const logoSize = isSm ? "w-7 h-7 mr-1.5" : isLg ? "w-14 h-14 mr-3" : "w-10 h-10 mr-2";
  const fontSize = isSm ? "text-lg font-bold" : isLg ? "text-4xl font-black" : "text-2xl font-extrabold";

  // Letters of "Openwall" (replacing the first 'O' with the brick logo)
  const letters = "penwall".split("");

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.1,
      },
    },
  };

  const letterVariants = {
    hidden: { 
      opacity: 0, 
      y: 12,
      scale: 0.8,
      filter: "blur(4px)" 
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { 
        type: "spring", 
        stiffness: 180, 
        damping: 12
      },
    },
  };

  // 10 Bricks forming the letter "O"
  const bricks = [
    // Top Row
    { id: 1, x: 4, y: 4, w: 7, h: 4, rx: 1.2, dx: -18, dy: -18, dr: -90 },
    { id: 2, x: 12, y: 4, w: 8, h: 4, rx: 1.2, dx: 0, dy: -24, dr: 0 },
    { id: 3, x: 21, y: 4, w: 7, h: 4, rx: 1.2, dx: 18, dy: -18, dr: 90 },
    // Right Column
    { id: 4, x: 24, y: 9, w: 4, h: 6, rx: 1.2, dx: 24, dy: -6, dr: 45 },
    { id: 5, x: 24, y: 17, w: 4, h: 6, rx: 1.2, dx: 24, dy: 6, dr: -45 },
    // Bottom Row
    { id: 6, x: 21, y: 24, w: 7, h: 4, rx: 1.2, dx: 18, dy: 18, dr: 90 },
    { id: 7, x: 12, y: 24, w: 8, h: 4, rx: 1.2, dx: 0, dy: 24, dr: 0 },
    { id: 8, x: 4, y: 24, w: 7, h: 4, rx: 1.2, dx: -18, dy: 18, dr: -90 },
    // Left Column
    { id: 9, x: 4, y: 17, w: 4, h: 6, rx: 1.2, dx: -24, dy: 6, dr: 45 },
    { id: 10, x: 4, y: 9, w: 4, h: 6, rx: 1.2, dx: -24, dy: -6, dr: -45 },
  ];

  const getBrickVariants = (dx, dy, dr) => ({
    hidden: {
      x: dx * 2,
      y: dy * 2,
      rotate: dr * 1.5,
      opacity: 0,
      scale: 0.5,
    },
    visible: {
      x: 0,
      y: 0,
      rotate: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 10,
      },
    },
    hover: {
      x: dx * 0.45,
      y: dy * 0.45,
      rotate: dr * 0.5,
      scale: 1.05,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 220,
        damping: 8,
      },
    },
  });

  return (
    <motion.div
      initial="hidden"
      animate={isTapped ? "hover" : "visible"}
      whileHover="hover"
      onClick={handleTap}
      className={`flex items-center select-none cursor-pointer group ${className}`}
    >
      {/* The Animated Brick Wall "O" Letter */}
      <div className="relative flex items-center justify-center">
        {/* Glow Ring Behind the Logo */}
        {glow && (
          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 0.8 },
              visible: { opacity: 0.4, scale: 1 },
              hover: { opacity: 0.8, scale: 1.15, rotate: 360 }
            }}
            transition={{
              hover: { rotate: { duration: 8, repeat: Infinity, ease: "linear" } },
              default: { type: "spring", stiffness: 100, damping: 10 }
            }}
            className="absolute inset-0 bg-gradient-to-tr from-brand via-pink-500 to-amber-500 rounded-full blur-[10px]"
            style={{ width: "95%", height: "95%", margin: "auto" }}
          />
        )}

        <motion.svg
          className={`${logoSize} overflow-visible align-middle relative z-10`}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logoCyberAurora" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8B5CF6" />
              <stop offset="0.5" stopColor="#EC4899" />
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
              fill="url(#logoCyberAurora)"
              variants={getBrickVariants(brick.dx, brick.dy, brick.dr)}
              style={{ originX: 0.5, originY: 0.5 }}
            />
          ))}
        </motion.svg>
      </div>

      {/* Animated Text Name "penwall" */}
      <motion.span
        variants={containerVariants}
        className={`${fontSize} tracking-tight font-display text-gray-900 dark:text-white flex items-center leading-none font-black ml-1`}
      >
        {letters.map((char, index) => (
          <motion.span
            key={index}
            variants={letterVariants}
            whileHover={{ 
              y: isSm ? -3 : isLg ? -8 : -5, 
              scale: 1.15, 
              color: "#EC4899",
              transition: { type: "spring", stiffness: 400, damping: 6 }
            }}
            className="inline-block origin-bottom transition-all duration-150"
            style={{
              textShadow: glow ? "0 0 10px rgba(139,92,246,0.2)" : "none",
            }}
          >
            {char}
          </motion.span>
        ))}
      </motion.span>
    </motion.div>
  );
}
