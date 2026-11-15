"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useBooking } from "@/context/BookingContext";
import { useAuth } from "@/context/AuthContext";
import { VERIFIED_SAHAYAKS } from "@/lib/mock-railway-data";
import AppleAvatar from "@/components/AppleAvatar";
import { CoachPlatformVisualizer } from "@/components/CoachPlatformVisualizer";
import { GoogleStyleLiveMap } from "@/components/GoogleStyleLiveMap";
import { PostTripFeedbackReceiptModal } from "@/components/PostTripFeedbackReceiptModal";
import {
  Train,
  CheckCircle2,
  Clock,
  Phone,
  MessageSquare,
  Award,
  Power,
  Volume2,
  VolumeX,
  AlertCircle,
  Banknote,
  Luggage,
  MapPin,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  QrCode,
  Download,
  IndianRupee,
  Share2,
  X,
  Smartphone,
  Sparkles,
  Target,
  LogOut,
  Lock,
  History,
  ChevronRight,
  Radio,
  Receipt,
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  requestScreenWakeLock,
  releaseScreenWakeLock,
  playRailwayChime,
} from "@/lib/sound-effects";
import { generateUpiUri, generateQrSvgPath } from "@/lib/qr";
import { IncomingJob } from "@/types";

export default function SahayakPortalPage() {
  const { language, t } = useLanguage();
  const {
    incomingJobs,
    acceptJob,
    completeJobWithOtp,
    isSahayakOnline,
    setIsSahayakOnline,
    currentSahayak,
    setCurrentSahayak,
    dailyEarnings,
  } = useBooking();

  const { sahayakUser, isSahayakLoggedIn, loginSahayak, logoutSahayak } = useAuth();
  const [billaInput, setBillaInput] = useState("BSP-108");
  const [pinInput, setPinInput] = useState("1080");
  const [loginError, setLoginError] = useState("");
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  // Sync sahayakUser with BookingContext's currentSahayak
  useEffect(() => {
    if (sahayakUser) {
      setCurrentSahayak(sahayakUser);
    }
  }, [sahayakUser, setCurrentSahayak]);

  const handleSahayakLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsSubmittingLogin(true);

    const res = await loginSahayak(billaInput, pinInput);
    setIsSubmittingLogin(false);

    if (!res.success) {
      setLoginError(res.error || "Authentication failed");
    } else if (res.sahayak) {
      setCurrentSahayak(res.sahayak);
    }
  };

  const [soundEnabled, setSoundEnabled] = useState(true);

  // OTP dialog state for completing trip
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");

  // NPCI UPI QR Modal state
  const [upiModalJob, setUpiModalJob] = useState<IncomingJob | null>(null);

  // Recently completed trip celebration card state (prevents abrupt vanishing)
  const [lastCompletedJob, setLastCompletedJob] = useState<IncomingJob | null>(null);

  // Completed Trips History Modal state
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedTripForReceipt, setSelectedTripForReceipt] = useState<IncomingJob | null>(null);

  // 25-Second Acceptance Timer on incoming jobs
  const [countdownSeconds, setCountdownSeconds] = useState<{ [jobId: string]: number }>({});

  // PWA Install Prompt state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // Load / listen to PWA install prompt
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      alert(
        language === "hi_cg"
          ? "अपने ब्राउज़र के मेनू (⋮) पर क्लिक करें और 'Add to Home screen' या 'ऐप इंस्टॉल करें' चुनें।"
          : "Tap browser menu (⋮) and select 'Add to Home screen' or 'Install App'."
      );
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  // Screen Wake Lock & Sound integration on duty toggle
  const handleToggleDuty = async () => {
    const nextStatus = !isSahayakOnline;
    setIsSahayakOnline(nextStatus);

    if (nextStatus) {
      await requestScreenWakeLock();
      if (soundEnabled) {
        playRailwayChime();
      }
    } else {
      releaseScreenWakeLock();
    }
  };

  // Decrement 25s countdown timers for new jobs
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        const next = { ...prev };
        incomingJobs.forEach((job) => {
          if (job.status === "CONFIRMED" || job.status === "SEARCHING") {
            const current = next[job.id] !== undefined ? next[job.id] : 25;
            next[job.id] = Math.max(0, current - 1);
          }
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [incomingJobs]);

  const handleAcceptJob = (jobId: string) => {
    acceptJob(jobId, displaySahayak.id);
  };

  const handleVerifyOtpForJob = (jobId: string, e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");
    setOtpSuccess("");

    const targetJob = incomingJobs.find((j) => j.id === jobId);
    const res = completeJobWithOtp(jobId, enteredOtp);
    if (res.success) {
      if (targetJob) {
        setLastCompletedJob({ ...targetJob, status: "COMPLETED" });
      }
      setOtpSuccess(res.message);
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.65 },
        });
      } catch {
        // ignore
      }
      setTimeout(() => {
        setEnteredOtp("");
        setOtpError("");
      }, 1000);
    } else {
      setOtpError(res.message);
    }
  };

  const displaySahayak = sahayakUser || currentSahayak;

  // Station and coolie-assigned jobs (keeps all station trips visible so nothing is hidden)
  const stationJobs = incomingJobs.filter((j) => {
    if (!j.trainDetails) return true;
    if (j.sahayak?.billaNumber === displaySahayak.billaNumber) return true;
    if (j.trainDetails.stationCode === displaySahayak.stationCode) return true;
    return true; // Keep visible for complete operational transparency
  });

  const activeAssignedJobs = stationJobs.filter(
    (j) => j.status === "ASSIGNED" || j.status === "AT_PLATFORM"
  );
  const pendingJobs = stationJobs.filter((j) => j.status === "CONFIRMED" || j.status === "SEARCHING");
  const completedJobs = stationJobs.filter((j) => j.status === "COMPLETED");

  // =========================================================================
  // VIEW 1: REDESIGNED LOGIN SCREEN (Apple Liquid Glass + SECR Sahayak Touch)
  // =========================================================================
  if (!isSahayakLoggedIn) {
    return (
      <div className="min-h-screen apple-glass-canvas text-slate-900 dark:text-white transition-colors relative overflow-hidden flex items-center justify-center p-4 sm:p-6">
        {/* Subtle Ambient Specular Mesh Lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[320px] bg-gradient-to-tr from-black/[0.03] via-transparent to-black/[0.02] dark:from-white/[0.04] dark:via-transparent dark:to-white/[0.02] blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="w-full max-w-md apple-glass-card rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative border border-white/20 dark:border-white/10">
          
          {/* SECR Licensed Sahayak Identity Header */}
          <div className="text-center space-y-3">
            {/* Gleaming SECR Brass Billa Emblem */}
            <div className="relative mx-auto w-20 h-20 rounded-3xl brass-badge flex flex-col items-center justify-center text-slate-950 font-black shadow-lg border-2 border-amber-300/80">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-amber-950/70">SECR</span>
              <span className="text-2xl font-black leading-none text-slate-950">दपूमरे</span>
              <span className="text-[9px] uppercase tracking-wider bg-black/15 px-2 py-0.5 rounded-full mt-1 font-bold">
                सहायक
              </span>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>
                  {language === "hi_cg"
                    ? "दक्षिण पूर्व मध्य रेलवे • बिलासपुर, रायपुर, दुर्ग"
                    : "South East Central Railway • Bilaspur, Raipur, Durg"}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
                {language === "hi_cg" ? "कुली साथी ड्यूटी लॉगिन" : "Sahayak Partner Sign In"}
              </h1>

              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
                {language === "hi_cg"
                  ? "प्लेटफॉर्म ड्यूटी शुरू करने के लिए अपना बिल्ला नंबर और 4-अंकीय पिन दर्ज करें।"
                  : "Enter your official Brass Billa ID and 4-digit PIN to start platform duty."}
              </p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSahayakLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Billa ID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                {language === "hi_cg" ? "SECR पीतल बिल्ला नंबर (Badge ID)" : "SECR Brass Billa Badge ID"}
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 font-mono text-sm font-bold text-slate-500 dark:text-zinc-400">
                  #
                </span>
                <input
                  type="text"
                  value={billaInput}
                  onChange={(e) => setBillaInput(e.target.value.toUpperCase())}
                  placeholder="BSP-108 / R-042 / DURG-019"
                  className="w-full pl-9 pr-3.5 py-3 rounded-2xl apple-glass-subcard font-mono text-sm sm:text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-400 uppercase tracking-wider"
                  required
                />
              </div>
            </div>

            {/* 4-Digit Security PIN */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                {language === "hi_cg" ? "4-अंकीय सुरक्षा पिन (Security PIN)" : "4-Digit Security PIN"}
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-500 dark:text-zinc-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                  placeholder="• • • •"
                  className="w-full pl-9 pr-3.5 py-3 rounded-2xl apple-glass-subcard font-mono text-base font-bold text-slate-900 dark:text-white tracking-[0.3em] focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>

            {/* SECR Welfare Pod: 100% Direct Porter Cash */}
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <p className="text-[11px] text-emerald-900 dark:text-emerald-300 font-semibold">
                {language === "hi_cg"
                  ? "✓ 0% कमीशन • 100% कमाई सीधे आपके हाथ में (Zero Gateway Fee)"
                  : "✓ 0% Commission • 100% Direct Porter Cash/UPI Tariff"}
              </p>
            </div>

            {/* Primary Action Button (Royal SECR Navy & Brass) */}
            <button
              type="submit"
              disabled={isSubmittingLogin}
              className="w-full py-3.5 px-4 rounded-2xl apple-glass-btn-primary font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 active:scale-95 transition-all cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>
                {isSubmittingLogin
                  ? "Verifying Badge..."
                  : language === "hi_cg"
                  ? "ड्यूटी शुरू करें / लॉगिन"
                  : "Sign In to Platform Duty"}
              </span>
            </button>
          </form>

          {/* Quick Demo Fill Buttons (1-Tap Test) */}
          <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.08] space-y-2">
            <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block text-center uppercase tracking-wider">
              {language === "hi_cg"
                ? "⚡ त्वरित परीक्षण क्रेडेंशियल्स (1-क्लिक भरें):"
                : "⚡ Quick Demo Credentials (1-Click Fill):"}
            </span>

            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setBillaInput("BSP-108");
                  setPinInput("1080");
                }}
                className="p-2 rounded-xl apple-glass-subcard hover:bg-black/5 dark:hover:bg-white/10 text-center font-bold text-slate-800 dark:text-zinc-200 transition-all border border-amber-400/20"
              >
                <div className="font-mono text-amber-600 dark:text-amber-400">BSP-108</div>
                <div className="text-[10px] text-slate-500">Ramesh (1080)</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBillaInput("R-042");
                  setPinInput("0420");
                }}
                className="p-2 rounded-xl apple-glass-subcard hover:bg-black/5 dark:hover:bg-white/10 text-center font-bold text-slate-800 dark:text-zinc-200 transition-all border border-amber-400/20"
              >
                <div className="font-mono text-amber-600 dark:text-amber-400">R-042</div>
                <div className="text-[10px] text-slate-500">Santosh (0420)</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBillaInput("DURG-019");
                  setPinInput("0190");
                }}
                className="p-2 rounded-xl apple-glass-subcard hover:bg-black/5 dark:hover:bg-white/10 text-center font-bold text-slate-800 dark:text-zinc-200 transition-all border border-amber-400/20"
              >
                <div className="font-mono text-amber-600 dark:text-amber-400">DURG-019</div>
                <div className="text-[10px] text-slate-500">Dilip (0190)</div>
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: LOGGED-IN SAHAYAK PORTAL (Streamlined Rapido Captain Architecture)
  // =========================================================================
  return (
    <div className="min-h-screen apple-glass-canvas text-slate-900 dark:text-white transition-colors relative overflow-hidden pb-12">
      {/* Specular Ambient Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[340px] bg-gradient-to-tr from-black/[0.03] via-transparent to-black/[0.02] dark:from-white/[0.04] dark:via-transparent dark:to-white/[0.02] blur-3xl rounded-full pointer-events-none -z-10" />

      <main className="max-w-xl mx-auto px-4 py-5 sm:py-7 space-y-4 relative z-10">
        
        {/* ================= 1. CLEAN RAPIDO TOP HEADER ================= */}
        <div className="apple-glass-card rounded-3xl p-4 sm:p-5 shadow-lg flex items-center justify-between gap-3">
          
          {/* Identity: AppleAvatar + Name + SECR Billa */}
          <div className="flex items-center gap-3">
            <AppleAvatar
              name={displaySahayak.name}
              billaNumber={displaySahayak.billaNumber}
              size="md"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-black text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                  {language === "hi_cg" ? displaySahayak.hindiName : displaySahayak.name}
                </h2>
                <span className="px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-700 dark:text-amber-300 text-[10px] font-black border border-amber-400/30">
                  {displaySahayak.rating}★
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-zinc-400 block mt-0.5">
                Billa #{displaySahayak.billaNumber} • {displaySahayak.stationName}
              </span>
            </div>
          </div>

          {/* Quick Actions (Sound Chime, PWA, Exit Shift) */}
          <div className="flex items-center gap-1.5">
            {/* Audio Chime Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl apple-glass-subcard hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-amber-400 transition-all shadow-xs"
              title={soundEnabled ? "Station Chime ON" : "Station Chime OFF"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Install PWA Icon (if supported) */}
            {isInstallable && (
              <button
                onClick={handleInstallApp}
                className="p-2 rounded-xl apple-glass-subcard text-amber-600 dark:text-amber-400 hover:bg-black/5 dark:hover:bg-white/10 shadow-xs"
                title="Install Partner App"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            {/* End Shift / Sign Out */}
            <button
              onClick={logoutSahayak}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 flex items-center gap-1 transition-all"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{language === "hi_cg" ? "निकास" : "Exit"}</span>
            </button>
          </div>

        </div>

        {/* ================= 2. GIANT RAPIDO DUTY TOGGLE ================= */}
        <div className="apple-glass-card rounded-3xl p-3 sm:p-4 shadow-md flex items-center justify-between border border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex items-center gap-2.5 pl-1.5">
            <span
              className={`w-3.5 h-3.5 rounded-full ${
                isSahayakOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
              }`}
            />
            <div>
              <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                {language === "hi_cg" ? "ड्यूटी स्थिति" : "Duty Status"}
              </span>
              <span
                className={`text-xs sm:text-sm font-black ${
                  isSahayakOnline
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-slate-600 dark:text-zinc-400"
                }`}
              >
                {isSahayakOnline
                  ? language === "hi_cg"
                    ? "🟢 ड्यूटी पर (ONLINE)"
                    : "🟢 ON DUTY (ONLINE)"
                  : language === "hi_cg"
                  ? "⚪ विश्राम (OFFLINE)"
                  : "⚪ OFF DUTY (OFFLINE)"}
              </span>
            </div>
          </div>

          <button
            onClick={handleToggleDuty}
            className={`px-4 py-2 rounded-2xl font-black text-xs transition-all shadow-md active:scale-95 ${
              isSahayakOnline
                ? "bg-slate-900 hover:bg-slate-800 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700"
                : "bg-emerald-500 hover:bg-emerald-600 text-white"
            }`}
          >
            {isSahayakOnline
              ? language === "hi_cg"
                ? "विश्राम लें (Go Offline)"
                : "Go Offline"
              : language === "hi_cg"
              ? "ड्यूटी शुरू करें (Go Online)"
              : "Go Online"}
          </button>
        </div>

        {/* ================= 3. TODAY'S QUICK EARNINGS STRIP ================= */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Today's Cash */}
          <div className="p-3.5 rounded-2xl apple-glass-subcard border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                {language === "hi_cg" ? "आज की नकद कमाई" : "Today's Cash"}
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 block mt-0.5">
                ₹{dailyEarnings.totalCash}
              </span>
              <span className="text-[9px] text-slate-500 dark:text-zinc-400 block">
                {language === "hi_cg" ? "✓ 100% सीधी कमाई" : "✓ 100% Direct to You"}
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
              ₹
            </div>
          </div>

          {/* Trips Completed (Click to view Ledger Drawer) */}
          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="p-3.5 rounded-2xl apple-glass-subcard border border-black/[0.06] dark:border-white/[0.08] hover:border-amber-400/40 text-left flex items-center justify-between shadow-xs transition-all group"
          >
            <div>
              <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                {language === "hi_cg" ? "कुल फेरे (ट्रिप्स)" : "Completed Trips"}
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white block mt-0.5">
                {dailyEarnings.tripsCount}
              </span>
              <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5 mt-0.5 group-hover:underline">
                <span>{language === "hi_cg" ? "इतिहास देखें" : "View History"}</span>
                <ChevronRight className="w-3 h-3" />
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
              <History className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* ================= 4. MAIN DYNAMIC WORK AREA ================= */}

        {/* CASE 0: RECENTLY COMPLETED JOURNEY (Prevents abrupt disappearing) */}
        {lastCompletedJob && (
          <div className="apple-glass-card rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 border-2 border-emerald-500/70 bg-gradient-to-br from-emerald-500/10 via-amber-400/5 to-transparent">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-xs">
                  ✓
                </span>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                    {language === "hi_cg" ? "यात्रा सफलतापूर्वक संपन्न!" : "Trip Completed Successfully!"}
                  </h3>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                    Trip #{lastCompletedJob.id} • PNR {lastCompletedJob.pnr}
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl">
                +₹{lastCompletedJob.fare.payToSahayakCash}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl apple-glass-subcard flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">{lastCompletedJob.passengerName}</span>
                <span className="text-[11px] text-slate-500">Coach {lastCompletedJob.trainDetails.coach} • Berth {lastCompletedJob.trainDetails.berth}</span>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-md">
                OTP: {lastCompletedJob.happyCode} Verified
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setUpiModalJob(lastCompletedJob)}
                className="py-2.5 px-3 rounded-2xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-900 dark:text-amber-300 font-bold text-xs border border-amber-400/40 flex items-center justify-center gap-1.5 transition-all"
              >
                <QrCode className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>{language === "hi_cg" ? "UPI QR दिखाएं" : "Show UPI QR"}</span>
              </button>

              <button
                onClick={() => setLastCompletedJob(null)}
                className="py-2.5 px-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-zinc-950 font-black text-xs shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <span>{language === "hi_cg" ? "अगली बुकिंग लें" : "Ready for Next Job"}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* CASE A: ACTIVE RUNNING TRIP (Step-by-Step Guidance) */}
        {activeAssignedJobs.length > 0 && (
          <div className="space-y-3 pt-1">
            {activeAssignedJobs.map((job) => (
              <div
                key={job.id}
                className="apple-glass-card rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 border-2 border-emerald-500/50 dark:border-emerald-400/40"
              >
                {/* Active Trip Header */}
                <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                      {language === "hi_cg" ? "चालू बुकिंग • # " : "ACTIVE TRIP • #"}
                      {job.id}
                    </span>
                  </div>
                  <span className="text-xs font-bold font-mono text-slate-900 dark:text-white bg-black/[0.04] dark:bg-white/[0.08] px-2.5 py-1 rounded-lg">
                    {language === "hi_cg" ? "नकद:" : "Fare:"} ₹{job.fare.payToSahayakCash}
                  </span>
                </div>

                {/* STEP 1: Meeting Target Destination */}
                <div className="p-4 rounded-2xl bg-[#0F2A4A] text-white border border-amber-400/40 space-y-1 shadow-md">
                  <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
                    <span>
                      {language === "hi_cg"
                        ? `चरण १: बोगी के बाहर पहुँचें`
                        : `STEP 1: PROCEED TO COACH DOOR`}
                    </span>
                    <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black text-[10px]">
                      PF {job.trainDetails.platform}
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    Coach {job.trainDetails.coach} • Seat {job.trainDetails.berth}
                  </div>
                  <div className="text-xs text-slate-300">
                    {job.trainDetails.trainNumber} - {job.trainDetails.trainName}
                  </div>
                  <div className="text-xs text-amber-300/90 pt-1 font-semibold">
                    🧳 {job.luggage.mediumTrolley} Trolley + {job.luggage.heavyCarton} Trunk •{" "}
                    {job.pickupDropMode === "TRAIN_TO_EXIT"
                      ? language === "hi_cg"
                        ? "ट्रेन से बाहर"
                        : "Train to Exit"
                      : language === "hi_cg"
                      ? "स्टेशन से ट्रेन"
                      : "Station to Train"}
                  </div>
                </div>

                {/* 2D Interactive Coach & FOB Platform Visualizer */}
                <CoachPlatformVisualizer
                  targetCoach={job.trainDetails.coach}
                  platform={job.trainDetails.platform}
                  trainNumber={job.trainDetails.trainNumber}
                  trainName={job.trainDetails.trainName}
                  stationName={job.trainDetails.boardingStation || job.trainDetails.stationName}
                />

                {/* Real-Time Live Coolie & Platform Tracker (Google Maps Live View) */}
                <GoogleStyleLiveMap
                  bookingId={job.id}
                  sahayak={displaySahayak}
                  targetCoach={job.trainDetails.coach}
                  platform={job.trainDetails.platform}
                  stationCode={job.trainDetails.stationCode}
                  stationName={job.trainDetails.boardingStation || job.trainDetails.stationName}
                  isCoolieView={true}
                  onPingArrival={() => {
                    alert(
                      language === "hi_cg"
                        ? "✓ यात्री को प्लेटफॉर्म आगमन सूचना भेज दी गई है!"
                        : "✓ Arrival notification sent to passenger!"
                    );
                  }}
                />

                {/* STEP 2: One-Tap Passenger Contact */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400 px-1">
                    <span>
                      {language === "hi_cg" ? "चरण २: यात्री से संपर्क करें" : "STEP 2: CONTACT PASSENGER"}
                    </span>
                    <strong className="text-slate-900 dark:text-white">{job.passengerName}</strong>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Call Passenger */}
                    <a
                      href={`tel:${job.passengerPhone}`}
                      className="py-3 px-3 rounded-2xl apple-glass-subcard hover:bg-black/5 dark:hover:bg-white/10 text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center gap-2 border border-black/5 dark:border-white/10 shadow-xs active:scale-95 transition-all"
                    >
                      <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{language === "hi_cg" ? "कॉल करें" : "Call Passenger"}</span>
                    </a>

                    {/* WhatsApp Passenger */}
                    <a
                      href={`https://wa.me/91${job.passengerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
                        language === "hi_cg"
                          ? `नमस्ते ${job.passengerName} जी, मैं आपका कुली साथी ${displaySahayak.hindiName} (बिल्ला #${displaySahayak.billaNumber}) आपकी बोगी ${job.trainDetails.coach} के बाहर प्रतीक्षा कर रहा हूँ।`
                          : `Hello ${job.passengerName}, I am your Sahayak ${displaySahayak.name} (Billa #${displaySahayak.billaNumber}) waiting near Coach ${job.trainDetails.coach} door.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 px-3 rounded-2xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 border border-[#25D366]/40 shadow-xs active:scale-95 transition-all"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{language === "hi_cg" ? "व्हाट्सएप" : "WhatsApp"}</span>
                    </a>
                  </div>
                </div>

                {/* STEP 3: Complete Trip with Happy Code & UPI QR */}
                <div className="p-4 rounded-2xl apple-glass-subcard border border-black/10 dark:border-white/15 space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400 block">
                    {language === "hi_cg"
                      ? "चरण ३: यात्री से ४-अंकीय हैप्पी कोड (OTP) लें"
                      : "STEP 3: ENTER PASSENGER'S 4-DIGIT HAPPY CODE"}
                  </span>

                  <form onSubmit={(e) => handleVerifyOtpForJob(job.id, e)} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        maxLength={4}
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="• • • •"
                        className="flex-1 text-center py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/15 font-mono text-xl font-black tracking-[0.3em] text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="submit"
                        disabled={enteredOtp.length !== 4}
                        className="px-5 py-2.5 rounded-2xl apple-glass-btn-primary font-bold text-xs sm:text-sm disabled:opacity-40 cursor-pointer shadow-md active:scale-95 transition-all shrink-0"
                      >
                        {language === "hi_cg" ? "सत्यापित करें" : "Verify & Finish"}
                      </button>
                    </div>

                    {otpError && (
                      <p className="text-xs text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/60 p-2 rounded-xl border border-rose-200 dark:border-rose-800">
                        {otpError}
                      </p>
                    )}
                    {otpSuccess && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 p-2 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        {otpSuccess}
                      </p>
                    )}
                  </form>

                  {/* Show NPCI UPI QR */}
                  <button
                    onClick={() => setUpiModalJob(job)}
                    className="w-full py-2.5 rounded-2xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-900 dark:text-amber-300 font-bold text-xs border border-amber-400/40 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <QrCode className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>{language === "hi_cg" ? "मेरा UPI QR कोड दिखाएं" : "Show My NPCI UPI QR Code"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CASE B: NEW INCOMING BOOKING ALERT (Rapido 25s High-Contrast Sheet) */}
        {activeAssignedJobs.length === 0 && pendingJobs.length > 0 && isSahayakOnline && (
          <div className="space-y-3 pt-1">
            {pendingJobs.map((job) => {
              const secondsLeft = countdownSeconds[job.id] !== undefined ? countdownSeconds[job.id] : 25;

              return (
                <div
                  key={job.id}
                  className="apple-glass-card rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 border-2 border-amber-500/60 dark:border-amber-400/50"
                >
                  {/* Urgent Countdown Header */}
                  <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-200">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                      <span>
                        {language === "hi_cg"
                          ? "⚡ नया यात्री बुकिंग ऑर्डर"
                          : "⚡ NEW PASSENGER BOOKING"}
                      </span>
                    </div>
                    <span className="font-mono text-sm font-black text-amber-700 dark:text-amber-300 bg-amber-400/30 px-2 py-0.5 rounded-lg">
                      {secondsLeft}s {language === "hi_cg" ? "शेष" : "left"}
                    </span>
                  </div>

                  {/* Cash to Collect & Luggage */}
                  <div className="flex items-center justify-between px-1">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                        {language === "hi_cg" ? "सीधी नकद कमाई" : "Direct Porter Tariff"}
                      </span>
                      <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                        ₹{job.fare.payToSahayakCash}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="px-3 py-1 rounded-xl bg-black/[0.05] dark:bg-white/[0.1] text-xs font-extrabold text-slate-800 dark:text-zinc-200 inline-block">
                        🧳 {job.luggage.mediumTrolley} Trolley + {job.luggage.heavyCarton} Trunk
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1 block font-semibold">
                        {language === "hi_cg" ? "१००% नकद या UPI" : "100% Cash / UPI"}
                      </span>
                    </div>
                  </div>

                  {/* Meeting Destination Target */}
                  <div className="p-4 rounded-2xl bg-[#0F2A4A] text-white border border-amber-400/40 space-y-1 shadow-md">
                    <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
                      <span>PLATFORM {job.trainDetails.platform} • ETA {job.trainDetails.eta}</span>
                      <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black text-[10px]">
                        {job.pickupDropMode === "TRAIN_TO_EXIT"
                          ? language === "hi_cg"
                            ? "ट्रेन आगमन"
                            : "Train Arrival"
                          : language === "hi_cg"
                          ? "ट्रेन प्रस्थान"
                          : "Train Departure"}
                      </span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black tracking-tight">
                      Coach {job.trainDetails.coach} • Seat {job.trainDetails.berth}
                    </div>
                    <div className="text-xs text-slate-300">
                      {job.trainDetails.trainNumber} - {job.trainDetails.trainName}
                    </div>
                  </div>

                  {/* Passenger Info */}
                  <div className="flex items-center justify-between text-xs px-1 text-slate-600 dark:text-zinc-400">
                    <span>
                      {language === "hi_cg" ? "यात्री:" : "Passenger:"} <strong>{job.passengerName}</strong>
                    </span>
                    <span>
                      {language === "hi_cg" ? "मिलने का स्थान:" : "Meeting:"} <strong>Coach Door</strong>
                    </span>
                  </div>

                  {/* Giant Rapido Style Green Accept Button */}
                  <button
                    onClick={() => handleAcceptJob(job.id)}
                    className="w-full py-4 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-white font-black text-base sm:text-lg shadow-xl transition-all flex items-center justify-center gap-2 tracking-wide cursor-pointer border border-white/20"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>
                      {language === "hi_cg"
                        ? `बुकिंग स्वीकार करें (₹${job.fare.payToSahayakCash})`
                        : `ACCEPT BOOKING (₹${job.fare.payToSahayakCash})`}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* CASE C: IDLE & WAITING (Train Radar Animation) */}
        {activeAssignedJobs.length === 0 && pendingJobs.length === 0 && isSahayakOnline && (
          <div className="py-10 px-4 text-center apple-glass-card rounded-3xl space-y-4 shadow-sm border border-black/[0.06] dark:border-white/[0.08]">
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-amber-500/30 animate-ping opacity-25" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0F2A4A] to-[#071526] text-amber-400 flex items-center justify-center shadow-lg border border-amber-400/40 text-2xl">
                <Radio className="w-8 h-8 animate-pulse text-amber-400" />
              </div>
            </div>

            <div>
              <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                {language === "hi_cg"
                  ? `${displaySahayak.stationName} स्टेशन पर यात्रियों की खोज जारी...`
                  : `Waiting for bookings at ${displaySahayak.stationName}...`}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                {language === "hi_cg"
                  ? "स्क्रीन वेक लॉक चालू है। जैसे ही कोई यात्री पीएनआर डालकर कुली बुक करेगा, 3-टोन रेलवे घंटी बजेगी।"
                  : "Screen wake lock is active. Your phone will play a loud 3-tone railway chime when a passenger books."}
              </p>
            </div>
          </div>
        )}

        {/* CASE D: OFFLINE STATE */}
        {!isSahayakOnline && (
          <div className="py-10 px-4 text-center apple-glass-card rounded-3xl space-y-4 shadow-sm border border-black/[0.06] dark:border-white/[0.08]">
            <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 flex items-center justify-center mx-auto text-2xl">
              <Power className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                {language === "hi_cg" ? "आप अभी ऑफलाइन (विश्राम) हैं" : "You are currently Offline"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
                {language === "hi_cg"
                  ? "यात्री बुकिंग प्राप्त करने के लिए ड्यूटी शुरू करें बटन दबाएं।"
                  : "Tap the button below to go online and receive passenger luggage bookings."}
              </p>
            </div>
            <button
              onClick={handleToggleDuty}
              className="py-3 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-md transition-all active:scale-95 inline-flex items-center gap-2"
            >
              <Power className="w-4 h-4" />
              <span>{language === "hi_cg" ? "ड्यूटी शुरू करें (Go Online)" : "Go Online Now"}</span>
            </button>
          </div>
        )}

        {/* ================= 5. STATION DISPATCHES & LIVE ROSTER ================= */}
        <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-zinc-300 px-1">
            <span className="flex items-center gap-1.5">
              <Train className="w-3.5 h-3.5 text-amber-500" />
              <span>{displaySahayak.stationName} Station Queue ({stationJobs.length})</span>
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Live Auto-Sync (3s)
            </span>
          </div>

          <div className="space-y-2">
            {stationJobs.length === 0 ? (
              <div className="p-4 rounded-2xl apple-glass-subcard text-center text-xs text-slate-500 dark:text-zinc-400">
                {language === "hi_cg" ? "वर्तमान में कोई लंबित बुकिंग नहीं है।" : "No pending dispatches right now."}
              </div>
            ) : (
              stationJobs.slice(0, 5).map((sj) => (
                <div
                  key={sj.id}
                  className="p-3 rounded-2xl apple-glass-subcard flex items-center justify-between text-xs border border-black/[0.04] dark:border-white/[0.06]"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 dark:text-white font-mono">{sj.id}</span>
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                          sj.status === "COMPLETED"
                            ? "bg-emerald-500/15 text-emerald-600"
                            : sj.status === "CONFIRMED"
                            ? "bg-amber-400/20 text-amber-700 animate-pulse"
                            : "bg-blue-500/15 text-blue-600"
                        }`}
                      >
                        {sj.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mt-0.5">
                      {sj.passengerName} • Coach {sj.trainDetails.coach} • PF {sj.trainDetails.platform}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 block">
                      ₹{sj.fare.payToSahayakCash}
                    </span>
                    {sj.status === "COMPLETED" ? (
                      <span className="text-[10px] text-slate-400 font-bold">Done</span>
                    ) : (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">Active</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </main>

      {/* ================= MODAL 1: NPCI UPI QR CODE ================= */}
      {upiModalJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm apple-glass-card rounded-3xl p-6 shadow-2xl space-y-4 text-center border border-black/10 dark:border-white/20">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-500" />
                <span>{language === "hi_cg" ? "NPCI UPI भुगतान QR" : "NPCI UPI Payment QR"}</span>
              </h3>
              <button
                onClick={() => setUpiModalJob(null)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <span className="text-xs text-slate-500 dark:text-zinc-400 block">
                {language === "hi_cg" ? "सीधी कुली राशि" : "Direct Porter Fare"}
              </span>
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono block mt-1">
                ₹{upiModalJob.fare.payToSahayakCash}
              </span>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 block mt-0.5">
                {language === "hi_cg"
                  ? `सीधे कुली ${displaySahayak.hindiName} (#${displaySahayak.billaNumber}) के बैंक खाते में`
                  : `Direct to Sahayak ${displaySahayak.name} (#${displaySahayak.billaNumber})`}
              </span>
            </div>

            {/* Pure SVG QR Code */}
            {(() => {
              const upiUri = generateUpiUri({
                vpa: `secr.porter.${displaySahayak.billaNumber.toLowerCase().replace(/[^a-z0-9]/g, "")}@sbi`,
                name: displaySahayak.name,
                amount: upiModalJob.fare.payToSahayakCash,
                note: `RailSangwari-${upiModalJob.id}`,
              });
              const qrSvg = generateQrSvgPath(upiUri, 200);

              return (
                <div className="p-4 bg-white rounded-2xl inline-block shadow-md mx-auto">
                  <svg viewBox={qrSvg.viewBox} className="w-44 h-44 mx-auto fill-slate-900">
                    <path d={qrSvg.path} />
                  </svg>
                  <span className="text-[10px] font-bold text-slate-800 block mt-1 tracking-wider uppercase">
                    NPCI UPI QR • PhonePe / GPay / Paytm
                  </span>
                </div>
              );
            })()}

            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              {language === "hi_cg"
                ? "०% प्लेटफॉर्म कटौती • पूरी राशि सीधे आपके बैंक में"
                : "0% platform deduction • 100% credited directly to your bank"}
            </p>

            <button
              onClick={() => setUpiModalJob(null)}
              className="w-full py-2.5 rounded-2xl apple-glass-subcard text-slate-700 dark:text-zinc-300 font-bold text-xs hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              {language === "hi_cg" ? "बंद करें" : "Close"}
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: TODAY'S COMPLETED TRIPS HISTORY ================= */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md apple-glass-card rounded-3xl p-6 shadow-2xl space-y-4 border border-black/10 dark:border-white/20">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  {language === "hi_cg" ? "आज के पूरे किए गए फेरे" : "Today's Completed Trips"}
                </h3>
              </div>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Summary Row */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block">
                  {language === "hi_cg" ? "कुल प्राप्त राशि" : "Total Cash Collected"}
                </span>
                <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                  ₹{dailyEarnings.totalCash}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 block">
                  {language === "hi_cg" ? "फेरे" : "Trips"}
                </span>
                <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                  {dailyEarnings.tripsCount}
                </span>
              </div>
            </div>

            {/* Trips List */}
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {completedJobs.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 dark:text-zinc-400 apple-glass-subcard rounded-2xl">
                  {language === "hi_cg"
                    ? "आज अभी तक कोई फेरा पूरा नहीं हुआ है।"
                    : "No trips completed yet today."}
                </div>
              ) : (
                completedJobs.map((cj) => (
                  <div
                    key={cj.id}
                    className="p-3.5 apple-glass-subcard rounded-2xl flex items-center justify-between text-xs border border-black/5 dark:border-white/5"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {cj.trainDetails.trainName} ({cj.trainDetails.trainNumber})
                      </span>
                      <span className="text-slate-500 dark:text-zinc-400 text-[11px] block mt-0.5">
                        Coach {cj.trainDetails.coach} • {cj.passengerName}
                      </span>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono block">
                        OTP: {cj.happyCode} • PF {cj.trainDetails.platform}
                      </span>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono text-base block">
                        +₹{cj.fare.payToSahayakCash}
                      </span>
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-300">
                        ✓ {language === "hi_cg" ? "प्राप्त" : "Received"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedTripForReceipt(cj)}
                        className="mt-1 px-2 py-0.5 rounded-lg bg-black/[0.05] dark:bg-white/[0.08] hover:bg-amber-400 hover:text-slate-950 text-[10px] font-bold transition-all flex items-center gap-1"
                      >
                        <Receipt className="w-3 h-3" />
                        <span>{language === "hi_cg" ? "रसीद देखें" : "SECR Receipt"}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setIsHistoryModalOpen(false)}
              className="w-full py-2.5 rounded-2xl apple-glass-btn-primary font-bold text-xs"
            >
              {language === "hi_cg" ? "वापस जाएँ" : "Back to Duty"}
            </button>
          </div>
        </div>
      )}

      {/* Option B: SECR Digital Luggage Receipt Modal */}
      {selectedTripForReceipt && (
        <PostTripFeedbackReceiptModal
          isOpen={Boolean(selectedTripForReceipt)}
          onClose={() => setSelectedTripForReceipt(null)}
          booking={selectedTripForReceipt}
          sahayak={displaySahayak}
        />
      )}

    </div>
  );
}
