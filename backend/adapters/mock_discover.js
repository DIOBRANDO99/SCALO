/**
 * DISCOVER MOCK — fictional data for testing the discover mode UI.
 * Covers 5 hubs for MXP→BKK:
 *   SIN: saves €219 (best)
 *   DXB: saves €199
 *   IST: saves €165
 *   LHR: negative (filtered out by DiscoverResults)
 *   DOH: negative (filtered out by DiscoverResults)
 *   All other hubs: return empty (no flights found)
 */

const ROUTES = {
  // IST hub — good savings
  "MXP→IST": {
    best_flights: [{ flights: [{ departure_airport: { id: "MXP" }, arrival_airport: { id: "IST" }, duration: 175, airline: "Turkish Airlines", flight_number: "TK 1874" }], layovers: [], total_duration: 175, carbon_emissions: { this_flight: 127000, typical_for_this_route: 150000, difference_percent: -15 }, price: 89, type: "One way", departure_token: "mock_disc_MXP_IST" }],
    other_flights: []
  },
  "IST→BKK": {
    best_flights: [{ flights: [{ departure_airport: { id: "IST" }, arrival_airport: { id: "BKK" }, duration: 560, airline: "Turkish Airlines", flight_number: "TK 58" }], layovers: [], total_duration: 560, carbon_emissions: { this_flight: 474000, typical_for_this_route: 500000, difference_percent: -5 }, price: 245, type: "One way", departure_token: "mock_disc_IST_BKK" }],
    other_flights: []
  },

  // DXB hub — best savings among Middle East
  "MXP→DXB": {
    best_flights: [{ flights: [{ departure_airport: { id: "MXP" }, arrival_airport: { id: "DXB" }, duration: 345, airline: "Emirates", flight_number: "EK 205" }], layovers: [], total_duration: 345, carbon_emissions: { this_flight: 290000, typical_for_this_route: 310000, difference_percent: -6 }, price: 110, type: "One way", departure_token: "mock_disc_MXP_DXB" }],
    other_flights: []
  },
  "DXB→BKK": {
    best_flights: [{ flights: [{ departure_airport: { id: "DXB" }, arrival_airport: { id: "BKK" }, duration: 390, airline: "Emirates", flight_number: "EK 384" }], layovers: [], total_duration: 390, carbon_emissions: { this_flight: 340000, typical_for_this_route: 360000, difference_percent: -6 }, price: 190, type: "One way", departure_token: "mock_disc_DXB_BKK" }],
    other_flights: []
  },

  // SIN hub — top savings
  "MXP→SIN": {
    best_flights: [{ flights: [{ departure_airport: { id: "MXP" }, arrival_airport: { id: "SIN" }, duration: 720, airline: "Singapore Airlines", flight_number: "SQ 378" }], layovers: [], total_duration: 720, carbon_emissions: { this_flight: 650000, typical_for_this_route: 680000, difference_percent: -4 }, price: 200, type: "One way", departure_token: "mock_disc_MXP_SIN" }],
    other_flights: []
  },
  "SIN→BKK": {
    best_flights: [{ flights: [{ departure_airport: { id: "SIN" }, arrival_airport: { id: "BKK" }, duration: 140, airline: "Singapore Airlines", flight_number: "SQ 718" }], layovers: [], total_duration: 140, carbon_emissions: { this_flight: 80000, typical_for_this_route: 90000, difference_percent: -11 }, price: 80, type: "One way", departure_token: "mock_disc_SIN_BKK" }],
    other_flights: []
  },

  // DOH hub — negative savings (expensive), filtered out in UI
  "MXP→DOH": {
    best_flights: [{ flights: [{ departure_airport: { id: "MXP" }, arrival_airport: { id: "DOH" }, duration: 345, airline: "Qatar Airways", flight_number: "QR 124" }], layovers: [], total_duration: 345, carbon_emissions: { this_flight: 326000, typical_for_this_route: 320000, difference_percent: 2 }, price: 400, type: "One way", departure_token: "mock_disc_MXP_DOH" }],
    other_flights: []
  },
  "DOH→BKK": {
    best_flights: [{ flights: [{ departure_airport: { id: "DOH" }, arrival_airport: { id: "BKK" }, duration: 415, airline: "Qatar Airways", flight_number: "QR 830" }], layovers: [], total_duration: 415, carbon_emissions: { this_flight: 294000, typical_for_this_route: 300000, difference_percent: -2 }, price: 350, type: "One way", departure_token: "mock_disc_DOH_BKK" }],
    other_flights: []
  },

  // LHR hub — negative savings (expensive), filtered out in UI
  "MXP→LHR": {
    best_flights: [{ flights: [{ departure_airport: { id: "MXP" }, arrival_airport: { id: "LHR" }, duration: 150, airline: "British Airways", flight_number: "BA 610" }], layovers: [], total_duration: 150, carbon_emissions: { this_flight: 120000, typical_for_this_route: 115000, difference_percent: 4 }, price: 250, type: "One way", departure_token: "mock_disc_MXP_LHR" }],
    other_flights: []
  },
  "LHR→BKK": {
    best_flights: [{ flights: [{ departure_airport: { id: "LHR" }, arrival_airport: { id: "BKK" }, duration: 680, airline: "British Airways", flight_number: "BA 9" }], layovers: [], total_duration: 680, carbon_emissions: { this_flight: 580000, typical_for_this_route: 560000, difference_percent: 4 }, price: 350, type: "One way", departure_token: "mock_disc_LHR_BKK" }],
    other_flights: []
  },

  // Shared return leg
  "BKK→MXP": {
    best_flights: [{ flights: [{ departure_airport: { id: "BKK" }, arrival_airport: { id: "MXP" }, duration: 650, airline: "THAI", flight_number: "TG 942" }], layovers: [], total_duration: 650, carbon_emissions: { this_flight: 593000, typical_for_this_route: 600000, difference_percent: -1 }, price: 389, type: "One way", departure_token: "mock_disc_BKK_MXP" }],
    other_flights: []
  },

  // Direct MXP→BKK baseline (in other_flights, no layovers)
  "MXP→BKK": {
    best_flights: [],
    other_flights: [{ flights: [{ departure_airport: { id: "MXP" }, arrival_airport: { id: "BKK" }, duration: 650, airline: "THAI", flight_number: "TG 941" }], layovers: [], total_duration: 650, carbon_emissions: { this_flight: 594000, typical_for_this_route: 628000, difference_percent: -5 }, price: 888, type: "One way", departure_token: "mock_disc_MXP_BKK_direct" }]
  },
};

export async function search({ departureId, arrivalId }) {
  const key = `${departureId}→${arrivalId}`;
  return ROUTES[key] ?? { best_flights: [], other_flights: [] };
}
