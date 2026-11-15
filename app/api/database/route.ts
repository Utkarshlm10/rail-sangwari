// SECR Central Database REST API Route
// Supports CRUD operations for Bookings, Sahayaks Roster, PNR Registry, and Audit Logs

import { NextRequest, NextResponse } from "next/server";
import {
  readDatabase,
  writeDatabase,
  getBookings,
  addOrUpdateBooking,
  updateBookingStatus,
  deleteBooking,
  clearAllBookings,
  getSahayaks,
  addOrUpdateSahayak,
  toggleSahayakDuty,
  deleteSahayak,
  getPnrs,
  addOrUpdatePnr,
  deletePnr,
  getAuditLogs,
} from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const collection = searchParams.get("collection");

    if (collection === "bookings") {
      return NextResponse.json({ success: true, data: getBookings() });
    }
    if (collection === "sahayaks") {
      return NextResponse.json({ success: true, data: getSahayaks() });
    }
    if (collection === "pnrs") {
      return NextResponse.json({ success: true, data: getPnrs() });
    }
    if (collection === "logs") {
      return NextResponse.json({ success: true, data: getAuditLogs() });
    }

    // Return complete database snapshot
    const db = readDatabase();
    return NextResponse.json({
      success: true,
      data: db,
      stats: {
        totalBookings: db.bookings.length,
        totalSahayaks: db.sahayaks.length,
        totalPnrs: db.pnrs.length,
        totalLogs: db.auditLogs.length,
        lastUpdated: db.meta.lastUpdated,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    if (action === "ADD_BOOKING") {
      const saved = addOrUpdateBooking(payload);
      return NextResponse.json({ success: true, data: saved });
    }

    if (action === "UPDATE_BOOKING_STATUS") {
      const { bookingId, status, sahayak } = payload;
      const ok = updateBookingStatus(bookingId, status, sahayak);
      return NextResponse.json({ success: ok });
    }

    if (action === "ADD_SAHAYAK") {
      const saved = addOrUpdateSahayak(payload);
      return NextResponse.json({ success: true, data: saved });
    }

    if (action === "TOGGLE_DUTY") {
      const { billaNumber, isActive } = payload;
      const ok = toggleSahayakDuty(billaNumber, isActive);
      return NextResponse.json({ success: ok });
    }

    if (action === "ADD_PNR") {
      const saved = addOrUpdatePnr(payload);
      return NextResponse.json({ success: true, data: saved });
    }

    return NextResponse.json(
      { success: false, error: "Unknown action" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const id = searchParams.get("id");

    if (action === "CLEAR_BOOKINGS") {
      clearAllBookings();
      return NextResponse.json({ success: true, message: "All test bookings cleared." });
    }

    if (action === "DELETE_BOOKING" && id) {
      const ok = deleteBooking(id);
      return NextResponse.json({ success: ok });
    }

    if (action === "DELETE_SAHAYAK" && id) {
      const ok = deleteSahayak(id);
      return NextResponse.json({ success: ok });
    }

    if (action === "DELETE_PNR" && id) {
      const ok = deletePnr(id);
      return NextResponse.json({ success: ok });
    }

    return NextResponse.json(
      { success: false, error: "Invalid delete parameters" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
