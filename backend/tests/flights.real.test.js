// Non-circular test: the expected values are derived here by reading the raw JSON
// files directly, using a separate code path from the service.
// If the service has a bug in parsing or calculation, the two paths disagree.
import { vi, describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Set FLIGHT_PROVIDER before any service call — adapter is loaded lazily
vi.stubEnv("FLIGHT_PROVIDER", "mock_real");
import { searchWithStopover } from "../services/flights.js";

const samplesDir = join(dirname(fileURLToPath(import.meta.url)), "../../doc/api_samples");

function allFlights(raw) {
  return [...(raw.best_flights ?? []), ...(raw.other_flights ?? [])];
}

function cheapest(flights) {
  const prices = flights.map(f => f.price).filter(p => typeof p === "number");
  return prices.length > 0 ? Math.min(...prices) : null;
}

// Read raw JSON files independently — ground truth, separate from the service's code path
const leg1Raw   = JSON.parse(readFileSync(join(samplesDir, "leg_MXP_IST_oneway.json"),    "utf8"));
const leg2Raw   = JSON.parse(readFileSync(join(samplesDir, "leg_IST_BKK_oneway.json"),    "utf8"));
const leg3Raw   = JSON.parse(readFileSync(join(samplesDir, "leg_BKK_MXP_oneway.json"),    "utf8"));
const directRaw = JSON.parse(readFileSync(join(samplesDir, "leg_MXP_BKK_roundtrip.json"), "utf8"));

const expLeg1    = cheapest(allFlights(leg1Raw));
const expLeg2    = cheapest(allFlights(leg2Raw));
const expLeg3    = cheapest(allFlights(leg3Raw));
const expDirect  = cheapest(allFlights(directRaw).filter(f => !f.layovers || f.layovers.length === 0));
const expCombined = expLeg1 + expLeg2 + expLeg3;
const expSavings  = expDirect - expCombined;

describe("searchWithStopover MXP→IST→BKK (real sample data)", () => {
  let result;
  beforeAll(async () => {
    result = await searchWithStopover({
      origin: "MXP", destination: "BKK", stopover: "IST",
      outboundDate: "2026-06-10", returnDate: "2026-06-20", stopoverNights: 3,
    });
  });

  it("bestCombinedPrice matches sum derived independently from raw JSON", () => {
    expect(result.summary.bestCombinedPrice).toBe(expCombined);
  });

  it("directPrice matches nonstop price derived independently from raw JSON", () => {
    expect(result.summary.directPrice).toBe(expDirect);
  });

  it("savings matches directPrice minus combined, derived independently", () => {
    expect(result.summary.savings).toBe(expSavings);
  });

  it("returns three legs with correct origins and destinations", () => {
    expect(result.legs[0].origin).toBe("MXP");
    expect(result.legs[0].destination).toBe("IST");
    expect(result.legs[1].origin).toBe("IST");
    expect(result.legs[1].destination).toBe("BKK");
    expect(result.legs[2].origin).toBe("BKK");
    expect(result.legs[2].destination).toBe("MXP");
  });
});
