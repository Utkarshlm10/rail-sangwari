"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Compass,
  MapPin,
  Train,
  ArrowRight,
  Maximize2,
  X,
  Info,
  Footprints,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface CoachPlatformVisualizerProps {
  targetCoach: string; // e.g. "B4", "H1", "S5", "A1"
  platform: string; // e.g. "2"
  trainNumber?: string;
  trainName?: string;
  stationName?: string;
  className?: string;
}

interface CoachItem {
  code: string;
  type: string;
  fullName: string;
  landmark?: string;
  landmarkType?: "FOB" | "ESCALATOR" | "LIFT" | "EXIT" | "WATER";
}

export function CoachPlatformVisualizer({
  targetCoach,
  platform,
  trainNumber = "12853",
  trainName = "Amarkantak Express",
  stationName = "Bilaspur Junction (BSP)",
  className = "",
}: CoachPlatformVisualizerProps) {
  const { language } = useLanguage();
  const [selectedCoach, setSelectedCoach] = useState<CoachItem | null>(null);
  const [isExpandedModal, setIsExpandedModal] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const targetCoachRef = useRef<HTMLDivElement>(null);

  // Generate a realistic 22-coach Indian Railways LHB rake composition containing the target coach
  const coaches: CoachItem[] = React.useMemo(() => {
    const rawRake = [
      { code: "EOG", type: "Generator Car", fullName: "End on Generation Van" },
      { code: "GS1", type: "General Unreserved", fullName: "General Class" },
      { code: "GS2", type: "General Unreserved", fullName: "General Class", landmark: "FOB 1 (Main Entrance)", landmarkType: "FOB" as const },
      { code: "S1", type: "Sleeper Class (SL)", fullName: "Sleeper Class 1" },
      { code: "S2", type: "Sleeper Class (SL)", fullName: "Sleeper Class 2" },
      { code: "S3", type: "Sleeper Class (SL)", fullName: "Sleeper Class 3", landmark: "Platform Escalator", landmarkType: "ESCALATOR" as const },
      { code: "S4", type: "Sleeper Class (SL)", fullName: "Sleeper Class 4" },
      { code: "S5", type: "Sleeper Class (SL)", fullName: "Sleeper Class 5" },
      { code: "S6", type: "Sleeper Class (SL)", fullName: "Sleeper Class 6" },
      { code: "PC", type: "Pantry Car", fullName: "Pantry Car", landmark: "Water Vending ATM", landmarkType: "WATER" as const },
      { code: "B1", type: "AC 3-Tier (3A)", fullName: "AC 3 Tier 1" },
      { code: "B2", type: "AC 3-Tier (3A)", fullName: "AC 3 Tier 2" },
      { code: "B3", type: "AC 3-Tier (3A)", fullName: "AC 3 Tier 3", landmark: "Central FOB 2 & Lift", landmarkType: "LIFT" as const },
      { code: "B4", type: "AC 3-Tier (3A)", fullName: "AC 3 Tier 4", landmark: "Central FOB 2 Stairs", landmarkType: "FOB" as const },
      { code: "B5", type: "AC 3-Tier (3A)", fullName: "AC 3 Tier 5" },
      { code: "B6", type: "AC 3-Tier (3A)", fullName: "AC 3 Tier 6" },
      { code: "M1", type: "AC 3-Tier Economy", fullName: "3E Economy" },
      { code: "A1", type: "AC 2-Tier (2A)", fullName: "AC 2 Tier 1", landmark: "FOB 3 (East Overbridge)", landmarkType: "FOB" as const },
      { code: "A2", type: "AC 2-Tier (2A)", fullName: "AC 2 Tier 2" },
      { code: "H1", type: "AC First Class (1A)", fullName: "Executive First AC" },
      { code: "GS3", type: "General Unreserved", fullName: "General Class 3" },
      { code: "SLR", type: "Luggage & Brake Van", fullName: "Guard / Brake Van", landmark: "Station Exit Gate", landmarkType: "EXIT" as const },
    ];

    // Ensure targetCoach is explicitly present
    const normalizedTarget = targetCoach.toUpperCase().trim();
    const exists = rawRake.some((c) => c.code === normalizedTarget);
    if (!exists && normalizedTarget) {
      // Replace B4 or S5 with target coach
      rawRake[13] = {
        code: normalizedTarget,
        type: "Reserved Coach",
        fullName: `Coach ${normalizedTarget}`,
        landmark: "Central FOB 2 Stairs",
        landmarkType: "FOB",
      };
    }

    return rawRake;
  }, [targetCoach]);

  const normalizedTarget = targetCoach.toUpperCase().trim();
  const targetIndex = coaches.findIndex((c) => c.code === normalizedTarget);
  const targetCoachData = coaches[targetIndex] || coaches[13];

  // Auto-scroll to center on target coach on mount or when expanded
  useEffect(() => {
    const timer = setTimeout(() => {
      if (targetCoachRef.current && scrollContainerRef.current) {
        targetCoachRef.current.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [targetCoach, isExpandedModal]);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      
      {/* 2D Platform Visualizer Container */}
      <div className="apple-glass-card rounded-3xl p-4 sm:p-5 shadow-lg border border-black/[0.07] dark:border-white/10 relative overflow-hidden">
        
        {/* Header Strip */}
        <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08] mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0F2A4A] text-amber-400 border border-amber-400/40 flex items-center justify-center font-black shadow-xs shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                  {language === "hi_cg" ? "प्लेटफार्म कोच एवं ओवरब्रिज (FOB) मैप" : "Platform Coach & FOB Position Map"}
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-400/30">
                  PF {platform}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                {trainNumber} {trainName} • {stationName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Scroll navigation arrows */}
            <button
              onClick={() => handleScroll("left")}
              className="w-7 h-7 rounded-lg apple-glass-subcard hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-zinc-300 flex items-center justify-center transition-colors shadow-xs"
              title="Scroll Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll("right")}
              className="w-7 h-7 rounded-lg apple-glass-subcard hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-zinc-300 flex items-center justify-center transition-colors shadow-xs"
              title="Scroll Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Expand Modal Button */}
            <button
              onClick={() => setIsExpandedModal(true)}
              className="p-1.5 rounded-lg apple-glass-subcard hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-zinc-300 transition-colors shadow-xs"
              title="Expand Full View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic Walking & FOB Recommendation Banner */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-400/30 mb-3 flex items-start gap-2.5 text-xs text-slate-800 dark:text-zinc-200">
          <Footprints className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-snug">
            <span className="font-extrabold text-amber-800 dark:text-amber-300 block">
              {language === "hi_cg"
                ? `🎯 बोगी ${normalizedTarget} का स्थान: ${targetCoachData.landmark || "सेंट्रल ओवरब्रिज के पास"}`
                : `🎯 Coach ${normalizedTarget} Position: Halts opposite ${targetCoachData.landmark || "Central FOB 2"}`}
            </span>
            <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-medium">
              {language === "hi_cg"
                ? `प्लेटफार्म ${platform} पर सेंट्रल FOB 2 सीढ़ियों या लिफ्ट से उतरें। कुली साथी आपके बोगी के दरवाजे पर मिलेंगे।`
                : `Take Central FOB 2 stairs or lift down to Platform ${platform}. Your Sahayak will meet you directly at the coach door.`}
            </span>
          </div>
        </div>

        {/* 2D TRACK & RAKE SCHEMATIC (Horizontal Scrollable) */}
        <div className="relative pt-6 pb-4">
          
          {/* Platform Floor Indicator */}
          <div className="absolute top-2 left-0 right-0 flex items-center justify-between text-[9px] font-black tracking-widest text-slate-400 dark:text-zinc-500 uppercase px-2">
            <span>◄ ENGINE END (WEST EXIT)</span>
            <span className="px-2 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.08] text-slate-700 dark:text-zinc-300 font-mono">
              PLATFORM {platform} CONCOURSE
            </span>
            <span>GUARD END (EAST EXIT) ►</span>
          </div>

          <div
            ref={scrollContainerRef}
            className="flex items-end gap-1.5 overflow-x-auto pb-4 pt-6 px-2 scroll-smooth select-none no-scrollbar"
            style={{ scrollbarWidth: "none" }}
          >
            {/* 1. Indian Railways Electric Locomotive (WAP-7) */}
            <div className="shrink-0 flex flex-col items-center group cursor-pointer mr-1">
              <div className="text-[9px] font-extrabold text-red-600 dark:text-red-400 flex items-center gap-0.5 mb-1 font-mono">
                <Zap className="w-2.5 h-2.5" />
                <span>WAP-7</span>
              </div>
              
              {/* Locomotive Body Graphic */}
              <div className="w-24 h-14 rounded-r-2xl rounded-l-md bg-gradient-to-r from-red-700 via-red-600 to-red-800 border-2 border-red-500 text-white flex flex-col justify-between p-1.5 shadow-md relative">
                {/* Pantograph graphic on roof */}
                <div className="absolute -top-3 left-4 w-6 h-2.5 border-t-2 border-r-2 border-l-2 border-amber-400"></div>
                
                {/* Windows & Cab */}
                <div className="flex items-center justify-between px-1">
                  <div className="w-4 h-3 bg-cyan-200/90 rounded-sm border border-cyan-400/50 shadow-inner" />
                  <span className="text-[9px] font-black tracking-wider text-amber-300">IR</span>
                  <div className="w-5 h-3 bg-cyan-200/90 rounded-sm border border-cyan-400/50 shadow-inner" />
                </div>
                
                {/* Wheels & Cowcatcher */}
                <div className="flex items-center justify-between text-[8px] font-bold text-white/90 px-0.5">
                  <span className="font-mono">LOCO</span>
                  <div className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
                </div>
              </div>

              {/* Steel Track ties under wheels */}
              <div className="w-full flex justify-around mt-1">
                <span className="w-3 h-3 rounded-full bg-slate-800 dark:bg-zinc-700 border border-slate-600"></span>
                <span className="w-3 h-3 rounded-full bg-slate-800 dark:bg-zinc-700 border border-slate-600"></span>
              </div>
            </div>

            {/* Coupling link */}
            <div className="w-2 h-1 bg-slate-400 dark:bg-zinc-600 self-center shrink-0 mb-4" />

            {/* 2. Train Coaches Strip */}
            {coaches.map((coach, idx) => {
              const isTarget = coach.code === normalizedTarget;

              return (
                <div
                  key={coach.code}
                  ref={isTarget ? targetCoachRef : null}
                  onClick={() => setSelectedCoach(coach)}
                  className="shrink-0 flex flex-col items-center cursor-pointer group transition-transform active:scale-95"
                >
                  {/* Top Landmark Pin if attached */}
                  <div className="h-6 flex items-center justify-center mb-1">
                    {coach.landmark && (
                      <div
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs whitespace-nowrap ${
                          isTarget
                            ? "bg-amber-400 text-slate-950 font-black animate-bounce"
                            : "bg-black/[0.05] dark:bg-white/[0.1] text-slate-600 dark:text-zinc-300"
                        }`}
                        title={coach.landmark}
                      >
                        <MapPin className="w-2.5 h-2.5 shrink-0" />
                        <span className="max-w-[70px] truncate">{coach.landmark.split(" ")[0]}</span>
                      </div>
                    )}
                  </div>

                  {/* Coach Car Graphic */}
                  <div
                    className={`w-14 h-14 rounded-xl flex flex-col justify-between p-1.5 border-2 transition-all relative ${
                      isTarget
                        ? "bg-gradient-to-b from-[#0F2A4A] to-[#071526] text-white border-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.55)] scale-105 z-10"
                        : "bg-gradient-to-b from-slate-100 to-slate-200 dark:from-zinc-800 dark:to-zinc-900 text-slate-800 dark:text-zinc-200 border-black/10 dark:border-white/10 hover:border-amber-400/60"
                    }`}
                  >
                    {/* Glowing Target Badge above */}
                    {isTarget && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 text-[8px] font-black uppercase tracking-wider shadow-sm">
                        TARGET
                      </span>
                    )}

                    {/* Window Strip */}
                    <div className="flex items-center justify-between gap-0.5 px-0.5">
                      <span className="w-2.5 h-2 bg-cyan-200 dark:bg-cyan-900/60 rounded-xs border border-cyan-400/30" />
                      <span className="w-2.5 h-2 bg-cyan-200 dark:bg-cyan-900/60 rounded-xs border border-cyan-400/30" />
                      <span className="w-2.5 h-2 bg-cyan-200 dark:bg-cyan-900/60 rounded-xs border border-cyan-400/30" />
                    </div>

                    {/* Coach Code */}
                    <div className="text-center font-black font-mono text-xs sm:text-sm tracking-tight leading-none">
                      {coach.code}
                    </div>

                    {/* Position index */}
                    <div className="text-[8px] font-semibold text-center opacity-70 leading-none">
                      #{idx + 1}
                    </div>
                  </div>

                  {/* Steel Bogie Wheels */}
                  <div className="w-full flex justify-around mt-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-700 dark:bg-zinc-600 border border-slate-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-700 dark:bg-zinc-600 border border-slate-500"></span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Continuous Railway Track Rail Lines */}
          <div className="w-full h-1 bg-gradient-to-r from-slate-400 via-slate-500 to-slate-400 dark:from-zinc-700 dark:via-zinc-600 dark:to-zinc-700 rounded-full my-1 shadow-inner" />
          <div className="w-full h-0.5 bg-slate-300 dark:bg-zinc-800 rounded-full" />
        </div>

        {/* Coach Detail Drawer (When clicked) */}
        {selectedCoach && (
          <div className="mt-3 p-3.5 rounded-2xl apple-glass-subcard border border-amber-400/30 flex items-center justify-between text-xs animate-in fade-in duration-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm font-mono text-slate-900 dark:text-white">
                  Coach {selectedCoach.code}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.08] text-slate-700 dark:text-zinc-300">
                  {selectedCoach.type}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                {selectedCoach.landmark
                  ? `📍 Landmark: Halts directly opposite ${selectedCoach.landmark}`
                  : `Position: ${coaches.findIndex((c) => c.code === selectedCoach.code) + 1}th coach from locomotive`}
              </p>
            </div>
            <button
              onClick={() => setSelectedCoach(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

      {/* ================= FULL EXPANDED SCREEN MODAL ================= */}
      {isExpandedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-3xl apple-glass-card rounded-3xl p-6 shadow-2xl space-y-4 border border-black/10 dark:border-white/20">
            
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#0F2A4A] text-amber-400 border border-amber-400/40 flex items-center justify-center font-bold">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                    {language === "hi_cg" ? "पूर्ण प्लेटफार्म कोच एवं ओवरब्रिज मैप" : "Full Platform Coach & Overbridge Schematic"}
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">
                    {trainNumber} - {trainName} • Platform {platform} • {stationName}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsExpandedModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Coach Highlight Card */}
            <div className="p-4 rounded-2xl bg-[#0F2A4A] text-white border border-amber-400/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
                  YOUR ASSIGNED COACH
                </span>
                <span className="text-2xl font-black block mt-0.5">
                  Coach {normalizedTarget}
                </span>
                <span className="text-xs text-slate-300 block mt-0.5">
                  Halts directly at {targetCoachData.landmark || "Central FOB 2"} • Platform {platform}
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-lg shadow-lg">
                {normalizedTarget}
              </div>
            </div>

            {/* Guide Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl apple-glass-subcard space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">🌉 FOB 1 (West End)</span>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Main Concourse ticket counter, GS1–S2 coaches.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl apple-glass-subcard space-y-1 border-amber-400/40">
                <span className="font-bold text-amber-600 dark:text-amber-400 block">⭐ FOB 2 (Central)</span>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Direct stairs & lift to AC Coaches (B1–B6, A1). Nearest to your coach!
                </p>
              </div>

              <div className="p-3.5 rounded-2xl apple-glass-subcard space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">🚪 FOB 3 & Exit (East End)</span>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Goods shed, auto stand exit, H1 & rear SLR.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsExpandedModal(false)}
              className="w-full py-3 rounded-2xl apple-glass-btn-primary font-bold text-xs sm:text-sm"
            >
              {language === "hi_cg" ? "मैप बंद करें" : "Close Schematic"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
