/**
 * DISCOVER MOCK — built from real SerpAPI data saved in doc/responses/discover_MXP_BKK_2026-03-19.json
 * Routes: MXP→BKK with all 16 hub cities. Only ORD has negative savings.
 * Direct MXP→BKK: €1176. Return BKK→MXP: €266.
 */

function leg(departureId, arrivalId, price, duration, airline) {
  return {
    best_flights: [{
      flights: [{ departure_airport: { id: departureId }, arrival_airport: { id: arrivalId }, duration, airline }],
      layovers: [],
      total_duration: duration,
      price,
      type: "One way",
    }],
    other_flights: [],
  };
}

const ROUTES = {
  // Outbound legs MXP → hub
  "MXP→IST": leg("MXP", "IST",  82,  105, "Air Serbia"),
  "MXP→MAD": leg("MXP", "MAD",  20,  150, "Wizz Air"),
  "MXP→ZRH": leg("MXP", "ZRH",  70,  105, "Air Serbia"),
  "MXP→MCT": leg("MXP", "MCT", 227,  345, "Qatar Airways"),
  "MXP→SIN": leg("MXP", "SIN", 314,  360, "Etihad"),
  "MXP→CDG": leg("MXP", "CDG",  28,   95, "easyJet"),
  "MXP→DOH": leg("MXP", "DOH", 250,  375, "Oman Air"),
  "MXP→FRA": leg("MXP", "FRA",  58,   70, "Condor"),
  "MXP→WAW": leg("MXP", "WAW",  20,  120, "Wizz Air"),
  "MXP→LHR": leg("MXP", "LHR",  96,  130, "British Airways"),
  "MXP→DXB": leg("MXP", "DXB", 247,  375, "Oman Air"),
  "MXP→HKG": leg("MXP", "HKG", 369,  360, "Etihad"),
  "MXP→AUH": leg("MXP", "AUH", 295,  360, "Gulf Air"),
  "MXP→BAH": leg("MXP", "BAH", 313,  360, "Etihad"),
  "MXP→JFK": leg("MXP", "JFK", 318,  180, "Tap Air Portugal"),
  "MXP→ORD": leg("MXP", "ORD", 415,  550, "American"),

  // Onward legs hub → BKK
  "IST→BKK": leg("IST", "BKK", 275,  565, "Air Arabia"),
  "MAD→BKK": leg("MAD", "BKK", 340,  415, "Etihad"),
  "ZRH→BKK": leg("ZRH", "BKK", 350,  370, "Etihad"),
  "MCT→BKK": leg("MCT", "BKK", 199,  105, "Gulf Air"),
  "SIN→BKK": leg("SIN", "BKK", 137,  155, "Scoot"),
  "CDG→BKK": leg("CDG", "BKK", 429,   80, "SWISS"),
  "DOH→BKK": leg("DOH", "BKK", 219,   65, "Air Arabia"),
  "FRA→BKK": leg("FRA", "BKK", 411,  395, "Oman Air"),
  "WAW→BKK": leg("WAW", "BKK", 450,  350, "Air Arabia"),
  "LHR→BKK": leg("LHR", "BKK", 376,  730, "Shenzhen Airlines"),
  "DXB→BKK": leg("DXB", "BKK", 227,   85, "Gulf Air"),
  "HKG→BKK": leg("HKG", "BKK", 112,  195, "Emirates"),
  "AUH→BKK": leg("AUH", "BKK", 220,   75, "Gulf Air"),
  "BAH→BKK": leg("BAH", "BKK", 207,   70, "Etihad"),
  "JFK→BKK": leg("JFK", "BKK", 452,  760, "Etihad"),
  "ORD→BKK": leg("ORD", "BKK", 769,  800, "Qatar Airways"),

  // Shared return leg (best option from real data)
  "BKK→MXP": leg("BKK", "MXP", 266, 265, "Air India"),

  // Direct MXP→BKK baseline (in other_flights so service picks it as direct)
  "MXP→BKK": {
    best_flights: [],
    other_flights: [{
      flights: [{ departure_airport: { id: "MXP" }, arrival_airport: { id: "BKK" }, duration: 650, airline: "Thai Airways" }],
      layovers: [],
      total_duration: 650,
      price: 1176,
      type: "One way",
    }],
  },
};

export async function search({ departureId, arrivalId }) {
  const key = `${departureId}→${arrivalId}`;
  return ROUTES[key] ?? { best_flights: [], other_flights: [] };
}
