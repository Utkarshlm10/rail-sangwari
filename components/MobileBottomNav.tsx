"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBooking } from "@/context/BookingContext";
import { useLanguage } from "@/context/LanguageContext";
import { Compass, Ticket, ShieldCheck, HardHat } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { activeBooking, setStep, openBillaModalWithId } = useBooking();
  const { language } = useLanguage();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#070E1A]/95 backdrop-blur-xl border-t border-black/[0.08] dark:border-white/[0.08] px-3 py-2 shadow-appleElevated transition-colors">
      <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
        {/* Tab 1: Book */}
        <Link
          href="/"
          onClick={() => {
            if (activeBooking) {
              // keep active booking view
            } else {
              setStep(1);
            }
          }}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
            pathname === "/" && (!activeBooking || activeBooking.status === "COMPLETED")
              ? "text-railway-red dark:text-amber-400 font-bold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">
            {language === "hi_cg" ? "बुक करव" : "Book"}
          </span>
        </Link>

        {/* Tab 2: My Trip / Boarding Pass */}
        <button
          onClick={() => {
            if (activeBooking) {
              setStep(3);
              window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
              setStep(1);
            }
          }}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all relative ${
            activeBooking && activeBooking.status !== "COMPLETED"
              ? "text-railway-navy dark:text-amber-400 font-bold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          {activeBooking && activeBooking.status !== "COMPLETED" && (
            <span className="absolute top-1 right-5 w-2 h-2 rounded-full bg-railway-red animate-ping" />
          )}
          <Ticket className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">
            {language === "hi_cg" ? "मोर यात्रा" : "My Trip"}
          </span>
        </button>

        {/* Tab 3: Verify Billa */}
        <button
          onClick={() => openBillaModalWithId("BSP-108")}
          className="flex flex-col items-center justify-center py-1 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
        >
          <ShieldCheck className="w-5 h-5 text-amber-500" />
          <span className="text-[10px] mt-1 tracking-tight">
            {language === "hi_cg" ? "बिल्ला जांच" : "Verify Billa"}
          </span>
        </button>

        {/* Tab 4: Help & Support */}
        <button
          onClick={() => alert(language === "hi_cg" ? "रेल संगवारी सहायता: 139 पर कॉल करव" : "Rail Sangwari SECR Helpline: Call 139")}
          className="flex flex-col items-center justify-center py-1 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
        >
          <HardHat className="w-5 h-5 text-amber-500" />
          <span className="text-[10px] mt-1 tracking-tight">
            {language === "hi_cg" ? "मदद (139)" : "Helpline"}
          </span>
        </button>
      </div>
    </div>
  );
}
