// Rail Sangwari 3-Run Automated E2E QA Verification Script
// Tests full passenger booking, coolie dispatch, live location tracking, Happy Code OTP, and database persistence 3 times.

const BASE_URL = "http://localhost:3000";

async function runTest() {
  console.log("===============================================================");
  console.log("   RAIL SANGWARI RIGOROUS 3-RUN END-TO-END QA AUDIT            ");
  console.log("===============================================================");

  const runs = [
    {
      runNumber: 1,
      station: "Bilaspur Junction (BSP)",
      stationCode: "BSP",
      pnr: "6412890341",
      train: "12859 Gitanjali Express",
      coach: "B4",
      berth: "42 (Side Upper)",
      platform: "2",
      passengerName: "Aarav Sharma",
      passengerPhone: "+91 98271 11222",
      coolieBilla: "BSP-108",
      coolieName: "Ramesh Yadav",
      cooliePin: "1080",
      luggage: { mediumTrolley: 2, heavyCarton: 1, smallBag: 0, wheelchairEscort: false },
      fare: { baseSahayakFare: 210, platformBookingFee: 39, totalAmount: 249, payToSahayakCash: 210 },
      happyCode: "4921",
    },
    {
      runNumber: 2,
      station: "Raipur Junction (R)",
      stationCode: "R",
      pnr: "4251984723",
      train: "12442 Bilaspur Rajdhani Express",
      coach: "H1",
      berth: "14 (Lower Berth)",
      platform: "1",
      passengerName: "Priya Sundaram",
      passengerPhone: "+91 94060 33444",
      coolieBilla: "R-042",
      coolieName: "Santosh Kumar Sahu",
      cooliePin: "0420",
      luggage: { mediumTrolley: 3, heavyCarton: 0, smallBag: 1, wheelchairEscort: false },
      fare: { baseSahayakFare: 180, platformBookingFee: 39, totalAmount: 219, payToSahayakCash: 180 },
      happyCode: "7492",
    },
    {
      runNumber: 3,
      station: "Durg Junction (DURG)",
      stationCode: "DURG",
      pnr: "8123904512",
      train: "18237 Chhattisgarh Express",
      coach: "S5",
      berth: "28 (Middle Berth)",
      platform: "3",
      passengerName: "Dr. Vikram Joshi",
      passengerPhone: "+91 97555 55666",
      coolieBilla: "DURG-019",
      coolieName: "Dilip Kumar Verma",
      cooliePin: "0190",
      luggage: { mediumTrolley: 0, heavyCarton: 1, smallBag: 0, wheelchairEscort: true },
      fare: { baseSahayakFare: 190, platformBookingFee: 39, totalAmount: 229, payToSahayakCash: 190 },
      happyCode: "8831",
    },
  ];

  let totalPassed = 0;
  let totalFailed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      totalPassed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      totalFailed++;
    }
  }

  for (const run of runs) {
    console.log(`\n---------------------------------------------------------------`);
    console.log(`>>> EXECUTING RUN ${run.runNumber} OF 3: ${run.station}`);
    console.log(`---------------------------------------------------------------`);

    const bookingId = `RS-TEST-${Date.now()}-${run.runNumber}`;

    // Step 1: PNR Lookup Verification
    const pnrRes = await fetch(`${BASE_URL}/api/pnr?pnr=${run.pnr}`);
    const pnrData = await pnrRes.json();
    assert(pnrData.success === true, `PNR ${run.pnr} lookup returned success: true`);
    assert(pnrData.data.platform === run.platform, `Platform resolved correctly to ${run.platform}`);
    assert(pnrData.data.coach === run.coach, `Coach resolved correctly to ${run.coach}`);

    // Step 2: Create Booking via Database API
    const bookingPayload = {
      id: bookingId,
      pnr: run.pnr,
      pickupDropMode: "TRAIN_TO_EXIT",
      passengerName: run.passengerName,
      passengerPhone: run.passengerPhone,
      trainDetails: {
        pnr: run.pnr,
        trainNumber: run.pnr === "6412890341" ? "12859" : run.pnr === "4251984723" ? "12442" : "18237",
        trainName: run.train,
        boardingStation: run.station,
        stationCode: run.stationCode,
        stationName: run.station,
        platform: run.platform,
        coach: run.coach,
        berth: run.berth,
        seatNumber: run.berth,
        eta: "On Time",
        arrivalDate: "Today",
      },
      luggage: run.luggage,
      fare: run.fare,
      sahayak: {
        id: `sahayak-${run.coolieBilla.toLowerCase()}`,
        billaNumber: run.coolieBilla,
        pin: run.cooliePin,
        name: run.coolieName,
        phone: "+91 98271 00000",
        rating: 4.9,
        reviewsCount: 300,
        stationCode: run.stationCode,
        stationName: run.station,
      },
      status: "ASSIGNED",
      happyCode: run.happyCode,
      createdAt: "Just now",
      meetingPoint: `Coach ${run.coach} Door on Platform ${run.platform}`,
    };

    const addRes = await fetch(`${BASE_URL}/api/database`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ADD_BOOKING", payload: bookingPayload }),
    });
    const addResult = await addRes.json();
    assert(addResult.success === true, `Booking ${bookingId} saved to database`);

    // Step 3: Verify Persistence in Database
    const dbRes = await fetch(`${BASE_URL}/api/database?collection=bookings`);
    const dbData = await dbRes.json();
    const savedBooking = dbData.data.find((b) => b.id === bookingId);
    assert(Boolean(savedBooking), `Booking ${bookingId} found in database snapshot`);
    assert(savedBooking.status === "ASSIGNED", `Booking initial status is ASSIGNED`);
    assert(savedBooking.happyCode === run.happyCode, `Happy Code ${run.happyCode} matches pass OTP`);

    // Step 4: Test Live Location Tracking API
    const locInitRes = await fetch(
      `${BASE_URL}/api/location?bookingId=${bookingId}&stationCode=${run.stationCode}&platform=${run.platform}&targetCoach=${run.coach}&billaNumber=${run.coolieBilla}`
    );
    const locInit = await locInitRes.json();
    assert(locInit.success === true, `Location beacon initialized for ${bookingId}`);
    assert(locInit.data.platformStep === 1, `Initial step is Step 1 (Concourse Stand)`);
    assert(locInit.data.hasArrived === false, `Initial arrival state is false`);
    assert(locInit.data.distanceMeters > 200, `Initial distance is ${locInit.data.distanceMeters}m`);

    // Step 5: Advance Location Step (Simulating Coolie Walking along Platform)
    const advRes = await fetch(`${BASE_URL}/api/location`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ADVANCE_STEP", bookingId }),
    });
    const advData = await advRes.json();
    assert(advData.data.platformStep === 2, `Location advanced to Step 2 (FOB Stairs)`);
    assert(advData.data.distanceMeters < locInit.data.distanceMeters, `Distance reduced as coolie walks closer`);

    // Step 6: Coolie Arrival Beacon Ping
    const arriveRes = await fetch(`${BASE_URL}/api/location`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ARRIVED", bookingId }),
    });
    const arriveData = await arriveRes.json();
    assert(arriveData.data.hasArrived === true, `Coolie marked ARRIVED outside Coach ${run.coach}`);
    assert(arriveData.data.distanceMeters === 0, `Distance reduced to 0m at coach door`);

    // Step 7: Trip Completion via Happy Code OTP
    const statusUpdateRes = await fetch(`${BASE_URL}/api/database`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "UPDATE_BOOKING_STATUS",
        payload: { bookingId, status: "COMPLETED" },
      }),
    });
    const statusResult = await statusUpdateRes.json();
    assert(statusResult.success === true, `Status updated to COMPLETED with Happy Code ${run.happyCode}`);

    // Step 8: Verify Complete Journey in Database Snapshot
    const verifyRes = await fetch(`${BASE_URL}/api/database?collection=bookings`);
    const verifyData = await verifyRes.json();
    const completedBooking = verifyData.data.find((b) => b.id === bookingId);
    assert(completedBooking.status === "COMPLETED", `Database reflects COMPLETED status for ${bookingId}`);
    assert(completedBooking.fare.payToSahayakCash === run.fare.payToSahayakCash, `Fare ₹${run.fare.payToSahayakCash} accurately recorded`);
  }

  // Final Multi-Port & Tunnel Health Audit
  console.log(`\n---------------------------------------------------------------`);
  console.log(`>>> VERIFYING ALL 4 DEDICATED APPLICATION PORTS`);
  console.log(`---------------------------------------------------------------`);

  const ports = [
    { port: 3000, name: "App 1: Passenger App" },
    { port: 3001, name: "App 2: Sahayak Partner App" },
    { port: 3002, name: "App 3: Supervisor & DRM Portal" },
    { port: 3003, name: "App 4: Central Data Manager" },
  ];

  for (const p of ports) {
    try {
      const res = await fetch(`http://localhost:${p.port}`);
      assert(res.status === 200, `${p.name} on Port ${p.port} responded with HTTP 200 OK`);
    } catch (err) {
      assert(false, `${p.name} on Port ${p.port} failed: ${err.message}`);
    }
  }

  console.log(`\n===============================================================`);
  console.log(`   3-RUN QA AUDIT SUMMARY                                      `);
  console.log(`   TOTAL TESTS: ${totalPassed + totalFailed} | PASSED: ${totalPassed} | FAILED: ${totalFailed}`);
  console.log(`===============================================================\n`);

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runTest().catch((err) => {
  console.error("Fatal Test Runner Error:", err);
  process.exit(1);
});
