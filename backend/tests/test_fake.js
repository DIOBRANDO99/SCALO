// Requires FLIGHT_PROVIDER=mock_fake in .env
// Tests service logic against controlled fake data — not real prices.
// Expected values are derived from reading mock_fake.js directly.

import { searchWithStopover, discoverStopovers } from "../services/flights.js";

function pass(condition) {
  return condition ? "PASS" : "FAIL";
}

// --- Scenario 1: stopover via IST cheaper than direct ---
// mock_fake: MXP→IST €89, IST→BKK €245, BKK→MXP €389, direct MXP→BKK €888
// combined = 89+245+389 = 723, savings = 888-723 = 165
console.log("=== SCENARIO 1: stopover via IST cheaper than direct MXP→BKK ===");
const s1 = await searchWithStopover({
  origin: "MXP", destination: "BKK", stopover: "IST",
  outboundDate: "2026-06-10", returnDate: "2026-06-20", stopoverNights: 3,
});
s1.legs.forEach(l => console.log(`  ${l.id}: ${l.origin}→${l.destination}, best: €${l.bestPrice}`));
console.log("summary:", s1.summary);
console.log("EXPECTED: combined €723, direct €888, savings €165");
console.log(pass(
  s1.summary.bestCombinedPrice === 723 &&
  s1.summary.directPrice === 888 &&
  s1.summary.savings === 165
), "\n");

// --- Scenario 2: stopover via DOH more expensive than direct ---
// mock_fake: MXP→DOH €400, DOH→BKK €350, BKK→MXP €389, direct MXP→BKK €888
// combined = 400+350+389 = 1139, savings = 888-1139 = -251
console.log("=== SCENARIO 2: stopover via DOH more expensive than direct MXP→BKK ===");
const s2 = await searchWithStopover({
  origin: "MXP", destination: "BKK", stopover: "DOH",
  outboundDate: "2026-06-10", returnDate: "2026-06-20", stopoverNights: 3,
});
s2.legs.forEach(l => console.log(`  ${l.id}: ${l.origin}→${l.destination}, best: €${l.bestPrice}`));
console.log("summary:", s2.summary);
console.log("EXPECTED: combined €1139, direct €888, savings €-251");
console.log(pass(
  s2.summary.bestCombinedPrice === 1139 &&
  s2.summary.directPrice === 888 &&
  s2.summary.savings === -251
), "\n");

// --- Scenario 3: no direct flight MXP→JFK ---
// mock_fake: MXP→JFK returns empty → directPrice null, savings null
// legs exist: MXP→IST €89, IST→JFK €310, JFK→MXP €290 → combined €689
console.log("=== SCENARIO 3: no direct flight MXP→JFK, savings should be null ===");
const s3 = await searchWithStopover({
  origin: "MXP", destination: "JFK", stopover: "IST",
  outboundDate: "2026-06-10", returnDate: "2026-06-20", stopoverNights: 3,
});
s3.legs.forEach(l => console.log(`  ${l.id}: ${l.origin}→${l.destination}, best: €${l.bestPrice}`));
console.log("summary:", s3.summary);
console.log("EXPECTED: combined €689, directPrice null, savings null");
console.log(pass(
  s3.summary.bestCombinedPrice === 689 &&
  s3.summary.directPrice === null &&
  s3.summary.savings === null
), "\n");

// --- Scenario 4: discoverStopovers ranks IST (savings €165) above DOH (savings €-251) ---
console.log("=== SCENARIO 4: discoverStopovers ranks IST above DOH ===");
const s4 = await discoverStopovers({
  origin: "MXP", destination: "BKK",
  outboundDate: "2026-06-10", returnDate: "2026-06-20", stopoverNights: 3,
});
s4.forEach(r => console.log(`  ${r.stopover.iata} — combined: €${r.summary.bestCombinedPrice}, savings: €${r.summary.savings}`));
const istIndex = s4.findIndex(r => r.stopover.iata === "IST");
const dohIndex = s4.findIndex(r => r.stopover.iata === "DOH");
console.log("EXPECTED: IST ranked before DOH");
console.log(pass(istIndex !== -1 && dohIndex !== -1 && istIndex < dohIndex));
