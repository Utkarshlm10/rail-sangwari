import { LocationBeacon, StationCode } from "@/types";

// In-memory location store for real-time tracking
declare global {
  // eslint-disable-next-line no-var
  var __locationBeacons: Map<string, LocationBeacon & { startedAt?: number }> | undefined;
}

if (!globalThis.__locationBeacons) {
  globalThis.__locationBeacons = new Map<string, LocationBeacon & { startedAt?: number }>();
}

const locationStore = globalThis.__locationBeacons;

// Station reference coordinates for SECR terminals
export const STATION_COORDINATES: Record<StationCode, { lat: number; lng: number; name: string }> = {
  BSP: { lat: 22.0833, lng: 82.1552, name: "Bilaspur Junction (BSP)" },
  R: { lat: 21.2568, lng: 81.6318, name: "Raipur Junction (R)" },
  DURG: { lat: 21.1904, lng: 81.2849, name: "Durg Junction (DURG)" },
};

// Real-world walking trajectory waypoints for each SECR terminal
export interface StationWaypoint {
  lat: number;
  lng: number;
  name: string;
}

export const STATION_WAYPOINTS: Record<StationCode, StationWaypoint[]> = {
  BSP: [
    { lat: 22.0841, lng: 82.1559, name: "Concourse & Coolie Rest Stand" },
    { lat: 22.0837, lng: 82.1556, name: "FOB 2 Stairs Entrance" },
    { lat: 22.0835, lng: 82.1554, name: "FOB 2 Walkway Over Tracks" },
    { lat: 22.0833, lng: 82.1552, name: "Platform 2 Escalator & Water Booth" },
    { lat: 22.0831, lng: 82.1550, name: "Platform 2 • Coach Door (Target)" },
  ],
  R: [
    { lat: 21.2575, lng: 81.6325, name: "Main Concourse Stand" },
    { lat: 21.2572, lng: 81.6322, name: "Central FOB 1" },
    { lat: 21.2570, lng: 81.6320, name: "Platform 1 Walkway" },
    { lat: 21.2568, lng: 81.6318, name: "Platform 1 Water Booth" },
    { lat: 21.2565, lng: 81.6315, name: "Platform 1 • Coach Door (Target)" },
  ],
  DURG: [
    { lat: 21.1912, lng: 81.2858, name: "Main Concourse Stand" },
    { lat: 21.1908, lng: 81.2854, name: "FOB 3 Ramps" },
    { lat: 21.1906, lng: 81.2851, name: "Platform 3 Walkway" },
    { lat: 21.1904, lng: 81.2849, name: "Platform 3 Water Station" },
    { lat: 21.1901, lng: 81.2846, name: "Platform 3 • Coach Door (Target)" },
  ],
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

// Interpolate GPS coordinates along waypoints based on progress 0.0 -> 1.0
function interpolateWaypoints(waypoints: StationWaypoint[], progress: number): { lat: number; lng: number } {
  if (waypoints.length === 0) return { lat: 22.0833, lng: 82.1552 };
  if (progress <= 0) return { lat: waypoints[0].lat, lng: waypoints[0].lng };
  if (progress >= 1) return { lat: waypoints[waypoints.length - 1].lat, lng: waypoints[waypoints.length - 1].lng };

  const totalSegments = waypoints.length - 1;
  const scaled = progress * totalSegments;
  const index = Math.floor(scaled);
  const segmentProgress = scaled - index;

  const p1 = waypoints[index];
  const p2 = waypoints[Math.min(index + 1, totalSegments)];

  return {
    lat: p1.lat + (p2.lat - p1.lat) * segmentProgress,
    lng: p1.lng + (p2.lng - p1.lng) * segmentProgress,
  };
}

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
  const station = initialInfo?.stationCode || "BSP";
  const waypoints = STATION_WAYPOINTS[station] || STATION_WAYPOINTS.BSP;
  const targetCoach = initialInfo?.targetCoach || "B4";
  const passengerPoint = waypoints[waypoints.length - 1];

  let beacon = locationStore.get(bookingId);

  if (!beacon) {
    const startPoint = waypoints[0];
    const initialMilestone = PLATFORM_MILESTONES[1];

    beacon = {
      bookingId,
      sahayakId: initialInfo?.sahayakId || "sahayak-bsp-108",
      billaNumber: initialInfo?.billaNumber || "BSP-108",
      stationCode: station,
      platform: initialInfo?.platform || "2",
      targetCoach,
      platformStep: 1,
      stepDescription: initialMilestone.desc,
      distanceMeters: initialMilestone.defaultDistance,
      estimatedMinutes: initialMilestone.defaultMinutes,
      latitude: startPoint.lat,
      longitude: startPoint.lng,
      passengerLat: passengerPoint.lat,
      passengerLng: passengerPoint.lng,
      hasArrived: false,
      lastUpdated: new Date().toISOString(),
      startedAt: Date.now(),
    };
    locationStore.set(bookingId, beacon);
    return beacon;
  }

  // Automatic Smooth Movement Engine (Google Maps Live Simulation)
  // Progresses automatically from 260m to 0m over ~40s without coolie needing to manually click!
  if (!beacon.hasArrived && beacon.startedAt) {
    const elapsedSeconds = (Date.now() - beacon.startedAt) / 1000;
    const TOTAL_WALK_TIME = 40; // 40 seconds to walk across platform to coach door
    const progress = Math.min(1.0, elapsedSeconds / TOTAL_WALK_TIME);

    const currentCoords = interpolateWaypoints(waypoints, progress);
    const newStep = (progress >= 1.0 ? 5 : progress >= 0.75 ? 4 : progress >= 0.5 ? 3 : progress >= 0.25 ? 2 : 1) as 1 | 2 | 3 | 4 | 5;
    const milestone = PLATFORM_MILESTONES[newStep];
    const currentDistance = Math.max(0, Math.round(260 * (1 - progress)));
    const currentMins = Math.max(0, Math.round((1 - progress) * 3.5 * 10) / 10);

    beacon = {
      ...beacon,
      latitude: currentCoords.lat,
      longitude: currentCoords.lng,
      platformStep: newStep,
      stepDescription: milestone.desc,
      distanceMeters: currentDistance,
      estimatedMinutes: currentMins,
      hasArrived: progress >= 1.0,
      lastUpdated: new Date().toISOString(),
    };
    locationStore.set(bookingId, beacon);
  }

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

  const updated: LocationBeacon & { startedAt?: number } = {
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
    distanceMeters: nextStep === 5 ? 0 : Math.round(260 * (1 - (nextStep - 1) / 4)),
  });
}
