"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { ShieldCheck, X, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SimulatedOtpBanner() {
  const { activeSimulatedOtp, clearSimulatedOtp } = useAuth();
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!activeSimulatedOtp) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(activeSimulatedOtp.otp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md shadow-2xl"
      >
        <div className="apple-glass-card rounded-2xl p-3.5 border-2 border-amber-400/60 dark:border-amber-400/40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-xs mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-railway-navy dark:text-amber-300">
                    {language === "hi_cg" ? "दक्षिण पूर्व मध्य रेलवे (SECR SMS)" : "SECR Sangwari (Free SMS)"}
                  </span>
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold">
                    {language === "hi_cg" ? "अभी-अभी" : "Just Now"}
                  </span>
                </div>

                <p className="text-xs text-slate-800 dark:text-slate-100 font-medium mt-0.5 leading-snug">
                  {language === "hi_cg" ? (
                    <>
                      लॉगिन ओटीपी (OTP) कोड:{" "}
                      <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-sm tracking-wider">
                        {activeSimulatedOtp.otp}
                      </span>
                    </>
                  ) : (
                    <>
                      Your one-time verification OTP is{" "}
                      <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-sm tracking-wider">
                        {activeSimulatedOtp.otp}
                      </span>
                    </>
                  )}
                </p>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
                  {language === "hi_cg"
                    ? "✓ 100% नि:शुल्क प्रदर्शन गेटवे (Zero Gateway Cost)"
                    : "✓ 100% Free Demo Gateway (Zero Gateway Cost)"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
                title="Copy OTP"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[11px]">{copied ? "Copied" : "Copy"}</span>
              </button>

              <button
                type="button"
                onClick={clearSimulatedOtp}
                className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
