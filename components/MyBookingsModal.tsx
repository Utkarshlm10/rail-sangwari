"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useBooking } from "@/context/BookingContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import {
  X,
  Train,
  LogOut,
  CheckCircle2,
  Phone,
  Calendar,
  Clock,
  Download,
  ChevronRight,
  Sun,
  Moon,
  Globe2,
  ShieldCheck,
  User,
  Ticket,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AppleAvatar from "@/components/AppleAvatar";

export default function MyBookingsModal() {
  const { isMyBookingsModalOpen, closeMyBookingsModal, passengerUser, logoutPassenger, pastBookings } =
    useAuth();
  const { activeBooking } = useBooking();
  const { language, toggleLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<"TRIPS" | "SETTINGS">("TRIPS");

  if (!isMyBookingsModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg max-h-[90vh] flex flex-col apple-glass-card rounded-3xl p-5 sm:p-6 shadow-2xl bg-white/95 dark:bg-slate-900/95 border border-black/10 dark:border-white/20"
        >
          {/* Header & User Profile Capsule */}
          <div className="pb-4 border-b border-black/[0.06] dark:border-white/[0.08] shrink-0 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400 block">
                {language === "hi_cg" ? "रेल संगवारी यात्री प्रोफाइल" : "Rail Sangwari Passenger Profile"}
              </span>

              <button
                type="button"
                onClick={closeMyBookingsModal}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Pod */}
            <div className="p-3 rounded-2xl apple-glass-subcard flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0F2A4A] to-[#1E3A8A] text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
                  {passengerUser?.name ? passengerUser.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                      {passengerUser?.name || "Verified Passenger"}
                    </h3>
                    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                      ✓ SECR
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold font-mono mt-0.5">
                    +91 {passengerUser?.phone || "98270 11200"}
                  </p>
                </div>
              </div>

              {/* Sign Out Action */}
              <button
                type="button"
                onClick={() => {
                  logoutPassenger();
                  closeMyBookingsModal();
                }}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-1 shrink-0"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{language === "hi_cg" ? "लॉगआउट" : "Sign Out"}</span>
              </button>
            </div>

            {/* Tab Switcher */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06]">
              <button
                type="button"
                onClick={() => setActiveTab("TRIPS")}
                className={`py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "TRIPS"
                    ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>{language === "hi_cg" ? "मेरी बुकिंग (Trips)" : "My Bookings"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("SETTINGS")}
                className={`py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "SETTINGS"
                    ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{language === "hi_cg" ? "थीम एवं सेटिंग्स" : "Theme & Settings"}</span>
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="overflow-y-auto py-4 space-y-4 pr-1 flex-1">
            {activeTab === "SETTINGS" ? (
              <div className="space-y-4">
                {/* 1. Theme Configuration (Item 2 & 3) */}
                <div className="p-4 rounded-2xl apple-glass-subcard space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {language === "hi_cg" ? "ऐप थीम (App Appearance)" : "App Appearance & Theme"}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        {language === "hi_cg" ? "डिफ़ॉल्ट लाइट थीम है। यहाँ से डार्क थीम चुनें।" : "Default is Light mode. Switch to Dark mode here."}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    {/* Light Option */}
                    <button
                      type="button"
                      onClick={() => setTheme("light")}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        theme === "light"
                          ? "bg-white text-slate-950 border-amber-400 shadow-md ring-2 ring-amber-400/25"
                          : "bg-black/[0.02] dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 border-black/10 dark:border-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Sun className={`w-5 h-5 ${theme === "light" ? "text-amber-500" : "text-slate-400"}`} />
                        {theme === "light" && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-400 text-slate-950">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-xs">Light Mode</div>
                      <div className="text-[10px] text-slate-500">Default bright clean styling</div>
                    </button>

                    {/* Dark Option */}
                    <button
                      type="button"
                      onClick={() => setTheme("dark")}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        theme === "dark"
                          ? "bg-zinc-800 text-white border-amber-400 shadow-md ring-2 ring-amber-400/25"
                          : "bg-black/[0.02] dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 border-black/10 dark:border-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Moon className={`w-5 h-5 ${theme === "dark" ? "text-amber-400" : "text-slate-400"}`} />
                        {theme === "dark" && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-400 text-slate-950">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-xs">Dark Mode</div>
                      <div className="text-[10px] text-slate-400">Night & OLED contrast</div>
                    </button>
                  </div>
                </div>

                {/* 2. Language Preference */}
                <div className="p-4 rounded-2xl apple-glass-subcard space-y-3">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {language === "hi_cg" ? "भाषा प्राथमिकता (Language)" : "Language Preference"}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      {language === "hi_cg" ? "अंग्रेजी एवं छत्तीसगढ़ी/हिंदी" : "English and Chhattisgarhi / Hindi"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={toggleLanguage}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        language === "en"
                          ? "bg-white dark:bg-zinc-800 text-slate-950 dark:text-white border-amber-400 shadow-sm"
                          : "bg-black/[0.02] dark:bg-white/[0.04] text-slate-500 dark:text-zinc-400 border-black/10 dark:border-white/10"
                      }`}
                    >
                      <div className="font-bold text-xs">English</div>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-400">Standard English interface</div>
                    </button>

                    <button
                      type="button"
                      onClick={toggleLanguage}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        language === "hi_cg"
                          ? "bg-white dark:bg-zinc-800 text-slate-950 dark:text-white border-amber-400 shadow-sm"
                          : "bg-black/[0.02] dark:bg-white/[0.04] text-slate-500 dark:text-zinc-400 border-black/10 dark:border-white/10"
                      }`}
                    >
                      <div className="font-bold text-xs">छत्तीसगढ़ी / हिंदी</div>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-400">स्थानीय भाषा में सहज अनुभव</div>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Active Booking (If Any) */}
                {activeBooking && (
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {language === "hi_cg" ? "सक्रिय बुकिंग (चालू यात्रा)" : "Active Booking (Live)"}
                    </span>

                    <div className="p-4 rounded-2xl apple-glass-subcard border-2 border-emerald-500/40 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold font-mono text-emerald-600 dark:text-emerald-400 block">
                            {activeBooking.id}
                          </span>
                          <h4 className="font-extrabold text-sm text-railway-navy dark:text-white">
                            {activeBooking.trainDetails.trainName} ({activeBooking.trainDetails.trainNumber})
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                            📍 {activeBooking.trainDetails.boardingStation || activeBooking.trainDetails.stationName} • PF-
                            {activeBooking.trainDetails.platform}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                            {activeBooking.status}
                          </span>
                          <span className="block text-xs font-black text-railway-navy dark:text-white mt-1">
                            ₹{activeBooking.fare.totalAmount}
                          </span>
                        </div>
                      </div>

                      {/* Target Spot */}
                      <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 block">
                            🎯 {language === "hi_cg" ? "गंतव्य स्थान:" : "Target Destination:"}
                          </span>
                          <span className="font-black text-slate-900 dark:text-white">
                            Coach {activeBooking.trainDetails.coach} • Seat {activeBooking.trainDetails.berth}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Happy Code</span>
                          <span className="font-mono font-black text-sm text-amber-600 dark:text-amber-400">
                            {activeBooking.happyCode}
                          </span>
                        </div>
                      </div>

                      {/* Sahayak Assigned */}
                      {activeBooking.sahayak && (
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-2">
                            <AppleAvatar
                              name={activeBooking.sahayak.name}
                              billaNumber={activeBooking.sahayak.billaNumber}
                              size="sm"
                            />
                            <div className="text-xs">
                              <span className="font-bold text-railway-navy dark:text-white block">
                                {language === "hi_cg"
                                  ? activeBooking.sahayak.hindiName
                                  : activeBooking.sahayak.name}
                              </span>
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                                Billa #{activeBooking.sahayak.billaNumber}
                              </span>
                            </div>
                          </div>

                          <a
                            href={`tel:${activeBooking.sahayak.phone}`}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Past Bookings */}
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                    {language === "hi_cg" ? "पिछली यात्राएं (इतिहास)" : "Past Completed Trips"}
                  </span>

                  {pastBookings.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      {language === "hi_cg" ? "कोई पिछली बुकिंग नहीं मिली।" : "No past bookings found."}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pastBookings.map((b) => (
                        <div
                          key={b.id}
                          className="p-3.5 rounded-2xl apple-glass-subcard hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                                  {b.id}
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                  ✓ {b.status}
                                </span>
                              </div>
                              <h5 className="font-bold text-xs text-railway-navy dark:text-white mt-0.5">
                                {b.trainDetails.trainName} ({b.trainDetails.trainNumber})
                              </h5>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                {b.trainDetails.boardingStation || b.trainDetails.stationName} • Coach{" "}
                                {b.trainDetails.coach} Seat {b.trainDetails.berth}
                              </p>
                            </div>

                            <div className="text-right">
                              <span className="text-xs font-black text-railway-navy dark:text-white block font-mono">
                                ₹{b.fare.totalAmount}
                              </span>
                              <span className="text-[10px] text-slate-400">{b.createdAt}</span>
                            </div>
                          </div>

                          {b.sahayak && (
                            <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                              <span>
                                {language === "hi_cg" ? "सहायक: " : "Sahayak: "}
                                <strong className="text-slate-800 dark:text-slate-200">
                                  {language === "hi_cg" ? b.sahayak.hindiName : b.sahayak.name} (
                                  {b.sahayak.billaNumber})
                                </strong>
                              </span>
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                {language === "hi_cg" ? "भुगतान पूर्ण" : "Fully Settled"}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
