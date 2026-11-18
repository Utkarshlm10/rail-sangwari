"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useBooking } from "@/context/BookingContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import {
  ShieldCheck,
  Globe2,
  Moon,
  Sun,
  Menu,
  X,
  Compass,
  Sparkles,
  User,
  Ticket,
} from "lucide-react";
import { FirebaseSyncBadge } from "@/components/FirebaseSyncBadge";

export function Navbar() {
  const { language, toggleLanguage, t } = useLanguage();
  const { openBillaModalWithId } = useBooking();
  const { theme, toggleTheme } = useTheme();
  const {
    passengerUser,
    isPassengerLoggedIn,
    openPassengerAuthModal,
    openMyBookingsModal,
    sahayakUser,
    isSahayakLoggedIn,
  } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isSahayakRoute = pathname.startsWith("/sahayak");
  const isSupervisorRoute = pathname.startsWith("/supervisor");
  const isPassengerRoute = !isSahayakRoute && !isSupervisorRoute;

  // Render ONLY for Passenger App (No switching options in any app)
  if (isSahayakRoute || isSupervisorRoute) {
    return null;
  }

  return (
    <div className="fixed top-3 sm:top-5 inset-x-3 sm:inset-x-0 mx-auto max-w-4xl z-50">
      {/* 21st / Apple Floating Liquid Glass Capsule */}
      <nav className="backdrop-blur-2xl bg-white/80 dark:bg-[#121215]/85 border border-black/[0.08] dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.7)] rounded-full px-3.5 sm:px-5 py-2 transition-all">
        <div className="flex items-center justify-between">
          {/* Brand Identity */}
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-black/10 dark:border-white/20 shadow-xs bg-white dark:bg-zinc-800 flex items-center justify-center p-0.5 transition-transform group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="Rail Sangwari"
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight leading-tight flex items-center gap-1.5">
                <span>{t("brandTitle")}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse hidden sm:inline-block" />
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-zinc-400 font-medium leading-none hidden sm:block">
                {t("brandTagline")}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 bg-black/[0.03] dark:bg-white/[0.05] p-1 rounded-full border border-black/[0.04] dark:border-white/[0.06]">
            {/* Passenger Link */}
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                isPassengerRoute
                  ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{t("passengerNav")}</span>
            </Link>

            {/* Verify Billa Modal Trigger */}
            <button
              onClick={() => openBillaModalWithId("BSP-108")}
              className="px-3 py-1.5 rounded-full text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t("verifyBadgeNav")}</span>
            </button>
          </div>

          {/* Controls: Language, Theme & Mobile Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Passenger Profile Pill (when logged in) */}
            {isPassengerLoggedIn && (
              <button
                onClick={openMyBookingsModal}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] border border-black/[0.06] dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white transition-all active:scale-95"
                title="Profile & Bookings"
              >
                <User className="w-3.5 h-3.5 text-amber-500" />
                <span className="truncate max-w-[90px]">{passengerUser?.name.split(" ")[0]}</span>
              </button>
            )}

            {/* Bilingual Switcher Pill */}
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] border border-black/[0.06] dark:border-white/10 text-xs font-extrabold text-slate-800 dark:text-white transition-all active:scale-95"
              title={language === "en" ? "हिंदी / छत्तीसगढ़ी में बदलें" : "Switch to English"}
            >
              <Globe2 className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
              <span className={language === "en" ? "text-slate-900 dark:text-white font-black" : "text-slate-400"}>
                EN
              </span>
              <span className="text-slate-300 dark:text-zinc-600">|</span>
              <span className={language === "hi_cg" ? "text-slate-900 dark:text-white font-black" : "text-slate-400"}>
                छ.ग.
              </span>
            </button>

            {/* Apple Dark Theme Switcher Button */}
            <button
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="p-2 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] border border-black/[0.06] dark:border-white/10 text-slate-700 dark:text-zinc-200 transition-all active:scale-90"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-zinc-200 transition-transform duration-300 rotate-0" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 transition-transform duration-300" />
              )}
            </button>

            {/* Mobile Hamburger / X Toggle (<md) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              className="md:hidden p-2 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-slate-800 dark:text-white border border-black/[0.06] dark:border-white/10 active:scale-95"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer (<md) */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-3 pb-2 border-t border-black/[0.06] dark:border-white/10 mt-2 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Passenger Mobile Sign In / My Bookings */}
            {isPassengerLoggedIn ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openMyBookingsModal();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold bg-black/[0.04] dark:bg-white/[0.08] text-slate-900 dark:text-white border border-black/[0.06] dark:border-white/10 text-left"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-500" />
                  <span>{language === "hi_cg" ? "मेरी प्रोफाइल एवं बुकिंग" : "My Profile & Bookings"}</span>
                </div>
                <span className="text-[10px] font-semibold">{passengerUser?.name}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openPassengerAuthModal();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/10 text-left"
              >
                <User className="w-4 h-4 text-slate-500" />
                <span>{language === "hi_cg" ? "यात्री लॉगिन (मुफ्त ओटीपी)" : "Passenger Sign In (Free OTP)"}</span>
              </button>
            )}

            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                !isSahayakRoute
                  ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-950 font-black"
                  : "text-slate-700 dark:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>{t("passengerNav")}</span>
            </Link>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openBillaModalWithId("BSP-108");
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/10 transition-all text-left"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t("verifyBadgeNav")}</span>
            </button>

            {/* Sync Mode Badge */}
            <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between px-1">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                Sync Engine
              </span>
              <FirebaseSyncBadge />
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
