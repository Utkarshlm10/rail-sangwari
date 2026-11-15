"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { X, Smartphone, ShieldCheck, ArrowRight, UserCheck, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PassengerAuthModal() {
  const {
    isPassengerAuthModalOpen,
    closePassengerAuthModal,
    sendPassengerOtp,
    verifyPassengerOtp,
    activeSimulatedOtp,
  } = useAuth();
  const { language } = useLanguage();

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isPassengerAuthModalOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      setErrorMsg(
        language === "hi_cg"
          ? "कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।"
          : "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    setErrorMsg("");
    setIsLoading(true);

    const res = await sendPassengerOtp(cleanPhone);
    setIsLoading(false);

    if (res.success) {
      setStep("OTP");
      // Auto-fill input for extreme ease of testing
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

    if (res.success) {
      closePassengerAuthModal();
      setStep("PHONE");
      setOtp("");
    } else {
      setErrorMsg(res.error || "Verification failed");
    }
  };

  const handleQuickDemoLogin = async () => {
    setPhone("9827112233");
    setName("Rahul Sharma");
    await verifyPassengerOtp("9827112233", "1234", "Rahul Sharma");
    closePassengerAuthModal();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md apple-glass-card rounded-3xl p-6 sm:p-7 shadow-2xl bg-white/95 dark:bg-slate-900/95 border border-white/20"
        >
          {/* Close button */}
          <button
            onClick={closePassengerAuthModal}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-railway-navy dark:bg-amber-400 text-white dark:text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400 block">
                {language === "hi_cg" ? "यात्री लॉगिन" : "Passenger Sign In"}
              </span>
              <h2 className="text-xl font-extrabold text-railway-navy dark:text-white tracking-tight">
                {step === "PHONE"
                  ? language === "hi_cg"
                    ? "मोबाइल नंबर दर्ज करें"
                    : "Enter Mobile Number"
                  : language === "hi_cg"
                  ? "ओटीपी (OTP) सत्यापित करें"
                  : "Verify OTP"}
              </h2>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {step === "PHONE" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  {language === "hi_cg" ? "आपका नाम (वैकल्पिक)" : "Your Name (Optional)"}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={language === "hi_cg" ? "उदा. राहुल शर्मा" : "e.g. Rahul Sharma"}
                  className="w-full px-3.5 py-2.5 rounded-xl apple-glass-subcard text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-railway-navy dark:focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  {language === "hi_cg" ? "10 अंकों का मोबाइल नंबर" : "10-Digit Mobile Number"}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="98270 12345"
                    className="w-full pl-12 pr-3.5 py-3 rounded-xl apple-glass-subcard font-mono text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-railway-navy dark:focus:border-amber-400 tracking-wider"
                    autoFocus
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                  {language === "hi_cg"
                    ? "100% फ्री ओटीपी: ऊपर स्क्रीन पर डेमो एसएमएस बैनर दिखाई देगा।"
                    : "100% Free OTP: A demo SMS banner will slide down at the top of your screen."}
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl apple-glass-btn-primary text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                <span>{isLoading ? "Sending..." : language === "hi_cg" ? "ओटीपी प्राप्त करें" : "Get OTP"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick Demo Fill button */}
              <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
                <button
                  type="button"
                  onClick={handleQuickDemoLogin}
                  className="w-full py-2.5 px-3 rounded-xl apple-glass-subcard hover:bg-black/5 dark:hover:bg-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    {language === "hi_cg"
                      ? "त्वरित डेमो लॉगिन (राहुल शर्मा • 9827112233)"
                      : "Quick Demo Login (Rahul Sharma • 9827112233)"}
                  </span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    {language === "hi_cg" ? "4 अंकों का ओटीपी (OTP)" : "4-Digit OTP Code"}
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep("PHONE")}
                    className="text-[11px] text-railway-navy dark:text-amber-300 font-bold hover:underline"
                  >
                    {language === "hi_cg" ? "नंबर बदलें" : "Change Number"}
                  </button>
                </div>

                <input
                  type="text"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="• • • •"
                  className="w-full text-center py-3.5 rounded-xl apple-glass-subcard font-mono text-2xl font-black text-railway-navy dark:text-white tracking-[0.5em] focus:outline-none focus:border-railway-navy dark:focus:border-amber-400"
                  autoFocus
                />
              </div>

              {activeSimulatedOtp && (
                <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 block">
                      {language === "hi_cg" ? "शीर्ष बैनर से प्राप्त ओटीपी:" : "Active Simulated Code:"}
                    </span>
                    <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                      {activeSimulatedOtp.otp}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtp(activeSimulatedOtp.otp)}
                    className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs shadow-xs"
                  >
                    {language === "hi_cg" ? "स्वतः भरें" : "Auto-Fill"}
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl apple-glass-btn-primary text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                <UserCheck className="w-4 h-4" />
                <span>
                  {isLoading
                    ? "Verifying..."
                    : language === "hi_cg"
                    ? "सत्यापित करें और लॉगिन करें"
                    : "Verify & Sign In"}
                </span>
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
