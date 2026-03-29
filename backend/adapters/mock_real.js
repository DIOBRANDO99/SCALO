import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const samplesDir = join(dirname(fileURLToPath(import.meta.url)), "../../doc/samples");

const ROUTES = {
  "MXP→IST:2": JSON.parse(readFileSync(join(samplesDir, "leg_MXP_IST_oneway.json"),    "utf8")),
  "IST→BKK:2": JSON.parse(readFileSync(join(samplesDir, "leg_IST_BKK_oneway.json"),    "utf8")),
  "BKK→MXP:2": JSON.parse(readFileSync(join(samplesDir, "leg_BKK_MXP_oneway.json"),    "utf8")),
  "MXP→BKK:1": JSON.parse(readFileSync(join(samplesDir, "leg_MXP_BKK_roundtrip.json"), "utf8")),
};

export async function search({ departureId, arrivalId, tripType = "1" }) {
  const key = `${departureId}→${arrivalId}:${tripType}`;
  return ROUTES[key] ?? { best_flights: [], other_flights: [] };
}
