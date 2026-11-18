"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { PassengerUser, SahayakProfile, BookingRecord } from "@/types";
import {
  authenticateSahayak,
  SAMPLE_PAST_BOOKINGS,
  VERIFIED_SAHAYAKS,
} from "@/lib/mock-railway-data";
import { playRailwayChime } from "@/lib/sound-effects";

interface SimulatedOtp {
  phone: string;
  otp: string;
  expiresAt: number;
}

interface AuthContextType {
  // Passenger Auth
  passengerUser: PassengerUser | null;
  isPassengerLoggedIn: boolean;
  isHydrated: boolean;
  sendPassengerOtp: (phone: string) => Promise<{ success: boolean; otp: string }>;
  verifyPassengerOtp: (
    phone: string,
    otp: string,
    name?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logoutPassenger: () => void;
  isPassengerAuthModalOpen: boolean;
  openPassengerAuthModal: () => void;
  closePassengerAuthModal: () => void;
  isMyBookingsModalOpen: boolean;
  openMyBookingsModal: () => void;
  closeMyBookingsModal: () => void;
  pastBookings: BookingRecord[];
  activeSimulatedOtp: SimulatedOtp | null;
  clearSimulatedOtp: () => void;

  // Sahayak Auth
  sahayakUser: SahayakProfile | null;
  isSahayakLoggedIn: boolean;
  loginSahayak: (
    billaNumber: string,
    pin: string
  ) => Promise<{ success: boolean; error?: string; sahayak?: SahayakProfile }>;
  logoutSahayak: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Passenger state
  const [passengerUser, setPassengerUser] = useState<PassengerUser | null>(null);
  const [isPassengerAuthModalOpen, setIsPassengerAuthModalOpen] = useState(false);
  const [isMyBookingsModalOpen, setIsMyBookingsModalOpen] = useState(false);
  const [pastBookings, setPastBookings] = useState<BookingRecord[]>(SAMPLE_PAST_BOOKINGS);
  const [activeSimulatedOtp, setActiveSimulatedOtp] = useState<SimulatedOtp | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Sahayak state
  const [sahayakUser, setSahayakUser] = useState<SahayakProfile | null>(null);

  // Hydrate sessions from localStorage on client mount
  useEffect(() => {
    try {
      const storedPassenger = localStorage.getItem("rail_sangwari_passenger");
      if (storedPassenger) {
        setPassengerUser(JSON.parse(storedPassenger));
      }

      const storedSahayak = localStorage.getItem("rail_sangwari_sahayak");
      if (storedSahayak) {
        setSahayakUser(JSON.parse(storedSahayak));
      }

      const storedPastBookings = localStorage.getItem("rail_sangwari_past_bookings");
      if (storedPastBookings) {
        setPastBookings(JSON.parse(storedPastBookings));
      }
    } catch (err) {
      console.warn("Could not hydrate auth session:", err);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // 1. Send Simulated OTP (100% Free with zero SMS gateway costs)
  const sendPassengerOtp = async (phone: string): Promise<{ success: boolean; otp: string }> => {
    const cleaned = phone.replace(/\D/g, "").slice(-10);
    // Generate realistic 4-digit OTP
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const otpData: SimulatedOtp = {
      phone: cleaned,
      otp: generatedOtp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    setActiveSimulatedOtp(otpData);

    // Play subtle auditory chime
    try {
      playRailwayChime();
    } catch {
      // Audio autoplay policy fallback
    }

    return { success: true, otp: generatedOtp };
  };

  // 2. Verify Passenger OTP
  const verifyPassengerOtp = async (
    phone: string,
    otp: string,
    name?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleaned = phone.replace(/\D/g, "").slice(-10);
    const trimmedOtp = otp.trim();

    // Valid if matches generated OTP or master universal demo OTP "1234"
    const isValid =
      (activeSimulatedOtp &&
        activeSimulatedOtp.phone === cleaned &&
        activeSimulatedOtp.otp === trimmedOtp &&
        Date.now() < activeSimulatedOtp.expiresAt) ||
      trimmedOtp === "1234" ||
      trimmedOtp === "0000";

    if (!isValid) {
      return { success: false, error: "Invalid OTP code. Please enter the code shown in the banner or '1234'." };
    }

    const newUser: PassengerUser = {
      id: `usr_${Date.now()}`,
      phone: cleaned,
      name: name?.trim() || `Passenger (${cleaned.slice(-4)})`,
      createdAt: new Date().toISOString(),
    };

    setPassengerUser(newUser);
    setActiveSimulatedOtp(null);

    try {
      localStorage.setItem("rail_sangwari_passenger", JSON.stringify(newUser));
    } catch (e) {
      console.warn("Storage write failed", e);
    }

    return { success: true };
  };

  const logoutPassenger = () => {
    setPassengerUser(null);
    try {
      localStorage.removeItem("rail_sangwari_passenger");
    } catch (e) {
      console.warn("Storage delete failed", e);
    }
  };

  const clearSimulatedOtp = () => {
    setActiveSimulatedOtp(null);
  };

  // 3. Sahayak Login via SECR Brass Billa + 4-Digit Security PIN
  const loginSahayak = async (
    billaNumber: string,
    pin: string
  ): Promise<{ success: boolean; error?: string; sahayak?: SahayakProfile }> => {
    const matched = authenticateSahayak(billaNumber, pin);
    if (!matched) {
      return {
        success: false,
        error: "Invalid Billa Badge Number or Security PIN. (Hint: Try BSP-108 with PIN 1080 or demo PIN 1234)",
      };
    }

    setSahayakUser(matched);
    try {
      localStorage.setItem("rail_sangwari_sahayak", JSON.stringify(matched));
    } catch (e) {
      console.warn("Storage write failed", e);
    }

    return { success: true, sahayak: matched };
  };

  const logoutSahayak = () => {
    setSahayakUser(null);
    try {
      localStorage.removeItem("rail_sangwari_sahayak");
    } catch (e) {
      console.warn("Storage delete failed", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        passengerUser,
        isPassengerLoggedIn: Boolean(passengerUser),
        isHydrated,
        sendPassengerOtp,
        verifyPassengerOtp,
        logoutPassenger,
        isPassengerAuthModalOpen,
        openPassengerAuthModal: () => setIsPassengerAuthModalOpen(true),
        closePassengerAuthModal: () => setIsPassengerAuthModalOpen(false),
        isMyBookingsModalOpen,
        openMyBookingsModal: () => setIsMyBookingsModalOpen(true),
        closeMyBookingsModal: () => setIsMyBookingsModalOpen(false),
        pastBookings,
        activeSimulatedOtp,
        clearSimulatedOtp,

        sahayakUser,
        isSahayakLoggedIn: Boolean(sahayakUser),
        loginSahayak,
        logoutSahayak,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
