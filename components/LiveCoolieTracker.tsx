"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  MapPin,
  Navigation,
  Compass,
  Phone,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Radio,
  ChevronRight,
  Sparkles,
  RefreshCw,
  LocateFixed,
} from "lucide-react";
import { LocationBeacon, SahayakProfile, StationCode } from "@/types";
import AppleAvatar from "@/components/AppleAvatar";
import { useLanguage } from "@/context/LanguageContext";
import { playRailwayChime, playCompletionDing } from "@/lib/sound-effects";

interface LiveCoolieTrackerProps {
  bookingId: string;
  sahayak?: SahayakProfile | null;
  targetCoach: string;
  platform: string;
  stationCode: StationCode;
  stationName: string;
  isCoolieView?: boolean;
  onPingArrival?: () => void;
}

export function LiveCoolieTracker({
  bookingId,
  sahayak,
  targetCoach,
  platform,
  stationCode,
  stationName,
  isCoolieView = false,
  onPingArrival,
}: LiveCoolieTrackerProps) {
  const { language } = useLanguage();
  const [beacon, setBeacon] = useState<LocationBeacon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"RADAR" | "PLATFORM_MAP">("RADAR");
  const [gpsShared, setGpsShared] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isSimulatingWalk, setIsSimulatingWalk] = useState(false);

  // Fetch or poll location from API
  const fetchLocation = async () => {
    try {
      const res = await fetch(
        `/api/location?bookingId=${bookingId}&stationCode=${stationCode}&platform=${platform}&targetCoach=${targetCoach}&sahayakId=${
          sahayak?.id || "sahayak-bsp-108"
        }&billaNumber=${sahayak?.billaNumber || "BSP-108"}`
      );
      const json = await res.json();
      if (json.success && json.data) {
        setBeacon((prev) => {
          // If just arrived, trigger alert chime
          if (!prev?.hasArrived && json.data.hasArrived) {
            playCompletionDing();
          }
          return json.data;
        });
      }
    } catch (err) {
      console.warn("Could not fetch location beacon:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
    const interval = setInterval(fetchLocation, 2500); // 2.5s live polling
    return () => clearInterval(interval);
  }, [bookingId, stationCode, platform, targetCoach]);

  // Handle GPS coordinate sharing from browser
  const handleShareGps = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        setGpsShared(true);

        try {
          await fetch("/api/location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookingId,
              updates: {
                passengerLat: latitude,
                passengerLng: longitude,
              },
            }),
          });
          fetchLocation();
        } catch {
          // ignore
        }
      },
      () => {
        alert("Please allow location permissions to share your exact spot on the platform.");
      },
      { enableHighAccuracy: true }
    );
  };

  // Simulate advancing coolie walk
  const handleAdvanceStep = async () => {
    try {
      setIsSimulatingWalk(true);
      const res = await fetch("/api/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ADVANCE_STEP", bookingId }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setBeacon(json.data);
        if (json.data.hasArrived) {
          playCompletionDing();
        }
      }
    } catch {
      // ignore
    } finally {
      setIsSimulatingWalk(false);
    }
  };

  // Coolie marks arrived at coach
  const handleMarkArrived = async () => {
    try {
      const res = await fetch("/api/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ARRIVED", bookingId }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setBeacon(json.data);
        playRailwayChime();
        if (onPingArrival) onPingArrival();
      }
    } catch {
      // ignore
    }
  };

  const stepsList = [
    { num: 1, label: language === "hi_cg" ? "कॉनकोर्स" : "Concourse", meters: 260 },
    { num: 2, label: language === "hi_cg" ? "FOB 2 सीढ़ी" : "FOB 2 Stairs", meters: 175 },
    { num: 3, label: language === "hi_cg" ? "वाटर बूथ" : "Water Booth", meters: 85 },
    { num: 4, label: language === "hi_cg" ? `बोगी ${targetCoach} मार्ग` : `Near ${targetCoach}`, meters: 30 },
    { num: 5, label: language === "hi_cg" ? `दरवाजा ${targetCoach}` : `Coach Door`, meters: 0 },
  ];

  const currentStep = beacon?.platformStep || 1;
  const isArrived = beacon?.hasArrived || currentStep === 5;
  const distance = beacon?.distanceMeters !== undefined ? beacon.distanceMeters : 120;
  const etaMins = beacon?.estimatedMinutes !== undefined ? beacon.estimatedMinutes : 1.5;

  return (
    <div className="apple-glass-card rounded-3xl p-5 border border-black/[0.08] dark:border-white/10 shadow-xl space-y-4 overflow-hidden relative">
      {/* Background ambient radar glow */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-amber-400/10 dark:bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 relative" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{language === "hi_cg" ? "लाइव कुली ट्रैकर" : "Live Sahayak Tracker"}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                GPS + Beacon
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Platform {platform} • Meeting at Coach {targetCoach} Door
            </p>
          </div>
        </div>

        {/* View Switcher Pill */}
        <div className="flex items-center gap-1 bg-black/[0.04] dark:bg-white/[0.06] p-1 rounded-xl text-[10px] font-bold">
          <button
            onClick={() => setActiveTab("RADAR")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeTab === "RADAR"
                ? "bg-slate-900 dark:bg-white text-white dark:text-zinc-950 font-black"
                : "text-slate-600 dark:text-zinc-400"
            }`}
          >
            Radar
          </button>
          <button
            onClick={() => setActiveTab("PLATFORM_MAP")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeTab === "PLATFORM_MAP"
                ? "bg-slate-900 dark:bg-white text-white dark:text-zinc-950 font-black"
                : "text-slate-600 dark:text-zinc-400"
            }`}
          >
            Track Map
          </button>
        </div>
      </div>

      {/* Arrival Announcement Banner */}
      {isArrived ? (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 dark:bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center gap-3 animate-pulse">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
            ✓
          </div>
          <div>
            <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 block">
              {language === "hi_cg"
                ? `कुली ${sahayak?.name || "रमेश यादव"} बोगी ${targetCoach} के बाहर पहुँच गए हैं!`
                : `Sahayak ${sahayak?.name || "Ramesh Yadav"} has arrived outside Coach ${targetCoach}!`}
            </span>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold block mt-0.5">
              {language === "hi_cg"
                ? `लाल वर्दी एवं बिल्ला #${sahayak?.billaNumber || "BSP-108"} देखें • हैप्पी कोड बताएं`
                : `Look for red uniform & Billa #${sahayak?.billaNumber || "BSP-108"} on platform`}
            </span>
          </div>
        </div>
      ) : (
        /* Distance & ETA Live Pill */
        <div className="p-3.5 rounded-2xl bg-[#0F2A4A] dark:bg-[#0A1929] text-white border border-amber-400/30 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-black text-base border border-amber-400/30">
              <Navigation className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xl font-black text-amber-300">
                  {distance}m
                </span>
                <span className="text-xs text-slate-300 font-bold">
                  • ~{etaMins} {language === "hi_cg" ? "मिनट" : "mins"}
                </span>
              </div>
              <span className="text-[11px] text-amber-200/90 font-medium block">
                {beacon?.stepDescription || "Approaching Coach Door"}
              </span>
            </div>
          </div>

          <button
            onClick={fetchLocation}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-200 transition-all active:scale-95"
            title="Refresh Location"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      )}

      {/* TAB 1: 5-STEP PLATFORM BEACON RADAR */}
      {activeTab === "RADAR" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400 font-bold px-1">
            <span>{language === "hi_cg" ? "प्लेटफॉर्म 2 ट्रैकिंग मार्ग" : "Platform 2 Walking Path"}</span>
            <span className="text-amber-600 dark:text-amber-400 font-mono">
              Step {currentStep} of 5
            </span>
          </div>

          {/* Stepper Progress Bar */}
          <div className="relative pt-1 pb-2">
            <div className="h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              />
            </div>

            <div className="grid grid-cols-5 gap-1 mt-2">
              {stepsList.map((st) => {
                const isPassed = currentStep >= st.num;
                const isCurrent = currentStep === st.num;

                return (
                  <div key={st.num} className="text-center">
                    <span
                      className={`inline-block w-5 h-5 rounded-full text-[10px] font-black leading-5 transition-all ${
                        isCurrent
                          ? "bg-amber-400 text-slate-950 ring-4 ring-amber-400/30 scale-110"
                          : isPassed
                          ? "bg-emerald-500 text-white"
                          : "bg-black/10 dark:bg-white/10 text-slate-500 dark:text-zinc-500"
                      }`}
                    >
                      {isPassed && !isCurrent ? "✓" : st.num}
                    </span>
                    <span
                      className={`block text-[9px] font-bold mt-1 truncate ${
                        isCurrent
                          ? "text-amber-600 dark:text-amber-400 font-black"
                          : isPassed
                          ? "text-slate-800 dark:text-zinc-200"
                          : "text-slate-400 dark:text-zinc-500"
                      }`}
                    >
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 2D PLATFORM TRACK MAP VISUALIZER */}
      {activeTab === "PLATFORM_MAP" && (
        <div className="p-4 rounded-2xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/10 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-zinc-400">
            <span>🚉 Platform {platform} • Railway Track Rake Visualizer</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono">Live Rake Position</span>
          </div>

          {/* 2D Railway Track with Coach & Coolie Pin */}
          <div className="relative py-4 px-2 bg-gradient-to-r from-slate-900 to-[#0F2A4A] text-white rounded-xl overflow-hidden border border-white/10 shadow-inner">
            {/* Rails */}
            <div className="absolute top-2 left-0 right-0 h-0.5 bg-zinc-500/40" />
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-zinc-500/40" />

            <div className="relative flex items-center justify-between pt-4 pb-2 text-xs">
              {/* Locomotive Engine */}
              <div className="p-2 rounded-lg bg-red-600 text-white font-mono font-black text-[10px] shadow-sm flex items-center gap-1">
                <span>🚂</span>
                <span>WAP-7 Engine</span>
              </div>

              {/* Passenger Coach B4 Target */}
              <div className="p-2 rounded-xl bg-amber-400 text-slate-950 font-black text-xs shadow-md border-2 border-white flex items-center gap-1.5 animate-pulse">
                <span>🎯</span>
                <span>Coach {targetCoach} (YOU)</span>
              </div>

              {/* Rear SLR */}
              <div className="p-2 rounded-lg bg-slate-700 text-zinc-300 font-mono text-[10px]">
                SLR / Guard
              </div>
            </div>

            {/* Coolie Dynamic Position Marker */}
            <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold text-emerald-300">
                  Coolie Position: {beacon?.stepDescription || "Approaching Platform"}
                </span>
              </div>
              <span className="font-mono font-bold text-amber-300">{distance}m to coach</span>
            </div>
          </div>
        </div>
      )}

      {/* Sahayak Profile Card & Direct Communications */}
      <div className="p-3.5 rounded-2xl apple-glass-subcard flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <AppleAvatar
            name={sahayak?.name || "Ramesh Yadav"}
            billaNumber={sahayak?.billaNumber || "BSP-108"}
            size="md"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                {sahayak?.name || "Ramesh Yadav"}
              </span>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                {sahayak?.rating || 4.9}★
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 block">
              Billa #{sahayak?.billaNumber || "BSP-108"} • SECR Verified
            </span>
          </div>
        </div>

        {/* Quick Contact Buttons */}
        <div className="flex items-center gap-1.5">
          <a
            href={`tel:${sahayak?.phone || "+919827144521"}`}
            className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs transition-transform active:scale-90"
            title="Call Coolie"
          >
            <Phone className="w-3.5 h-3.5" />
          </a>
          <a
            href={`https://wa.me/91${(sahayak?.phone || "9827144521").replace(/\D/g, "")}?text=${encodeURIComponent(
              `Namaskar Sahayak ji, my train Coach is ${targetCoach} on Platform ${platform}. I am tracking you on Rail Sangwari.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-green-600 hover:bg-green-700 text-white shadow-xs transition-transform active:scale-90"
            title="WhatsApp Coolie"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Passenger Action: Share Browser GPS */}
      {!isCoolieView && (
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={handleShareGps}
            className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 transition-colors"
          >
            <LocateFixed className="w-3.5 h-3.5" />
            <span>
              {gpsShared
                ? "✓ Live Platform GPS Active"
                : language === "hi_cg"
                ? "कुली के साथ मेरा GPS शेयर करें"
                : "Share My Platform GPS with Coolie"}
            </span>
          </button>

          {/* Quick Demo Simulator for Testing */}
          <button
            onClick={handleAdvanceStep}
            disabled={isSimulatingWalk || isArrived}
            className="text-[10px] font-bold px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 text-slate-700 dark:text-zinc-300 transition-all"
            title="Simulate Coolie Walking One Step Closer"
          >
            {isSimulatingWalk ? "Walking..." : isArrived ? "At Coach" : "⚡ Advance Coolie Walk"}
          </button>
        </div>
      )}

      {/* Sahayak View: Coolie Arrival Ping Button */}
      {isCoolieView && (
        <div className="pt-2 flex items-center gap-2">
          <button
            onClick={handleAdvanceStep}
            disabled={isArrived}
            className="flex-1 py-2.5 rounded-xl apple-glass-subcard font-bold text-xs flex items-center justify-center gap-1 text-slate-800 dark:text-white"
          >
            <Navigation className="w-3.5 h-3.5 text-amber-500" />
            <span>{language === "hi_cg" ? "अगले स्थान पर बढ़ें" : "Advance Location Step"}</span>
          </button>

          <button
            onClick={handleMarkArrived}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1 transition-all active:scale-95"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{language === "hi_cg" ? "बोगी पहुँच गया (Ping Passenger)" : "I Have Arrived at Coach"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
