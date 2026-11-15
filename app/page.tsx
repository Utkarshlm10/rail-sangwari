"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useBooking } from "@/context/BookingContext";
import { BookingWidget } from "@/components/BookingWidget";
import { VerifyBillaModal } from "@/components/VerifyBillaModal";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { ShieldCheck, MapPin, Scale, Award, Sparkles } from "lucide-react";
import SahayakPage from "./sahayak/page";

export default function HomePage() {
  const { language, t } = useLanguage();
  const { openBillaModalWithId } = useBooking();
  const [isSahayakHost, setIsSahayakHost] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const h = window.location.hostname.toLowerCase();
      if (h.includes("sahayak")) {
        setIsSahayakHost(true);
      }
    }
  }, []);

  if (isSahayakHost) {
    return <SahayakPage />;
  }

  return (
    <div className="min-h-screen flex flex-col apple-glass-canvas transition-colors relative overflow-hidden">
      {/* Apple Specular Ambient Glow Lights */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[340px] bg-gradient-to-tr from-black/[0.03] via-transparent to-black/[0.02] dark:from-white/[0.04] dark:via-transparent dark:to-white/[0.02] blur-3xl rounded-full pointer-events-none -z-10" />

      <main className="flex-1 max-w-xl mx-auto px-4 py-6 sm:py-10 w-full space-y-6 relative z-10">
        {/* Simple & Focused Glass Header */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full apple-glass-subcard text-xs font-semibold text-slate-800 dark:text-zinc-200 shadow-xs border border-amber-400/20">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>{t("secrStationsTag")}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            {t("heroTitle")}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-sm mx-auto font-medium">
            {t("heroDesc")}
          </p>
        </div>

        {/* The Star: Apple Glass Booking Widget */}
        <BookingWidget />

        {/* 3 Apple Glass Value Points */}
        <div className="grid grid-cols-3 gap-2.5 pt-2 text-center">
          <div className="p-3.5 apple-glass-subcard rounded-2xl transition-transform hover:-translate-y-0.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-1.5 shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs text-slate-900 dark:text-white">{t("brassBillaValue")}</h3>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">{t("brassBillaSub")}</p>
          </div>

          <div className="p-3.5 apple-glass-subcard rounded-2xl transition-transform hover:-translate-y-0.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-1.5 shadow-xs">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs text-slate-900 dark:text-white">{t("coachDoorValue")}</h3>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">{t("coachDoorSub")}</p>
          </div>

          <div className="p-3.5 apple-glass-subcard rounded-2xl transition-transform hover:-translate-y-0.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-1.5 shadow-xs">
              <Scale className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs text-slate-900 dark:text-white">{t("fixedRateValue")}</h3>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">{t("fixedRateSub")}</p>
          </div>
        </div>

        {/* Simple footer badge verification prompt */}
        <div className="text-center pt-2">
          <button
            onClick={() => openBillaModalWithId("BSP-108")}
            className="text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white font-semibold underline underline-offset-4 transition-colors"
          >
            {t("verifyPrompt")}
          </button>
        </div>
      </main>

      {/* Verification Modal */}
      <VerifyBillaModal />
    </div>
  );
}
