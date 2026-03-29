const adapterMap = {
  serpapi:        "../adapters/serpapi.js",
  mock_fake:      "../adapters/mock_fake.js",
  mock_real:      "../adapters/mock_real.js",
  mock_discover:  "../adapters/mock_discover.js",
};

async function getAdapter() {
  const path = adapterMap[process.env.FLIGHT_PROVIDER] ?? "../adapters/mock_real.js";
  return import(path);
}

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

function normalizeOption(o) {
  return {
    price:         o.price,
    totalDuration: o.total_duration,
    type:          o.type,
    airlineLogo:   o.airline_logo ?? null,
    bookingToken:  o.booking_token ?? null,
    carbonEmissions: o.carbon_emissions ? {
      grams:            o.carbon_emissions.this_flight,
      typicalGrams:     o.carbon_emissions.typical_for_this_route,
      differencePercent: o.carbon_emissions.difference_percent,
    } : null,
    layovers: o.layovers ?? [],
    flights: (o.flights ?? []).map(f => ({
      flightNumber:    f.flight_number ?? null,
      airline:         f.airline ?? null,
      airlineLogo:     f.airline_logo ?? null,
      airplane:        f.airplane ?? null,
      travelClass:     f.travel_class ?? null,
      duration:        f.duration,
      legroom:         f.legroom ?? null,
      departureAirport: f.departure_airport ?? null,
      arrivalAirport:   f.arrival_airport ?? null,
      overnight:        f.overnight ?? false,
      oftenDelayed:     f.often_delayed_by_over_30_min ?? false,
      ticketAlsoSoldBy: f.ticket_also_sold_by ?? [],
      planeAndCrewBy:   f.plane_and_crew_by ?? null,
    })),
  };
}

function extractFlights(raw) {
  return [...(raw.best_flights ?? []), ...(raw.other_flights ?? [])].map(normalizeOption);
}

function cheapestPrice(flights) {
  const prices = flights.map(f => f.price).filter(p => typeof p === "number");
  return prices.length > 0 ? Math.min(...prices) : null;
}

export async function searchWithStopover({ origin, destination, stopover, outboundDate, returnDate, stopoverNights }) {
  const adapter = await getAdapter();
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

  const directPrice = cheapestPrice(directFlights.filter(f => !f.layovers || f.layovers.length === 0));

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
