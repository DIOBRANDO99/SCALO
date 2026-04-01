// Pre-recorded SerpAPI responses for four demo corridors:
//   FCO → AMS  (short-haul EU,    stopovers: CDG, FRA, BRU)
//   CDG → BKK  (long-haul EU→AS,  stopovers: IST (saves money), SVO (no prices - Russia sanctions))
//   LHR → SIN  (long-haul EU→AS,  stopovers: DXB, BOM)
//   GRU → NRT  (ultra long-haul,  stopovers: ATL, DXB, FRA — no direct price available)

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const samplesDir = join(dirname(fileURLToPath(import.meta.url)), "../../doc/samples");

const ROUTES = {
  // FCO → AMS corridor
  "FCO→CDG:2": JSON.parse(readFileSync(join(samplesDir, "leg_FCO_CDG_oneway.json"),    "utf8")),
  "CDG→AMS:2": JSON.parse(readFileSync(join(samplesDir, "leg_CDG_AMS_oneway.json"),    "utf8")),
  "FCO→FRA:2": JSON.parse(readFileSync(join(samplesDir, "leg_FCO_FRA_oneway.json"),    "utf8")),
  "FRA→AMS:2": JSON.parse(readFileSync(join(samplesDir, "leg_FRA_AMS_oneway.json"),    "utf8")),
  "FCO→BRU:2": JSON.parse(readFileSync(join(samplesDir, "leg_FCO_BRU_oneway.json"),    "utf8")),
  "BRU→AMS:2": JSON.parse(readFileSync(join(samplesDir, "leg_BRU_AMS_oneway.json"),    "utf8")),
  "AMS→FCO:2": JSON.parse(readFileSync(join(samplesDir, "leg_AMS_FCO_oneway.json"),    "utf8")),
  "FCO→AMS:1": JSON.parse(readFileSync(join(samplesDir, "leg_FCO_AMS_roundtrip.json"), "utf8")),

  // CDG → BKK corridor
  "CDG→IST:2": JSON.parse(readFileSync(join(samplesDir, "leg_CDG_IST_oneway.json"),    "utf8")),
  "IST→BKK:2": JSON.parse(readFileSync(join(samplesDir, "leg_IST_BKK_oneway.json"),    "utf8")),
  "CDG→SVO:2": JSON.parse(readFileSync(join(samplesDir, "leg_CDG_SVO_oneway.json"),    "utf8")),
  "SVO→BKK:2": JSON.parse(readFileSync(join(samplesDir, "leg_SVO_BKK_oneway.json"),    "utf8")),
  "BKK→CDG:2": JSON.parse(readFileSync(join(samplesDir, "leg_BKK_CDG_oneway.json"),    "utf8")),
  "CDG→BKK:1": JSON.parse(readFileSync(join(samplesDir, "leg_CDG_BKK_roundtrip.json"), "utf8")),

  // LHR → SIN corridor
  "LHR→DXB:2": JSON.parse(readFileSync(join(samplesDir, "leg_LHR_DXB_oneway.json"),    "utf8")),
  "DXB→SIN:2": JSON.parse(readFileSync(join(samplesDir, "leg_DXB_SIN_oneway.json"),    "utf8")),
  "LHR→BOM:2": JSON.parse(readFileSync(join(samplesDir, "leg_LHR_BOM_oneway.json"),    "utf8")),
  "BOM→SIN:2": JSON.parse(readFileSync(join(samplesDir, "leg_BOM_SIN_oneway.json"),    "utf8")),
  "SIN→LHR:2": JSON.parse(readFileSync(join(samplesDir, "leg_SIN_LHR_oneway.json"),    "utf8")),
  "LHR→SIN:1": JSON.parse(readFileSync(join(samplesDir, "leg_LHR_SIN_roundtrip.json"), "utf8")),

  // GRU → NRT corridor
  "GRU→ATL:2": JSON.parse(readFileSync(join(samplesDir, "leg_GRU_ATL_oneway.json"),    "utf8")),
  "ATL→NRT:2": JSON.parse(readFileSync(join(samplesDir, "leg_ATL_NRT_oneway.json"),    "utf8")),
  "GRU→DXB:2": JSON.parse(readFileSync(join(samplesDir, "leg_GRU_DXB_oneway.json"),    "utf8")),
  "DXB→NRT:2": JSON.parse(readFileSync(join(samplesDir, "leg_DXB_NRT_oneway.json"),    "utf8")),
  "GRU→FRA:2": JSON.parse(readFileSync(join(samplesDir, "leg_GRU_FRA_oneway.json"),    "utf8")),
  "FRA→NRT:2": JSON.parse(readFileSync(join(samplesDir, "leg_FRA_NRT_oneway.json"),    "utf8")),
  "NRT→GRU:2": JSON.parse(readFileSync(join(samplesDir, "leg_NRT_GRU_oneway.json"),    "utf8")),
  "GRU→NRT:1": JSON.parse(readFileSync(join(samplesDir, "leg_GRU_NRT_roundtrip.json"), "utf8")),
};

export async function search({ departureId, arrivalId, tripType = "1" }) {
  const key = `${departureId}→${arrivalId}:${tripType}`;
  return ROUTES[key] ?? { best_flights: [], other_flights: [] };
}
