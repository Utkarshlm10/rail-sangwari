"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  CheckCircle2,
  Share2,
  Printer,
  Download,
  X,
  Heart,
  Sparkles,
  QrCode,
  ShieldCheck,
  Train,
  ArrowRight,
  IndianRupee,
  Luggage,
  ThumbsUp,
  MessageSquare,
  Award,
  ExternalLink,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useLanguage } from "@/context/LanguageContext";
import { BookingRecord, SahayakProfile } from "@/types";
import AppleAvatar from "@/components/AppleAvatar";
import { generateUpiUri, generateQrSvgPath } from "@/lib/qr";

interface PostTripFeedbackReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingRecord;
  sahayak?: SahayakProfile | null;
  onRatingSubmitted?: (rating: number, review: string, tip: number) => void;
}

const PRAISE_TAGS = [
  { id: "punctual", labelEn: "⏱️ On-Time at Coach", labelHi: "⏱️ बोगी पर समय पर" },
  { id: "careful", labelEn: "🧳 Careful Luggage Handling", labelHi: "🧳 सामान को सावधानी से संभाला" },
  { id: "courteous", labelEn: "🤝 Polite & Respectful", labelHi: "🤝 विनम्र और सहयोगी" },
  { id: "guidance", labelEn: "📍 Clear FOB & Platform Guidance", labelHi: "📍 ओवरब्रिज का सही मार्गदर्शन" },
  { id: "wheelchair", labelEn: "♿ Gentle Wheelchair Support", labelHi: "♿ व्हीलचेयर में पूरा सहयोग" },
  { id: "fast", labelEn: "⚡ Fast & Efficient", labelHi: "⚡ तेज़ और कुशल" },
];

const TIP_PRESETS = [10, 20, 50, 100];

export function PostTripFeedbackReceiptModal({
  isOpen,
  onClose,
  booking,
  sahayak,
  onRatingSubmitted,
}: PostTripFeedbackReceiptModalProps) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"FEEDBACK" | "RECEIPT">("FEEDBACK");

  // Rating State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "punctual",
    "careful",
    "courteous",
  ]);
  const [comment, setComment] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Tipping State
  const [tipAmount, setTipAmount] = useState<number>(20);
  const [isCustomTip, setIsCustomTip] = useState<boolean>(false);
  const [customTipInput, setCustomTipInput] = useState<string>("");
  const [tipConfirmed, setTipConfirmed] = useState<boolean>(false);

  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const displaySahayak = sahayak || booking.sahayak || {
    id: "sahayak-1",
    name: "Ramesh Yadav",
    hindiName: "रमेश यादव",
    billaNumber: "BSP-108",
    rating: 4.9,
    phone: "+91 98271 44521",
    stationName: "Bilaspur Junction",
    stationCode: "BSP",
  };

  // Generate UPI payment parameters for 100% direct coolie tipping
  const cleanPhone = displaySahayak.phone.replace(/\D/g, "").slice(-10) || "9827144521";
  const upiVpa = `${cleanPhone}@sbi`;
  const upiUri = generateUpiUri({
    vpa: upiVpa,
    name: displaySahayak.name,
    amount: tipAmount,
    note: `Rail Sangwari Sahayak Tip - Billa ${displaySahayak.billaNumber}`,
  });
  const upiQrSvg = generateQrSvgPath(upiUri, 150);

  // Generate Official SECR Luggage Receipt ID
  const receiptNumber = `SECR/LUG/${new Date().getFullYear()}/${booking.trainDetails.stationCode || "BSP"}-${booking.id.replace(/\D/g, "").slice(-4) || "8492"}`;
  const receiptTimestamp = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleSelectTipPreset = (amount: number) => {
    setIsCustomTip(false);
    setTipAmount(amount);
  };

  const handleCustomTipChange = (val: string) => {
    const num = parseInt(val.replace(/\D/g, ""), 10);
    setCustomTipInput(val);
    setTipAmount(isNaN(num) ? 0 : num);
  };

  const handleSubmitFeedback = () => {
    setIsSubmitted(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
    if (onRatingSubmitted) {
      onRatingSubmitted(rating, comment, tipAmount);
    }
    // Automatically transition to receipt view after brief pause
    setTimeout(() => {
      setActiveTab("RECEIPT");
    }, 900);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const getRatingLabel = (stars: number) => {
    switch (stars) {
      case 5:
        return language === "hi_cg" ? "⭐⭐⭐⭐⭐ उत्कृष्ट सेवा!" : "⭐⭐⭐⭐⭐ Outstanding Service!";
      case 4:
        return language === "hi_cg" ? "⭐⭐⭐⭐ बहुत अच्छा" : "⭐⭐⭐⭐ Very Good";
      case 3:
        return language === "hi_cg" ? "⭐⭐⭐ संतोषजनक" : "⭐⭐⭐ Satisfactory";
      case 2:
        return language === "hi_cg" ? "⭐⭐ सुधार की आवश्यकता" : "⭐⭐ Needs Improvement";
      case 1:
        return language === "hi_cg" ? "⭐ असंतोषजनक" : "⭐ Unsatisfactory";
      default:
        return "";
    }
  };

  const totalCalculated = (booking.fare?.totalAmount || 159) + (tipConfirmed ? tipAmount : 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92vh] bg-white dark:bg-[#0A1929] rounded-3xl border border-amber-400/40 shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-white">
        {/* Top Header Bar */}
        <div className="px-5 py-4 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between bg-slate-50/70 dark:bg-[#071320]/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0F2A4A] to-[#071526] text-amber-400 border border-amber-400/50 flex items-center justify-center font-black shadow-xs">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold uppercase tracking-widest block">
                {language === "hi_cg" ? "दक्षिण पूर्व मध्य रेलवे • सेवा समापन" : "SECR • JOURNEY COMPLETED"}
              </span>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                {language === "hi_cg" ? "कुली रेटिंग एवं डिजिटल रसीद" : "Sahayak Feedback & SECR Receipt"}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Segment Controls */}
        <div className="px-5 pt-3 pb-2 bg-slate-50/40 dark:bg-[#071320]/40 shrink-0">
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.04]">
            <button
              type="button"
              onClick={() => setActiveTab("FEEDBACK")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "FEEDBACK"
                  ? "bg-[#0F2A4A] dark:bg-[#1E3A8A] text-white border border-amber-400/30 shadow-xs"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{language === "hi_cg" ? "रेटिंग व टिप" : "Rate & Tip Sahayak"}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("RECEIPT")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "RECEIPT"
                  ? "bg-[#0F2A4A] dark:bg-[#1E3A8A] text-white border border-amber-400/30 shadow-xs"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === "hi_cg" ? "डिजिटल रसीद" : "Official SECR Receipt"}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {activeTab === "FEEDBACK" ? (
            <div className="space-y-5">
              {/* Sahayak Identity Card */}
              <div className="p-4 rounded-2xl apple-glass-subcard flex items-center justify-between border border-black/[0.06] dark:border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <AppleAvatar
                    name={displaySahayak.name}
                    billaNumber={displaySahayak.billaNumber}
                    size="lg"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-base text-slate-900 dark:text-white">
                        {language === "hi_cg" ? displaySahayak.hindiName : displaySahayak.name}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                        ✓ SECR
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold block">
                      Billa #{displaySahayak.billaNumber} • {displaySahayak.stationName}
                    </span>
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold block mt-0.5">
                      Coach {booking.trainDetails.coach} • Seat {booking.trainDetails.berth}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    {language === "hi_cg" ? "नकद भुगतान" : "Trip Cash"}
                  </span>
                  <span className="text-base font-extrabold font-mono text-slate-900 dark:text-white">
                    ₹{booking.fare?.payToSahayakCash || 120}
                  </span>
                </div>
              </div>

              {/* 1. Star Rating Selector */}
              <div className="text-center p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] space-y-2">
                <span className="text-xs font-bold text-slate-600 dark:text-zinc-300">
                  {language === "hi_cg"
                    ? "कुली सेवा का अनुभव कैसा रहा?"
                    : "How was your luggage porter experience?"}
                </span>

                {/* Stars Row */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const activeLevel = hoverRating || rating;
                    const isFilled = star <= activeLevel;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-125 active:scale-95 focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            isFilled
                              ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                              : "text-slate-300 dark:text-zinc-600 hover:text-amber-300"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Dynamic Rating Label */}
                <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 block h-4">
                  {getRatingLabel(hoverRating || rating)}
                </span>
              </div>

              {/* 2. Praise Badges Chips */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  {language === "hi_cg" ? "प्रशंसा टैग चुनें:" : "What went well?"}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRAISE_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                          isSelected
                            ? "bg-[#0F2A4A] dark:bg-[#1E3A8A] text-white border-amber-400/50 shadow-xs"
                            : "bg-white/80 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-300 border-black/10 dark:border-white/10 hover:border-amber-400/30"
                        }`}
                      >
                        {language === "hi_cg" ? tag.labelHi : tag.labelEn}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Comment Box */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  {language === "hi_cg" ? "कुली साथी के लिए कोई संदेश (ऐच्छिक):" : "Add a note or compliment (optional):"}
                </label>
                <textarea
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={
                    language === "hi_cg"
                      ? "उदा. रमेश जी ने कोच बी४ तक तुरंत पहुँचाया और बहुत मददगार रहे..."
                      : "e.g. Ramesh was waiting right at Coach B4 door and assisted my elderly mother..."
                  }
                  className="w-full p-3 rounded-2xl apple-glass-subcard text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400/50 transition-all resize-none"
                />
              </div>

              {/* 4. One-Tap Coolie Direct UPI Tipping Section */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-[#0F2A4A]/5 to-transparent border border-amber-400/30 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-xs">
                      <Heart className="w-4 h-4 fill-slate-950" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">
                        {language === "hi_cg" ? "कुली साथी को टिप दें" : "Tip Your SECR Sahayak"}
                      </h4>
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                        {language === "hi_cg"
                          ? "१००% सीधे कुली के खाते में (शून्य रेलवे कटौती)"
                          : "100% directly credited to porter • Zero deductions"}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-black text-amber-600 dark:text-amber-400">
                    ₹{tipAmount}
                  </span>
                </div>

                {/* Preset Chips */}
                <div className="grid grid-cols-4 gap-2">
                  {TIP_PRESETS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleSelectTipPreset(amt)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                        !isCustomTip && tipAmount === amt
                          ? "bg-amber-400 text-slate-950 border-amber-500 shadow-xs font-black scale-105"
                          : "apple-glass-subcard text-slate-700 dark:text-zinc-300 hover:border-amber-400/40"
                      }`}
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>

                {/* Custom Tip Input Toggle */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomTip(!isCustomTip);
                      if (!isCustomTip) setTipAmount(0);
                    }}
                    className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 hover:text-amber-500 underline"
                  >
                    {isCustomTip
                      ? language === "hi_cg" ? "तय विकल्प चुनें" : "Choose preset"
                      : language === "hi_cg" ? "अन्य राशि दर्ज करें" : "Enter custom amount"}
                  </button>

                  {isCustomTip && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-500">₹</span>
                      <input
                        type="text"
                        maxLength={4}
                        value={customTipInput}
                        onChange={(e) => handleCustomTipChange(e.target.value)}
                        placeholder="e.g. 75"
                        className="w-20 px-2 py-1 rounded-lg apple-glass-subcard text-xs font-bold font-mono text-slate-900 dark:text-white text-center focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  )}
                </div>

                {/* Live UPI QR & Intent link */}
                {tipAmount > 0 && (
                  <div className="pt-2 border-t border-amber-400/20 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/60 dark:bg-black/40 p-3 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-white rounded-lg p-1 border border-black/10 shrink-0 shadow-xs">
                        <svg viewBox={upiQrSvg.viewBox} className="w-full h-full">
                          <path d={upiQrSvg.path} fill="#0F2A4A" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-semibold">
                          UPI VPA: <span className="font-mono text-slate-700 dark:text-zinc-200">{upiVpa}</span>
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block mt-0.5">
                          {language === "hi_cg" ? "स्कैन करें या ऐप से भेजें" : "Scan QR or tap to open UPI App"}
                        </span>
                        <a
                          href={upiUri}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline mt-0.5"
                        >
                          <span>{language === "hi_cg" ? "GPay / PhonePe / Paytm खोलें" : "Open PhonePe / GPay"}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setTipConfirmed(!tipConfirmed)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        tipConfirmed
                          ? "bg-emerald-500 text-white shadow-xs"
                          : "bg-black/[0.06] dark:bg-white/[0.08] text-slate-700 dark:text-zinc-200 hover:bg-emerald-500/10"
                      }`}
                    >
                      {tipConfirmed
                        ? (language === "hi_cg" ? "✓ टिप जोड़ दी गई" : "✓ Tip Added")
                        : (language === "hi_cg" ? "टिप को रसीद में जोड़ें" : "Include Tip in Receipt")}
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Rating Button */}
              <button
                type="button"
                onClick={handleSubmitFeedback}
                className="w-full py-3.5 px-4 rounded-2xl apple-glass-btn-primary text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>
                  {isSubmitted
                    ? (language === "hi_cg" ? "रेटिंग दर्ज हो गई! रसीद लोड हो रही है..." : "Rating Recorded! Loading Receipt...")
                    : (language === "hi_cg" ? "रेटिंग सबमिट करें और रसीद देखें" : "Submit Rating & View SECR Receipt")}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* ================= TAB 2: OFFICIAL SECR DIGITAL RECEIPT ================= */
            <div className="space-y-4">
              {/* Printable Official Railway Voucher Container */}
              <div
                ref={receiptRef}
                className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-white to-slate-50 dark:from-[#091523] dark:to-[#060D17] border-2 border-amber-400/40 shadow-xl space-y-4 text-slate-900 dark:text-white print:border-black print:text-black print:bg-white"
              >
                {/* Official Railways Header */}
                <div className="text-center border-b-2 border-dashed border-black/[0.1] dark:border-white/[0.1] pb-3 space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-600 dark:text-amber-400 border border-amber-400/20 text-[10px] font-black uppercase tracking-wider">
                    <Train className="w-3 h-3" />
                    <span>INDIAN RAILWAYS • SOUTH EAST CENTRAL RAILWAY</span>
                  </div>
                  <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                    दक्षिण पूर्व मध्य रेलवे • आधिकारिक कुली सेवा रसीद
                  </h3>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">
                    OFFICIAL STATION PORTER TARIFF & PASSENGER VOUCHER
                  </p>
                </div>

                {/* Receipt Metadata Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-black/[0.02] dark:bg-white/[0.02] p-3 rounded-2xl border border-black/[0.04] dark:border-white/[0.05]">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase block">
                      Receipt Number
                    </span>
                    <span className="font-mono font-extrabold text-slate-900 dark:text-white text-[11px]">
                      {receiptNumber}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase block">
                      Date & Time
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-zinc-300 text-[11px]">
                      {receiptTimestamp}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase block">
                      Passenger / PNR
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {booking.passengerName || "Rahul Sharma"} • <span className="font-mono">{booking.pnr}</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase block">
                      Station & Platform
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {booking.trainDetails.boardingStation || booking.trainDetails.stationName} (PF-{booking.trainDetails.platform})
                    </span>
                  </div>
                </div>

                {/* Train & Destination Target Card */}
                <div className="p-3 rounded-2xl bg-[#0F2A4A] text-white flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider block">
                      Verified Destination Target
                    </span>
                    <span className="text-sm font-black text-white">
                      Coach {booking.trainDetails.coach} • Seat {booking.trainDetails.berth}
                    </span>
                    <span className="text-[10px] text-slate-300 block">
                      {booking.trainDetails.trainNumber} - {booking.trainDetails.trainName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold block">
                      OTP: {booking.happyCode || "4892"}
                    </span>
                    <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">
                      ✓ DELIVERED
                    </span>
                  </div>
                </div>

                {/* Handled By SECR Sahayak */}
                <div className="p-3 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <AppleAvatar
                      name={displaySahayak.name}
                      billaNumber={displaySahayak.billaNumber}
                      size="sm"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {displaySahayak.name} ({displaySahayak.hindiName})
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold">
                        SECR Licensed Billa #{displaySahayak.billaNumber}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                    SECR VERIFIED
                  </span>
                </div>

                {/* Itemized Fare & Tariff Ledger */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 border-b border-black/[0.06] dark:border-white/[0.06] pb-1">
                    Itemized Luggage Tariff Breakdown
                  </div>

                  {/* Medium Trolleys */}
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-zinc-300 py-0.5">
                    <span>
                      Medium Trolley Bags ({booking.luggage?.mediumTrolley || 0} × ₹60)
                    </span>
                    <span className="font-mono font-bold">
                      ₹{(booking.luggage?.mediumTrolley || 0) * 60}
                    </span>
                  </div>

                  {/* Heavy Cartons */}
                  {(booking.luggage?.heavyCarton || 0) > 0 && (
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-zinc-300 py-0.5">
                      <span>
                        Heavy Trunks / Steel Cartons ({booking.luggage.heavyCarton} × ₹90)
                      </span>
                      <span className="font-mono font-bold">
                        ₹{booking.luggage.heavyCarton * 90}
                      </span>
                    </div>
                  )}

                  {/* Small Bag */}
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-zinc-300 py-0.5">
                    <span>Small Cabin / Laptop Bag</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {(booking.fare?.smallBagCharge || 0) === 0 ? "FREE (Included)" : `₹${booking.fare.smallBagCharge}`}
                    </span>
                  </div>

                  {/* Wheelchair Escort */}
                  {booking.luggage?.wheelchairEscort && (
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-zinc-300 py-0.5">
                      <span>Dedicated Wheelchair Escort & Ramp Access</span>
                      <span className="font-mono font-bold">₹100</span>
                    </div>
                  )}

                  {/* SECR Platform Pool */}
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-zinc-300 py-0.5">
                    <span>SECR Convenience & Station Welfare Pool</span>
                    <span className="font-mono font-bold">₹39</span>
                  </div>

                  {/* Direct Porter Tip (if applicable) */}
                  {tipConfirmed && tipAmount > 0 && (
                    <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 py-0.5 font-bold">
                      <span>Direct Sahayak Token of Appreciation (Tip)</span>
                      <span className="font-mono">₹{tipAmount}</span>
                    </div>
                  )}

                  {/* Total Line */}
                  <div className="border-t-2 border-dashed border-black/[0.1] dark:border-white/[0.1] pt-2 mt-2 flex items-center justify-between text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                    <span>Total Amount Paid / कुल देय राशि</span>
                    <span className="font-mono text-lg text-emerald-600 dark:text-emerald-400 font-black">
                      ₹{totalCalculated}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-500 dark:text-zinc-400 text-center pt-1 font-medium">
                    Payment Mode: ₹{booking.fare?.payToSahayakCash || 120} Hand-to-Hand Cash/UPI to Sahayak + ₹39 SECR Amenity
                  </div>
                </div>

                {/* Security QR & Official SECR Seal Stamp */}
                <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-14 bg-white rounded-lg p-1 border border-black/10 shrink-0 shadow-xs">
                      <svg viewBox={upiQrSvg.viewBox} className="w-full h-full">
                        <path d={upiQrSvg.path} fill="#0F2A4A" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        TTE / Supervisor Verify
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-800 dark:text-zinc-200 block">
                        {receiptNumber}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                        ✓ SECR Digital PRS Authenticated
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="w-12 h-12 rounded-full border-2 border-amber-500/40 text-amber-600 dark:text-amber-400 flex flex-col items-center justify-center text-[7px] font-black uppercase tracking-tight p-0.5 rotate-[-12deg] shadow-xs">
                      <span>SECR</span>
                      <span className="text-[6px]">OFFICIAL</span>
                      <span>VALID</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Print, WhatsApp Share, Close */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="py-3 px-3 rounded-2xl apple-glass-subcard text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-black/5 dark:hover:bg-white/10 transition-all shadow-xs"
                >
                  <Printer className="w-4 h-4 text-slate-600 dark:text-zinc-300" />
                  <span>{language === "hi_cg" ? "रसीद प्रिंट / PDF" : "Print / Save PDF"}</span>
                </button>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    language === "hi_cg"
                      ? `*दक्षिण पूर्व मध्य रेलवे (SECR) - आधिकारिक कुली सेवा रसीद*\n` +
                        `• रसीद संख्या: ${receiptNumber}\n` +
                        `• यात्री: ${booking.passengerName} (${booking.pnr})\n` +
                        `• ट्रेन: ${booking.trainDetails.trainName} (${booking.trainDetails.trainNumber})\n` +
                        `• गंतव्य: Coach ${booking.trainDetails.coach}, Seat ${booking.trainDetails.berth} (PF-${booking.trainDetails.platform})\n` +
                        `• कुली साथी: ${displaySahayak.name} (बिल्ला #${displaySahayak.billaNumber})\n` +
                        `• कुल मजदूरी भुगतान: ₹${totalCalculated}\n` +
                        `• स्थिति: सफल एवं सत्यापित (Happy Code: ${booking.happyCode})`
                      : `*South East Central Railway (SECR) - Luggage Porter Receipt*\n` +
                        `• Receipt No: ${receiptNumber}\n` +
                        `• Passenger: ${booking.passengerName} (${booking.pnr})\n` +
                        `• Train: ${booking.trainDetails.trainName} (${booking.trainDetails.trainNumber})\n` +
                        `• Target: Coach ${booking.trainDetails.coach}, Seat ${booking.trainDetails.berth} (PF-${booking.trainDetails.platform})\n` +
                        `• Sahayak: ${displaySahayak.name} (Billa #${displaySahayak.billaNumber})\n` +
                        `• Total Amount Paid: ₹${totalCalculated}\n` +
                        `• Status: Verified & Completed (Happy Code: ${booking.happyCode})`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{language === "hi_cg" ? "व्हाट्सएप पर भेजें" : "Share WhatsApp"}</span>
                </a>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl apple-glass-subcard text-slate-600 dark:text-zinc-400 font-bold text-xs hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {language === "hi_cg" ? "समाप्त करें / बंद करें" : "Done / Close"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
