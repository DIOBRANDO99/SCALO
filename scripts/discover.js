import "dotenv/config";
import { getJson } from "serpapi";

// --- Config ---
const ORIGIN          = "MXP";   // change this to test other departure cities
const OUTBOUND        = "2026-06-10";
const RETURN          = "2026-06-20";
const MIN_LAYOVER_MIN = 180;      // 3h minimum to actually explore the city

// --- 20 most desired tourist destinations ---
const DESTINATIONS = [
  { code: "JFK", label: "New York" },
  { code: "LAX", label: "Los Angeles" },
  { code: "NRT", label: "Tokyo" },
  { code: "BKK", label: "Bangkok" },
  { code: "SYD", label: "Sydney" },
  { code: "DXB", label: "Dubai" },
  { code: "SIN", label: "Singapore" },
  { code: "GRU", label: "São Paulo" },
  { code: "MEX", label: "Mexico City" },
  { code: "JNB", label: "Johannesburg" },
  { code: "LIM", label: "Lima" },
  { code: "MNL", label: "Manila" },
  { code: "HKG", label: "Hong Kong" },
  { code: "ICN", label: "Seoul" },
  { code: "YYZ", label: "Toronto" },
  { code: "CPT", label: "Cape Town" },
  { code: "DEL", label: "New Delhi" },
  { code: "BOM", label: "Mumbai" },
  { code: "AKL", label: "Auckland" },
  { code: "ORD", label: "Chicago" },
];
// ------------------------------------------------

async function probeRoute(destination) {
  const base = {
    engine: "google_flights",
    departure_id: ORIGIN,
    arrival_id: destination.code,
    outbound_date: OUTBOUND,
    return_date: RETURN,
    type: "1",
    currency: "EUR",
    hl: "en",
    api_key: process.env.SERPAPI_KEY,
  };

  const [directRaw, stopRaw] = await Promise.all([
    getJson({ ...base, stops: "1" }),  // nonstop only
    getJson({ ...base, stops: "2" }),  // 1 stop or fewer
  ]);

  const directFlights = [...(directRaw.best_flights ?? []), ...(directRaw.other_flights ?? [])];
  const stopFlights   = [...(stopRaw.best_flights ?? []),   ...(stopRaw.other_flights ?? [])];

  const directPrices = directFlights.map(f => f.price).filter(p => typeof p === "number");
  const directPrice  = directPrices.length > 0 ? Math.min(...directPrices) : null;

  const candidates = stopFlights
    .filter(f => typeof f.price === "number")
    .filter(f => f.layovers?.some(l => l.duration >= MIN_LAYOVER_MIN))
    .filter(f => directPrice === null || f.price < directPrice)
    .map(f => {
      const bestLayover = [...f.layovers]
        .filter(l => l.duration >= MIN_LAYOVER_MIN)
        .sort((a, b) => b.duration - a.duration)[0];
      return {
        ...f,
        savings: directPrice !== null ? directPrice - f.price : null,
        bestLayover,
      };
    })
    .sort((a, b) => (b.savings ?? 0) - (a.savings ?? 0));

  return { destination, directPrice, candidates };
}

function fmtDuration(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h${m}m` : `${h}h`;
}

// --- MAIN ---
console.log(`\nSCALO – Discovery mode`);
console.log(`From: ${ORIGIN}  |  Outbound: ${OUTBOUND}  |  Return: ${RETURN}`);
console.log(`Min layover: ${MIN_LAYOVER_MIN} min  |  Probing ${DESTINATIONS.length} destinations\n`);

const results = [];

for (const dest of DESTINATIONS) {
  process.stdout.write(`  Checking ${ORIGIN}→${dest.code} (${dest.label})...`);
  const result = await probeRoute(dest);
  const hits = result.candidates.length;
  process.stdout.write(` ${hits > 0 ? hits + " match(es)" : "none"}\n`);
  if (hits > 0) results.push(result);
}

// Sort all findings: routes with savings first, then by best savings amount
results.sort((a, b) => {
  const aSavings = a.candidates[0].savings ?? -1;
  const bSavings = b.candidates[0].savings ?? -1;
  return bSavings - aSavings;
});

console.log(`\n${"=".repeat(80)}`);
console.log(` RESULTS — ${results.length} route(s) with explorable layovers`);
console.log(`${"=".repeat(80)}\n`);

if (results.length === 0) {
  console.log("No interesting stopovers found across all destinations.");
} else {
  for (const { destination, directPrice, candidates } of results) {
    const directStr = directPrice ? `direct €${directPrice}` : "no direct flight";
    console.log(`${ORIGIN} → ${destination.code} (${destination.label})  [${directStr}]`);

    candidates.slice(0, 3).forEach(f => {
      const l        = f.bestLayover;
      const duration = fmtDuration(l.duration);
      const overnight = l.overnight ? " [overnight]" : "";
      const savings  = f.savings !== null ? `  ✓ SAVE €${f.savings}` : "";
      console.log(`    ↳ ${l.id.padEnd(4)} ${l.name.padEnd(45)} ${duration.padEnd(8)} €${String(f.price).padEnd(6)}${savings}${overnight}`);
    });
    console.log();
  }
}
