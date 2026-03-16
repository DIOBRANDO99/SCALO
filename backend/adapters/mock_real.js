/**
 * REAL DATA MOCK — built from actual SerpAPI responses fetched 2026-03-16.
 * Route: MXP→BKK via IST, stopoverNights: 3, outbound: 2026-06-10, return: 2026-06-20.
 *
 * Expected service output when called with these params:
 *   leg1 (MXP→IST one-way):  cheapest €82
 *   leg2 (IST→BKK one-way):  cheapest €275
 *   return (BKK→MXP one-way): cheapest €272
 *   direct (MXP→BKK round-trip): cheapest direct €1176
 *   bestCombinedPrice: 82 + 275 + 272 = €629
 *   savings: 1176 - 629 = €547
 */

const ROUTES = {

  "MXP→IST:2": {
    best_flights: [
      {
        flights: [
          { departure_airport: { name: "Milano Malpensa Airport", id: "MXP", time: "2026-06-10 09:20" }, arrival_airport: { name: "Belgrade Nikola Tesla Airport", id: "BEG", time: "2026-06-10 11:05" }, duration: 105, airplane: "Embraer 190", airline: "Air Serbia", airline_logo: "https://www.gstatic.com/flights/airline_logos/70px/JU.png", travel_class: "Economy", flight_number: "JU 417", legroom: "31 in" },
          { departure_airport: { name: "Belgrade Nikola Tesla Airport", id: "BEG", time: "2026-06-10 12:15" }, arrival_airport: { name: "Istanbul Airport", id: "IST", time: "2026-06-10 15:00" }, duration: 105, airplane: "Airbus A220-300 Passenger", airline: "Air Serbia", airline_logo: "https://www.gstatic.com/flights/airline_logos/70px/JU.png", travel_class: "Economy", flight_number: "JU 422", legroom: "30 in" }
        ],
        layovers: [{ duration: 70, name: "Belgrade Nikola Tesla Airport", id: "BEG" }],
        total_duration: 280,
        carbon_emissions: { this_flight: 204000, typical_for_this_route: 142000, difference_percent: 44 },
        price: 82,
        type: "One way",
        booking_token: "WyJDalJJUTI1cFExbFFZa0ZGTW1kQlRFeFlWRkZDUnkwdExTMHRMUzB0TFMxd1ptSm5ORUZCUVVGQlIyMHpMV0kwUkVwYU1VOUJFZ3RLVlRReE4zeEtWVFF5TWhvS0NQcy9FQUlhQTBWVlVqZ2NjTHBKIixbWyJNWFAiLCIyMDI2LTA2LTEwIiwiQkVHIixudWxsLCJKVSIsIjQxNyJdLFsiQkVHIiwiMjAyNi0wNi0xMCIsIklTVCIsbnVsbCwiSlUiLCI0MjIiXV1d"
      },
      {
        flights: [
          { departure_airport: { name: "Milano Malpensa Airport", id: "MXP", time: "2026-06-10 20:50" }, arrival_airport: { name: "Belgrade Nikola Tesla Airport", id: "BEG", time: "2026-06-10 22:35" }, duration: 105, airplane: "Embraer 195", airline: "Air Serbia", airline_logo: "https://www.gstatic.com/flights/airline_logos/70px/JU.png", travel_class: "Economy", flight_number: "JU 419", legroom: "31 in" },
          { departure_airport: { name: "Belgrade Nikola Tesla Airport", id: "BEG", time: "2026-06-11 00:55" }, arrival_airport: { name: "Istanbul Airport", id: "IST", time: "2026-06-11 03:40" }, duration: 105, airplane: "Airbus A319", airline: "Air Serbia", airline_logo: "https://www.gstatic.com/flights/airline_logos/70px/JU.png", travel_class: "Economy", flight_number: "JU 426", legroom: "30 in", overnight: true }
        ],
        layovers: [{ duration: 140, name: "Belgrade Nikola Tesla Airport", id: "BEG" }],
        total_duration: 350,
        carbon_emissions: { this_flight: 206000, typical_for_this_route: 142000, difference_percent: 45 },
        price: 82,
        type: "One way",
        booking_token: "WyJDalJJUTI1cFExbFFZa0ZGTW1kQlRFeFlWRkZDUnkwdExTMHRMUzB0TFMxd1ptSm5ORUZCUVVGQlIyMHpMV0kwUkVwYU1VOUJFZ3RLVlRReE9YeEtWVFF5TmhvS0NQcy9FQUlhQTBWVlVqZ2NjTHBKIixbWyJNWFAiLCIyMDI2LTA2LTEwIiwiQkVHIixudWxsLCJKVSIsIjQxOSJdLFsiQkVHIiwiMjAyNi0wNi0xMSIsIklTVCIsbnVsbCwiSlUiLCI0MjYiXV1d"
      },
      {
        flights: [
          { departure_airport: { name: "Milano Malpensa Airport", id: "MXP", time: "2026-06-10 14:00" }, arrival_airport: { name: "Josep Tarradellas Barcelona-El Prat Airport", id: "BCN", time: "2026-06-10 15:45" }, duration: 105, airplane: "Airbus A320", airline: "Vueling", airline_logo: "https://www.gstatic.com/flights/airline_logos/70px/VY.png", travel_class: "Economy", flight_number: "VY 6343", legroom: "29 in" },
          { departure_airport: { name: "Josep Tarradellas Barcelona-El Prat Airport", id: "BCN", time: "2026-06-10 16:40" }, arrival_airport: { name: "Istanbul Airport", id: "IST", time: "2026-06-10 21:25" }, duration: 225, airplane: "Airbus A320", airline: "Vueling", airline_logo: "https://www.gstatic.com/flights/airline_logos/70px/VY.png", travel_class: "Economy", flight_number: "VY 3072", legroom: "29 in" }
        ],
        layovers: [{ duration: 55, name: "Josep Tarradellas Barcelona-El Prat Airport", id: "BCN" }],
        total_duration: 385,
        carbon_emissions: { this_flight: 248000, typical_for_this_route: 142000, difference_percent: 75 },
        price: 123,
        type: "One way",
        booking_token: "WyJDalJJUTI1cFExbFFZa0ZGTW1kQlRFeFlWRkZDUnkwdExTMHRMUzB0TFMxd1ptSm5ORUZCUVVGQlIyMHpMV0kwUkVwYU1VOUJFZzFXV1RZek5ETjhWbGt6TURjeUdnb0l2RjhRQWhvRFJWVlNPQnh3MG0wPSIsW1siTVhQIiwiMjAyNi0wNi0xMCIsIkJDTiIsbnVsbCwiVlkiLCI2MzQzIl0sWyJCQ04iLCIyMDI2LTA2LTEwIiwiSVNUIixudWxsLCJWWSIsIjMwNzIiXV1d"
      }
    ],
    other_flights: []
  },

  "IST→BKK:2": {
    best_flights: [
      {
        flights: [
          { departure_airport: { name: "Istanbul Airport", id: "IST", time: "2026-06-13 14:10" }, arrival_airport: { name: "Sharjah International Airport", id: "SHJ", time: "2026-06-13 19:35" }, duration: 265, airplane: "Airbus A320", airline: "Air Arabia", airline_logo: "https://www.gstatic.com/flights/airline_logos/70px/G9.png", travel_class: "Economy", flight_number: "G9 322", legroom: "29 in" },
          { departure_airport: { name: "Sharjah International Airport", id: "SHJ", time: "2026-06-14 00:45" }, arrival_airport: { name: "Suvarnabhumi Airport", id: "BKK", time: "2026-06-14 10:20" }, duration: 395, airplane: "Airbus A321", airline: "Air Arabia", airline_logo: "https://www.gstatic.com/flights/airline_logos/70px/G9.png", travel_class: "Economy", flight_number: "G9 823", legroom: "32 in", overnight: true }
        ],
        layovers: [{ duration: 310, name: "Sharjah International Airport", id: "SHJ" }],
        total_duration: 970,
        carbon_emissions: { this_flight: 645000, typical_for_this_route: 589000, difference_percent: 10 },
        price: 275,
        type: "One way",
        booking_token: "WyJDalJJUTI1cFExbFFZa0ZGTW1kQlRFeFlZMEZDUnkwdExTMHRMUzB0TFMxd1ptSm5ORUZCUVVGQlIyMHpMV0k0UWpCU1pEWkJFZ3RIT1RNeU1ueEhPVGd5TXhvTENLaldBUkFDR2dORlZWSTRISENQOWdFPSIsW1siSVNUIiwiMjAyNi0wNi0xMyIsIlNISiIsbnVsbCwiRzkiLCIzMjIiXSxbIlNISiIsIjIwMjYtMDYtMTQiLCJCS0siLG51bGwsIkc5IiwiODIzIl1dXQ=="
      },
      {
        flights: [
          { departure_airport: { name: "Istanbul Airport", id: "IST", time: "2026-06-13 14:10" }, arrival_airport: { name: "Sharjah International Airport", id: "SHJ", time: "2026-06-13 19:35" }, duration: 265, airplane: "Airbus A320", airline: "Air Arabia", airline_logo: "https://www.gstatic.com/flights/airline_logos/70px/G9.png", travel_class: "Economy", flight_number: "G9 322", legroom: "29 in" },
          { departure_airport: { name: "Sharjah International Airport", id: "SHJ", time: "2026-06-13 22:15" }, arrival_airport: { name: "Suvarnabhumi Airport", id: "BKK", time: "2026-06-14 07:50" }, duration: 395, airplane: "Airbus A321", airline: "Air Arabia", airline_logo: "https://www.gstatic.com/flights/airline_logos/70px/G9.png", travel_class: "Economy", flight_number: "G9 821", legroom: "32 in", overnight: true }
        ],
        layovers: [{ duration: 160, name: "Sharjah International Airport", id: "SHJ" }],
        total_duration: 820,
        carbon_emissions: { this_flight: 645000, typical_for_this_route: 589000, difference_percent: 10 },
        price: 279,
        type: "One way",
        booking_token: "WyJDalJJUTI1cFExbFFZa0ZGTW1kQlRFeFlZMEZDUnkwdExTMHRMUzB0TFMxd1ptSm5ORUZCUVVGQlIyMHpMV0k0UWpCU1pEWkJFZ3RIT1RNeU1ueEhPVGd5TVJvTENLUFpBUkFDR2dORlZWSTRISEREK1FFPSIsW1siSVNUIiwiMjAyNi0wNi0xMyIsIlNISiIsbnVsbCwiRzkiLCIzMjIiXSxbIlNISiIsIjIwMjYtMDYtMTMiLCJCS0siLG51bGwsIkc5IiwiODIxIl1dXQ=="
      }
    ],
    other_flights: []
  },

  "BKK→MXP:2": {
    best_flights: [
      {
        flights: [
          { departure_airport: { name: "Suvarnabhumi Airport", id: "BKK", time: "2026-06-20 09:45" }, arrival_airport: { name: "Zayed International Airport", id: "AUH", time: "2026-06-20 13:05" }, duration: 380, airplane: "Boeing 787", airline: "Etihad", airline_logo: "https://www.gstatic.com/flights/airline_logos/70px/EY.png", travel_class: "Economy", flight_number: "EY 409", legroom: "31 in" },
          { departure_airport: { name: "Zayed International Airport", id: "AUH", time: "2026-06-20 14:20" }, arrival_airport: { name: "Milano Malpensa Airport", id: "MXP", time: "2026-06-20 18:50" }, duration: 390, airplane: "Boeing 787-10", airline: "Etihad", airline_logo: "https://www.gstatic.com/flights/airline_logos/70px/EY.png", travel_class: "Economy", flight_number: "EY 79", legroom: "31 in" }
        ],
        layovers: [{ duration: 75, name: "Zayed International Airport", id: "AUH" }],
        total_duration: 845,
        carbon_emissions: { this_flight: 599000, typical_for_this_route: 667000, difference_percent: -10 },
        price: 272,
        type: "One way",
        booking_token: "WyJDalJJYW1jMk1WaGhOSFF5WW1OQlNERTFkbWRDUnkwdExTMHRMUzB0TFhscFltdG1PRUZCUVVGQlIyMHpMV05CVFZGa1NUWkJFZ3BGV1RRd09YeEZXVGM1R2dzSTVkTUJFQUlhQTBWVlVqZ2NjSnp6QVE9PSIsW1siQktLIiwiMjAyNi0wNi0yMCIsIkFVSCIsbnVsbCwiRVkiLCI0MDkiXSxbIkFVSCIsIjIwMjYtMDYtMjAiLCJNWFAiLG51bGwsIkVZIiwiNzkiXV1d"
      },
      {
        flights: [
          { departure_airport: { name: "Suvarnabhumi Airport", id: "BKK", time: "2026-06-20 15:05" }, arrival_airport: { name: "Zayed International Airport", id: "AUH", time: "2026-06-20 19:20" }, duration: 435, airplane: "Boeing 787", airline: "Etihad", airline_logo: "https://www.gstatic.com/flights/airline_logos/70px/EY.png", travel_class: "Economy", flight_number: "EY 405", legroom: "31 in" },
          { departure_airport: { name: "Zayed International Airport", id: "AUH", time: "2026-06-21 02:15" }, arrival_airport: { name: "Milano Malpensa Airport", id: "MXP", time: "2026-06-21 06:45" }, duration: 390, airplane: "Boeing 787", airline: "Etihad", airline_logo: "https://www.gstatic.com/flights/airline_logos/70px/EY.png", travel_class: "Economy", flight_number: "EY 81", legroom: "31 in", overnight: true }
        ],
        layovers: [{ duration: 415, name: "Zayed International Airport", id: "AUH", overnight: true }],
        total_duration: 1240,
        carbon_emissions: { this_flight: 598000, typical_for_this_route: 667000, difference_percent: -10 },
        price: 272,
        type: "One way",
        booking_token: "WyJDalJJYW1jMk1WaGhOSFF5WW1OQlNERTFkbWRDUnkwdExTMHRMUzB0TFhscFltdG1PRUZCUVVGQlIyMHpMV05CVFZGa1NUWkJFZ3BGV1RRd05YeEZXVGd4R2dzSTVkTUJFQUlhQTBWVlVqZ2NjSnp6QVE9PSIsW1siQktLIiwiMjAyNi0wNi0yMCIsIkFVSCIsbnVsbCwiRVkiLCI0MDUiXSxbIkFVSCIsIjIwMjYtMDYtMjEiLCJNWFAiLG51bGwsIkVZIiwiODEiXV1d"
      }
    ],
    other_flights: []
  },

  "MXP→BKK:1": {
    best_flights: [
      {
        flights: [
          { departure_airport: { name: "Milano Malpensa Airport", id: "MXP", time: "2026-06-10 21:50" }, arrival_airport: { name: "Muscat International Airport", id: "MCT", time: "2026-06-11 06:05" }, duration: 375, airplane: "Boeing 787", airline: "Oman Air", airline_logo: "https://www.gstatic.com/flights/airline_logos/70px/WY.png", travel_class: "Economy", flight_number: "WY 144", legroom: "31 in", overnight: true },
          { departure_airport: { name: "Muscat International Airport", id: "MCT", time: "2026-06-11 08:40" }, arrival_airport: { name: "Suvarnabhumi Airport", id: "BKK", time: "2026-06-11 17:45" }, duration: 365, airplane: "Boeing 787", airline: "Oman Air", airline_logo: "https://www.gstatic.com/flights/airline_logos/70px/WY.png", travel_class: "Economy", flight_number: "WY 815", legroom: "31 in" }
        ],
        layovers: [{ duration: 155, name: "Muscat International Airport", id: "MCT" }],
        total_duration: 895,
        carbon_emissions: { this_flight: 596000, typical_for_this_route: 628000, difference_percent: -5 },
        price: 566,
        type: "Round trip",
        departure_token: "WyJDalJJV0dwcVJISjJTbE5TWkRSQlRXaDNRbEZDUnkwdExTMHRMUzEyZDJocE9TMXVNa0ZCUVVGQlIyMHpMVXROU1VGRk1EaEJFZ3RYV1RFME5IeFhXVGd4TlJvTENKaTZBeEFDR2dORlZWSTRISERvK3dNPSIsW1siTVhQIiwiMjAyNi0wNi0xMCIsIk1DVCIsbnVsbCwiV1kiLCIxNDQiXSxbIk1DVCIsIjIwMjYtMDYtMTEiLCJCS0siLG51bGwsIldZIiwiODE1Il1dXQ=="
      },
      {
        flights: [
          { departure_airport: { name: "Milano Malpensa Airport", id: "MXP", time: "2026-06-10 11:40" }, arrival_airport: { name: "Zayed International Airport", id: "AUH", time: "2026-06-10 19:40" }, duration: 360, airplane: "Boeing 787", airline: "Etihad", airline_logo: "https://www.gstatic.com/flights/airline_logos/70px/EY.png", travel_class: "Economy", flight_number: "EY 82", legroom: "31 in" },
          { departure_airport: { name: "Zayed International Airport", id: "AUH", time: "2026-06-10 20:40" }, arrival_airport: { name: "Suvarnabhumi Airport", id: "BKK", time: "2026-06-11 06:15" }, duration: 395, airplane: "Boeing 787", airline: "Etihad", airline_logo: "https://www.gstatic.com/flights/airline_logos/70px/EY.png", travel_class: "Economy", flight_number: "EY 408", legroom: "31 in", overnight: true }
        ],
        layovers: [{ duration: 60, name: "Zayed International Airport", id: "AUH" }],
        total_duration: 815,
        carbon_emissions: { this_flight: 622000, typical_for_this_route: 628000, difference_percent: -1 },
        price: 609,
        type: "Round trip",
        departure_token: "WyJDalJJV0dwcVJISjJTbE5TWkRSQlRXaDNRbEZDUnkwdExTMHRMUzEyZDJocE9TMXVNa0ZCUVVGQlIyMHpMVXROU1VGRk1EaEJFZ3BGV1RneWZFVlpOREE0R2dzSWlkc0RFQUlhQTBWVlVqZ2NjTXFoQkE9PSIsW1siTVhQIiwiMjAyNi0wNi0xMCIsIkFVSCIsbnVsbCwiRVkiLCI4MiJdLFsiQVVIIiwiMjAyNi0wNi0xMCIsIkJLSyIsbnVsbCwiRVkiLCI0MDgiXV1d"
      }
    ],
    other_flights: [
      {
        flights: [
          { departure_airport: { name: "Milano Malpensa Airport", id: "MXP", time: "2026-06-10 14:05" }, arrival_airport: { name: "Suvarnabhumi Airport", id: "BKK", time: "2026-06-11 05:55" }, duration: 650, airplane: "Boeing 787", airline: "THAI", airline_logo: "https://www.gstatic.com/flights/airline_logos/70px/TG.png", travel_class: "Economy", flight_number: "TG 941", legroom: "32 in", overnight: true }
        ],
        total_duration: 650,
        carbon_emissions: { this_flight: 594000, typical_for_this_route: 628000, difference_percent: -5 },
        price: 1176,
        type: "Round trip",
        departure_token: "WyJDalJJV0dwcVJISjJTbE5TWkRSQlRXaDNRbEZDUnkwdExTMHRMUzEyZDJocE9TMXVNa0ZCUVVGQlIyMHpMVXROU1VGRk1EaEJFZ1ZVUnprME1Sb0xDSkNXQnhBQ0dnTkZWVkk0SEhDeW5nZz0iLFtbIk1YUCIsIjIwMjYtMDYtMTAiLCJCS0siLG51bGwsIlRHIiwiOTQxIl1dXQ=="
      }
    ]
  }

};

export async function search({ departureId, arrivalId, tripType = "1" }) {
  const key = `${departureId}→${arrivalId}:${tripType}`;
  return ROUTES[key] ?? { best_flights: [], other_flights: [] };
}
