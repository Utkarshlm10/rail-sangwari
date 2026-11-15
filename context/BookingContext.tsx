"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import {
  BookingRecord,
  BookingStatus,
  FareBreakdown,
  IncomingJob,
  LuggageSelection,
  PickupDropMode,
  PNRData,
  SahayakProfile,
} from "@/types";
import {
  calculateFare,
  DEMO_PNRS,
  getAssignedSahayak,
  INITIAL_INCOMING_JOBS,
  VERIFIED_SAHAYAKS,
} from "@/lib/mock-railway-data";
import {
  isFirebaseConfigured,
  subscribeToFirebaseBookings,
  syncBookingToFirebase,
  syncJobStatusToFirebase,
  syncSahayakDutyToFirebase,
} from "@/lib/firebase";
import {
  playRailwayChime,
  playCompletionDing,
  triggerJobVibration,
} from "@/lib/sound-effects";

interface BookingContextType {
  // Step state
  step: 1 | 2 | 3;
  setStep: (step: 1 | 2 | 3) => void;

  // Step 1 details
  pnrInput: string;
  setPnrInput: (val: string) => void;
  trainDetails: PNRData | null;
  setTrainDetails: (data: PNRData | null) => void;
  pickupDropMode: PickupDropMode;
  setPickupDropMode: (mode: PickupDropMode) => void;
  passengerName: string;
  setPassengerName: (name: string) => void;
  passengerPhone: string;
  setPassengerPhone: (phone: string) => void;

  // Step 2 details
  luggage: LuggageSelection;
  updateLuggageCount: (key: keyof LuggageSelection, delta: number) => void;
  toggleWheelchair: () => void;
  fare: FareBreakdown;

  // Step 3 details (Active Booking)
  activeBooking: BookingRecord | null;
  setActiveBooking: (b: BookingRecord | null) => void;
  happyCode: string;
  assignedSahayak: SahayakProfile | null;

  // Actions
  selectDemoPnr: (demo: PNRData) => void;
  confirmBooking: () => void;
  resetBooking: () => void;
  updateBookingStatus: (status: BookingStatus) => void;

  // Porter / Supervisor Portal integration
  incomingJobs: IncomingJob[];
  acceptJob: (jobId: string, sahayakId: string) => void;
  completeJobWithOtp: (jobId: string, enteredOtp: string) => { success: boolean; message: string };
  isSahayakOnline: boolean;
  setIsSahayakOnline: (online: boolean) => void;
  currentSahayak: SahayakProfile;
  setCurrentSahayak: (s: SahayakProfile) => void;
  dailyEarnings: {
    tripsCount: number;
    totalCash: number;
    totalAmount: number;
  };

  // Quick Billa Verification modal state
  isBillaModalOpen: boolean;
  openBillaModalWithId: (billaId?: string) => void;
  closeBillaModal: () => void;
  selectedBillaForModal: string;
  isFirebaseSyncActive: boolean;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [pnrInput, setPnrInput] = useState<string>("");
  const [trainDetails, setTrainDetails] = useState<PNRData | null>(null);
  const [pickupDropMode, setPickupDropMode] = useState<PickupDropMode>("TRAIN_TO_EXIT");
  const [passengerName, setPassengerName] = useState<string>("");
  const [passengerPhone, setPassengerPhone] = useState<string>("");

  const [luggage, setLuggage] = useState<LuggageSelection>({
    mediumTrolley: 2,
    heavyCarton: 1,
    smallBag: 1,
    wheelchairEscort: false,
  });

  const [fare, setFare] = useState<FareBreakdown>(() => calculateFare(luggage));
  const [activeBooking, setActiveBooking] = useState<BookingRecord | null>(null);
  const [happyCode, setHappyCode] = useState<string>("7492");
  const [assignedSahayak, setAssignedSahayak] = useState<SahayakProfile | null>(null);

  // Porter Portal shared state
  const [incomingJobs, setIncomingJobs] = useState<IncomingJob[]>(INITIAL_INCOMING_JOBS);
  const [isSahayakOnline, setIsSahayakOnline] = useState<boolean>(true);
  const [currentSahayak, setCurrentSahayak] = useState<SahayakProfile>(VERIFIED_SAHAYAKS[0]);

  // Billa verification modal
  const [isBillaModalOpen, setIsBillaModalOpen] = useState(false);
  const [selectedBillaForModal, setSelectedBillaForModal] = useState("");

  // BroadcastChannel reference for cross-tab communication
  const bcRef = useRef<BroadcastChannel | null>(null);

  // Helper to broadcast events to other tabs and other devices
  const broadcastDispatchEvent = (type: string, payload: unknown) => {
    // 1. Same-device cross-tab broadcast
    if (bcRef.current) {
      try {
        bcRef.current.postMessage({ type, payload });
      } catch {
        // ignore
      }
    }

    // 2. Cross-device SSE dispatch route
    if (typeof window !== "undefined") {
      fetch("/api/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, payload }),
      }).catch(() => {
        // network fallback
      });
    }
  };

  // Setup real-time listeners (BroadcastChannel + SSE EventSource)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleIncomingDispatch = (data: { type: string; payload: unknown }) => {
      if (!data || !data.type) return;

      if (data.type === "NEW_JOB") {
        const job = data.payload as IncomingJob;
        if (!job || !job.id) return;

        setIncomingJobs((prev) => {
          if (prev.some((j) => j.id === job.id)) return prev;
          // Play Indian Railways Chime and Haptic Vibration on new job
          playRailwayChime();
          triggerJobVibration();
          return [job, ...prev];
        });
      } else if (data.type === "JOB_ACCEPTED") {
        const { jobId, sahayak } = data.payload as { jobId: string; sahayak: SahayakProfile };
        setIncomingJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, sahayak, status: "ASSIGNED" } : j))
        );
        setActiveBooking((prev) => {
          if (prev && prev.id === jobId) {
            const updated = { ...prev, sahayak, status: "ASSIGNED" as BookingStatus };
            try {
              localStorage.setItem("rail_sangwari_active_booking", JSON.stringify(updated));
            } catch {
              // ignore
            }
            return updated;
          }
          return prev;
        });
      } else if (data.type === "JOB_COMPLETED") {
        const { jobId } = data.payload as { jobId: string };
        setIncomingJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, status: "COMPLETED" } : j))
        );
        setActiveBooking((prev) => {
          if (prev && prev.id === jobId) {
            playCompletionDing();
            const updated = { ...prev, status: "COMPLETED" as BookingStatus };
            try {
              localStorage.setItem("rail_sangwari_active_booking", JSON.stringify(updated));
            } catch {
              // ignore
            }
            return updated;
          }
          return prev;
        });
      }
    };

    // 1. BroadcastChannel init
    if ("BroadcastChannel" in window) {
      try {
        const bc = new BroadcastChannel("rail_sangwari_dispatch");
        bcRef.current = bc;
        bc.onmessage = (event) => {
          handleIncomingDispatch(event.data);
        };
      } catch (err) {
        console.warn("BroadcastChannel not supported or error:", err);
      }
    }

    // 2. Server-Sent Events (SSE) init for cross-device sync
    let es: EventSource | null = null;
    try {
      es = new EventSource("/api/dispatch");
      es.addEventListener("dispatch", (event) => {
        try {
          const parsed = JSON.parse(event.data);
          handleIncomingDispatch(parsed);
        } catch {
          // ignore
        }
      });
    } catch (err) {
      console.warn("EventSource error:", err);
    }

    // 3. Firebase Cloud Firestore Real-Time subscription (if configured)
    const unsubFirebase = subscribeToFirebaseBookings((firebaseBookings) => {
      if (firebaseBookings && firebaseBookings.length > 0) {
        setIncomingJobs((prev) => {
          const merged = [...prev];
          for (const fb of firebaseBookings) {
            const idx = merged.findIndex((j) => j.id === fb.id);
            const jobData: IncomingJob = {
              ...fb,
              urgency: "HIGH",
              estimatedMinutesToArrival: 15,
            };
            if (idx >= 0) {
              merged[idx] = { ...merged[idx], ...jobData };
            } else {
              merged.unshift(jobData);
            }
          }
          return merged;
        });

        // Also check if current active booking was updated in Firestore
        setActiveBooking((prev) => {
          if (!prev) return prev;
          const match = firebaseBookings.find((fb) => fb.id === prev.id);
          if (match && match.status !== prev.status) {
            if (match.status === "COMPLETED") {
              playCompletionDing();
            }
            return { ...prev, ...match };
          }
          return prev;
        });
      }
    });

    return () => {
      if (bcRef.current) {
        bcRef.current.close();
        bcRef.current = null;
      }
      if (es) {
        es.close();
      }
      if (unsubFirebase) {
        unsubFirebase();
      }
    };
  }, []);

  // Compute daily earnings dynamically for Sahayaks
  const completedJobs = incomingJobs.filter((j) => j.status === "COMPLETED");
  const dailyEarnings = {
    tripsCount: completedJobs.length,
    totalCash: completedJobs.reduce((acc, j) => acc + (j.fare?.payToSahayakCash || 0), 0),
    totalAmount: completedJobs.reduce((acc, j) => acc + (j.fare?.payToSahayakCash || 0), 0),
  };

  // Recalculate fare whenever luggage changes
  useEffect(() => {
    setFare(calculateFare(luggage));
  }, [luggage]);

  // Resilient Database Polling & Hydration Loop (Syncs every 3 seconds across all devices & tunnels)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("rail_sangwari_active_booking");
      if (saved) {
        const parsed = JSON.parse(saved);
        setActiveBooking(parsed);
        setStep(3);
        setAssignedSahayak(parsed.sahayak);
        setHappyCode(parsed.happyCode);
      }
    } catch {
      // Ignore parse errors
    }

    const syncWithDatabase = async () => {
      if (typeof window === "undefined") return;
      try {
        const res = await fetch("/api/database?collection=bookings");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const dbJobs: IncomingJob[] = json.data.map((b: BookingRecord) => ({
            ...b,
            urgency: "HIGH",
            estimatedMinutesToArrival: 15,
          }));

          setIncomingJobs((prev) => {
            const map = new Map<string, IncomingJob>();
            // Add server jobs first
            for (const dj of dbJobs) {
              map.set(dj.id, dj);
            }
            // Keep any locally created pending jobs that haven't hit server yet
            for (const pj of prev) {
              if (!map.has(pj.id)) {
                map.set(pj.id, pj);
              }
            }
            return Array.from(map.values());
          });

          // Also keep activeBooking in sync if its status changed on another device
          setActiveBooking((current) => {
            if (!current) return current;
            const serverMatch = json.data.find((b: BookingRecord) => b.id === current.id);
            if (serverMatch && serverMatch.status !== current.status) {
              const updated = { ...current, ...serverMatch };
              try {
                localStorage.setItem("rail_sangwari_active_booking", JSON.stringify(updated));
              } catch {
                // ignore
              }
              return updated;
            }
            return current;
          });
        }
      } catch (err) {
        console.warn("[Rail Sangwari] DB poll warning:", err);
      }
    };

    // Immediate sync on mount
    syncWithDatabase();

    // Recurring sync every 3 seconds for 100% rock-solid real-time continuity across all tabs & mobile devices
    const pollInterval = setInterval(syncWithDatabase, 3000);

    // Also sync whenever tab becomes visible / focused
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        syncWithDatabase();
      }
    };
    window.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", syncWithDatabase);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", syncWithDatabase);
    };
  }, []);

  const selectDemoPnr = (demo: PNRData) => {
    setPnrInput(demo.pnr);
    setTrainDetails(demo);
  };

  const updateLuggageCount = (key: keyof LuggageSelection, delta: number) => {
    if (key === "wheelchairEscort") return;
    setLuggage((prev) => {
      const current = prev[key] as number;
      const nextVal = Math.max(0, current + delta);
      return { ...prev, [key]: nextVal };
    });
  };

  const toggleWheelchair = () => {
    setLuggage((prev) => ({
      ...prev,
      wheelchairEscort: !prev.wheelchairEscort,
    }));
  };

  const confirmBooking = () => {
    if (!trainDetails) return;

    const sahayak = getAssignedSahayak(trainDetails.stationCode);
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const newBookingId = `RS-${Date.now().toString().slice(-6)}`;

    const newBooking: BookingRecord = {
      id: newBookingId,
      pnr: trainDetails.pnr,
      pickupDropMode,
      passengerName: passengerName || "Passenger",
      passengerPhone: passengerPhone ? `+91 ${passengerPhone}` : "+91 98270 00000",
      trainDetails,
      luggage,
      fare,
      sahayak,
      status: "ASSIGNED",
      happyCode: generatedOtp,
      createdAt: "Just now",
      meetingPoint:
        pickupDropMode === "TRAIN_TO_EXIT"
          ? `Coach ${trainDetails.coach} Door on Platform ${trainDetails.platform}`
          : `Station Portico Gate 1 towards Coach ${trainDetails.coach}`,
    };

    setActiveBooking(newBooking);
    setAssignedSahayak(sahayak);
    setHappyCode(generatedOtp);
    setStep(3);

    // Also inject into incomingJobs for the Sahayak Portal
    const newJob: IncomingJob = {
      ...newBooking,
      urgency: "HIGH",
      estimatedMinutesToArrival: 18,
    };
    setIncomingJobs((prev) => [newJob, ...prev]);

    // Broadcast real-time dispatch event to all other tabs and devices
    broadcastDispatchEvent("NEW_JOB", newJob);

    // Sync to persistent FileDB database API
    if (typeof window !== "undefined") {
      fetch("/api/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ADD_BOOKING", payload: newBooking }),
      }).catch(() => {});
    }

    // Sync to Firebase Firestore (if enabled)
    syncBookingToFirebase(newBooking);

    try {
      localStorage.setItem("rail_sangwari_active_booking", JSON.stringify(newBooking));
    } catch {
      // localStorage fallback
    }
  };

  const resetBooking = () => {
    setActiveBooking(null);
    setStep(1);
    try {
      localStorage.removeItem("rail_sangwari_active_booking");
    } catch {
      // ignore
    }
  };

  const updateBookingStatus = (status: BookingStatus) => {
    if (!activeBooking) return;
    const updated = { ...activeBooking, status };
    setActiveBooking(updated);
    // Sync status change to Firebase
    syncJobStatusToFirebase(activeBooking.id, status);
    // Sync status change to persistent database
    if (typeof window !== "undefined") {
      fetch("/api/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_BOOKING_STATUS",
          payload: { bookingId: activeBooking.id, status },
        }),
      }).catch(() => {});
    }
    try {
      localStorage.setItem("rail_sangwari_active_booking", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const acceptJob = (jobId: string, sahayakId: string) => {
    const sahayak = VERIFIED_SAHAYAKS.find((s) => s.id === sahayakId) || currentSahayak;
    setIncomingJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          return { ...job, sahayak, status: "ASSIGNED" };
        }
        return job;
      })
    );

    if (activeBooking && activeBooking.id === jobId) {
      updateBookingStatus("ASSIGNED");
    }

    // Broadcast job acceptance to passenger and other porters
    broadcastDispatchEvent("JOB_ACCEPTED", { jobId, sahayak });

    // Sync acceptance to Firebase Firestore
    syncJobStatusToFirebase(jobId, "ASSIGNED", sahayak);

    // Sync status change to persistent database
    if (typeof window !== "undefined") {
      fetch("/api/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_BOOKING_STATUS",
          payload: { bookingId: jobId, status: "ASSIGNED", sahayak },
        }),
      }).catch(() => {});
    }
  };

  const completeJobWithOtp = (jobId: string, enteredOtp: string) => {
    const job = incomingJobs.find((j) => j.id === jobId);
    if (!job) {
      return { success: false, message: "Job not found" };
    }
    if (job.happyCode !== enteredOtp.trim()) {
      return { success: false, message: "Invalid Happy Code OTP. Please ask the passenger for the correct 4-digit code." };
    }

    setIncomingJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: "COMPLETED" } : j))
    );

    if (activeBooking && activeBooking.id === jobId) {
      updateBookingStatus("COMPLETED");
    }

    // Broadcast job completion and play completion sound
    broadcastDispatchEvent("JOB_COMPLETED", { jobId });
    playCompletionDing();

    // Sync completion to Firebase Firestore
    syncJobStatusToFirebase(jobId, "COMPLETED");

    // Sync status change to persistent database
    if (typeof window !== "undefined") {
      fetch("/api/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_BOOKING_STATUS",
          payload: { bookingId: jobId, status: "COMPLETED" },
        }),
      }).catch(() => {});
    }

    return { success: true, message: "Trip successfully verified! Please collect cash/UPI." };
  };

  const openBillaModalWithId = (billaId?: string) => {
    setSelectedBillaForModal(billaId || "BSP-108");
    setIsBillaModalOpen(true);
  };

  const closeBillaModal = () => {
    setIsBillaModalOpen(false);
  };

  return (
    <BookingContext.Provider
      value={{
        step,
        setStep,
        pnrInput,
        setPnrInput,
        trainDetails,
        setTrainDetails,
        pickupDropMode,
        setPickupDropMode,
        passengerName,
        setPassengerName,
        passengerPhone,
        setPassengerPhone,
        luggage,
        updateLuggageCount,
        toggleWheelchair,
        fare,
        activeBooking,
        setActiveBooking,
        happyCode,
        assignedSahayak,
        selectDemoPnr,
        confirmBooking,
        resetBooking,
        updateBookingStatus,
        incomingJobs,
        acceptJob,
        completeJobWithOtp,
        isSahayakOnline,
        setIsSahayakOnline,
        currentSahayak,
        setCurrentSahayak,
        dailyEarnings,
        isBillaModalOpen,
        openBillaModalWithId,
        closeBillaModal,
        selectedBillaForModal,
        isFirebaseSyncActive: isFirebaseConfigured,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}
