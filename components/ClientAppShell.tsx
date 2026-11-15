"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import SimulatedOtpBanner from "@/components/SimulatedOtpBanner";
import PassengerAuthModal from "@/components/PassengerAuthModal";
import MyBookingsModal from "@/components/MyBookingsModal";

export function ClientAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isDedicatedPartnerHost, setIsDedicatedPartnerHost] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const h = window.location.hostname.toLowerCase();
      if (h.includes("sahayak") || h.includes("supervisor") || h.includes("admin")) {
        setIsDedicatedPartnerHost(true);
      }
    }
  }, []);

  const isPassengerApp =
    !isDedicatedPartnerHost &&
    !pathname.startsWith("/sahayak") &&
    !pathname.startsWith("/supervisor") &&
    !pathname.startsWith("/admin");

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

      <main className={`flex-1 ${isPassengerApp ? "pt-16 sm:pt-20" : ""}`}>
        {children}
      </main>

      {isPassengerApp && <Footer />}
    </>
  );
}
