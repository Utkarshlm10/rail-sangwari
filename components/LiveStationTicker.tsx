"use client";

import React from "react";
import { LIVE_STATION_TICKER } from "@/lib/mock-railway-data";
import { Train, Radio } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function LiveStationTicker() {
  const { language } = useLanguage();

  return (
    <div className="w-full bg-[#0B2545]/5 border-y border-black/[0.04] py-2.5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#0B2545] text-white px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>
              {language === "hi_cg" ? "लाइव स्टेशन स्थिति" : "Live SECR Feeds"}
            </span>
          </div>

          <div className="relative flex-1 overflow-x-auto no-scrollbar scroll-smooth">
            <div className="flex items-center gap-4 sm:gap-6 whitespace-nowrap text-xs text-railway-navy">
              {LIVE_STATION_TICKER.map((item, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 bg-white/70 hover:bg-white transition-colors px-3 py-1 rounded-full border border-black/[0.04] shadow-xs"
                >
                  <Train className="w-3.5 h-3.5 text-railway-red" />
                  <span className="font-semibold text-railway-navy">{item.train}</span>
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-railway-navy/10 text-railway-navy">
                    {item.station} • {item.platform}
                  </span>
                  <span className="text-[11px] text-emerald-700 font-medium">
                    {item.status}
                  </span>
                  <span className="text-[11px] text-amber-700 font-medium">
                    ({item.cooliesAvailable} {language === "hi_cg" ? "कुली मौजूद" : "Sahayaks on duty"})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
