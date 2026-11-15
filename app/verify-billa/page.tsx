"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { VERIFIED_SAHAYAKS, getSahayakByBilla } from "@/lib/mock-railway-data";
import AppleAvatar from "@/components/AppleAvatar";
import {
  ShieldCheck,
  Award,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Scale,
  AlertCircle,
} from "lucide-react";

export default function VerifyBillaPage() {
  const { language } = useLanguage();
  const [billaQuery, setBillaQuery] = useState("BSP-108");
  const [profile, setProfile] = useState(() => getSahayakByBilla("BSP-108"));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(getSahayakByBilla(billaQuery));
  };

  const handleSelectBilla = (billa: string) => {
    setBillaQuery(billa);
    setProfile(getSahayakByBilla(billa));
  };

  return (
    <div className="min-h-screen apple-glass-canvas py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:text-slate-950 dark:hover:text-white transition-colors apple-glass-subcard px-3 py-1.5 rounded-full border border-black/5 dark:border-white/10 shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{language === "hi_cg" ? "वापस मुख्य पृष्ठ" : "Back to Home"}</span>
          </Link>

          <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 bg-black/[0.04] dark:bg-white/[0.06] px-3 py-1 rounded-full border border-black/5 dark:border-white/10">
            SECR Commercial Department Portal
          </span>
        </div>

        {/* Header Hero */}
        <div className="apple-glass-card rounded-3xl p-6 sm:p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl brass-badge flex items-center justify-center text-railway-navy shadow-md">
            <Award className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-railway-navy dark:text-white tracking-tight">
            {language === "hi_cg"
              ? "कुली पीतल बिल्ला एवं पहचान पत्र सत्यापन"
              : "SECR Licensed Porter (Brass Billa) Verification"}
          </h1>
          <p className="text-xs sm:text-sm text-railway-textMuted dark:text-slate-400 leading-relaxed">
            {language === "hi_cg"
              ? "बिलासपुर, रायपुर एवं दुर्ग रेलवे स्टेशनों पर कार्यरत कुली संगवारी के पीतल बिल्ला नंबर को दर्ज करके उनके अधिकृत होने की पुष्टि करें।"
              : "Verify the official credentials, police background verification status, DRM roster validity, and government-approved tariff for any SECR registered coolie."}
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="pt-2">
            <div className="relative flex items-center">
              <input
                type="text"
                value={billaQuery}
                onChange={(e) => setBillaQuery(e.target.value)}
                placeholder="Enter Billa ID (e.g. BSP-108, R-042, DURG-019)"
                className="w-full pl-4 pr-28 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-black/10 dark:border-white/15 text-sm font-mono font-bold uppercase text-railway-navy dark:text-white focus:outline-none focus:border-railway-navy dark:focus:border-amber-400 shadow-xs"
              />
              <button
                type="submit"
                className="absolute right-1.5 px-4 py-2 rounded-xl bg-railway-navy dark:bg-amber-400 text-white dark:text-slate-950 text-xs font-bold hover:bg-railway-navyLight dark:hover:bg-amber-300 transition-colors"
              >
                Verify Now
              </button>
            </div>
          </form>

          {/* Sample quick buttons */}
          <div className="flex items-center gap-2 flex-wrap pt-2 text-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Registered Badges:</span>
            {VERIFIED_SAHAYAKS.map((s) => (
              <button
                key={s.billaNumber}
                type="button"
                onClick={() => handleSelectBilla(s.billaNumber)}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                  billaQuery.toUpperCase() === s.billaNumber
                    ? "bg-amber-100 dark:bg-amber-400/20 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-400/40 shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-black/5 dark:border-white/10"
                }`}
              >
                {s.billaNumber} ({s.stationCode})
              </button>
            ))}
          </div>
        </div>

        {/* Verification Card Result */}
        {profile ? (
          <div className="apple-glass-card rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-black/[0.06] dark:border-white/[0.08]">
              {/* Apple Avatar & Arm Brass Badge visual */}
              <div className="flex items-center gap-3 shrink-0">
                <AppleAvatar name={profile.name} billaNumber={profile.billaNumber} size="xl" />
                <div className="w-20 h-20 rounded-2xl brass-badge flex flex-col items-center justify-center text-railway-navy shadow-md border-2 border-yellow-200 shrink-0">
                  <span className="text-[8px] font-black tracking-widest uppercase">SECR</span>
                  <span className="text-sm font-black tracking-tight">{profile.billaNumber}</span>
                  <span className="text-[8px] font-bold uppercase bg-black/10 px-1 rounded">{profile.stationCode} JN</span>
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {profile.name} ({profile.hindiName})
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> SECR REGISTERED
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center justify-center sm:justify-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-railway-red shrink-0" />
                  <span>
                    Station: <strong>{profile.stationName} ({profile.stationCode})</strong>
                  </span>
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/90 rounded-xl border border-black/5 dark:border-white/10">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Experience</span>
                    <span className="font-bold text-railway-navy dark:text-white">{profile.experienceYears} Years</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/90 rounded-xl border border-black/5 dark:border-white/10">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Passenger Rating</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{profile.rating} ★</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/90 rounded-xl border border-black/5 dark:border-white/10">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Completed Trips</span>
                    <span className="font-bold text-railway-navy dark:text-white">{profile.completedTrips}+</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/90 rounded-xl border border-black/5 dark:border-white/10">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">License Valid</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">Till 2027</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Credentials Checklist */}
            <div className="space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-railway-navy dark:text-slate-300">
                Verified Verification Milestones:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/40 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <strong className="block text-emerald-950 dark:text-emerald-200">Police Verification Clear</strong>
                    <span className="text-[11px] text-emerald-800 dark:text-emerald-400">Chhattisgarh Police Special Branch</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/40 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <strong className="block text-emerald-950 dark:text-emerald-200">Railway Hospital Fitness Cert</strong>
                    <span className="text-[11px] text-emerald-800 dark:text-emerald-400">Valid till {profile.medicalFitnessValidTill}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Rates Table */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-black/5 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-railway-navy dark:text-white flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-railway-navy dark:text-amber-400" />
                  SECR Commercial Tariff Chart (सरकारी तय दर)
                </h4>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Zero Bargaining</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-black/5 dark:border-white/10">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Medium Luggage</span>
                  <span className="text-base font-extrabold text-railway-navy dark:text-white mt-0.5 block">₹60</span>
                  <span className="text-[10px] text-slate-400">Up to 40 kg</span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-black/5 dark:border-white/10">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Heavy Carton</span>
                  <span className="text-base font-extrabold text-railway-navy dark:text-white mt-0.5 block">₹90</span>
                  <span className="text-[10px] text-slate-400">Above 40 kg</span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-black/5 dark:border-white/10">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Wheelchair Assist</span>
                  <span className="text-base font-extrabold text-rose-600 dark:text-rose-400 mt-0.5 block">₹100</span>
                  <span className="text-[10px] text-slate-400">Escort with ramp</span>
                </div>
              </div>
            </div>

            {/* Book Now Button */}
            <div className="pt-2">
              <Link
                href="/?action=book"
                className="w-full py-3.5 px-4 rounded-2xl apple-glass-btn-primary text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Book This SECR Sahayak for Upcoming Journey</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0D1B2E] rounded-3xl p-8 border border-black/[0.06] dark:border-white/[0.09] shadow-apple text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="font-extrabold text-base text-railway-navy dark:text-white">No Sahayak Record Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Please check the badge number on the brass arm band. Official SECR badges follow the format: BSP-108, R-042, or DURG-019.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
