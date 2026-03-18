import "dotenv/config";
import { readFileSync } from "fs";
import { searchWithStopover } from "../services/flights.js";

// --- Independently derive expected values from raw SerpAPI responses ---
// These files are the ground truth. The test reads them separately from the
// service, computes expected prices itself, then checks the service agrees.

const leg1Raw    = JSON.parse(readFileSync("../../doc/api_samples/leg_MXP_IST_oneway.json",   "utf8"));
const leg2Raw    = JSON.parse(readFileSync("../../doc/api_samples/leg_IST_BKK_oneway.json",   "utf8"));
const leg3Raw    = JSON.parse(readFileSync("../../doc/api_samples/leg_BKK_MXP_oneway.json",   "utf8"));
const directRaw  = JSON.parse(readFileSync("../../doc/api_samples/leg_MXP_BKK_roundtrip.json","utf8"));

function allFlights(raw) {
  return [...(raw.best_flights ?? []), ...(raw.other_flights ?? [])];
}

function cheapest(flights) {
  const prices = flights.map(f => f.price).filter(p => typeof p === "number");
  return prices.length > 0 ? Math.min(...prices) : null;
}

const expLeg1    = cheapest(allFlights(leg1Raw));
const expLeg2    = cheapest(allFlights(leg2Raw));
const expLeg3    = cheapest(allFlights(leg3Raw));
const expDirect  = cheapest(allFlights(directRaw).filter(f => !f.layovers || f.layovers.length === 0));
const expCombined = expLeg1 + expLeg2 + expLeg3;
const expSavings  = expDirect - expCombined;

console.log("=== Expected values derived independently from raw JSON ===");
console.log(`  leg1  MXP→IST:  €${expLeg1}`);
console.log(`  leg2  IST→BKK:  €${expLeg2}`);
console.log(`  return BKK→MXP: €${expLeg3}`);
console.log(`  direct MXP→BKK nonstop: €${expDirect}`);
console.log(`  combined: €${expCombined}, savings: €${expSavings}\n`);

// --- Run the service ---
const result = await searchWithStopover({
  origin: "MXP", destination: "BKK", stopover: "IST",
  outboundDate: "2026-06-10", returnDate: "2026-06-20", stopoverNights: 3,
});

console.log("=== SCENARIO: service output vs raw data ===");
result.legs.forEach(l =>
  console.log(`  ${l.id}: ${l.origin}→${l.destination} on ${l.date}, best: €${l.bestPrice}, options: ${l.options.length}`)
);
console.log("summary:", result.summary);

const pass =
  result.summary.bestCombinedPrice === expCombined &&
  result.summary.directPrice       === expDirect   &&
  result.summary.savings           === expSavings;

console.log(`\nEXPECTED: combined €${expCombined}, direct €${expDirect}, savings €${expSavings}`);
console.log("PASS:", pass);
