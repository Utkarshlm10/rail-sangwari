// Test Coach Platform Visualizer logic and rake composition
import assert from "node:assert";

console.log("=========================================");
console.log("  COACH & FOB PLATFORM VISUALIZER AUDIT  ");
console.log("=========================================\n");

// Standard LHB Rake
const rawRake = [
  { code: "EOG", type: "Generator Car", fullName: "End on Generation Van" },
  { code: "GS1", type: "General Unreserved", fullName: "General Class" },
  { code: "GS2", type: "General Unreserved", fullName: "General Class", landmark: "FOB 1 (Main Entrance)", landmarkType: "FOB" },
  { code: "S1", type: "Sleeper Class (SL)", fullName: "Sleeper Class 1" },
  { code: "S2", type: "Sleeper Class (SL)", fullName: "Sleeper Class 2" },
  { code: "S3", type: "Sleeper Class (SL)", fullName: "Sleeper Class 3", landmark: "Platform Escalator", landmarkType: "ESCALATOR" },
  { code: "S4", type: "Sleeper Class (SL)", fullName: "Sleeper Class 4" },
  { code: "S5", type: "Sleeper Class (SL)", fullName: "Sleeper Class 5" },
  { code: "S6", type: "Sleeper Class (SL)", fullName: "Sleeper Class 6" },
  { code: "PC", type: "Pantry Car", fullName: "Pantry Car", landmark: "Water Vending ATM", landmarkType: "WATER" },
  { code: "B1", type: "AC 3-Tier (3A)", fullName: "AC 3 Tier 1" },
  { code: "B2", type: "AC 3-Tier (3A)", fullName: "AC 3 Tier 2" },
  { code: "B3", type: "AC 3-Tier (3A)", fullName: "AC 3 Tier 3", landmark: "Central FOB 2 & Lift", landmarkType: "LIFT" },
  { code: "B4", type: "AC 3-Tier (3A)", fullName: "AC 3 Tier 4", landmark: "Central FOB 2 Stairs", landmarkType: "FOB" },
  { code: "B5", type: "AC 3-Tier (3A)", fullName: "AC 3 Tier 5" },
  { code: "B6", type: "AC 3-Tier (3A)", fullName: "AC 3 Tier 6" },
  { code: "M1", type: "AC 3-Tier Economy", fullName: "3E Economy" },
  { code: "A1", type: "AC 2-Tier (2A)", fullName: "AC 2 Tier 1", landmark: "FOB 3 (East Overbridge)", landmarkType: "FOB" },
  { code: "A2", type: "AC 2-Tier (2A)", fullName: "AC 2 Tier 2" },
  { code: "H1", type: "AC 1st Class (1A)", fullName: "AC First Class" },
  { code: "GS3", type: "General Unreserved", fullName: "General Class 3" },
  { code: "SLR", type: "Luggage & Brake Van", fullName: "Guard / Brake Van", landmark: "Station Exit Gate", landmarkType: "EXIT" },
];

function getRakeWithTarget(target) {
  const norm = (target || "B4").toUpperCase().trim();
  const exists = rawRake.some((c) => c.code === norm);
  if (exists) return rawRake;
  const copy = [...rawRake];
  copy.splice(13, 0, {
    code: norm,
    type: "Target Coach",
    fullName: `Coach ${norm}`,
    landmark: "Central FOB 2 Stairs",
    landmarkType: "FOB",
  });
  return copy;
}

// 1. Verify standard rake contains 22 coaches
assert.strictEqual(rawRake.length, 22, "Standard rake should have 22 coaches");
console.log("[PASS] Standard LHB rake verified with 22 coaches");

// 2. Verify target coach B4 is in rake and aligned with Central FOB 2
const b4Rake = getRakeWithTarget("B4");
const b4Coach = b4Rake.find(c => c.code === "B4");
assert.ok(b4Coach, "Coach B4 must exist in rake");
assert.strictEqual(b4Coach.landmark, "Central FOB 2 Stairs", "B4 should align with Central FOB 2");
console.log("[PASS] Target Coach B4 correctly anchored to Central FOB 2 Stairs");

// 3. Verify target coach H1 (Rajdhani) is in rake
const h1Rake = getRakeWithTarget("H1");
const h1Coach = h1Rake.find(c => c.code === "H1");
assert.ok(h1Coach, "Coach H1 must exist in rake");
console.log("[PASS] First AC Coach H1 found in standard rake");

// 4. Verify custom/unlisted coach injection
const customRake = getRakeWithTarget("D1");
const d1Coach = customRake.find(c => c.code === "D1");
assert.ok(d1Coach, "Custom Coach D1 must be dynamically injected");
assert.strictEqual(customRake.length, 23, "Rake length should expand to 23 with custom coach");
console.log("[PASS] Dynamic custom coach D1 safely injected into rake");

// 5. Verify physical landmarks distribution
const landmarks = rawRake.filter(c => c.landmark);
assert.ok(landmarks.length >= 6, "Must have at least 6 platform landmarks");
console.log(`[PASS] ${landmarks.length} physical platform landmarks mapped across train rake`);

console.log("\nALL VISUALIZER LOGIC TESTS PASSED!");
