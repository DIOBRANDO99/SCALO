import { getJson } from "serpapi";
import "dotenv/config";
import { writeFileSync } from "fs";

const BASE = {
  engine: "google_flights",
  type: "1",
  currency: "EUR",
  hl: "en",
  api_key: process.env.SERPAPI_KEY,
};

const LEGS = [
  { key: "MXP_IST_oneway", departure_id: "MXP", arrival_id: "IST", outbound_date: "2026-06-10", type: "2" },
  { key: "IST_BKK_oneway", departure_id: "IST", arrival_id: "BKK", outbound_date: "2026-06-13", type: "2" },
  { key: "BKK_MXP_oneway", departure_id: "BKK", arrival_id: "MXP", outbound_date: "2026-06-20", type: "2" },
  { key: "MXP_BKK_roundtrip", departure_id: "MXP", arrival_id: "BKK", outbound_date: "2026-06-10", return_date: "2026-06-20", type: "1" },
];

for (const leg of LEGS) {
  const { key, ...params } = leg;
  process.stdout.write(`fetching ${key}...`);
  const response = await getJson({ ...BASE, ...params });
  writeFileSync(`../doc/api_samples/leg_${key}.json`, JSON.stringify(response, null, 2));
  console.log(` saved to doc/leg_${key}.json`);
}

console.log("\ndone — 4 files saved.");
