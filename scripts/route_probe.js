import "dotenv/config";
import { getJson } from "serpapi";

// --- Routes to probe (edit freely) ---
const ROUTES = [
  { origin: "MXP", destination: "NRT" },  // Tokyo
  { origin: "MXP", destination: "SYD" },  // Sydney
  { origin: "MXP", destination: "MEX" },  // Mexico City
  { origin: "MXP", destination: "JNB" },  // Johannesburg
  { origin: "MXP", destination: "MNL" },  // Manila
  { origin: "MXP", destination: "LIM" },  // Lima
  { origin: "MXP", destination: "JFK" },  // New York
  { origin: "FCO", destination: "ORD" },  // Chicago
  { origin: "MXP", destination: "DXB" },  // Dubai
];

const OUTBOUND          = "2026-06-10";
const RETURN            = "2026-06-20";
const MIN_LAYOVER_MIN   = 180;  // 3h minimum to explore the city
// --------------------------------------

async function probeRoute({ origin, destination }) {
  const base = {
    engine: "google_flights",
    departure_id: origin,
    arrival_id: destination,
    outbound_date: OUTBOUND,
    return_date: RETURN,
    type: "1",
    currency: "EUR",
    hl: "en",
    api_key: process.env.SERPAPI_KEY,
  };

  const [directRaw, stopRaw] = await Promise.all([
    getJson({ ...base, stops: "1" }),  // nonstop only
    getJson({ ...base, stops: "2" }),
  ]);

  const directFlights = [...(directRaw.best_flights ?? []), ...(directRaw.other_flights ?? [])];
  const stopFlights   = [...(stopRaw.best_flights ?? []),   ...(stopRaw.other_flights ?? [])];

  const directPrices = directFlights.map(f => f.price).filter(p => typeof p === "number");
  const directPrice  = directPrices.length > 0 ? Math.min(...directPrices) : null;

  const interesting = stopFlights
    .filter(f => typeof f.price === "number")
    .filter(f => f.layovers?.some(l => l.duration >= MIN_LAYOVER_MIN))
    .filter(f => directPrice === null || f.price < directPrice)
    .map(f => {
      const bestLayover = [...f.layovers]
        .filter(l => l.duration >= MIN_LAYOVER_MIN)
        .sort((a, b) => b.duration - a.duration)[0];
      return { ...f, savings: directPrice ? directPrice - f.price : null, bestLayover };
    })
    .sort((a, b) => (b.savings ?? 0) - (a.savings ?? 0));

  return { origin, destination, directPrice, stopCount: stopFlights.length, interesting };
}

// --- MAIN ---
console.log(`\nSCALO – Route probe`);
console.log(`Outbound: ${OUTBOUND}  |  Return: ${RETURN}`);
console.log(`Min layover: ${MIN_LAYOVER_MIN} min\n`);
const COL = { route: 14, direct: 12, stops: 8, matches: 10 };

console.log(
  `${"Route".padEnd(COL.route)} ${"Direct".padEnd(COL.direct)} ${"Stops".padEnd(COL.stops)} ${"Matches"}`
);
console.log("─".repeat(60));

for (const route of ROUTES) {
  process.stdout.write(`${(route.origin + "→" + route.destination).padEnd(COL.route)} `);
  const result = await probeRoute(route);

  const direct = result.directPrice ? `€${result.directPrice}` : "none";
  const hits   = result.interesting.length;
  console.log(
    `${direct.padEnd(COL.direct)} ${String(result.stopCount).padEnd(COL.stops)} ${hits} match${hits !== 1 ? "es" : ""}`
  );

  if (hits > 0) {
    result.interesting.slice(0, 3).forEach(f => {
      const l        = f.bestLayover;
      const hours    = Math.floor(l.duration / 60) + "h" + (l.duration % 60 > 0 ? (l.duration % 60) + "m" : "");
      const overnight = l.overnight ? " [overnight]" : "";
      const savings  = f.savings !== null ? `  SAVE €${f.savings}` : "";
      console.log(`    ↳ ${l.id.padEnd(4)} ${l.name.padEnd(45)} ${hours.padEnd(8)} €${String(f.price).padEnd(6)}${savings}${overnight}`);
    });
  }
}
