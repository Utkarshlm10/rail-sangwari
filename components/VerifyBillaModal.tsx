"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useBooking } from "@/context/BookingContext";
import { useLanguage } from "@/context/LanguageContext";
import { getSahayakByBilla, VERIFIED_SAHAYAKS } from "@/lib/mock-railway-data";
import {
  ShieldCheck,
  Award,
  X,
  Search,
  CheckCircle2,
  FileText,
  Heart,
  Scale,
  MapPin,
  Calendar,
  AlertCircle,
} from "lucide-react";

export function VerifyBillaModal() {
  const { isBillaModalOpen, closeBillaModal, selectedBillaForModal } = useBooking();
  const { language } = useLanguage();
  const [billaQuery, setBillaQuery] = useState(selectedBillaForModal || "BSP-108");
  const [searchedProfile, setSearchedProfile] = useState(() =>
    getSahayakByBilla(selectedBillaForModal || "BSP-108")
  );

  useEffect(() => {
    if (selectedBillaForModal) {
      setBillaQuery(selectedBillaForModal);
      setSearchedProfile(getSahayakByBilla(selectedBillaForModal));
    }
  }, [selectedBillaForModal]);

  if (!isBillaModalOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const result = getSahayakByBilla(billaQuery);
    setSearchedProfile(result);
  };

  const handleQuickSelect = (billa: string) => {
    setBillaQuery(billa);
    setSearchedProfile(getSahayakByBilla(billa));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md transition-all animate-fadeIn">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0D1B2E] rounded-3xl shadow-2xl overflow-hidden border border-black/10 dark:border-white/10 flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-railway-navy dark:bg-[#061221] text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-black shadow-sm">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                {language === "hi_cg"
                  ? "रेलवे पीतल बिल्ला सत्यापन (Billa Verification)"
                  : "SECR Brass Billa Sahayak Verification"}
              </h3>
              <p className="text-[11px] text-slate-300 dark:text-slate-400">
                Official Commercial Department Licensed Porter Verification
              </p>
            </div>
          </div>
          <button
            onClick={closeBillaModal}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Search Input Box */}
          <form onSubmit={handleSearch} className="space-y-2">
            <label className="block text-xs font-bold text-railway-navy dark:text-slate-200">
              Enter Brass Billa Badge ID (or Select Sample Below):
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={billaQuery}
                onChange={(e) => setBillaQuery(e.target.value)}
                placeholder="e.g. BSP-108, R-042, DURG-019"
                className="w-full pl-3.5 pr-24 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-black/10 dark:border-white/15 font-mono text-sm font-bold uppercase text-slate-900 dark:text-white focus:outline-none focus:border-railway-navy dark:focus:border-amber-400"
              />
              <button
                type="submit"
                className="absolute right-1.5 px-3 py-1.5 rounded-xl bg-railway-navy dark:bg-amber-400 text-white dark:text-slate-950 text-xs font-semibold hover:bg-railway-navyLight dark:hover:bg-amber-300 transition-colors"
              >
                Verify
              </button>
            </div>

            {/* Quick chips */}
            <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Quick Pick:</span>
              {VERIFIED_SAHAYAKS.map((s) => (
                <button
                  key={s.billaNumber}
                  type="button"
                  onClick={() => handleQuickSelect(s.billaNumber)}
                  className={`px-2.5 py-1 rounded-lg border font-mono font-bold text-[11px] transition-all ${
                    billaQuery.toUpperCase() === s.billaNumber
                      ? "bg-amber-100 dark:bg-amber-400/20 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-400/40 shadow-xs"
                      : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-black/5 dark:border-white/10"
                  }`}
                >
                  {s.billaNumber} ({s.stationCode})
                </button>
              ))}
            </div>
          </form>

          {/* Searched Sahayak Profile Card */}
          {searchedProfile ? (
            <div className="space-y-5">
              {/* Official Credential Badge Banner */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-50/60 to-orange-50/40 dark:from-amber-950/20 dark:to-orange-950/10 border-2 border-amber-200/90 dark:border-amber-400/30 shadow-sm relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  {/* Big Brass Billa Metallic Shield */}
                  <div className="w-24 h-24 rounded-2xl brass-badge flex flex-col items-center justify-center text-railway-navy shadow-lg border-2 border-yellow-200/80 shrink-0">
                    <span className="text-[10px] font-black tracking-widest uppercase">
                      INDIAN RAILWAYS
                    </span>
                    <span className="text-xl font-black tracking-tight my-0.5">
                      {searchedProfile.billaNumber}
                    </span>
                    <span className="text-[10px] font-bold uppercase bg-black/10 px-2 py-0.5 rounded">
                      SECR ZONE
                    </span>
                  </div>

                  {/* Profile info */}
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h4 className="text-lg font-extrabold text-railway-navy dark:text-white">
                        {searchedProfile.name} ({searchedProfile.hindiName})
                      </h4>
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-600">
                        <ShieldCheck className="w-3 h-3" /> SECR ACTIVE
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex items-center justify-center sm:justify-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-railway-red shrink-0" />
                      Station: <strong>{searchedProfile.stationName} ({searchedProfile.stationCode})</strong>
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs">
                      <div className="bg-white dark:bg-slate-800/90 p-2 rounded-xl border border-black/5 dark:border-white/10">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Experience</span>
                        <span className="font-bold text-railway-navy dark:text-white">
                          {searchedProfile.experienceYears} Years
                        </span>
                      </div>
                      <div className="bg-white dark:bg-slate-800/90 p-2 rounded-xl border border-black/5 dark:border-white/10">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Rating</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          {searchedProfile.rating} ★ ({searchedProfile.reviewsCount})
                        </span>
                      </div>
                      <div className="bg-white dark:bg-slate-800/90 p-2 rounded-xl border border-black/5 dark:border-white/10">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Completed Trips</span>
                        <span className="font-bold text-railway-navy dark:text-white">
                          {searchedProfile.completedTrips}+
                        </span>
                      </div>
                      <div className="bg-white dark:bg-slate-800/90 p-2 rounded-xl border border-black/5 dark:border-white/10">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Medical Fitness</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">Valid</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verification Checkmarks */}
                <div className="mt-4 pt-3 border-t border-amber-200/80 dark:border-amber-400/20 flex flex-wrap items-center justify-between text-xs text-slate-700 dark:text-slate-300 gap-2">
                  <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> Police Verification Clear
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> SECR ID Card Valid till {searchedProfile.medicalFitnessValidTill}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    ID: {searchedProfile.id}
                  </span>
                </div>
              </div>

              {/* Official Tariff Card Reference */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-black/5 dark:border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-railway-navy dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-railway-navy dark:text-amber-400" />
                    SECR Approved Official Porterage Rates (दर तालिका)
                  </h5>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                    Circular SECR/Comml/Porter/2026
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-black/5 dark:border-white/10">
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Up to 40 kg (Per Trip)</span>
                    <span className="text-base font-extrabold text-railway-navy dark:text-white">₹60</span>
                    <span className="text-[10px] text-slate-400 block">Suitcase / Trolley</span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-black/5 dark:border-white/10">
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Above 40 kg (Per Trip)</span>
                    <span className="text-base font-extrabold text-railway-navy dark:text-white">₹90</span>
                    <span className="text-[10px] text-slate-400 block">Cartons / Iron Trunks</span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-black/5 dark:border-white/10">
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Wheelchair Assist</span>
                    <span className="text-base font-extrabold text-rose-600 dark:text-rose-400">₹100</span>
                    <span className="text-[10px] text-slate-400 block">Ramps & Overbridges</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 rounded-2xl border border-black/5 dark:border-white/10 space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <h4 className="font-bold text-sm text-railway-navy dark:text-white">No Sahayak Record Found</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                The badge number &quot;{billaQuery}&quot; was not found in SECR active roster.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-[#061221] border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Helpline: <strong>139 (Indian Railways)</strong>
          </span>
          <button
            onClick={closeBillaModal}
            className="px-4 py-2 rounded-xl bg-railway-navy dark:bg-amber-400 text-white dark:text-slate-950 font-semibold hover:bg-railway-navyLight dark:hover:bg-amber-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
