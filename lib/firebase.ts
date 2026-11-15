// Dual-Mode Real-Time Sync Engine: Firebase Cloud Firestore + SECR Mesh Fallback
// Provides seamless real-time multi-device sync across mobile phones with zero-crash local fallback

import { initializeApp, getApps, getApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import type { BookingRecord, BookingStatus, SahayakProfile } from "../types";

// Firebase Configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if valid Firebase configuration exists
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes("YOUR_")
);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (typeof window !== "undefined" && isFirebaseConfigured) {
  try {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("🔥 [Rail Sangwari] Firebase Firestore initialized successfully");
  } catch (error) {
    console.warn("⚠️ [Rail Sangwari] Failed to initialize Firebase:", error);
    app = null;
    db = null;
  }
}

export function getFirebaseDb(): Firestore | null {
  return db;
}

export function isFirebaseActive(): boolean {
  return Boolean(db);
}

/**
 * Subscribe to real-time booking changes from Firestore
 * Returns unsubscribe function or null if Firebase is not active
 */
export function subscribeToFirebaseBookings(
  onBookingsUpdated: (bookings: BookingRecord[]) => void
): (() => void) | null {
  if (!db) return null;

  try {
    const bookingsCol = collection(db, "bookings");
    const q = query(bookingsCol, orderBy("createdAt", "desc"), limit(50));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const bookings: BookingRecord[] = [];
        snapshot.forEach((docSnap) => {
          bookings.push(docSnap.data() as BookingRecord);
        });
        onBookingsUpdated(bookings);
      },
      (error) => {
        console.warn("⚠️ [Rail Sangwari] Firestore bookings subscription error:", error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn("⚠️ [Rail Sangwari] Failed to attach Firestore listener:", err);
    return null;
  }
}

/**
 * Save or update a booking in Firestore
 */
export async function syncBookingToFirebase(booking: BookingRecord): Promise<boolean> {
  if (!db) return false;

  try {
    const bookingRef = doc(db, "bookings", booking.id);
    await setDoc(bookingRef, {
      ...booking,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn("⚠️ [Rail Sangwari] Failed to sync booking to Firebase:", err);
    return false;
  }
}

/**
 * Update booking status and optionally assigned sahayak in Firestore
 */
export async function syncJobStatusToFirebase(
  bookingId: string,
  status: BookingStatus,
  sahayak?: SahayakProfile
): Promise<boolean> {
  if (!db) return false;

  try {
    const bookingRef = doc(db, "bookings", bookingId);
    const updatePayload: Record<string, unknown> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (sahayak) {
      updatePayload.sahayak = sahayak;
    }
    await updateDoc(bookingRef, updatePayload);
    return true;
  } catch (err) {
    console.warn("⚠️ [Rail Sangwari] Failed to update job status in Firebase:", err);
    return false;
  }
}

/**
 * Sync Sahayak online/offline duty status to Firestore
 */
export async function syncSahayakDutyToFirebase(
  sahayak: SahayakProfile,
  isOnline: boolean
): Promise<boolean> {
  if (!db) return false;

  try {
    const sahayakRef = doc(db, "sahayaks", sahayak.billaNumber);
    await setDoc(
      sahayakRef,
      {
        ...sahayak,
        isActive: isOnline,
        lastSeen: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.warn("⚠️ [Rail Sangwari] Failed to update Sahayak duty in Firebase:", err);
    return false;
  }
}
