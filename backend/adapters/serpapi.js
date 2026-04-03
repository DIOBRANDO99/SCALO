import { getJson } from "serpapi";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SAMPLES_DIR = join(__dirname, "../../doc/samples");

export async function search({ departureId, arrivalId, outboundDate, returnDate, stops = "2", tripType = "1" }) {
  const result = await getJson({
    engine: "google_flights",
    departure_id: departureId,
    arrival_id: arrivalId,
    outbound_date: outboundDate,
    return_date: returnDate,
    stops,
    type: tripType,
    currency: "EUR",
    hl: "en",
    api_key: process.env.SERPAPI_KEY,
  });

  if (process.env.SAVE_SAMPLES === "true") {
    const type = tripType === "1" ? "roundtrip" : "oneway";
    const key = `leg_${departureId}_${arrivalId}_${type}`;
    mkdirSync(SAMPLES_DIR, { recursive: true });
    writeFileSync(join(SAMPLES_DIR, `${key}.json`), JSON.stringify(result, null, 2));
    console.log(`[serpapi] saved ${key}.json`);
  }

  return result;
}
