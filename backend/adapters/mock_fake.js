/**
 * FICTIONAL TEST MOCK — not based on real API responses.
 * Purpose: verify service logic handles all key scenarios correctly.
 *
 * Routes defined:
 *   MXP→IST — cheap leg1 (stopover via IST saves money vs direct)
 *   IST→BKK — cheap leg2
 *   MXP→DOH — expensive leg1 (stopover via DOH costs more than direct)
 *   DOH→BKK — expensive leg2
 *   BKK→MXP — return leg (shared across scenarios)
 *   MXP→BKK — direct flight exists (baseline for savings comparison)
 *   MXP→JFK — no direct flight exists (savings should be null)
 *   IST→JFK — leg for no-direct scenario
 *   JFK→MXP — return leg for no-direct scenario
 */

const ROUTES = {
  // --- leg1: cheap stopover via IST ---
  "MXP→IST": {
    best_flights: [
      {
        flights: [
          { departure_airport: { id: "MXP" }, arrival_airport: { id: "IST" }, duration: 175, airline: "Turkish Airlines", flight_number: "TK 1874" }
        ],
        layovers: [],
        total_duration: 175,
        carbon_emissions: { this_flight: 127000, typical_for_this_route: 150000, difference_percent: -15 },
        price: 89,
        type: "One way",
        departure_token: "mock_test_token_MXP_IST"
      }
    ],
    other_flights: []
  },

  // --- leg2: cheap onward from IST ---
  "IST→BKK": {
    best_flights: [
      {
        flights: [
          { departure_airport: { id: "IST" }, arrival_airport: { id: "BKK" }, duration: 560, airline: "Turkish Airlines", flight_number: "TK 58" }
        ],
        layovers: [],
        total_duration: 560,
        carbon_emissions: { this_flight: 474000, typical_for_this_route: 500000, difference_percent: -5 },
        price: 245,
        type: "One way",
        departure_token: "mock_test_token_IST_BKK"
      }
    ],
    other_flights: []
  },

  // --- leg1: expensive stopover via DOH ---
  "MXP→DOH": {
    best_flights: [
      {
        flights: [
          { departure_airport: { id: "MXP" }, arrival_airport: { id: "DOH" }, duration: 345, airline: "Qatar Airways", flight_number: "QR 124" }
        ],
        layovers: [],
        total_duration: 345,
        carbon_emissions: { this_flight: 326000, typical_for_this_route: 320000, difference_percent: 2 },
        price: 400,
        type: "One way",
        departure_token: "mock_test_token_MXP_DOH"
      }
    ],
    other_flights: []
  },

  // --- leg2: expensive onward from DOH ---
  "DOH→BKK": {
    best_flights: [
      {
        flights: [
          { departure_airport: { id: "DOH" }, arrival_airport: { id: "BKK" }, duration: 415, airline: "Qatar Airways", flight_number: "QR 830" }
        ],
        layovers: [],
        total_duration: 415,
        carbon_emissions: { this_flight: 294000, typical_for_this_route: 300000, difference_percent: -2 },
        price: 350,
        type: "One way",
        departure_token: "mock_test_token_DOH_BKK"
      }
    ],
    other_flights: []
  },

  // --- return leg: BKK→MXP (shared) ---
  "BKK→MXP": {
    best_flights: [
      {
        flights: [
          { departure_airport: { id: "BKK" }, arrival_airport: { id: "MXP" }, duration: 650, airline: "THAI", flight_number: "TG 942" }
        ],
        layovers: [],
        total_duration: 650,
        carbon_emissions: { this_flight: 593000, typical_for_this_route: 600000, difference_percent: -1 },
        price: 389,
        type: "One way",
        departure_token: "mock_test_token_BKK_MXP"
      }
    ],
    other_flights: []
  },

  // --- direct MXP→BKK (baseline for savings) ---
  "MXP→BKK": {
    best_flights: [],
    other_flights: [
      {
        flights: [
          { departure_airport: { id: "MXP" }, arrival_airport: { id: "BKK" }, duration: 650, airline: "THAI", flight_number: "TG 941" }
        ],
        total_duration: 650,
        carbon_emissions: { this_flight: 594000, typical_for_this_route: 628000, difference_percent: -5 },
        price: 888,
        type: "One way",
        departure_token: "mock_test_token_MXP_BKK_direct"
      }
    ]
  },

  // --- no direct flight scenario: MXP→JFK ---
  "MXP→JFK": {
    best_flights: [],
    other_flights: []
  },

  // --- leg2 for no-direct scenario ---
  "IST→JFK": {
    best_flights: [
      {
        flights: [
          { departure_airport: { id: "IST" }, arrival_airport: { id: "JFK" }, duration: 600, airline: "Turkish Airlines", flight_number: "TK 2" }
        ],
        layovers: [],
        total_duration: 600,
        carbon_emissions: { this_flight: 600000, typical_for_this_route: 620000, difference_percent: -3 },
        price: 310,
        type: "One way",
        departure_token: "mock_test_token_IST_JFK"
      }
    ],
    other_flights: []
  },

  // --- return leg for no-direct scenario ---
  "JFK→MXP": {
    best_flights: [
      {
        flights: [
          { departure_airport: { id: "JFK" }, arrival_airport: { id: "MXP" }, duration: 480, airline: "Delta", flight_number: "DL 402" }
        ],
        layovers: [],
        total_duration: 480,
        carbon_emissions: { this_flight: 450000, typical_for_this_route: 460000, difference_percent: -2 },
        price: 290,
        type: "One way",
        departure_token: "mock_test_token_JFK_MXP"
      }
    ],
    other_flights: []
  }
};

export async function search({ departureId, arrivalId }) {
  const key = `${departureId}→${arrivalId}`;
  return ROUTES[key] ?? { best_flights: [], other_flights: [] };
}
