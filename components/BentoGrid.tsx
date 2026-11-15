"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { useBooking } from "@/context/BookingContext";
import {
  ShieldCheck,
  MapPin,
  Scale,
  HeartHandshake,
  CheckCircle2,
  ArrowRight,
  Train,
  Award,
  Sparkles,
  Users,
} from "lucide-react";

export function BentoGrid() {
  const { language } = useLanguage();
  const { openBillaModalWithId } = useBooking();
  const [activeCoachTab, setActiveCoachTab] = useState<"B4" | "H1" | "S5">("B4");

  return (
    <section className="mt-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-railway-navy tracking-tight">
            {language === "hi_cg"
              ? "काबर चुनिहा रेल संगवारी?"
              : "The Rail Sangwari Standard"}
          </h2>
          <p className="text-xs sm:text-sm text-railway-textMuted mt-0.5">
            {language === "hi_cg"
              ? "सुरक्षित, पारदर्शी अउ सुखद रेलवे यात्रा बर चार पक्का भरोसा"
              : "Four pillars of trust engineered for seamless Indian Railway travel."}
          </p>
        </div>
      </div>

      {/* Bento Grid: 2x2 on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Card 1: Verified Brass Billa Sahayaks */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-black/[0.06] shadow-apple hover:shadow-appleHover transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200/80">
                <Award className="w-3.5 h-3.5 text-railway-goldDark" />
                {language === "hi_cg" ? "१००% अधिकृत पीतल बिल्ला" : "SECR Commercial License"}
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Police Verified
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-railway-navy tracking-tight">
              {language === "hi_cg"
                ? "सरकारी पीतल बिल्ला (Official Sahayak)"
                : "100% Verified Brass Billa Sahayaks"}
            </h3>
            <p className="text-xs sm:text-sm text-railway-textMuted mt-1 leading-relaxed">
              {language === "hi_cg"
                ? "स्टेशन म कोनो अजनबी नई, केवल रेलवे द्वारा अधिकृत पीतल बिल्ला कुली साथी। पुलिस सत्यापन अउ स्वास्थ्य जांच पूरा।"
                : "No unauthorized touts. Only legitimate Indian Railways licensed coolies with tamper-proof brass badges and background checks."}
            </p>

            {/* Interactive Brass Badge Preview */}
            <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-amber-50/50 to-orange-50/40 border border-amber-200/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl brass-badge flex flex-col items-center justify-center text-railway-navy shadow-md p-1 border border-yellow-200">
                  <span className="text-[9px] font-black tracking-widest uppercase">SECR</span>
                  <span className="text-xs font-black tracking-tight">BSP</span>
                  <span className="text-[10px] font-bold">108</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-railway-navy">Ramesh Yadav (रमेश यादव)</div>
                  <div className="text-[11px] text-railway-textMuted flex items-center gap-1 mt-0.5">
                    <span>SECR Bilaspur Jn</span>
                    <span>•</span>
                    <span className="text-amber-700 font-semibold">4.9 ★ (1,240 trips)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => openBillaModalWithId("BSP-108")}
                className="px-3 py-1.5 rounded-xl bg-railway-navy text-white text-xs font-semibold hover:bg-railway-navyLight transition-colors shrink-0 shadow-xs"
              >
                {language === "hi_cg" ? "बिल्ला देखव" : "Inspect Badge"}
              </button>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-black/[0.05] flex items-center justify-between text-xs text-railway-textMuted">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              {language === "hi_cg" ? "रेलवे डिवीजन रेकॉर्ड म दर्ज" : "Logged in SECR DRM Roster"}
            </span>
            <span className="font-semibold text-railway-navy">Bilaspur • Raipur • Durg</span>
          </div>
        </div>

        {/* Card 2: Coach-Doorstep Pickup via Live Coach Position */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-black/[0.06] shadow-apple hover:shadow-appleHover transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200/80">
                <MapPin className="w-3.5 h-3.5 text-blue-700" />
                {language === "hi_cg" ? "बोगी दुवार म मिलही" : "Live Coach Position"}
              </span>
              <span className="text-[11px] font-bold text-railway-red bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                Doorstep Pickup
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-railway-navy tracking-tight">
              {language === "hi_cg"
                ? "ट्रेन बोगी के दुवार म हाजिर"
                : "Coach Doorstep Pickup via Live Rake Position"}
            </h3>
            <p className="text-xs sm:text-sm text-railway-textMuted mt-1 leading-relaxed">
              {language === "hi_cg"
                ? "स्टेशन म कुली खोजे के जरूरत नई। ट्रेन आवे के १५ मिनट पहले आप मन के बोगी नंबर (जैसे B4, H1) के ठीक आगू कुली साथी उपस्थित रहिही।"
                : "No hunting across platforms. Your Sahayak tracks your train's live arrival and waits at your exact coach door before the train stops."}
            </p>

            {/* Interactive Coach Visualization */}
            <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-railway-navy uppercase tracking-wider flex items-center gap-1.5">
                  <Train className="w-3.5 h-3.5 text-railway-red" />
                  Live Rake Sequence (12859 Gitanjali)
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Platform 2</span>
              </div>

              {/* Coach blocks preview */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[10px] font-mono">
                <div className="px-2 py-1.5 bg-slate-800 text-amber-300 font-black rounded-lg shrink-0">
                  ENG 🚂
                </div>
                <div className="px-2 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg shrink-0">
                  SLR
                </div>
                <div className="px-2 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg shrink-0">
                  S1-S4
                </div>
                <div className="px-2.5 py-1.5 bg-railway-red text-white font-extrabold rounded-lg shadow-sm shrink-0 border border-red-700 animate-pulse">
                  📍 Coach B4 (You)
                </div>
                <div className="px-2 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg shrink-0">
                  B5
                </div>
                <div className="px-2 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg shrink-0">
                  A1
                </div>
                <div className="px-2 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg shrink-0">
                  HA1
                </div>
              </div>
              <p className="text-[11px] text-slate-600 font-medium mt-2">
                📌 Sahayak position: Waiting near 2nd Foot Overbridge Ramp, Platform 2
              </p>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-black/[0.05] flex items-center justify-between text-xs text-railway-textMuted">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {language === "hi_cg" ? "१५ मिनट पहले फोन म सम्पर्क" : "Direct Phone & WhatsApp connect"}
            </span>
            <span className="font-semibold text-railway-navy">Zero Platform Running</span>
          </div>
        </div>

        {/* Card 3: Government-Fixed Transparent Rates */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-black/[0.06] shadow-apple hover:shadow-appleHover transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200/80">
                <Scale className="w-3.5 h-3.5 text-emerald-700" />
                {language === "hi_cg" ? "सरकारी निर्धारित दर" : "SECR Gazette Tariff"}
              </span>
              <span className="text-[11px] font-semibold text-railway-navy bg-slate-100 px-2 py-0.5 rounded-full">
                Zero Bargaining
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-railway-navy tracking-tight">
              {language === "hi_cg"
                ? "सरकारी तय दर, मोल-भाव से मुक्ति"
                : "Government-Fixed Transparent Rates"}
            </h3>
            <p className="text-xs sm:text-sm text-railway-textMuted mt-1 leading-relaxed">
              {language === "hi_cg"
                ? "स्टेशन म अनचाहा ज्यादा पैसा मांगे के झंझट खत्म। दक्षिण पूर्व मध्य रेलवे (SECR) अधिकृत रेट कार्ड अनुसार हर सामान के फिक्स दर।"
                : "No arbitrary demands at late night or festival rushes. Transparent tariffs published per SECR commercial circular."}
            </p>

            {/* Quick Rate Matrix */}
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                <div className="text-xs text-railway-textMuted">Medium Trolley</div>
                <div className="text-base font-extrabold text-railway-navy mt-1">₹60</div>
                <div className="text-[10px] text-emerald-700 font-semibold">Up to 35 kg</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                <div className="text-xs text-railway-textMuted">Heavy Trunk</div>
                <div className="text-base font-extrabold text-railway-navy mt-1">₹90</div>
                <div className="text-[10px] text-emerald-700 font-semibold">Over 35 kg</div>
              </div>
              <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/70">
                <div className="text-xs text-amber-900 font-semibold">Small Bag</div>
                <div className="text-base font-extrabold text-emerald-700 mt-1">FREE*</div>
                <div className="text-[10px] text-amber-800">*With 2+ bags</div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-black/[0.05] flex items-center justify-between text-xs text-railway-textMuted">
            <span>Pay base fare after service</span>
            <span className="font-bold text-railway-navy">₹39 Platform Lock</span>
          </div>
        </div>

        {/* Card 4: Senior Citizen Wheelchair & Escort Assist */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-black/[0.06] shadow-apple hover:shadow-appleHover transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-900 border border-rose-200/80">
                <HeartHandshake className="w-3.5 h-3.5 text-rose-600" />
                {language === "hi_cg" ? "बुजुर्ग अउ मरीज सेवा" : "Wheelchair & Senior Care"}
              </span>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Gentle Escort
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-railway-navy tracking-tight">
              {language === "hi_cg"
                ? "सियान अउ मरीज मन बर व्हीलचेयर सहयोग"
                : "Senior Citizen & Wheelchair Escort Assist"}
            </h3>
            <p className="text-xs sm:text-sm text-railway-textMuted mt-1 leading-relaxed">
              {language === "hi_cg"
                ? "बुजुर्ग महतारी-बाप, बीमार या विशेष आवश्यकता वाले परिजन मन ल स्टेशन म ओवरब्रिज, लिफ्ट अउ रैंप म हाथ थाम के सुरक्षित बोगी तक पहुचाये के भरोसा।"
                : "Dedicated assistance for elderly parents, patients, and passengers with mobility needs. Complete bridge ramp escort and battery car liaison."}
            </p>

            <div className="mt-5 p-3.5 rounded-2xl bg-gradient-to-r from-rose-50/70 to-orange-50/60 border border-rose-200/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-railway-red shadow-xs shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-railway-navy block">
                  Peace of mind for solo elderly travelers
                </span>
                <span className="text-slate-600 text-[11px]">
                  Sahayak coordinates with SECR Station Divyangjan Helpdesk (+₹100 flat)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-black/[0.05] flex items-center justify-between text-xs text-railway-textMuted">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Ramp & Elevator Navigation
            </span>
            <span className="font-semibold text-railway-navy">Available 24x7</span>
          </div>
        </div>
      </div>
    </section>
  );
}
