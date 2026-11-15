"use client";

import React, { useState } from "react";
import { Cloud, Wifi, Database, CheckCircle2, Shield, Info, X } from "lucide-react";
import { isFirebaseConfigured } from "@/lib/firebase";
import { useLanguage } from "@/context/LanguageContext";

interface FirebaseSyncBadgeProps {
  className?: string;
  showModalTrigger?: boolean;
}

export function FirebaseSyncBadge({
  className = "",
  showModalTrigger = true,
}: FirebaseSyncBadgeProps) {
  const { language } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => showModalTrigger && setIsModalOpen(true)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all shadow-xs ${
          isFirebaseConfigured
            ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30"
            : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
        } ${className}`}
        title={
          isFirebaseConfigured
            ? "Connected to Firebase Cloud Firestore for multi-device sync"
            : "Running on SECR Offline-First Mesh Engine (BroadcastChannel + SSE)"
        }
      >
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isFirebaseConfigured ? "bg-amber-400" : "bg-emerald-400"
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isFirebaseConfigured ? "bg-amber-500" : "bg-emerald-500"
            }`}
          />
        </span>

        {isFirebaseConfigured ? (
          <>
            <Database className="w-3 h-3 shrink-0" />
            <span className="truncate">
              {language === "hi_cg" ? "फायरबेस क्लाउड सिंक" : "Firebase Realtime Sync"}
            </span>
          </>
        ) : (
          <>
            <Wifi className="w-3 h-3 shrink-0" />
            <span className="truncate">
              {language === "hi_cg" ? "एसईसीआर मेश सिंक (लोकल)" : "SECR Mesh Sync (Zero-Cloud)"}
            </span>
          </>
        )}
      </button>

      {/* Architecture Explanatory Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#0A1929] rounded-3xl border border-amber-400/30 shadow-2xl p-5 space-y-4 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-black/[0.08] dark:border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#0F2A4A] text-amber-400 flex items-center justify-center font-bold">
                  {isFirebaseConfigured ? <Cloud className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {language === "hi_cg" ? "सिंक आर्किटेक्चर" : "Real-Time Sync Architecture"}
                  </h3>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold block">
                    Dual-Engine: Firebase Cloud + SECR Local Mesh
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-zinc-300">
              <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] space-y-1.5">
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                  <span>Current Active Mode:</span>
                  <span className={isFirebaseConfigured ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}>
                    {isFirebaseConfigured ? "🔥 Firebase Firestore Cloud" : "⚡ Zero-Cloud SECR Mesh"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {isFirebaseConfigured
                    ? "Bookings and porter statuses sync in real-time across physically separated mobile devices and networks via Google Cloud Firestore."
                    : "Running on high-performance BroadcastChannel & Server-Sent Events (SSE). Zero external cloud dependencies, zero paid bills, and 100% offline station reliability."}
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block">
                  How to switch to your own Firebase Project:
                </span>
                <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-500 dark:text-zinc-400">
                  <li>Create a free project at <span className="font-mono text-amber-600">console.firebase.google.com</span>.</li>
                  <li>Enable <strong>Firestore Database</strong> in test mode.</li>
                  <li>Copy your project keys into <span className="font-mono text-slate-700 dark:text-zinc-200">.env.local</span> (see <span className="font-mono">.env.local.example</span>).</li>
                  <li>The app will automatically detect your keys and upgrade from local mesh to cloud sync!</li>
                </ol>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full py-2.5 rounded-xl apple-glass-btn-primary font-bold text-xs"
            >
              {language === "hi_cg" ? "ठीक है / बंद करें" : "Understood"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
