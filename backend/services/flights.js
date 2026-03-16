import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
config({ path: join(dirname(fileURLToPath(import.meta.url)), "../.env") });

const adapterMap = {
  serpapi:   "../adapters/serpapi.js",
  mock_fake: "../adapters/mock_fake.js",
  mock_real: "../adapters/mock_real.js",
};

const adapterPath = adapterMap[process.env.FLIGHT_PROVIDER] ?? "../adapters/mock.js";
const adapter = await import(adapterPath);

const HUB_CITIES = [
  "IST", "AUH", "DOH", "DXB", "LHR",
  "CDG", "FRA", "ZRH", "WAW", "MCT",
  "BAH", "MAD", "SIN", "HKG", "JFK", "ORD"
];

function addDays(dateStr, days) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

function extractFlights(raw) {
  return [...(raw.best_flights ?? []), ...(raw.other_flights ?? [])];
}

function cheapestPrice(flights) {
  const prices = flights.map(f => f.price).filter(p => typeof p === "number");
  return prices.length > 0 ? Math.min(...prices) : null;
}

export async function searchWithStopover({ origin, destination, stopover, outboundDate, returnDate, stopoverNights }) {
  const stopoverDepartureDate = addDays(outboundDate, stopoverNights);

  const [leg1Raw, leg2Raw, leg3Raw, directRaw] = await Promise.all([
    adapter.search({ departureId: origin,       arrivalId: stopover,     outboundDate,                        tripType: "2" }),
    adapter.search({ departureId: stopover,     arrivalId: destination,  outboundDate: stopoverDepartureDate, tripType: "2" }),
    adapter.search({ departureId: destination,  arrivalId: origin,       outboundDate: returnDate,            tripType: "2" }),
    adapter.search({ departureId: origin,       arrivalId: destination,  outboundDate,              returnDate,              tripType: "1" }),
  ]);

  const leg1Options = extractFlights(leg1Raw);
  const leg2Options = extractFlights(leg2Raw);
  const leg3Options = extractFlights(leg3Raw);
  const directFlights = extractFlights(directRaw);

  const bestLeg1Price = cheapestPrice(leg1Options);
  const bestLeg2Price = cheapestPrice(leg2Options);
  const bestLeg3Price = cheapestPrice(leg3Options);
  const directPrice   = cheapestPrice(directFlights.filter(f => !f.layovers || f.layovers.length === 0));

  const bestCombinedPrice = bestLeg1Price !== null && bestLeg2Price !== null && bestLeg3Price !== null
    ? bestLeg1Price + bestLeg2Price + bestLeg3Price
    : null;

  const savings = directPrice !== null && bestCombinedPrice !== null
    ? directPrice - bestCombinedPrice
    : null;

  return {
    stopover: { iata: stopover, nights: stopoverNights },
    legs: [
      { id: "outbound1", origin,       destination: stopover,     date: outboundDate,          bestPrice: bestLeg1Price, options: leg1Options },
      { id: "outbound2", origin: stopover, destination,           date: stopoverDepartureDate, bestPrice: bestLeg2Price, options: leg2Options },
      { id: "return",    origin: destination, destination: origin, date: returnDate,           bestPrice: bestLeg3Price, options: leg3Options },
    ],
    summary: { bestCombinedPrice, directPrice, savings, currency: "EUR" },
  };
}

export async function discoverStopovers({ origin, destination, outboundDate, returnDate, stopoverNights }) {
  const results = await Promise.all(
    HUB_CITIES.map(city =>
      searchWithStopover({ origin, destination, stopover: city, outboundDate, returnDate, stopoverNights })
    )
  );

  return results
    .filter(r => r.summary.bestCombinedPrice !== null)
    .sort((a, b) => (b.summary.savings ?? -Infinity) - (a.summary.savings ?? -Infinity));
}
