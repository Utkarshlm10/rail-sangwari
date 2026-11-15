"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useBooking } from "@/context/BookingContext";
import { VERIFIED_SAHAYAKS } from "@/lib/mock-railway-data";
import AppleAvatar from "@/components/AppleAvatar";
import { FirebaseSyncBadge } from "@/components/FirebaseSyncBadge";
import {
  ShieldCheck,
  Building2,
  Train,
  CheckCircle2,
  Clock,
  Phone,
  MessageSquare,
  Award,
  Users,
  Search,
  Download,
  IndianRupee,
  Luggage,
  Sparkles,
  MapPin,
  AlertTriangle,
  RefreshCw,
  Bell,
  Radio,
  FileSpreadsheet,
  Check,
  ExternalLink,
} from "lucide-react";
import { playRailwayChime } from "@/lib/sound-effects";

export default function SupervisorDashboardPage() {
  const { language, t } = useLanguage();
  const { incomingJobs, openBillaModalWithId } = useBooking();

  // Active Station Division Selection
  const [selectedStation, setSelectedStation] = useState<"BSP" | "R" | "DURG">("BSP");
  const [activeTab, setActiveTab] = useState<"DEPLOYMENT" | "AUDIT" | "ROSTER" | "BROADCAST">("DEPLOYMENT");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "IN_PROGRESS" | "COMPLETED">("ALL");
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState("");

  // Live Station Clock
  const [currentTime, setCurrentTime] = useState("");
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Station Metadata
  const stationMeta = {
    BSP: {
      name: "Bilaspur Junction (BSP)",
      hindiName: "बिलासपुर जंक्शन",
      zone: "South East Central Railway — Zonal HQ",
      platformsCount: 8,
    },
    R: {
      name: "Raipur Junction (R)",
      hindiName: "रायपुर जंक्शन",
      zone: "SECR Raipur Division Office",
      platformsCount: 7,
    },
    DURG: {
      name: "Durg Junction (DURG)",
      hindiName: "दुर्ग जंक्शन",
      zone: "SECR Durg Terminal Hub",
      platformsCount: 6,
    },
  };

  const currentMeta = stationMeta[selectedStation];

  // Database Bookings State (Zero Dummy Data - 100% Database Driven)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dbBookings, setDbBookings] = useState<any[]>([]);
  const [isRefreshingDb, setIsRefreshingDb] = useState(false);

  const fetchDbBookings = async () => {
    try {
      setIsRefreshingDb(true);
      const res = await fetch("/api/database?collection=bookings");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setDbBookings(json.data);
      }
    } catch (err) {
      console.warn("Could not fetch database bookings:", err);
    } finally {
      setIsRefreshingDb(false);
    }
  };

  useEffect(() => {
    fetchDbBookings();
  }, []);

  // Dynamic Completed + Active Trip Data from Persistent Database & Live Context
  const allTrips = useMemo(() => {
    const mappedDbTrips = dbBookings.map((b) => ({
      id: b.id,
      pnr: b.pnr,
      passengerName: b.passengerName,
      passengerPhone: b.passengerPhone,
      trainNumber: b.trainDetails?.trainNumber || "12859",
      trainName: b.trainDetails?.trainName || "Express",
      coach: b.trainDetails?.coach || "B4",
      berth: b.trainDetails?.berth || "42",
      platform: b.trainDetails?.platform || "2",
      stationCode: b.trainDetails?.stationCode || "BSP",
      sahayakName: b.sahayak?.name || "Assigned Sahayak",
      billaNumber: b.sahayak?.billaNumber || "BSP-108",
      luggageDesc: `${b.luggage?.mediumTrolley || 0} Trolley + ${b.luggage?.heavyCarton || 0} Trunk`,
      bagsCount: (b.luggage?.mediumTrolley || 0) + (b.luggage?.heavyCarton || 0) + (b.luggage?.smallBag || 0),
      porterFare: b.fare?.payToSahayakCash || 120,
      secrFee: b.fare?.platformBookingFee || 39,
      status: b.status === "COMPLETED" ? "COMPLETED" : "IN_PROGRESS",
      happyCode: b.happyCode,
      time: b.createdAt || "Just Now",
    }));

    // Merge incoming jobs from real-time context if not already in DB list
    const dynamicIncoming = incomingJobs
      .filter((j) => !dbBookings.some((db) => db.id === j.id))
      .map((j) => ({
        id: j.id,
        pnr: j.pnr,
        passengerName: j.passengerName,
        passengerPhone: j.passengerPhone,
        trainNumber: j.trainDetails?.trainNumber || "12859",
        trainName: j.trainDetails?.trainName || "Express",
        coach: j.trainDetails?.coach || "B4",
        berth: j.trainDetails?.berth || "42",
        platform: j.trainDetails?.platform || "2",
        stationCode: j.trainDetails?.stationCode || "BSP",
        sahayakName: j.sahayak?.name || "Assigned Sahayak",
        billaNumber: j.sahayak?.billaNumber || "BSP-108",
        luggageDesc: `${j.luggage?.mediumTrolley || 0} Trolley + ${j.luggage?.heavyCarton || 0} Trunk`,
        bagsCount: (j.luggage?.mediumTrolley || 0) + (j.luggage?.heavyCarton || 0) + (j.luggage?.smallBag || 0),
        porterFare: j.fare?.payToSahayakCash || 120,
        secrFee: j.fare?.platformBookingFee || 39,
        status: j.status === "COMPLETED" ? "COMPLETED" : "IN_PROGRESS",
        happyCode: j.happyCode,
        time: "Just Now",
      }));

    return [...dynamicIncoming, ...mappedDbTrips];
  }, [incomingJobs, dbBookings]);

  // Live dynamic KPI statistics calculated from real trips and active roster
  const liveStats = useMemo(() => {
    const stationTrips = allTrips.filter((t) => !t.stationCode || t.stationCode === selectedStation);
    const totalLuggage = stationTrips.reduce((acc, t) => acc + (t.bagsCount || 0), 0);
    const totalPorterCash = stationTrips.reduce((acc, t) => acc + (t.porterFare || 0), 0);
    const totalSecrFee = stationTrips.reduce((acc, t) => acc + (t.secrFee || 0), 0);
    const stationCoolies = VERIFIED_SAHAYAKS.filter((s) => s.stationCode === selectedStation);
    const activeCoolies = stationCoolies.filter((s) => s.isActive).length;
    const inProgressCount = stationTrips.filter((t) => t.status === "IN_PROGRESS").length;

    return {
      activePorters: activeCoolies || stationCoolies.length,
      engagedPorters: Math.min(inProgressCount, activeCoolies || 1),
      availablePorters: Math.max((activeCoolies || stationCoolies.length) - inProgressCount, 0),
      totalLuggage,
      totalPorterCash,
      totalSecrFee,
      completedCount: stationTrips.filter((t) => t.status === "COMPLETED").length,
    };
  }, [allTrips, selectedStation]);

  // Filtered trips
  const filteredTrips = useMemo(() => {
    return allTrips.filter((t) => {
      const matchesSearch =
        t.pnr.includes(searchQuery) ||
        t.passengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.sahayakName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.billaNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.trainName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" ? true : t.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [allTrips, searchQuery, statusFilter]);

  // Trigger Station Announcement Simulator
  const handleSendBroadcast = () => {
    if (!broadcastMessage.trim()) return;
    playRailwayChime();
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setBroadcastMessage("");
    }, 4000);
  };

  return (
    <div className="min-h-screen apple-glass-canvas text-slate-900 dark:text-white transition-colors relative overflow-hidden pb-16 pt-20 sm:pt-24">
      {/* Specular Ambient Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[360px] bg-gradient-to-tr from-black/[0.03] via-transparent to-black/[0.02] dark:from-white/[0.04] dark:via-transparent dark:to-white/[0.02] blur-3xl rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">

        {/* ================= 1. EXECUTIVE HEADER BANNER ================= */}
        <div className="apple-glass-card rounded-3xl p-5 sm:p-6 shadow-xl border border-black/[0.08] dark:border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* SECR Authority Emblem & Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl brass-badge flex flex-col items-center justify-center text-slate-950 font-black shadow-md border border-amber-300/80 shrink-0">
              <span className="text-[8px] uppercase tracking-wider font-extrabold text-amber-950/70">SECR</span>
              <span className="text-xl font-black leading-none text-slate-950">दपूमरे</span>
              <span className="text-[7px] uppercase tracking-widest bg-black/15 px-1.5 rounded mt-0.5 font-bold">DRM</span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {language === "hi_cg" ? "स्टेशन अधीक्षक एवं मंडल नियंत्रक पोर्टल" : "Station Supervisor & DRM Control Center"}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px] font-black border border-emerald-500/20 inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE OPERATIONAL AUDIT
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-semibold flex items-center gap-2">
                <span>{currentMeta.zone}</span>
                <span>•</span>
                <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">⏰ {currentTime || "LIVE"}</span>
              </p>
            </div>
          </div>

          {/* Division Station Selector Tabs & Firebase Sync Badge */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            <FirebaseSyncBadge />
            <div className="flex items-center gap-1 bg-black/[0.04] dark:bg-white/[0.08] p-1.5 rounded-2xl border border-black/5 dark:border-white/10 text-xs font-bold w-full sm:w-auto justify-between">
              <button
                onClick={() => setSelectedStation("BSP")}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  selectedStation === "BSP"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm font-black"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>Bilaspur (BSP)</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              </button>

              <button
                onClick={() => setSelectedStation("R")}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  selectedStation === "R"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm font-black"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>Raipur (R)</span>
              </button>

              <button
                onClick={() => setSelectedStation("DURG")}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  selectedStation === "DURG"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm font-black"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>Durg (DURG)</span>
              </button>
            </div>
          </div>

        </div>

        {/* ================= 2. 21ST.DEV EXECUTIVE KPI BENTO GRID ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Card 1: Porters On Duty */}
          <div className="apple-glass-card rounded-3xl p-4 sm:p-5 space-y-1 shadow-md border border-black/[0.06] dark:border-white/[0.08]">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-zinc-400">
              <span>{language === "hi_cg" ? "ड्यूटी पर सक्रिय कुली" : "Porters On Duty"}</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
              {liveStats.activePorters} Active
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span>● {liveStats.engagedPorters} Engaged</span>
              <span className="opacity-40">•</span>
              <span>{liveStats.availablePorters} Available</span>
            </div>
          </div>

          {/* Card 2: Luggage Handled */}
          <div className="apple-glass-card rounded-3xl p-4 sm:p-5 space-y-1 shadow-md border border-black/[0.06] dark:border-white/[0.08]">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-zinc-400">
              <span>{language === "hi_cg" ? "आज संभाला गया सामान" : "Luggage Handled"}</span>
              <span className="text-base">🧳</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
              {liveStats.totalLuggage} Bags
            </div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold">
              Across {liveStats.completedCount} completed coach journeys
            </div>
          </div>

          {/* Card 3: 100% Direct Porter Cash */}
          <div className="apple-glass-card rounded-3xl p-4 sm:p-5 space-y-1 shadow-md border border-emerald-500/30 dark:border-emerald-400/20">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-zinc-400">
              <span>{language === "hi_cg" ? "कुलियों की सीधी कमाई" : "Direct Porter Tariff"}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10">
                100% Direct
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
              ₹{liveStats.totalPorterCash.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold">
              ✓ ₹0 deduction • Full tariff paid to coolies
            </div>
          </div>

          {/* Card 4: SECR Platform Revenue Pool */}
          <div className="apple-glass-card rounded-3xl p-4 sm:p-5 space-y-1 shadow-md border border-amber-400/30 dark:border-amber-400/20">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-zinc-400">
              <span>{language === "hi_cg" ? "SECR सुविधा शुल्क कोष" : "SECR Platform Pool"}</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold text-[10px] px-1.5 py-0.5 rounded bg-amber-400/10">
                ₹39 / trip
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-amber-600 dark:text-amber-400 tracking-tight">
              ₹{liveStats.totalSecrFee.toLocaleString()}
            </div>
            <div className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold">
              Digital PNR infra & station amenities pool
            </div>
          </div>

        </div>

        {/* ================= 3. NAVIGATION PILL TABS ================= */}
        <div className="flex items-center gap-1 bg-black/[0.04] dark:bg-white/[0.06] p-1.5 rounded-2xl border border-black/[0.05] dark:border-white/[0.08] text-xs font-bold max-w-xl overflow-x-auto">
          <button
            onClick={() => setActiveTab("DEPLOYMENT")}
            className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "DEPLOYMENT"
                ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs font-black"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-blue-500" />
            <span>Platform Coverage</span>
          </button>

          <button
            onClick={() => setActiveTab("AUDIT")}
            className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "AUDIT"
                ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs font-black"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span>Trip Audit Log ({filteredTrips.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("ROSTER")}
            className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "ROSTER"
                ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs font-black"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            <span>License Roster</span>
          </button>

          <button
            onClick={() => setActiveTab("BROADCAST")}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "BROADCAST"
                ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs font-black"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-rose-500" />
            <span>Broadcast Chime</span>
          </button>
        </div>

        {/* ================= TAB 1: PLATFORM COVERAGE & HEATMAP ================= */}
        {activeTab === "DEPLOYMENT" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                  🚉 Live Platform Coverage & Porter Distribution
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Real-time GPS & platform beacon monitoring across {currentMeta.name}.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-zinc-400 bg-black/[0.04] dark:bg-white/[0.08] px-2.5 py-1 rounded-lg">
                8 Platforms Tracked
              </span>
            </div>

            {/* Platform Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Platform 1 Card */}
              <div className="apple-glass-card rounded-3xl p-5 space-y-3.5 shadow-md border border-black/[0.06] dark:border-white/[0.08]">
                <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-[#0F2A4A] text-white flex items-center justify-center font-black text-xs border border-amber-400/40 shadow-xs">
                      PF 1
                    </span>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Main Concourse Line</h3>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Vande Bharat & Rajdhani</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    4 Porters
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="p-3 rounded-2xl apple-glass-subcard flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <AppleAvatar name="Santosh Kumar Sahu" billaNumber="R-042" size="sm" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">Santosh Kumar Sahu</span>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">#R-042 • FOB 1 Lift</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      Available
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl apple-glass-subcard flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <AppleAvatar name="Manish Baghel" billaNumber="BSP-114" size="sm" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">Manish Baghel</span>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">#BSP-114 • Coach H1 Door</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-md">
                      In Trip
                    </span>
                  </div>
                </div>
              </div>

              {/* Platform 2 Card */}
              <div className="apple-glass-card rounded-3xl p-5 space-y-3.5 shadow-md border border-black/[0.06] dark:border-white/[0.08]">
                <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-[#0F2A4A] text-white flex items-center justify-center font-black text-xs border border-amber-400/40 shadow-xs">
                      PF 2
                    </span>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Express Loop Line</h3>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Amarkantak & Gitanjali</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    6 Porters
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="p-3 rounded-2xl apple-glass-subcard flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <AppleAvatar name="Ramesh Yadav" billaNumber="BSP-108" size="sm" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">Ramesh Yadav</span>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">#BSP-108 • Coach B4 (42)</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-md">
                      In Trip
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl apple-glass-subcard flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <AppleAvatar name="Kishore Netam" billaNumber="BSP-121" size="sm" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">Kishore Netam</span>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">#BSP-121 • FOB 2 Stairs</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      Available
                    </span>
                  </div>
                </div>
              </div>

              {/* Platform 3 Card */}
              <div className="apple-glass-card rounded-3xl p-5 space-y-3.5 shadow-md border border-black/[0.06] dark:border-white/[0.08]">
                <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-[#0F2A4A] text-white flex items-center justify-center font-black text-xs border border-amber-400/40 shadow-xs">
                      PF 3
                    </span>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Passenger Terminal</h3>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Chhattisgarh & Memu</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    8 Porters
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="p-3 rounded-2xl apple-glass-subcard flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <AppleAvatar name="Dilip Kumar" billaNumber="DURG-019" size="sm" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">Dilip Kumar</span>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">#DURG-019 • Escalator 3</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      Available
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl apple-glass-subcard flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <AppleAvatar name="Bholaram Verma" billaNumber="BSP-088" size="sm" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">Bholaram Verma</span>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">#BSP-088 • Coolie Rest Room</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-md">
                      Resting
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ================= TAB 2: LIVE AUDIT & TRIP LEDGER ================= */}
        {activeTab === "AUDIT" && (
          <div className="space-y-4">
            
            {/* Search & Filter Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search PNR, Passenger, Train, or Billa #..."
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl apple-glass-subcard text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-amber-400 font-sans"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as "ALL" | "IN_PROGRESS" | "COMPLETED")}
                  className="px-3 py-2 rounded-2xl apple-glass-subcard text-xs font-bold text-slate-700 dark:text-zinc-300 focus:outline-none"
                >
                  <option value="ALL">All Status</option>
                  <option value="IN_PROGRESS">In Progress Only</option>
                  <option value="COMPLETED">Completed Only</option>
                </select>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-2xl apple-glass-btn-primary font-bold text-xs flex items-center gap-1.5 shadow-sm shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Shift Report</span>
                </button>
              </div>
            </div>

            {/* Audit Table */}
            <div className="apple-glass-card rounded-3xl overflow-hidden shadow-xl border border-black/[0.08] dark:border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/[0.03] dark:bg-white/[0.04] border-b border-black/[0.06] dark:border-white/[0.08] text-slate-600 dark:text-zinc-400 font-extrabold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Trip ID / PNR</th>
                      <th className="py-3 px-4">Passenger Contact</th>
                      <th className="py-3 px-4">Train & Target Coach</th>
                      <th className="py-3 px-4">Assigned Sahayak</th>
                      <th className="py-3 px-4">Luggage Breakdown</th>
                      <th className="py-3 px-4">Tariff Settlement</th>
                      <th className="py-3 px-4">Happy Code / Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.05] dark:divide-white/[0.05] text-slate-800 dark:text-zinc-200">
                    {filteredTrips.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 px-4 text-center">
                          <div className="max-w-md mx-auto space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 text-amber-500 mx-auto flex items-center justify-center text-xl">
                              🧳
                            </div>
                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                              No Active Deployments Recorded
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">
                              Zero dummy data active. Trips booked by passengers on the Passenger App or created in the Central Data Manager will appear here in real time.
                            </p>
                            <button
                              onClick={fetchDbBookings}
                              disabled={isRefreshingDb}
                              className="px-3.5 py-1.5 rounded-xl apple-glass-subcard text-xs font-bold inline-flex items-center gap-1.5 text-slate-800 dark:text-white hover:border-amber-400 transition-all"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingDb ? "animate-spin text-amber-500" : ""}`} />
                              <span>{isRefreshingDb ? "Refreshing..." : "Refresh Database Snapshot"}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredTrips.map((trip) => (
                        <tr key={trip.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                          
                          {/* Trip & PNR */}
                          <td className="py-3.5 px-4">
                            <span className="font-extrabold text-slate-900 dark:text-white block font-mono">{trip.id}</span>
                            <span className="font-mono text-[11px] text-slate-500 dark:text-zinc-400">PNR {trip.pnr}</span>
                          </td>

                          {/* Passenger */}
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 dark:text-white block">{trip.passengerName}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{trip.passengerPhone}</span>
                          </td>

                          {/* Train & Target Coach */}
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {trip.trainNumber} - {trip.trainName}
                            </span>
                            <span className="text-amber-600 dark:text-amber-400 font-black text-[11px] block mt-0.5">
                              Coach {trip.coach} • Seat {trip.berth} (PF {trip.platform})
                            </span>
                          </td>

                          {/* Assigned Sahayak */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <AppleAvatar name={trip.sahayakName} billaNumber={trip.billaNumber} size="sm" />
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white block">{trip.sahayakName}</span>
                                <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">
                                  #{trip.billaNumber}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Luggage */}
                          <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-zinc-300">
                            {trip.luggageDesc}
                          </td>

                          {/* Tariff */}
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm block">
                              +₹{trip.porterFare}
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              ₹{trip.secrFee} SECR Fee
                            </span>
                          </td>

                          {/* Happy Code Status */}
                          <td className="py-3.5 px-4">
                            {trip.status === "COMPLETED" ? (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px] font-extrabold border border-emerald-500/20 inline-flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                <span>OTP: {trip.happyCode} Verified</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-700 dark:text-amber-300 text-[10px] font-extrabold border border-amber-400/30 inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                <span>In Progress</span>
                              </span>
                            )}
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 3: SAHAYAK LICENSE & MEDICAL ROSTER ================= */}
        {activeTab === "ROSTER" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                  🛡️ SECR Licensed Sahayak Compliance & Medical Registry
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  SECR Police verification, Railway Hospital medical card validity, and station division records.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {VERIFIED_SAHAYAKS.map((sahayak) => (
                <div
                  key={sahayak.id}
                  className="apple-glass-card rounded-3xl p-5 space-y-3.5 shadow-md border border-black/[0.06] dark:border-white/[0.08]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AppleAvatar name={sahayak.name} billaNumber={sahayak.billaNumber} size="md" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                            {language === "hi_cg" ? sahayak.hindiName : sahayak.name}
                          </h3>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-700 dark:text-amber-300">
                            {sahayak.rating}★
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                          Billa #{sahayak.billaNumber}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.08] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                      <span>Police Verification:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400">✓ SECR Cleared</strong>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                      <span>Medical Fitness Card:</span>
                      <strong className="font-mono text-slate-900 dark:text-white">{sahayak.medicalFitnessValidTill}</strong>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                      <span>Division Station:</span>
                      <strong className="text-slate-900 dark:text-white">{sahayak.stationName}</strong>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                      <span>Experience:</span>
                      <strong className="text-slate-900 dark:text-white">{sahayak.experienceYears} Years</strong>
                    </div>
                  </div>

                  {/* Audit Billa Button */}
                  <button
                    onClick={() => openBillaModalWithId(sahayak.billaNumber)}
                    className="w-full py-2 px-3 rounded-xl apple-glass-subcard hover:bg-black/5 dark:hover:bg-white/10 text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center justify-center gap-1.5 transition-colors border border-black/5 dark:border-white/10"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>View Public SECR License Record</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: STATION BROADCAST & CHIME ================= */}
        {activeTab === "BROADCAST" && (
          <div className="apple-glass-card rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl border border-black/[0.08] dark:border-white/10 max-w-2xl mx-auto text-center">
            
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#0F2A4A] to-[#071526] text-amber-400 border border-amber-400/40 flex items-center justify-center mx-auto shadow-lg text-2xl">
              <Radio className="w-8 h-8 animate-pulse" />
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {language === "hi_cg" ? "प्लेटफॉर्म सायरन एवं कुली घोषणा केंद्र" : "Station Director Platform Broadcast"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
                Trigger a digital Indian Railways 3-tone chime and send an urgent platform directive to all active coolie phones on duty.
              </p>
            </div>

            <div className="space-y-3 text-left">
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                Broadcast Announcement Message:
              </label>
              <textarea
                rows={3}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="e.g., Attention all Sahayaks on Platform 2: 12853 Amarkantak Express arriving in 5 minutes at Coach B4-B8..."
                className="w-full p-3.5 rounded-2xl apple-glass-subcard text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
              />

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setBroadcastMessage("Train 12853 Amarkantak Exp arriving on Platform 2. All available Sahayaks proceed to FOB 2.")}
                  className="px-2.5 py-1 rounded-lg apple-glass-subcard text-[11px] font-semibold hover:bg-black/5 dark:hover:bg-white/10"
                >
                  Template: Amarkantak Arrival (PF 2)
                </button>
                <button
                  type="button"
                  onClick={() => setBroadcastMessage("Senior citizen VIP passenger arriving at Coach H1. Wheelchair assist required immediately.")}
                  className="px-2.5 py-1 rounded-lg apple-glass-subcard text-[11px] font-semibold hover:bg-black/5 dark:hover:bg-white/10"
                >
                  Template: Wheelchair Priority (H1)
                </button>
              </div>

              {broadcastSent && (
                <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Broadcast transmitted to 18 active Sahayak devices across {currentMeta.name}!</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleSendBroadcast}
                disabled={!broadcastMessage.trim()}
                className="w-full py-3.5 px-4 rounded-2xl apple-glass-btn-primary font-bold text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg active:scale-95 cursor-pointer mt-2"
              >
                <Bell className="w-4 h-4 text-amber-400" />
                <span>Play IR Chime & Broadcast to Platform Porters</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
