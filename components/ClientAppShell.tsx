"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import SimulatedOtpBanner from "@/components/SimulatedOtpBanner";
import PassengerAuthModal from "@/components/PassengerAuthModal";
import MyBookingsModal from "@/components/MyBookingsModal";

export function ClientAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Synchronously evaluate if current client context is a dedicated partner host (Sahayak, Supervisor, Admin)
  const [isDedicatedPartnerHost, setIsDedicatedPartnerHost] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const h = window.location.hostname.toLowerCase();
    const host = window.location.host.toLowerCase();
    const port = window.location.port;
    const path = window.location.pathname.toLowerCase();

    return (
      h.includes("sahayak") ||
      host.includes("3001") ||
      port === "3001" ||
      path.startsWith("/sahayak") ||
      h.includes("supervisor") ||
      host.includes("3002") ||
      port === "3002" ||
      path.startsWith("/supervisor") ||
      h.includes("admin") ||
      host.includes("3003") ||
      port === "3003" ||
      path.startsWith("/admin")
    );
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const h = window.location.hostname.toLowerCase();
      const host = window.location.host.toLowerCase();
      const port = window.location.port;
      const path = window.location.pathname.toLowerCase();

      const isPartner =
        h.includes("sahayak") ||
        host.includes("3001") ||
        port === "3001" ||
        path.startsWith("/sahayak") ||
        h.includes("supervisor") ||
        host.includes("3002") ||
        port === "3002" ||
        path.startsWith("/supervisor") ||
        h.includes("admin") ||
        host.includes("3003") ||
        port === "3003" ||
        path.startsWith("/admin");

      setIsDedicatedPartnerHost(isPartner);
    }
  }, [pathname]);

  const isDedicatedRoute =
    pathname.startsWith("/sahayak") ||
    pathname.startsWith("/supervisor") ||
    pathname.startsWith("/admin");

  const isPassengerApp = !isDedicatedPartnerHost && !isDedicatedRoute;

  return (
    <>
      {isPassengerApp && (
        <>
          <SimulatedOtpBanner />
          <PassengerAuthModal />
          <MyBookingsModal />
          <Navbar />
        </>
      )}

      <main className={`flex-1 ${isPassengerApp ? "pt-20 sm:pt-24" : ""}`}>
        {children}
      </main>

      {isPassengerApp && <Footer />}
    </>
  );
}
