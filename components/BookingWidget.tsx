"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { useBooking } from "@/context/BookingContext";
import { useAuth } from "@/context/AuthContext";
import AppleAvatar from "@/components/AppleAvatar";
import { CoachPlatformVisualizer } from "@/components/CoachPlatformVisualizer";
import { GoogleStyleLiveMap } from "@/components/GoogleStyleLiveMap";
import { PostTripFeedbackReceiptModal } from "@/components/PostTripFeedbackReceiptModal";
import { lookupPnr } from "@/lib/mock-railway-data";
import {
  Train,
  CheckCircle2,
  Phone,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  MapPin,
  HeartHandshake,
  Award,
  AlertCircle,
  CreditCard,
  User,
  PhoneCall,
  Search,
  Sparkles,
  Target,
  Share2,
  Star,
  Receipt,
  Radio,
} from "lucide-react";
import confetti from "canvas-confetti";

export function BookingWidget() {
  const { language, t } = useLanguage();
  const { passengerUser, isPassengerLoggedIn, openPassengerAuthModal } = useAuth();
  const {
    step,
    setStep,
    pnrInput,
    setPnrInput,
    trainDetails,
    setTrainDetails,
    pickupDropMode,
    setPickupDropMode,
    passengerPhone,
    setPassengerPhone,
    passengerName,
    setPassengerName,
    luggage,
    updateLuggageCount,
    toggleWheelchair,
    fare,
    activeBooking,
    happyCode,
    assignedSahayak,
    confirmBooking,
    resetBooking,
    acceptJob,
  } = useBooking();

  // Auto-populate logged-in passenger details
  useEffect(() => {
    if (passengerUser) {
      if (!passengerPhone) setPassengerPhone(passengerUser.phone);
      if (!passengerName) setPassengerName(passengerUser.name);
    }
  }, [passengerUser, passengerPhone, passengerName, setPassengerPhone, setPassengerName]);

  const [searchError, setSearchError] = useState("");
  const [isSearchingPnr, setIsSearchingPnr] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // Auto-open feedback & receipt modal when active booking is marked completed
  useEffect(() => {
    if (activeBooking?.status === "COMPLETED") {
      setIsFeedbackModalOpen(true);
    }
  }, [activeBooking?.status]);

  const fetchPnrDetails = async (cleaned: string) => {
    if (cleaned.length !== 10) {
      setSearchError(language === "hi_cg" ? "कृपया 10 अंकों का वैध पीएनआर नंबर दर्ज करें" : "Please enter a valid 10-digit PNR number");
      return null;
    }

    setIsSearchingPnr(true);
    setSearchError("");
    try {
      const res = await fetch(`/api/pnr?pnr=${cleaned}`);
      const json = await res.json();
      if (json.success && json.data) {
        setTrainDetails(json.data);
        return json.data;
      } else {
        const fallback = lookupPnr(cleaned);
        if (fallback) {
          setTrainDetails(fallback);
          return fallback;
        } else {
          setSearchError(json.error || (language === "hi_cg" ? "पीएनआर रिकॉर्ड नहीं मिला। कृपया नंबर जांचें।" : "Could not find PNR records. Please check the number."));
          return null;
        }
      }
    } catch {
      const fallback = lookupPnr(cleaned);
      if (fallback) {
        setTrainDetails(fallback);
        return fallback;
      } else {
        setSearchError(language === "hi_cg" ? "पीएनआर स्थिति लोड नहीं हो सकी" : "Failed to fetch PNR status.");
        return null;
      }
    } finally {
      setIsSearchingPnr(false);
    }
  };

  const handlePnrSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = pnrInput.replace(/\D/g, "");
    await fetchPnrDetails(cleaned);
  };

  const handleProceedToStep2 = async () => {
    if (!trainDetails) {
      const cleaned = pnrInput.replace(/\D/g, "");
      if (cleaned.length !== 10) {
        setSearchError(language === "hi_cg" ? "कृपया आगे बढ़ने से पहले 10 अंकों का पीएनआर नंबर दर्ज करें" : "Please enter a valid 10-digit PNR first.");
        return;
      }
      const fetched = await fetchPnrDetails(cleaned);
      if (fetched) {
        setStep(2);
      }
    } else {
      setStep(2);
    }
  };

  const handleConfirmAndPay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      confirmBooking();
      try {
        confetti({
          particleCount: 75,
          spread: 65,
          origin: { y: 0.6 },
          colors: ["#0B2545", "#F59E0B", "#C81E1E", "#10B981"],
        });
      } catch {
        // ignore
      }
    }, 900);
  };

  return (
    <div className="w-full apple-glass-card rounded-3xl p-5 sm:p-7 transition-all">
      {/* Clean Step Indicator */}
      <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] dark:border-white/[0.08] mb-5">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-full bg-[#0F2A4A] text-amber-300 border border-amber-400/40 text-xs font-bold flex items-center justify-center shadow-xs">
            {step}
          </span>
          <h2 className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">
            {step === 1 && t("step1Heading")}
            {step === 2 && t("step2Heading")}
            {step === 3 && t("step3Heading")}
          </h2>
        </div>

        {step > 1 && (
          <button
            onClick={() => {
              if (step === 3) resetBooking();
              else setStep((step - 1) as 1 | 2);
            }}
            className="text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{step === 3 ? (language === "hi_cg" ? "नई बुकिंग" : "New Booking") : (language === "hi_cg" ? "पीछे" : "Back")}</span>
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* ================= STEP 1: SIMPLE PNR ENTRY ONLY ================= */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* PNR input only - NO train number inputs */}
            <form onSubmit={handlePnrSearch} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                  {t("pnrStep1Label")}
                </label>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  {t("pnrAutoFetchHint")}
                </span>
              </div>
              <div className="relative flex items-center">
                <input
                  type="text"
                  maxLength={10}
                  value={pnrInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setPnrInput(val);
                    setSearchError("");
                    if (val.length === 10) {
                      fetchPnrDetails(val);
                    } else if (val.length < 10) {
                      setTrainDetails(null);
                    }
                  }}
                  placeholder={t("pnrPlaceholder")}
                  className="w-full pl-3.5 pr-24 py-3 rounded-2xl apple-glass-subcard focus:border-slate-800 dark:focus:border-zinc-300 focus:outline-none font-mono text-base font-bold text-slate-900 dark:text-white tracking-wider transition-all placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={isSearchingPnr}
                  className="absolute right-1.5 px-3.5 py-1.5 rounded-xl bg-[#0F2A4A] hover:bg-[#1E3A8A] border border-amber-400/30 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                >
                  {isSearchingPnr ? t("fetchingBtn") : t("fetchBtn")}
                </button>
              </div>
              {searchError && (
                <p className="text-[11px] text-red-600 dark:text-red-400 font-medium">{searchError}</p>
              )}
            </form>

            {/* Train & Seat Destination Card */}
            {trainDetails && (
              <div className="p-4 rounded-2xl apple-glass-subcard space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                      {t("pnrVerified")}
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1">
                      {trainDetails.trainName} ({trainDetails.trainNumber})
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-300 font-semibold mt-1">
                      <span className="px-2 py-0.5 rounded-md bg-black/[0.04] dark:bg-white/[0.08] text-slate-800 dark:text-zinc-200 font-bold">
                        📍 {trainDetails.boardingStation || trainDetails.stationName}
                      </span>
                      <span>•</span>
                      <span>{trainDetails.fromStation} → {trainDetails.toStation}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 shrink-0">
                    Platform {trainDetails.platform} • {trainDetails.eta}
                  </span>
                </div>

                {/* Highlighted Final Destination for the Coolie */}
                <div className="p-3.5 rounded-2xl coolie-target-radar flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0F2A4A] to-[#071526] text-amber-400 border border-amber-400/50 flex items-center justify-center font-black shadow-md shrink-0">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#0F2A4A] dark:text-amber-400 block">
                      {t("targetDestination")}
                    </span>
                    <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      Coach {trainDetails.coach} • Seat {trainDetails.berth}
                    </span>
                  </div>
                </div>

                {/* Pickup direction toggle */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setPickupDropMode("TRAIN_TO_EXIT")}
                    className={`p-2 rounded-xl text-xs font-semibold transition-all text-center ${
                      pickupDropMode === "TRAIN_TO_EXIT"
                        ? "bg-[#0F2A4A] dark:bg-[#1E3A8A] text-white border border-amber-400/30 shadow-xs font-bold"
                        : "apple-glass-subcard text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {t("arrivalMode")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPickupDropMode("ENTRY_TO_TRAIN")}
                    className={`p-2 rounded-xl text-xs font-semibold transition-all text-center ${
                      pickupDropMode === "ENTRY_TO_TRAIN"
                        ? "bg-[#0F2A4A] dark:bg-[#1E3A8A] text-white border border-amber-400/30 shadow-xs font-bold"
                        : "apple-glass-subcard text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {t("departureMode")}
                  </button>
                </div>

                {/* 2D Interactive Coach & FOB Platform Visualizer */}
                <div className="pt-2">
                  <CoachPlatformVisualizer
                    targetCoach={trainDetails.coach}
                    platform={trainDetails.platform}
                    trainNumber={trainDetails.trainNumber}
                    trainName={trainDetails.trainName}
                    stationName={trainDetails.boardingStation || trainDetails.stationName}
                  />
                </div>
              </div>
            )}

            {/* Mobile number */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  {t("phoneLabel")}
                </label>
                {isPassengerLoggedIn ? (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{passengerUser?.name}</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={openPassengerAuthModal}
                    className="text-[10px] text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>{language === "hi_cg" ? "मुफ्त लॉगिन करें" : "Sign In with Free OTP"}</span>
                  </button>
                )}
              </div>
              <input
                type="tel"
                value={passengerPhone}
                onChange={(e) => setPassengerPhone(e.target.value)}
                placeholder={t("phonePlaceholder")}
                className="w-full px-3.5 py-2.5 rounded-xl apple-glass-subcard text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-railway-navy dark:focus:border-amber-400 font-mono"
              />
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={handleProceedToStep2}
              className="w-full py-3.5 px-4 rounded-2xl apple-glass-btn-primary text-white font-bold text-sm flex items-center justify-center gap-2 mt-2"
            >
              <span>{t("continueToLuggage")}</span>
            </button>
          </motion.div>
        )}

        {/* ================= STEP 2: SIMPLE LUGGAGE SELECTOR ================= */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Bag Counters */}
            <div className="space-y-2.5">
              {/* Suitcase */}
              <div className="p-3.5 rounded-2xl apple-glass-subcard flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-railway-navy dark:text-white">{t("mediumTrolleyTitle")}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{t("mediumTrolleyDesc")}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateLuggageCount("mediumTrolley", -1)}
                    disabled={luggage.mediumTrolley === 0}
                    className="w-8 h-8 rounded-full apple-glass-subcard flex items-center justify-center font-bold text-base text-slate-900 dark:text-white disabled:opacity-30 hover:bg-white dark:hover:bg-slate-700 transition-colors shadow-xs active:scale-95"
                  >
                    -
                  </button>
                  <span className="w-5 text-center font-bold text-sm text-railway-navy dark:text-white">
                    {luggage.mediumTrolley}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateLuggageCount("mediumTrolley", 1)}
                    className="w-8 h-8 rounded-full apple-glass-subcard flex items-center justify-center font-bold text-base text-slate-900 dark:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors shadow-xs active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Heavy Trunk */}
              <div className="p-3.5 rounded-2xl apple-glass-subcard flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-railway-navy dark:text-white">{t("heavyCartonTitle")}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{t("heavyCartonDesc")}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateLuggageCount("heavyCarton", -1)}
                    disabled={luggage.heavyCarton === 0}
                    className="w-8 h-8 rounded-full apple-glass-subcard flex items-center justify-center font-bold text-base text-slate-900 dark:text-white disabled:opacity-30 hover:bg-white dark:hover:bg-slate-700 transition-colors shadow-xs active:scale-95"
                  >
                    -
                  </button>
                  <span className="w-5 text-center font-bold text-sm text-railway-navy dark:text-white">
                    {luggage.heavyCarton}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateLuggageCount("heavyCarton", 1)}
                    className="w-8 h-8 rounded-full apple-glass-subcard flex items-center justify-center font-bold text-base text-slate-900 dark:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors shadow-xs active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Wheelchair Escort Toggle */}
              <div className="p-3.5 rounded-2xl apple-glass-subcard border-rose-200/50 dark:border-rose-900/40 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-railway-navy dark:text-white flex items-center gap-1.5">
                    <HeartHandshake className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    {t("wheelchairTitle")}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{t("wheelchairDesc")}</div>
                </div>
                <button
                  type="button"
                  onClick={toggleWheelchair}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                    luggage.wheelchairEscort ? "bg-rose-600" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <div
                    className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                      luggage.wheelchairEscort ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Simple Glassy Fare Summary Box (Light & Dark Adaptive) */}
            <div className="p-4 rounded-2xl apple-glass-subcard space-y-2 border border-black/[0.06] dark:border-white/[0.08] shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-zinc-400 font-semibold">{t("totalPorterFare")}</span>
                <span className="font-black font-mono text-base text-slate-900 dark:text-white">
                  ₹{fare.totalAmount}
                </span>
              </div>
              <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.08] text-[11px] text-slate-500 dark:text-zinc-400 flex items-center justify-between">
                <span>{t("payToReserve")} <strong className="text-slate-800 dark:text-zinc-200">₹{fare.payNowFee}</strong></span>
                <span>{t("payAfterDrop")} <strong className="text-slate-800 dark:text-zinc-200">₹{fare.payToSahayakCash}</strong></span>
              </div>
            </div>

            {/* Confirm CTA */}
            <button
              type="button"
              disabled={fare.totalAmount === 0 || isProcessing}
              onClick={handleConfirmAndPay}
              className="w-full py-4 px-4 rounded-2xl apple-glass-btn-primary disabled:opacity-40 font-bold text-sm flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>{t("confirmingBtn")}</span>
                </div>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>{t("payAndConfirmBtn")}</span>
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* ================= STEP 3: APPLE WALLET GLASS BOARDING PASS ================= */}
        {step === 3 && activeBooking && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* If still searching for porter, show dedicated Searching Radar UI */}
            {activeBooking.status === "SEARCHING" ? (
              <div className="apple-glass-card rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 border-2 border-amber-500/50 relative overflow-hidden">
                {/* Concentric Radar Animation */}
                <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
                  <span className="absolute inset-0 rounded-full border-2 border-amber-400/30 animate-ping" />
                  <span className="absolute inset-3 rounded-full border border-amber-400/50 animate-pulse" />
                  <span className="absolute inset-6 rounded-full bg-gradient-to-tr from-amber-500/20 to-amber-300/10 blur-md" />
                  <div className="relative z-10 w-16 h-16 rounded-2xl bg-[#0F2A4A] text-amber-300 border-2 border-amber-400/80 flex items-center justify-center text-2xl shadow-xl">
                    <Radio className="w-8 h-8 animate-spin" style={{ animationDuration: "6s" }} />
                  </div>
                </div>

                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {activeBooking.trainDetails.boardingStation || activeBooking.trainDetails.stationName} • PF {activeBooking.trainDetails.platform}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {language === "hi_cg" ? "निकटतम SECR कुली साथी खोज रहे हैं..." : "Searching for SECR Licensed Sahayak..."}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                    {language === "hi_cg"
                      ? "स्टेशन कॉनकोर्स एवं प्लेटफॉर्म 2 पर उपस्थित कुलियों को आपका अनुरोध भेज दिया गया है। कुली के 'स्वीकार' (Accept) करते ही विवरण यहाँ दिखेगा।"
                      : "Booking request broadcasted to on-duty porters at station concourse & Platform 2. Trip details will appear once accepted."}
                  </p>
                </div>

                {/* Target Coach & Fare Pill */}
                <div className="p-4 rounded-2xl apple-glass-subcard border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between text-left">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                      Target Meeting Coach
                    </span>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      Coach {activeBooking.trainDetails.coach} • Seat {activeBooking.trainDetails.berth}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-zinc-400 block">
                      {activeBooking.trainDetails.trainNumber} - {activeBooking.trainDetails.trainName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                      Total Fare
                    </span>
                    <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                      ₹{activeBooking.fare.totalAmount}
                    </span>
                  </div>
                </div>

                {/* Live Steps Ticker */}
                <div className="space-y-2 text-xs text-slate-600 dark:text-zinc-400 text-left p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04]">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>✓</span>
                    <span>1. {language === "hi_cg" ? "पीएनआर एवं बोगी स्थान सत्यापित" : "PNR & Coach location verified"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>✓</span>
                    <span>2. {language === "hi_cg" ? "प्लेटफॉर्म कुली रोस्टर को रेडियो संदेश प्रेषित" : "Radio dispatch alert sent to platform porters"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>3. {language === "hi_cg" ? "कुली साथी द्वारा स्वीकार (Accept) किए जाने की प्रतीक्षा..." : "Waiting for porter to accept trip..."}</span>
                  </div>
                </div>

                {/* Passenger Cancel Search Option */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={resetBooking}
                    className="w-full py-3 px-4 rounded-2xl bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-slate-700 dark:text-zinc-300 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <span>{language === "hi_cg" ? "अनुरोध रद्द करें (Cancel Request)" : "Cancel Search Request"}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Apple Wallet Style Glass Ticket (Adaptive Light & Dark) */
              <div className="apple-glass-wallet-pass rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 relative overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider block">
                      {t("secrPassTitle")}
                    </span>
                    <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                      {activeBooking.id}
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold px-2.5 py-1 rounded-full border border-emerald-500/20">
                    {activeBooking.status === "COMPLETED" ? t("completedStatus") : t("assignedStatus")}
                  </span>
                </div>

                {/* Coolie Destination Highlight */}
                <div className="p-4 rounded-2xl coolie-target-radar flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#0F2A4A] dark:text-amber-400 uppercase tracking-widest font-black block">
                      {t("targetDestination")}
                    </span>
                    <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white block mt-0.5">
                      Coach {activeBooking.trainDetails.coach} • Seat {activeBooking.trainDetails.berth}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mt-0.5">
                      {activeBooking.trainDetails.trainName} • PF-{activeBooking.trainDetails.platform} • {activeBooking.trainDetails.boardingStation || activeBooking.trainDetails.stationName}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F2A4A] to-[#071526] text-amber-400 border border-amber-400/40 flex items-center justify-center font-bold shadow-xs shrink-0">
                    <Target className="w-5 h-5" />
                  </div>
                </div>

                {/* Sahayak Profile Row with AppleAvatar */}
                {assignedSahayak && (
                  <div className="p-3.5 rounded-2xl apple-glass-subcard border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between backdrop-blur-md">
                    <div className="flex items-center gap-3">
                      <AppleAvatar
                        name={assignedSahayak.name}
                        billaNumber={assignedSahayak.billaNumber}
                        size="md"
                      />
                      <div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white block">
                          {language === "hi_cg" ? assignedSahayak.hindiName : assignedSahayak.name}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold">
                          Billa #{assignedSahayak.billaNumber} ({assignedSahayak.rating}★)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${assignedSahayak.phone}`}
                        className="p-2.5 rounded-xl bg-[#0F2A4A] hover:bg-[#1E3A8A] text-white border border-amber-400/30 transition-all shadow-xs active:scale-95"
                        title="Call Sahayak"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                      <a
                        href={`https://wa.me/91${assignedSahayak.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                          language === "hi_cg"
                            ? `नमस्ते ${assignedSahayak.hindiName} जी, मेरा गंतव्य कोच ${activeBooking.trainDetails.coach} सीट ${activeBooking.trainDetails.berth} है।`
                            : `Hello ${assignedSahayak.name}, my destination is Coach ${activeBooking.trainDetails.coach} Seat ${activeBooking.trainDetails.berth}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white transition-all shadow-xs active:scale-95"
                        title="WhatsApp Sahayak"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                )}

                {/* High-Contrast Apple Security Pass Capsule (Happy Code OTP) */}
                <div className="p-4 rounded-2xl bg-slate-950 dark:bg-zinc-900 text-white border border-black/10 dark:border-white/10 flex items-center justify-between shadow-lg">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                      {t("happyCodeLabel")}
                    </span>
                    <span className="text-[11px] text-zinc-300 font-medium">
                      {t("happyCodeDesc")}
                    </span>
                  </div>
                  <span className="font-mono text-2xl sm:text-3xl font-black tracking-[0.2em] text-white">
                    {happyCode}
                  </span>
                </div>

                {/* Real-Time Live Google Maps Tracker (Continuous Automatic Movement) */}
                <GoogleStyleLiveMap
                  bookingId={activeBooking.id}
                  sahayak={assignedSahayak || activeBooking.sahayak}
                  targetCoach={activeBooking.trainDetails.coach}
                  platform={activeBooking.trainDetails.platform}
                  stationCode={activeBooking.trainDetails.stationCode}
                  stationName={activeBooking.trainDetails.boardingStation || activeBooking.trainDetails.stationName}
                />

                {/* 2D Interactive Coach & FOB Platform Visualizer */}
                <CoachPlatformVisualizer
                  targetCoach={activeBooking.trainDetails.coach}
                  platform={activeBooking.trainDetails.platform}
                  trainNumber={activeBooking.trainDetails.trainNumber}
                  trainName={activeBooking.trainDetails.trainName}
                  stationName={activeBooking.trainDetails.boardingStation || activeBooking.trainDetails.stationName}
                />
              </div>
            )}

            {/* Option B: Trip Completed Banner if verified */}
            {activeBooking.status === "COMPLETED" && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/15 to-transparent border border-amber-400/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0">
                    <Star className="w-4 h-4 fill-slate-950" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white block">
                      {language === "hi_cg" ? "यात्रा पूरी हुई! कुली को रेट करें" : "Trip Completed! Rate Your Sahayak"}
                    </span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">
                      {language === "hi_cg" ? "टिप दें एवं आधिकारिक SECR रसीद देखें" : "Add tip & download official SECR receipt"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFeedbackModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#0F2A4A] dark:bg-[#1E3A8A] text-white border border-amber-400/40 text-xs font-bold hover:scale-105 transition-all shadow-xs shrink-0"
                >
                  {language === "hi_cg" ? "रेट करें" : "Rate & Tip"}
                </button>
              </div>
            )}

            {/* Rate & Digital SECR Receipt Action */}
            <button
              type="button"
              onClick={() => setIsFeedbackModalOpen(true)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#0F2A4A] to-[#071526] hover:from-[#1E3A8A] hover:to-[#0F2A4A] text-white border border-amber-400/40 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Receipt className="w-4 h-4 text-amber-400" />
              <span>
                {activeBooking.status === "COMPLETED"
                  ? (language === "hi_cg" ? "रेटिंग दें, टिप दें व SECR रसीद डाउनलोड करें" : "Rate Sahayak, Tip & Download SECR Receipt")
                  : (language === "hi_cg" ? "डिजिटल SECR रसीद देखें / टिप दें" : "View SECR Luggage Receipt & Tip")}
              </span>
            </button>

            {/* Share booking details via WhatsApp */}
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                language === "hi_cg"
                  ? `नमस्ते! रेल संगवारी कुली बुकिंग पुष्टि:\n` +
                    `• बुकिंग ID: ${activeBooking.id}\n` +
                    `• ट्रेन: ${activeBooking.trainDetails.trainName} (${activeBooking.trainDetails.trainNumber})\n` +
                    `• गंतव्य: Coach ${activeBooking.trainDetails.coach}, Seat ${activeBooking.trainDetails.berth} (Platform ${activeBooking.trainDetails.platform})\n` +
                    `• कुली साथी: ${assignedSahayak?.hindiName || "रमेश यादव"} (बिल्ला #${assignedSahayak?.billaNumber || "BSP-108"})\n` +
                    `• हैप्पी कोड (OTP): ${happyCode}\n` +
                    `• शेष मजदूरी: ₹${activeBooking.fare.payToSahayakCash}`
                  : `Rail Sangwari Sahayak Booking Confirmed:\n` +
                    `• Booking ID: ${activeBooking.id}\n` +
                    `• Train: ${activeBooking.trainDetails.trainName} (${activeBooking.trainDetails.trainNumber})\n` +
                    `• Destination: Coach ${activeBooking.trainDetails.coach}, Seat ${activeBooking.trainDetails.berth} (Platform ${activeBooking.trainDetails.platform})\n` +
                    `• Sahayak: ${assignedSahayak?.name || "Ramesh Yadav"} (Billa #${assignedSahayak?.billaNumber || "BSP-108"})\n` +
                    `• Happy Code (OTP): ${happyCode}\n` +
                    `• Cash/UPI to pay: ₹${activeBooking.fare.payToSahayakCash}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-2xl bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              <span>{t("shareWhatsApp")}</span>
            </a>

            {/* Simple Reset */}
            <button
              type="button"
              onClick={resetBooking}
              className="w-full py-3 rounded-2xl apple-glass-subcard text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors hover:bg-white/80 dark:hover:bg-slate-800"
            >
              {t("bookAnother")}
            </button>

            {/* Option B: Post-Trip Feedback, Porter Tipping & Digital SECR Receipt Modal */}
            <PostTripFeedbackReceiptModal
              isOpen={isFeedbackModalOpen}
              onClose={() => setIsFeedbackModalOpen(false)}
              booking={activeBooking}
              sahayak={assignedSahayak}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
