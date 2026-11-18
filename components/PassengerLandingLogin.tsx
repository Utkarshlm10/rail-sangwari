"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  Smartphone,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Award,
  MapPin,
  Scale,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function PassengerLandingLogin() {
  const { sendPassengerOtp, verifyPassengerOtp, activeSimulatedOtp } = useAuth();
  const { language } = useLanguage();

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phone.replace(/\D/g, "");
    if (clean.length !== 10) {
      setErrorMsg(
        language === "hi_cg"
          ? "कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।"
          : "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    setErrorMsg("");
    setIsLoading(true);
    const res = await sendPassengerOtp(clean);
    setIsLoading(false);

    if (res.success) {
      setStep("OTP");
      // Auto-populate for seamless frictionless test flow
      setOtp(res.otp);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim().length !== 4) {
      setErrorMsg(
        language === "hi_cg"
          ? "कृपया 4 अंकों का ओटीपी (OTP) दर्ज करें।"
          : "Please enter the 4-digit OTP."
      );
      return;
    }

    setErrorMsg("");
    setIsLoading(true);
    const res = await verifyPassengerOtp(phone, otp, name);
    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || "Verification failed");
    }
  };

  const handleQuickDemoLogin = async () => {
    setIsLoading(true);
    await verifyPassengerOtp("9827011200", "1234", "Rahul Verma");
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 sm:py-6 relative z-10 space-y-6">
      {/* Specular Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[580px] h-[340px] bg-gradient-to-tr from-amber-500/[0.04] via-transparent to-blue-500/[0.04] blur-3xl rounded-full pointer-events-none -z-10" />

      {/* Main Login Card */}
      <div className="apple-glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-black/[0.08] dark:border-white/15 bg-white/95 dark:bg-zinc-900/95 space-y-6">
        {/* Header Tag */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[11px] font-black uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>{language === "hi_cg" ? "दक्षिण पूर्व मध्य रेलवे (SECR)" : "South East Central Railway"}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {language === "hi_cg" ? "यात्री लॉगिन" : "Passenger Sign In"}
          </h1>

          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mx-auto font-medium leading-relaxed">
            {language === "hi_cg"
              ? "सरकारी दर पर अधिकृत कुली साथी बुक करने बर अपन 10 अंकों का मोबाइल नंबर दर्ज करव।"
              : "Enter your 10-digit mobile number for verified SECR porters & instant coach pickup."}
          </p>
        </div>

        {/* Form */}
        <AnimatePresence mode="wait">
          {step === "PHONE" ? (
            <motion.form
              key="step-phone"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleSendOtp}
              className="space-y-4"
            >
              {/* Mobile Input */}
              <div className="space-y-1.5">
                <label htmlFor="passenger-phone" className="block text-xs font-black text-slate-800 dark:text-zinc-200">
                  {language === "hi_cg" ? "मोबाइल नंबर (Mobile Number)" : "Mobile Number"}
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-2.5 px-2 py-1 rounded-xl bg-black/[0.05] dark:bg-white/[0.08] border border-black/[0.06] dark:border-white/10 flex items-center gap-1 text-xs font-black text-slate-800 dark:text-zinc-200 pointer-events-none">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    id="passenger-phone"
                    type="tel"
                    maxLength={10}
                    autoFocus
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, ""));
                      setErrorMsg("");
                    }}
                    placeholder="98270 11200"
                    className="w-full pl-20 pr-4 py-3 rounded-2xl apple-glass-subcard text-base font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 font-mono tracking-wider transition-all placeholder:text-slate-400 placeholder:font-normal placeholder:tracking-normal border border-black/10 dark:border-white/15"
                  />
                </div>
              </div>

              {/* Optional Name */}
              <div className="space-y-1.5">
                <label htmlFor="passenger-name" className="block text-xs font-black text-slate-800 dark:text-zinc-200">
                  {language === "hi_cg" ? "अपन नाम (वैकल्पिक)" : "Your Name (Optional)"}
                </label>
                <input
                  id="passenger-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={language === "hi_cg" ? "उदा. राहुल वर्मा" : "e.g. Rahul Verma"}
                  className="w-full px-4 py-2.5 rounded-2xl apple-glass-subcard text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 border border-black/10 dark:border-white/15"
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-bold text-center">{errorMsg}</p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || phone.length !== 10}
                className="w-full py-3.5 px-4 rounded-2xl apple-glass-btn-primary text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>{isLoading ? "..." : language === "hi_cg" ? "ओटीपी प्राप्त करव →" : "Send Free OTP →"}</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>

              {/* Quick 1-Tap Demo Login */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleQuickDemoLogin}
                  className="w-full py-2.5 px-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-400/30 text-amber-900 dark:text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{language === "hi_cg" ? "डेमो यात्री से 1-क्लिक में लॉगिन करव" : "1-Click Demo Login (Rahul Verma)"}</span>
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.form
              key="step-otp"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleVerifyOtp}
              className="space-y-4"
            >
              {/* Active OTP Prompt */}
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                  {language === "hi_cg" ? "ओटीपी भेजा गया" : "OTP Code Dispatched"}
                </span>
                <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                  +91 {phone}
                </p>
                {activeSimulatedOtp && (
                  <div className="pt-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-lg bg-emerald-500 text-white font-mono font-black text-xs tracking-widest shadow-xs">
                      OTP: {activeSimulatedOtp.otp}
                    </span>
                  </div>
                )}
              </div>

              {/* OTP Input */}
              <div className="space-y-1.5">
                <label htmlFor="passenger-otp" className="block text-xs font-black text-slate-800 dark:text-zinc-200 text-center">
                  {language === "hi_cg" ? "4 अंकों का ओटीपी दर्ज करव" : "Enter 4-Digit OTP"}
                </label>
                <input
                  id="passenger-otp"
                  type="text"
                  maxLength={4}
                  autoFocus
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ""));
                    setErrorMsg("");
                  }}
                  placeholder="1234"
                  className="w-full text-center py-3 rounded-2xl apple-glass-subcard text-2xl font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 font-mono tracking-[0.5em] transition-all border border-black/10 dark:border-white/15"
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-bold text-center">{errorMsg}</p>
              )}

              {/* Verify Button */}
              <button
                type="submit"
                disabled={isLoading || otp.length !== 4}
                className="w-full py-3.5 px-4 rounded-2xl apple-glass-btn-primary text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 active:scale-[0.98] transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{isLoading ? "..." : language === "hi_cg" ? "सत्यापित करव एवं यात्रा शुरू करव" : "Verify & Start Booking"}</span>
              </button>

              {/* Change Phone */}
              <button
                type="button"
                onClick={() => {
                  setStep("PHONE");
                  setOtp("");
                  setErrorMsg("");
                }}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-bold transition-colors"
              >
                ← {language === "hi_cg" ? "मोबाइल नंबर बदलव" : "Change Mobile Number"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* 3 Pillars of Rail Sangwari */}
      <div className="grid grid-cols-3 gap-2.5 pt-2 text-center">
        <div className="p-3 apple-glass-subcard rounded-2xl">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
          <h4 className="font-bold text-[11px] text-slate-900 dark:text-white leading-tight">100% SECR</h4>
          <p className="text-[9px] text-slate-500 dark:text-zinc-400 mt-0.5">Licensed Billa</p>
        </div>

        <div className="p-3 apple-glass-subcard rounded-2xl">
          <Scale className="w-4 h-4 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
          <h4 className="font-bold text-[11px] text-slate-900 dark:text-white leading-tight">Govt Rates</h4>
          <p className="text-[9px] text-slate-500 dark:text-zinc-400 mt-0.5">Fixed Tariff</p>
        </div>

        <div className="p-3 apple-glass-subcard rounded-2xl">
          <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
          <h4 className="font-bold text-[11px] text-slate-900 dark:text-white leading-tight">Doorstep</h4>
          <p className="text-[9px] text-slate-500 dark:text-zinc-400 mt-0.5">Coach Pickup</p>
        </div>
      </div>
    </div>
  );
}
