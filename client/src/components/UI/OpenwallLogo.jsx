import React from "react";

export default function OpenwallLogo({ className = "w-8 h-8", glow = true }) {
  return (
    <svg
      className={`${className} ${glow ? "drop-shadow-[0_0_8px_rgba(124,58,237,0.5)]" : ""} transition-all duration-300`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Brick Wall blocks */}
      {/* Row 1 */}
      <rect x="2" y="5" width="6" height="3" rx="0.75" fill="currentColor" opacity="0.45" />
      <rect x="9" y="5" width="6" height="3" rx="0.75" fill="currentColor" opacity="0.45" />
      <rect x="16" y="5" width="6" height="3" rx="0.75" fill="currentColor" opacity="0.45" />
      
      {/* Row 2 - Central brick sliding open and glowing */}
      <rect x="2" y="9.5" width="4" height="3" rx="0.75" fill="currentColor" opacity="0.45" />
      {/* Sliding glowing brick */}
      <rect x="7" y="9" width="10" height="4" rx="1" fill="url(#logoGrad)" className="animate-pulse" />
      <rect x="18" y="9.5" width="4" height="3" rx="0.75" fill="currentColor" opacity="0.45" />
      
      {/* Row 3 */}
      <rect x="2" y="14" width="6" height="3" rx="0.75" fill="currentColor" opacity="0.45" />
      <rect x="9" y="14" width="6" height="3" rx="0.75" fill="currentColor" opacity="0.45" />
      <rect x="16" y="14" width="6" height="3" rx="0.75" fill="currentColor" opacity="0.45" />
      
      <defs>
        <linearGradient id="logoGrad" x1="7" y1="9" x2="17" y2="13" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#EC4899" />
        </linearGradient>
      </defs>
    </svg>
  );
}
