export type StationCode = "BSP" | "R" | "DURG";

export interface PNRData {
  pnr: string;
  trainNumber: string;
  trainName: string;
  fromStation: string;
  toStation: string;
  boardingStation?: string; // Boarding station for the coolie pickup
  stationCode: StationCode;
  stationName: string;
  platform: string;
  coach: string;
  berth: string;
  seatNumber?: string; // Explicit alias for berth
  eta: string;
  arrivalDate: string;
  coachPosition: string; // e.g. "11th from engine, near Foot Overbridge 2"
  trainStatus: string; // e.g. "Running On Time" or "Delayed by 10 mins"
}

export interface LuggageSelection {
  mediumTrolley: number; // ₹60/bag
  heavyCarton: number;   // ₹90/bag
  smallBag: number;      // Free if total other bags >= 2, else ₹30/bag
  wheelchairEscort: boolean; // ₹100
}

export interface FareBreakdown {
  baseSahayakFare: number;
  smallBagCharge: number;
  wheelchairCharge: number;
  platformBookingFee: number; // ₹39
  totalAmount: number;
  payNowFee: number; // ₹39 to confirm
  payToSahayakCash: number; // Base fare after completion
}

export interface SahayakProfile {
  id: string;
  billaNumber: string; // e.g. "BSP-108"
  pin?: string; // 4-digit security PIN for duty authentication
  name: string;
  hindiName: string;
  stationCode: StationCode;
  stationName: string;
  phone: string;
  rating: number;
  reviewsCount: number;
  completedTrips: number;
  photoUrl: string;
  policeVerified: boolean;
  medicalFitnessValidTill: string;
  experienceYears: number;
  languages: string[];
  currentLocation?: string;
  isActive: boolean;
}

export interface PassengerUser {
  id: string;
  phone: string;
  name: string;
  city?: string;
  createdAt: string;
}

export type PickupDropMode = "TRAIN_TO_EXIT" | "ENTRY_TO_TRAIN";

export type BookingStatus =
  | "CONFIRMED"
  | "ASSIGNED"
  | "AT_PLATFORM"
  | "IN_PROGRESS"
  | "COMPLETED";

export interface BookingRecord {
  id: string;
  pnr: string;
  pickupDropMode: PickupDropMode;
  passengerName: string;
  passengerPhone: string;
  trainDetails: PNRData;
  luggage: LuggageSelection;
  fare: FareBreakdown;
  sahayak?: SahayakProfile;
  status: BookingStatus;
  happyCode: string; // 4-digit OTP
  createdAt: string;
  meetingPoint: string;
  notes?: string;
}

export interface IncomingJob extends BookingRecord {
  urgency: "HIGH" | "NORMAL";
  estimatedMinutesToArrival: number;
}

export interface LocationBeacon {
  bookingId: string;
  sahayakId: string;
  billaNumber: string;
  stationCode: StationCode;
  platform: string;
  targetCoach: string;
  platformStep: 1 | 2 | 3 | 4 | 5;
  stepDescription: string;
  distanceMeters: number;
  estimatedMinutes: number;
  latitude?: number;
  longitude?: number;
  passengerLat?: number;
  passengerLng?: number;
  hasArrived: boolean;
  lastUpdated: string;
}
