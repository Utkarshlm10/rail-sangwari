"use client";

import React from "react";

interface AppleAvatarProps {
  name: string;
  billaNumber?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

// Apple-style vibrant VisionOS gradient palettes per porter
const AVATAR_GRADIENTS: Record<string, { bg: string; accent: string; initialBg: string }> = {
  "BSP-108": {
    bg: "from-blue-600 via-indigo-600 to-violet-700",
    accent: "#60A5FA",
    initialBg: "bg-blue-500/20 text-blue-200",
  },
  "R-042": {
    bg: "from-emerald-600 via-teal-600 to-cyan-700",
    accent: "#34D399",
    initialBg: "bg-emerald-500/20 text-emerald-200",
  },
  "DURG-019": {
    bg: "from-slate-700 via-[#0F2A4A] to-[#071526]",
    accent: "#F59E0B",
    initialBg: "bg-amber-500/20 text-amber-300",
  },
  "BSP-256": {
    bg: "from-amber-600 via-orange-600 to-red-700",
    accent: "#FBBF24",
    initialBg: "bg-amber-500/20 text-amber-200",
  },
  "R-114": {
    bg: "from-cyan-600 via-blue-600 to-indigo-700",
    accent: "#38BDF8",
    initialBg: "bg-cyan-500/20 text-cyan-200",
  },
};

const DEFAULT_GRADIENT = {
  bg: "from-slate-700 via-zinc-800 to-neutral-900",
  accent: "#E2E8F0",
  initialBg: "bg-white/10 text-white",
};

export default function AppleAvatar({
  name,
  billaNumber = "",
  size = "md",
  className = "",
}: AppleAvatarProps) {
  const palette = AVATAR_GRADIENTS[billaNumber.toUpperCase().trim()] || DEFAULT_GRADIENT;

  const sizeClasses = {
    sm: "w-8 h-8 rounded-xl text-xs",
    md: "w-11 h-11 rounded-2xl text-sm",
    lg: "w-14 h-14 rounded-2xl text-base",
    xl: "w-16 h-16 rounded-3xl text-lg",
  }[size];

  const iconSizes = {
    sm: 18,
    md: 26,
    lg: 32,
    xl: 38,
  }[size];

  // Extract initials
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "RY";

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden shadow-md select-none bg-gradient-to-tr ${palette.bg} border border-white/25 dark:border-white/15 ${sizeClasses} ${className}`}
      title={`${name} (${billaNumber})`}
    >
      {/* Specular glass reflection shine */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-black/20 pointer-events-none" />

      {/* Stylized Apple Memoji / Porter Avatar Graphic */}
      <svg
        width={iconSizes}
        height={iconSizes}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-sm"
      >
        {/* Head / Face */}
        <circle cx="24" cy="20" r="10" fill="#FED7AA" />
        {/* Hair / Cap */}
        <path
          d="M14 18C14 13.5817 17.5817 10 22 10H26C30.4183 10 34 13.5817 34 18V20H14V18Z"
          fill="#C81E1E"
        />
        {/* Cap Visor */}
        <path
          d="M12 20C12 19.4477 12.4477 19 13 19H35C35.5523 19 36 19.4477 36 20C36 20.5523 35.5523 21 35 21H13C12.4477 21 12 20.5523 12 20Z"
          fill="#991B1B"
        />
        {/* Gold Billa Star / Badge on Cap */}
        <circle cx="24" cy="15" r="2.5" fill="#FBBF24" />
        <circle cx="24" cy="15" r="1.2" fill="#78350F" />
        {/* Friendly Eyes */}
        <circle cx="20.5" cy="21.5" r="1.3" fill="#1C1917" />
        <circle cx="27.5" cy="21.5" r="1.3" fill="#1C1917" />
        {/* Smile */}
        <path
          d="M21 25.5C22 27 26 27 27 25.5"
          stroke="#9A3412"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        {/* Sahayak Red Uniform Shoulders */}
        <path
          d="M10 42C10 34.268 16.268 29 24 29C31.732 29 38 34.268 38 42V44H10V42Z"
          fill="#DC2626"
        />
        {/* White Kurta Collar */}
        <path d="M21 29L24 34L27 29" stroke="#FEF2F2" strokeWidth="2" strokeLinecap="round" />
        {/* Brass Arm Billa Badge */}
        <rect x="11" y="36" width="6" height="5" rx="1.5" fill="#FBBF24" stroke="#78350F" strokeWidth="0.8" />
      </svg>

      {/* Tiny Badge Pill overlay in corner for medium/large */}
      {(size === "lg" || size === "xl") && (
        <span className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded-md bg-black/60 backdrop-blur-md text-[9px] font-mono font-black text-amber-300 border border-white/20 z-20">
          {billaNumber.split("-")[1] || initials}
        </span>
      )}
    </div>
  );
}
