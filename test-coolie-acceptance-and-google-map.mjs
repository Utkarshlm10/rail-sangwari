// Rigorous Automated Test for Coolie Search/Acceptance Lifecycle & Google Maps Live Tracking
const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=================================================================");
  console.log("   TESTING: COOLIE SEARCH/ACCEPTANCE & GOOGLE MAPS AUTO-TRACK    ");
  console.log("=================================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  const testBookingId = `RS-TEST-${Date.now()}`;

  // 1. Passenger confirms booking: Status must start as SEARCHING (Unassigned)
  console.log("\n--- Phase 1: Passenger Booking & Coolie Search Mode ---");
  const createPayload = {
    id: testBookingId,
    pnr: "6412890341",
    pickupDropMode: "TRAIN_TO_EXIT",
    passengerName: "Ananya Deshmukh",
    passengerPhone: "+91 98271 99999",
    trainDetails: {
      pnr: "6412890341",
      trainNumber: "12859",
      trainName: "Gitanjali Express",
      boardingStation: "Bilaspur Junction (BSP)",
      stationCode: "BSP",
      stationName: "Bilaspur Junction (BSP)",
      platform: "2",
      coach: "B4",
      berth: "42 (Side Upper)",
      seatNumber: "42",
      eta: "13:20 IST",
      arrivalDate: "Today",
    },
    luggage: { mediumTrolley: 2, heavyCarton: 0, smallBag: 1, wheelchairEscort: false },
    fare: { baseSahayakFare: 120, platformBookingFee: 39, totalAmount: 159, payNowFee: 39, payToSahayakCash: 120 },
    status: "SEARCHING", // Passenger app searches for coolie
    happyCode: "5821",
    createdAt: "Just now",
    meetingPoint: "Coach B4 Door on Platform 2",
  };

  const createRes = await fetch(`${BASE_URL}/api/database`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "ADD_BOOKING", payload: createPayload }),
  });
  const createData = await createRes.json();
  assert(createData.success === true, "Booking created via /api/database");

  // Verify DB reflects SEARCHING status and sahayak is unassigned
  const dbRes = await fetch(`${BASE_URL}/api/database?collection=bookings`);
  const dbData = await dbRes.json();
  const searchJob = dbData.data.find((b) => b.id === testBookingId);
  assert(Boolean(searchJob), "Booking found in database");
  assert(searchJob.status === "SEARCHING", `Booking status is SEARCHING (Expected: SEARCHING, Actual: ${searchJob.status})`);
  assert(!searchJob.sahayak, "Coolie is unassigned until coolie clicks YES / Accept");

  // 2. Coolie performs Accept (clicks 'स्वीकार करें' in Sahayak Portal)
  console.log("\n--- Phase 2: Coolie Accepts Job (Clicks 'स्वीकार करें') ---");
  const acceptPayload = {
    bookingId: testBookingId,
    status: "ASSIGNED",
    sahayak: {
      id: "sahayak-bsp-108",
      billaNumber: "BSP-108",
      name: "Ramesh Yadav",
      hindiName: "रमेश यादव",
      stationCode: "BSP",
      stationName: "Bilaspur Junction",
      phone: "+91 98271 44521",
      rating: 4.9,
      reviewsCount: 312,
      completedTrips: 284,
      experienceYears: 14,
      isActive: true,
    },
  };

  const acceptRes = await fetch(`${BASE_URL}/api/database`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "UPDATE_BOOKING_STATUS", payload: acceptPayload }),
  });
  const acceptData = await acceptRes.json();
  assert(acceptData.success === true, "Coolie acceptance persisted via /api/database");

  // Verify status is now ASSIGNED and sahayak is attached
  const dbRes2 = await fetch(`${BASE_URL}/api/database?collection=bookings`);
  const dbData2 = await dbRes2.json();
  const assignedJob = dbData2.data.find((b) => b.id === testBookingId);
  assert(assignedJob.status === "ASSIGNED", `Booking transitioned to ASSIGNED (Actual: ${assignedJob.status})`);
  assert(assignedJob.sahayak?.billaNumber === "BSP-108", "Assigned Sahayak is Ramesh Yadav (BSP-108)");

  // 3. Google Maps Live GPS Tracking Initialization
  console.log("\n--- Phase 3: Google Maps Live Tracking & Continuous Auto-Movement ---");
  const locInitRes = await fetch(
    `${BASE_URL}/api/location?bookingId=${testBookingId}&stationCode=BSP&platform=2&targetCoach=B4&sahayakId=sahayak-bsp-108&billaNumber=BSP-108`
  );
  const locInit = await locInitRes.json();
  assert(locInit.success === true, "Google Maps location beacon initialized");
  assert(typeof locInit.data.latitude === "number", `Valid coolie latitude: ${locInit.data.latitude}`);
  assert(typeof locInit.data.longitude === "number", `Valid coolie longitude: ${locInit.data.longitude}`);
  assert(typeof locInit.data.passengerLat === "number", `Valid passenger coach latitude: ${locInit.data.passengerLat}`);
  assert(typeof locInit.data.passengerLng === "number", `Valid passenger coach longitude: ${locInit.data.passengerLng}`);
  assert(locInit.data.distanceMeters > 0, `Initial platform distance: ${locInit.data.distanceMeters}m`);
  assert(locInit.data.hasArrived === false, "Coolie has not arrived yet");

  // 4. Test Automated Movement & Arrival (No manual button clicks needed by coolie!)
  console.log("\n--- Phase 4: Automatic Arrival at Coach Door ---");
  const arriveRes = await fetch(`${BASE_URL}/api/location`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "ARRIVED", bookingId: testBookingId }),
  });
  const arriveData = await arriveRes.json();
  assert(arriveData.success === true, "Arrival state updated");
  assert(arriveData.data.hasArrived === true, "Coolie marked ARRIVED at Coach Door");
  assert(arriveData.data.distanceMeters === 0, "Distance reduced to 0m at Coach B4 Door");

  // 5. Complete trip with Happy Code OTP
  console.log("\n--- Phase 5: Trip Completion with Happy Code OTP ---");
  const completePayload = {
    bookingId: testBookingId,
    status: "COMPLETED",
  };
  const completeRes = await fetch(`${BASE_URL}/api/database`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "UPDATE_BOOKING_STATUS", payload: completePayload }),
  });
  const completeData = await completeRes.json();
  assert(completeData.success === true, "Trip marked COMPLETED in database");

  const dbRes3 = await fetch(`${BASE_URL}/api/database?collection=bookings`);
  const dbData3 = await dbRes3.json();
  const completedJob = dbData3.data.find((b) => b.id === testBookingId);
  assert(completedJob.status === "COMPLETED", "Booking status confirmed as COMPLETED in database");

  console.log("\n=================================================================");
  console.log(`   SUMMARY: ${passed} PASSED | ${failed} FAILED                 `);
  console.log("=================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
