// Script to fetch an API response for mocking purposes
import { getJson } from "serpapi";
import "dotenv/config";
import { writeFileSync } from "fs";

const response = await getJson({
  engine: "google_flights",
  departure_id: "MXP",
  arrival_id: "BKK",
  outbound_date: "2026-06-10",
  return_date: "2026-06-20",
  stops: "2",
  type: "1",
  currency: "EUR",
  hl: "en",
  api_key: process.env.SERPAPI_KEY,
});

writeFileSync("sample_response.json", JSON.stringify(response, null, 2));
console.log("done — saved to sample_response.json");
