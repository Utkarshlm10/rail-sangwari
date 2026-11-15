import { NextRequest, NextResponse } from "next/server";
import {
  getOrCreateLocationBeacon,
  updateLocationBeacon,
  advanceLocationStep,
  PLATFORM_MILESTONES,
} from "@/lib/location";

// GET /api/location?bookingId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get("bookingId");

    if (!bookingId) {
      return NextResponse.json({ success: false, error: "Missing bookingId" }, { status: 400 });
    }

    const stationCode = (searchParams.get("stationCode") as "BSP" | "R" | "DURG") || "BSP";
    const platform = searchParams.get("platform") || "2";
    const targetCoach = searchParams.get("targetCoach") || "B4";
    const sahayakId = searchParams.get("sahayakId") || "sahayak-bsp-108";
    const billaNumber = searchParams.get("billaNumber") || "BSP-108";

    const beacon = getOrCreateLocationBeacon(bookingId, {
      stationCode,
      platform,
      targetCoach,
      sahayakId,
      billaNumber,
    });

    return NextResponse.json({
      success: true,
      data: beacon,
      milestones: PLATFORM_MILESTONES,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST /api/location
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, bookingId, updates } = body;

    if (!bookingId) {
      return NextResponse.json({ success: false, error: "Missing bookingId" }, { status: 400 });
    }

    if (action === "ADVANCE_STEP") {
      const advanced = advanceLocationStep(bookingId);
      return NextResponse.json({ success: true, data: advanced });
    }

    if (action === "ARRIVED") {
      const arrived = updateLocationBeacon(bookingId, {
        platformStep: 5,
        hasArrived: true,
        distanceMeters: 0,
        estimatedMinutes: 0,
      });
      return NextResponse.json({ success: true, data: arrived });
    }

    const updated = updateLocationBeacon(bookingId, updates || {});
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
