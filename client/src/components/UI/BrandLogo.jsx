import React from "react";
import { motion } from "framer-motion";

export default function BrandLogo({ className = "", size = "md", glow = true }) {
  const isSm = size === "sm";
  const logoSize = isSm ? "w-6 h-6" : "w-8 h-8";
  const fontSize = isSm ? "text-lg font-bold" : "text-2xl font-black";

  // Framer Motion variants
  const letters = "Openwall".split("");

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.2,
      },
    },
  };

  const letterVariants = {
    hidden: { 
      opacity: 0, 
      x: -12, 
      filter: "blur(3px)" 
    },
    visible: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: { 
        type: "spring", 
        stiffness: 140, 
        damping: 10 
      },
    },
    hover: {
      y: -3,
      scale: 1.05,
      color: "#EC4899",
      textShadow: "0 0 12px rgba(236,72,153,0.8), 0 0 25px rgba(236,72,153,0.4)",
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 8 
      }
    }
  };

  const brickVariants = {
    hidden: { x: 3 }, // Start shifted right (closed)
    visible: {
      x: 0, // Slide open
      transition: { 
        type: "spring", 
        stiffness: 80, 
        damping: 8,
        delay: 0.1
      }
    },
    hover: {
      x: -2.5, // Slide further open on hover
      scaleY: 1.05,
      transition: {
        type: "spring",
        stiffness: 180,
        damping: 8
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={`flex items-center gap-2.5 select-none ${className}`}
    >
      {/* Animated SVG Wall Logo */}
      <svg
        className={`${logoSize} ${glow ? "drop-shadow-[0_0_8px_rgba(124,58,237,0.55)]" : ""} transition-all duration-300 overflow-visible`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Row 1 (Bricks) */}
        <rect x="2" y="5" width="6" height="3" rx="0.75" fill="currentColor" opacity="0.35" />
        <rect x="9" y="5" width="6" height="3" rx="0.75" fill="currentColor" opacity="0.35" />
        <rect x="16" y="5" width="6" height="3" rx="0.75" fill="currentColor" opacity="0.35" />
        
        {/* Row 2 - Dynamic sliding brick in center */}
        <rect x="2" y="9.5" width="4" height="3" rx="0.75" fill="currentColor" opacity="0.35" />
        {/* Glowing animated brick */}
        <motion.rect
          variants={brickVariants}
          x="7" y="9" width="10" height="4" rx="1.2"
          fill="url(#brandLogoGrad)"
          className="cursor-pointer"
        />
        <rect x="18" y="9.5" width="4" height="3" rx="0.75" fill="currentColor" opacity="0.35" />
        
        {/* Row 3 (Bricks) */}
        <rect x="2" y="14" width="6" height="3" rx="0.75" fill="currentColor" opacity="0.35" />
        <rect x="9" y="14" width="6" height="3" rx="0.75" fill="currentColor" opacity="0.35" />
        <rect x="16" y="14" width="6" height="3" rx="0.75" fill="currentColor" opacity="0.35" />
        
        <defs>
          <linearGradient id="brandLogoGrad" x1="7" y1="9" x2="17" y2="13" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8B5CF6" />
            <stop offset="1" stopColor="#EC4899" />
          </linearGradient>
        </defs>
      </svg>

      {/* Animated Text Name */}
      <motion.span
        variants={containerVariants}
        className={`${fontSize} tracking-tight font-display text-brand flex items-center leading-none`}
      >
        {letters.map((char, index) => (
          <motion.span
            key={index}
            variants={letterVariants}
            className="inline-block origin-bottom"
            style={{ 
              textShadow: glow ? "0 0 8px rgba(124,58,237,0.25)" : "none"
            }}
          >
            {char}
          </motion.span>
        ))}
      </motion.span>
    </motion.div>
  );
}
