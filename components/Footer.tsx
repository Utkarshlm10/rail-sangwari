"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

export function Footer() {
  const { language } = useLanguage();

  return (
    <footer className="mt-auto border-t border-black/[0.05] dark:border-white/[0.08] bg-white dark:bg-[#070E1A] text-slate-500 dark:text-slate-400 text-xs py-6 mb-16 lg:mb-0 transition-colors">
      <div className="max-w-xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md overflow-hidden bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 flex items-center justify-center">
            <Image src="/logo.png" alt="Rail Sangwari" width={18} height={18} />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            Rail Sangwari (रेल संगवारी)
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">• SECR Zone</span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <Link href="/verify-billa" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Verify Billa
          </Link>
          <span>Helpline: 139</span>
        </div>
      </div>
    </footer>
  );
}
