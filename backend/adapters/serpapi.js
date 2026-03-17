import { getJson } from "serpapi";

export async function search({ departureId, arrivalId, outboundDate, returnDate, stops = "2" }) {
  return getJson({
    engine: "google_flights",
    departure_id: departureId,
    arrival_id: arrivalId,
    outbound_date: outboundDate,
    return_date: returnDate,
    stops,
    type: "1",
    currency: "EUR",
    hl: "en",
    api_key: process.env.SERPAPI_KEY,
  });
}
