import { vi, describe, it, expect, beforeAll } from "vitest";

// Set FLIGHT_PROVIDER before any service call — adapter is loaded lazily
vi.stubEnv("FLIGHT_PROVIDER", "mock_fake");
import { searchWithStopover, discoverStopovers } from "../services/flights.js";

// --- Scenario 1: IST stopover cheaper than direct ---
// Inputs: MXP→IST €89, IST→BKK €245, BKK→MXP €389, direct MXP→BKK €888
// Expected derived by hand: combined = 89+245+389 = 723, savings = 888-723 = 165
describe("searchWithStopover via IST — cheaper than direct", () => {
  let result;
  beforeAll(async () => {
    result = await searchWithStopover({
      origin: "MXP", destination: "BKK", stopover: "IST",
      outboundDate: "2026-06-10", returnDate: "2026-06-20", stopoverNights: 3,
    });
  });

  it("sums all three leg prices into bestCombinedPrice", () => {
    expect(result.summary.bestCombinedPrice).toBe(723);
  });

  it("finds the direct flight price", () => {
    expect(result.summary.directPrice).toBe(888);
  });

  it("calculates savings as direct minus combined", () => {
    expect(result.summary.savings).toBe(165);
  });

  it("returns three legs in the correct order", () => {
    expect(result.legs[0].id).toBe("outbound1");
    expect(result.legs[1].id).toBe("outbound2");
    expect(result.legs[2].id).toBe("return");
  });
});

// --- Scenario 2: DOH stopover more expensive than direct ---
// Inputs: MXP→DOH €400, DOH→BKK €350, BKK→MXP €389, direct MXP→BKK €888
// Expected: combined = 400+350+389 = 1139, savings = 888-1139 = -251
describe("searchWithStopover via DOH — more expensive than direct", () => {
  let result;
  beforeAll(async () => {
    result = await searchWithStopover({
      origin: "MXP", destination: "BKK", stopover: "DOH",
      outboundDate: "2026-06-10", returnDate: "2026-06-20", stopoverNights: 3,
    });
  });

  it("sums all three leg prices into bestCombinedPrice", () => {
    expect(result.summary.bestCombinedPrice).toBe(1139);
  });

  it("savings is negative when stopover costs more than direct", () => {
    expect(result.summary.savings).toBe(-251);
  });
});

// --- Scenario 3: no direct flight to JFK ---
// Inputs: MXP→IST €89, IST→JFK €310, JFK→MXP €290, direct MXP→JFK: none
// Expected: combined = 89+310+290 = 689, directPrice = null, savings = null
describe("searchWithStopover via IST to JFK — no direct flight exists", () => {
  let result;
  beforeAll(async () => {
    result = await searchWithStopover({
      origin: "MXP", destination: "JFK", stopover: "IST",
      outboundDate: "2026-06-10", returnDate: "2026-06-20", stopoverNights: 3,
    });
  });

  it("calculates combined price across all three legs", () => {
    expect(result.summary.bestCombinedPrice).toBe(689);
  });

  it("directPrice is null when no direct flight exists", () => {
    expect(result.summary.directPrice).toBeNull();
  });

  it("savings is null when directPrice is null", () => {
    expect(result.summary.savings).toBeNull();
  });
});

// --- Scenario 4: discoverStopovers ranks by savings ---
// IST saves €165, DOH saves €-251 → IST must appear before DOH
describe("discoverStopovers — ranks stopovers by savings descending", () => {
  let results;
  beforeAll(async () => {
    results = await discoverStopovers({
      origin: "MXP", destination: "BKK",
      outboundDate: "2026-06-10", returnDate: "2026-06-20", stopoverNights: 3,
    });
  });

  it("includes IST in results", () => {
    expect(results.some(r => r.stopover.iata === "IST")).toBe(true);
  });

  it("includes DOH in results", () => {
    expect(results.some(r => r.stopover.iata === "DOH")).toBe(true);
  });

  it("ranks IST before DOH (higher savings first)", () => {
    const istIndex = results.findIndex(r => r.stopover.iata === "IST");
    const dohIndex = results.findIndex(r => r.stopover.iata === "DOH");
    expect(istIndex).toBeLessThan(dohIndex);
  });

  it("filters out stopovers with no price data", () => {
    results.forEach(r => expect(r.summary.bestCombinedPrice).not.toBeNull());
  });
});
