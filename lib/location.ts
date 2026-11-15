import { LocationBeacon, StationCode } from "@/types";

// In-memory location store for real-time tracking
declare global {
  // eslint-disable-next-line no-var
  var __locationBeacons: Map<string, LocationBeacon> | undefined;
}

if (!globalThis.__locationBeacons) {
  globalThis.__locationBeacons = new Map<string, LocationBeacon>();
}

const locationStore = globalThis.__locationBeacons;

// Station reference coordinates for SECR terminals
export const STATION_COORDINATES: Record<StationCode, { lat: number; lng: number; name: string }> = {
  BSP: { lat: 22.0833, lng: 82.1552, name: "Bilaspur Junction (BSP)" },
  R: { lat: 21.2568, lng: 81.6318, name: "Raipur Junction (R)" },
  DURG: { lat: 21.1904, lng: 81.2849, name: "Durg Junction (DURG)" },
};

// Calculate Haversine distance in meters
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Platform walk milestone descriptors
export const PLATFORM_MILESTONES: Record<
  1 | 2 | 3 | 4 | 5,
  { desc: string; hindiDesc: string; defaultDistance: number; defaultMinutes: number }
> = {
  1: {
    desc: "At Coolie Rest Room & Concourse Stand",
    hindiDesc: "कुली विश्राम कक्ष एवं मुख्य कॉनकोर्स पर",
    defaultDistance: 260,
    defaultMinutes: 4,
  },
  2: {
    desc: "Ascending Foot Overbridge towards Platform",
    hindiDesc: "फुट ओवरब्रिज सीढ़ियों से प्लेटफॉर्म की ओर अग्रसर",
    defaultDistance: 175,
    defaultMinutes: 2.5,
  },
  3: {
    desc: "Descending to Platform near Water Booth",
    hindiDesc: "प्लेटफॉर्म पर उतरे • वाटर बूथ के पास",
    defaultDistance: 85,
    defaultMinutes: 1.2,
  },
  4: {
    desc: "Approaching Target Coach Door",
    hindiDesc: "आपकी बोगी के दरवाजे की ओर बढ़ रहे हैं",
    defaultDistance: 30,
    defaultMinutes: 0.5,
  },
  5: {
    desc: "Arrived outside Coach Door • Waiting on Platform",
    hindiDesc: "बोगी के बाहर पहुँच गए हैं • प्लेटफॉर्म पर प्रतीक्षारत",
    defaultDistance: 0,
    defaultMinutes: 0,
  },
};

export function getOrCreateLocationBeacon(
  bookingId: string,
  initialInfo?: {
    sahayakId?: string;
    billaNumber?: string;
    stationCode?: StationCode;
    platform?: string;
    targetCoach?: string;
  }
): LocationBeacon {
  if (locationStore.has(bookingId)) {
    return locationStore.get(bookingId)!;
  }

  const station = initialInfo?.stationCode || "BSP";
  const stationCoords = STATION_COORDINATES[station] || STATION_COORDINATES.BSP;

  // Initial beacon at milestone 1
  const milestone = PLATFORM_MILESTONES[1];
  const beacon: LocationBeacon = {
    bookingId,
    sahayakId: initialInfo?.sahayakId || "sahayak-bsp-108",
    billaNumber: initialInfo?.billaNumber || "BSP-108",
    stationCode: station,
    platform: initialInfo?.platform || "2",
    targetCoach: initialInfo?.targetCoach || "B4",
    platformStep: 1,
    stepDescription: milestone.desc,
    distanceMeters: milestone.defaultDistance,
    estimatedMinutes: milestone.defaultMinutes,
    latitude: stationCoords.lat + 0.0008,
    longitude: stationCoords.lng + 0.0006,
    hasArrived: false,
    lastUpdated: new Date().toISOString(),
  };

  locationStore.set(bookingId, beacon);
  return beacon;
}

export function updateLocationBeacon(
  bookingId: string,
  updates: Partial<LocationBeacon>
): LocationBeacon {
  const existing = getOrCreateLocationBeacon(bookingId);
  
  let newStep = updates.platformStep !== undefined ? updates.platformStep : existing.platformStep;
  if (updates.hasArrived) {
    newStep = 5;
  }

  const milestone = PLATFORM_MILESTONES[newStep as 1 | 2 | 3 | 4 | 5] || PLATFORM_MILESTONES[1];
  
  // Calculate distance if GPS coords are provided
  let dist = updates.distanceMeters !== undefined ? updates.distanceMeters : milestone.defaultDistance;
  if (updates.latitude && updates.longitude && updates.passengerLat && updates.passengerLng) {
    dist = calculateHaversineDistance(
      updates.latitude,
      updates.longitude,
      updates.passengerLat,
      updates.passengerLng
    );
  }

  const updated: LocationBeacon = {
    ...existing,
    ...updates,
    platformStep: newStep as 1 | 2 | 3 | 4 | 5,
    stepDescription: milestone.desc,
    distanceMeters: dist,
    estimatedMinutes: milestone.defaultMinutes,
    hasArrived: newStep === 5 || Boolean(updates.hasArrived),
    lastUpdated: new Date().toISOString(),
  };

  locationStore.set(bookingId, updated);
  return updated;
}

export function advanceLocationStep(bookingId: string): LocationBeacon {
  const current = getOrCreateLocationBeacon(bookingId);
  const nextStep = Math.min(5, current.platformStep + 1) as 1 | 2 | 3 | 4 | 5;
  return updateLocationBeacon(bookingId, {
    platformStep: nextStep,
    hasArrived: nextStep === 5,
  });
}
