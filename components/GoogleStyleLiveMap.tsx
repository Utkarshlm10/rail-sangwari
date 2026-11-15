"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  MapPin,
  Navigation,
  Compass,
  Phone,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  LocateFixed,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { LocationBeacon, SahayakProfile, StationCode } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import { playRailwayChime, playCompletionDing } from "@/lib/sound-effects";
import AppleAvatar from "@/components/AppleAvatar";

interface GoogleStyleLiveMapProps {
  bookingId: string;
  sahayak?: SahayakProfile | null;
  targetCoach: string;
  platform: string;
  stationCode: StationCode;
  stationName: string;
  isCoolieView?: boolean;
  onPingArrival?: () => void;
}

export function GoogleStyleLiveMap({
  bookingId,
  sahayak,
  targetCoach,
  platform,
  stationCode,
  stationName,
  isCoolieView = false,
  onPingArrival,
}: GoogleStyleLiveMapProps) {
  const { language } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const coolieMarkerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const passengerMarkerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const routePolylineRef = useRef<any>(null);

  const [beacon, setBeacon] = useState<LocationBeacon | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasNotifiedArrival, setHasNotifiedArrival] = useState(false);

  // Poll location beacon every 2.5 seconds
  const fetchLocation = async () => {
    try {
      const res = await fetch(
        `/api/location?bookingId=${bookingId}&stationCode=${stationCode}&platform=${platform}&targetCoach=${targetCoach}&sahayakId=${
          sahayak?.id || "sahayak-bsp-108"
        }&billaNumber=${sahayak?.billaNumber || "BSP-108"}`
      );
      const json = await res.json();
      if (json.success && json.data) {
        setBeacon((prev) => {
          if (!prev?.hasArrived && json.data.hasArrived && !hasNotifiedArrival) {
            setHasNotifiedArrival(true);
            playCompletionDing();
          }
          return json.data;
        });
      }
    } catch (err) {
      console.warn("Could not fetch location beacon:", err);
    }
  };

  useEffect(() => {
    fetchLocation();
    const interval = setInterval(fetchLocation, 2500);
    return () => clearInterval(interval);
  }, [bookingId, stationCode, platform, targetCoach]);

  // Initialize Leaflet Map safely in client
  useEffect(() => {
    let isMounted = true;

    async function initLeaflet() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      try {
        const L = (await import("leaflet")).default;
        if (!isMounted || !mapContainerRef.current) return;

        const defaultLat = beacon?.latitude || 22.0833;
        const defaultLng = beacon?.longitude || 82.1552;

        const map = L.map(mapContainerRef.current, {
          center: [defaultLat, defaultLng],
          zoom: 18,
          zoomControl: false,
          attributionControl: false,
        });

        // Clean OpenStreetMap raster tiles (100% Free, Zero Watermark, No API Key Required)
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        // Custom Coolie Animated Pin
        const coolieHtml = `
          <div class="relative flex items-center justify-center">
            <span class="absolute -inset-2 rounded-full bg-red-500/30 animate-ping"></span>
            <span class="absolute -inset-1 rounded-full bg-amber-400/50 animate-pulse"></span>
            <div class="w-10 h-10 rounded-2xl bg-[#C81E1E] text-white flex flex-col items-center justify-center shadow-2xl border-2 border-amber-300 relative z-10 font-bold text-[10px]">
              <span>🧳</span>
              <span class="leading-none text-[8px] font-mono">${sahayak?.billaNumber || "BSP-108"}</span>
            </div>
          </div>
        `;
        const coolieIcon = L.divIcon({
          html: coolieHtml,
          className: "coolie-leaflet-icon",
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        // Custom Passenger Coach Pin
        const passengerHtml = `
          <div class="relative flex items-center justify-center">
            <div class="w-10 h-10 rounded-2xl bg-[#0F2A4A] text-amber-300 flex flex-col items-center justify-center shadow-2xl border-2 border-emerald-400 font-bold text-[10px]">
              <span>📍</span>
              <span class="leading-none text-[8px] font-mono">${targetCoach}</span>
            </div>
          </div>
        `;
        const passengerIcon = L.divIcon({
          html: passengerHtml,
          className: "passenger-leaflet-icon",
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const cMarker = L.marker([defaultLat, defaultLng], { icon: coolieIcon }).addTo(map);
        const passLat = beacon?.passengerLat || defaultLat - 0.0006;
        const passLng = beacon?.passengerLng || defaultLng - 0.0006;
        const pMarker = L.marker([passLat, passLng], { icon: passengerIcon }).addTo(map);

        // Route polyline connecting coolie to coach
        const polyline = L.polyline(
          [
            [defaultLat, defaultLng],
            [passLat, passLng],
          ],
          {
            color: "#2563EB",
            weight: 4,
            dashArray: "6, 8",
            opacity: 0.85,
          }
        ).addTo(map);

        coolieMarkerRef.current = cMarker;
        passengerMarkerRef.current = pMarker;
        routePolylineRef.current = polyline;
        mapInstanceRef.current = map;

        setMapLoaded(true);

        // Fit bounds to show both pins with clean mobile padding
        const bounds = L.latLngBounds([
          [defaultLat, defaultLng],
          [passLat, passLng],
        ]);
        map.fitBounds(bounds, { padding: [35, 35], maxZoom: 18 });
      } catch (err) {
        console.warn("Leaflet map initialization warning:", err);
      }
    }

    initLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Smoothly update marker positions on beacon updates
  useEffect(() => {
    if (!mapInstanceRef.current || !beacon) return;

    const coolieLat = beacon.latitude || 22.0833;
    const coolieLng = beacon.longitude || 82.1552;
    const passLat = beacon.passengerLat || coolieLat - 0.0006;
    const passLng = beacon.passengerLng || coolieLng - 0.0006;

    if (coolieMarkerRef.current) {
      coolieMarkerRef.current.setLatLng([coolieLat, coolieLng]);
    }
    if (passengerMarkerRef.current) {
      passengerMarkerRef.current.setLatLng([passLat, passLng]);
    }
    if (routePolylineRef.current) {
      routePolylineRef.current.setLatLngs([
        [coolieLat, coolieLng],
        [passLat, passLng],
      ]);
    }
  }, [beacon]);

  const handleCenterMap = async () => {
    if (!mapInstanceRef.current || !beacon) return;
    try {
      const L = (await import("leaflet")).default;
      const coolieLat = beacon.latitude || 22.0833;
      const coolieLng = beacon.longitude || 82.1552;
      const passLat = beacon.passengerLat || coolieLat - 0.0006;
      const passLng = beacon.passengerLng || coolieLng - 0.0006;

      const bounds = L.latLngBounds([
        [coolieLat, coolieLng],
        [passLat, passLng],
      ]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 19 });
    } catch {
      // ignore
    }
  };

  const isArrived = beacon?.hasArrived || (beacon?.distanceMeters !== undefined && beacon.distanceMeters <= 10);
  const distance = beacon?.distanceMeters !== undefined ? beacon.distanceMeters : 175;
  const etaMins = beacon?.estimatedMinutes !== undefined ? beacon.estimatedMinutes : 2;

  return (
    <div className="apple-glass-card rounded-3xl overflow-hidden shadow-2xl border border-black/[0.08] dark:border-white/10 space-y-0 relative">
      {/* Top Google Maps Floating Header Card - Clean & Uncongested */}
      <div className="px-3.5 py-3 sm:px-4 sm:py-3.5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between gap-2.5 relative z-20">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="relative flex items-center justify-center shrink-0">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 relative" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                {isArrived
                  ? language === "hi_cg"
                    ? "कुली बोगी पर पहुँच गए हैं!"
                    : "Sahayak Arrived at Coach!"
                  : language === "hi_cg"
                  ? "लाइव गूगल मैप ट्रैकिंग"
                  : "Live Google Maps Tracking"}
              </h3>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 shrink-0">
                {isArrived ? "ARRIVED" : "LIVE GPS"}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
              {beacon?.stepDescription || `${stationName} • PF-${platform} • Coach ${targetCoach} Door`}
            </p>
          </div>
        </div>

        {/* Live Distance & ETA Pill */}
        <div className="text-right shrink-0 bg-emerald-500/10 dark:bg-emerald-500/15 px-2.5 py-1 rounded-xl border border-emerald-500/20">
          <div className="text-xs sm:text-sm font-black font-mono text-emerald-600 dark:text-emerald-400 leading-tight">
            {isArrived ? "0 m" : `${distance} m`}
          </div>
          <div className="text-[9px] sm:text-[10px] text-emerald-700 dark:text-emerald-300 font-bold leading-tight">
            {isArrived ? "At Door" : `~${etaMins} min`}
          </div>
        </div>
      </div>

      {/* Main Interactive Leaflet Map Container (Optimized 220px Height on Mobile) */}
      <div className="relative w-full overflow-hidden" style={{ height: isExpanded ? "380px" : "220px" }}>
        <div ref={mapContainerRef} className="w-full h-full z-10 bg-slate-100 dark:bg-zinc-800" />

        {/* Map Floating Control Buttons (Recenter & Expand) */}
        <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={handleCenterMap}
            className="w-8 h-8 rounded-full bg-white dark:bg-zinc-900 shadow-xl border border-black/10 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-zinc-300 hover:scale-105 active:scale-95 transition-all"
            title="Recenter Map"
          >
            <LocateFixed className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-8 h-8 rounded-full bg-white dark:bg-zinc-900 shadow-xl border border-black/10 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-zinc-300 hover:scale-105 active:scale-95 transition-all"
            title={isExpanded ? "Collapse Map" : "Expand Map"}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Arrival Banner Overlay */}
        {isArrived && (
          <div className="absolute bottom-3 left-3 right-14 z-20 p-2.5 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center gap-2 animate-bounce">
            <span className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center text-sm shrink-0 font-black">
              ✓
            </span>
            <div className="text-[11px] min-w-0">
              <strong className="block font-black truncate">
                {language === "hi_cg" ? "कुली आपकी बोगी के बाहर उपस्थित हैं!" : "Sahayak is outside your coach door!"}
              </strong>
              <span className="text-[9px] text-emerald-100 truncate block">
                {language === "hi_cg"
                  ? `लाल वर्दी और पीतल बिल्ला #${sahayak?.billaNumber || "BSP-108"} देखें`
                  : `Look for red uniform & Billa #${sahayak?.billaNumber || "BSP-108"}`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Section: Sahayak Partner View vs Passenger View */}
      {isCoolieView ? (
        <div className="p-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between text-xs font-bold text-slate-800 dark:text-zinc-200">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
            <span className="truncate">Destination: Coach {targetCoach} • Platform {platform}</span>
          </div>
          {onPingArrival && (
            <button
              type="button"
              onClick={onPingArrival}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all shrink-0 ml-2"
            >
              {language === "hi_cg" ? "✓ आगमन सूचना भेजें" : "✓ Notify Arrival"}
            </button>
          )}
        </div>
      ) : (
        /* Passenger View: Unified Clean Driver Profile Card */
        <div className="p-3 sm:p-3.5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between gap-2.5 relative z-20">
          <div className="flex items-center gap-2.5 min-w-0">
            <AppleAvatar
              name={sahayak?.name || "Ramesh Yadav"}
              billaNumber={sahayak?.billaNumber || "BSP-108"}
              size="md"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                  {language === "hi_cg" ? sahayak?.hindiName || sahayak?.name || "रमेश यादव" : sahayak?.name || "Ramesh Yadav"}
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-700 dark:text-amber-300 text-[10px] font-black border border-amber-400/30 shrink-0">
                  {sahayak?.rating || 4.9}★
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-500 dark:text-zinc-400 block mt-0.5 truncate">
                SECR Billa #{sahayak?.billaNumber || "BSP-108"} • {sahayak?.experienceYears || 12}+ yrs
              </span>
            </div>
          </div>

          {/* Quick Contact Buttons (With min-w & shrink protection) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {sahayak?.phone && (
              <a
                href={`tel:${sahayak.phone}`}
                className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shadow-xs active:scale-95 transition-all"
                title="Call Sahayak"
              >
                <Phone className="w-4 h-4" />
              </a>
            )}
            {sahayak?.phone && (
              <a
                href={`https://wa.me/91${sahayak.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                  language === "hi_cg"
                    ? `नमस्ते ${sahayak.hindiName || sahayak.name} जी, मैं बोगी ${targetCoach} पर प्रतीक्षा कर रहा हूँ।`
                    : `Hello ${sahayak.name}, I am at Coach ${targetCoach}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 sm:p-2.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/30 shadow-xs active:scale-95 transition-all"
                title="WhatsApp Sahayak"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
