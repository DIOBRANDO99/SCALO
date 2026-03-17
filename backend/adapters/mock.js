const MOCK_RESPONSE = {
  "search_parameters": {
    "engine": "google_flights",
    "departure_id": "MXP",
    "arrival_id": "BKK",
    "outbound_date": "2026-06-10",
    "return_date": "2026-06-20",
    "stops": 2,
    "currency": "EUR"
  },
  "best_flights": [
    {
      "flights": [
        {
          "departure_airport": { "name": "Milano Malpensa Airport", "id": "MXP", "time": "2026-06-10 21:50" },
          "arrival_airport": { "name": "Muscat International Airport", "id": "MCT", "time": "2026-06-11 06:05" },
          "duration": 375,
          "airplane": "Boeing 787",
          "airline": "Oman Air",
          "airline_logo": "https://www.gstatic.com/flights/airline_logos/70px/WY.png",
          "travel_class": "Economy",
          "flight_number": "WY 144",
          "legroom": "31 in",
          "overnight": true
        },
        {
          "departure_airport": { "name": "Muscat International Airport", "id": "MCT", "time": "2026-06-11 08:40" },
          "arrival_airport": { "name": "Suvarnabhumi Airport", "id": "BKK", "time": "2026-06-11 17:45" },
          "duration": 365,
          "airplane": "Boeing 787",
          "airline": "Oman Air",
          "airline_logo": "https://www.gstatic.com/flights/airline_logos/70px/WY.png",
          "travel_class": "Economy",
          "flight_number": "WY 815",
          "legroom": "31 in"
        }
      ],
      "layovers": [{ "duration": 155, "name": "Muscat International Airport", "id": "MCT" }],
      "total_duration": 895,
      "carbon_emissions": { "this_flight": 596000, "typical_for_this_route": 628000, "difference_percent": -5 },
      "price": 565,
      "type": "Round trip",
      "departure_token": "mock_token_WY144"
    },
    {
      "flights": [
        {
          "departure_airport": { "name": "Milano Malpensa Airport", "id": "MXP", "time": "2026-06-10 11:40" },
          "arrival_airport": { "name": "Zayed International Airport", "id": "AUH", "time": "2026-06-10 19:40" },
          "duration": 360,
          "airplane": "Boeing 787",
          "airline": "Etihad",
          "airline_logo": "https://www.gstatic.com/flights/airline_logos/70px/EY.png",
          "travel_class": "Economy",
          "flight_number": "EY 82",
          "legroom": "31 in"
        },
        {
          "departure_airport": { "name": "Zayed International Airport", "id": "AUH", "time": "2026-06-10 20:40" },
          "arrival_airport": { "name": "Suvarnabhumi Airport", "id": "BKK", "time": "2026-06-11 06:15" },
          "duration": 395,
          "airplane": "Boeing 787",
          "airline": "Etihad",
          "airline_logo": "https://www.gstatic.com/flights/airline_logos/70px/EY.png",
          "travel_class": "Economy",
          "flight_number": "EY 408",
          "legroom": "31 in",
          "overnight": true
        }
      ],
      "layovers": [{ "duration": 60, "name": "Zayed International Airport", "id": "AUH" }],
      "total_duration": 815,
      "carbon_emissions": { "this_flight": 622000, "typical_for_this_route": 628000, "difference_percent": -1 },
      "price": 609,
      "type": "Round trip",
      "departure_token": "mock_token_EY82"
    },
    {
      "flights": [
        {
          "departure_airport": { "name": "Milano Malpensa Airport", "id": "MXP", "time": "2026-06-10 12:30" },
          "arrival_airport": { "name": "Bahrain International Airport", "id": "BAH", "time": "2026-06-10 19:30" },
          "duration": 360,
          "airplane": "Airbus A321neo",
          "airline": "Gulf Air",
          "airline_logo": "https://www.gstatic.com/flights/airline_logos/70px/GF.png",
          "travel_class": "Economy",
          "flight_number": "GF 22",
          "legroom": "31 in"
        },
        {
          "departure_airport": { "name": "Bahrain International Airport", "id": "BAH", "time": "2026-06-10 22:35" },
          "arrival_airport": { "name": "Suvarnabhumi Airport", "id": "BKK", "time": "2026-06-11 09:45" },
          "duration": 430,
          "airplane": "Boeing 787",
          "airline": "Gulf Air",
          "airline_logo": "https://www.gstatic.com/flights/airline_logos/70px/GF.png",
          "travel_class": "Economy",
          "flight_number": "GF 152",
          "legroom": "32 in",
          "overnight": true
        }
      ],
      "layovers": [{ "duration": 185, "name": "Bahrain International Airport", "id": "BAH" }],
      "total_duration": 975,
      "carbon_emissions": { "this_flight": 694000, "typical_for_this_route": 628000, "difference_percent": 11 },
      "price": 616,
      "type": "Round trip",
      "departure_token": "mock_token_GF22"
    },
    {
      "flights": [
        {
          "departure_airport": { "name": "Milano Malpensa Airport", "id": "MXP", "time": "2026-06-10 14:55" },
          "arrival_airport": { "name": "Zurich Airport", "id": "ZRH", "time": "2026-06-10 15:50" },
          "duration": 55,
          "airplane": "Embraer 190",
          "airline": "SWISS",
          "airline_logo": "https://www.gstatic.com/flights/airline_logos/70px/LX.png",
          "travel_class": "Economy",
          "flight_number": "LX 1629",
          "legroom": "29 in"
        },
        {
          "departure_airport": { "name": "Zurich Airport", "id": "ZRH", "time": "2026-06-10 17:55" },
          "arrival_airport": { "name": "Suvarnabhumi Airport", "id": "BKK", "time": "2026-06-11 09:50" },
          "duration": 655,
          "airplane": "Boeing 777",
          "airline": "SWISS",
          "airline_logo": "https://www.gstatic.com/flights/airline_logos/70px/LX.png",
          "travel_class": "Economy",
          "flight_number": "LX 180",
          "legroom": "31 in",
          "overnight": true
        }
      ],
      "layovers": [{ "duration": 125, "name": "Zurich Airport", "id": "ZRH" }],
      "total_duration": 835,
      "carbon_emissions": { "this_flight": 631000, "typical_for_this_route": 628000, "difference_percent": 0 },
      "price": 659,
      "type": "Round trip",
      "departure_token": "mock_token_LX1629"
    }
  ],
  "other_flights": [
    {
      "flights": [
        {
          "departure_airport": { "name": "Milano Malpensa Airport", "id": "MXP", "time": "2026-06-10 22:55" },
          "arrival_airport": { "name": "Zayed International Airport", "id": "AUH", "time": "2026-06-11 06:55" },
          "duration": 360,
          "airplane": "Boeing 787-10",
          "airline": "Etihad",
          "airline_logo": "https://www.gstatic.com/flights/airline_logos/70px/EY.png",
          "travel_class": "Economy",
          "flight_number": "EY 80",
          "legroom": "31 in",
          "overnight": true
        },
        {
          "departure_airport": { "name": "Zayed International Airport", "id": "AUH", "time": "2026-06-11 08:35" },
          "arrival_airport": { "name": "Suvarnabhumi Airport", "id": "BKK", "time": "2026-06-11 18:10" },
          "duration": 395,
          "airplane": "Boeing 777",
          "airline": "Etihad",
          "airline_logo": "https://www.gstatic.com/flights/airline_logos/70px/EY.png",
          "travel_class": "Economy",
          "flight_number": "EY 406",
          "legroom": "31 in"
        }
      ],
      "layovers": [{ "duration": 100, "name": "Zayed International Airport", "id": "AUH" }],
      "total_duration": 855,
      "carbon_emissions": { "this_flight": 679000, "typical_for_this_route": 628000, "difference_percent": 8 },
      "price": 609,
      "type": "Round trip",
      "departure_token": "mock_token_EY80"
    },
    {
      "flights": [
        {
          "departure_airport": { "name": "Milano Malpensa Airport", "id": "MXP", "time": "2026-06-10 09:40" },
          "arrival_airport": { "name": "Hamad International Airport", "id": "DOH", "time": "2026-06-10 16:25" },
          "duration": 345,
          "airplane": "Airbus A350",
          "airline": "Qatar Airways",
          "airline_logo": "https://www.gstatic.com/flights/airline_logos/70px/QR.png",
          "travel_class": "Economy",
          "flight_number": "QR 124",
          "legroom": "31 in"
        },
        {
          "departure_airport": { "name": "Hamad International Airport", "id": "DOH", "time": "2026-06-10 20:10" },
          "arrival_airport": { "name": "Suvarnabhumi Airport", "id": "BKK", "time": "2026-06-11 07:05" },
          "duration": 415,
          "airplane": "Boeing 787",
          "airline": "Qatar Airways",
          "airline_logo": "https://www.gstatic.com/flights/airline_logos/70px/QR.png",
          "travel_class": "Economy",
          "flight_number": "QR 830",
          "legroom": "31 in",
          "overnight": true
        }
      ],
      "layovers": [{ "duration": 225, "name": "Hamad International Airport", "id": "DOH" }],
      "total_duration": 985,
      "carbon_emissions": { "this_flight": 620000, "typical_for_this_route": 628000, "difference_percent": -1 },
      "price": 624,
      "type": "Round trip",
      "departure_token": "mock_token_QR124"
    },
    {
      "flights": [
        {
          "departure_airport": { "name": "Milano Malpensa Airport", "id": "MXP", "time": "2026-06-10 14:15" },
          "arrival_airport": { "name": "Dubai International Airport", "id": "DXB", "time": "2026-06-10 22:20" },
          "duration": 365,
          "airplane": "Airbus A380",
          "airline": "Emirates",
          "airline_logo": "https://www.gstatic.com/flights/airline_logos/70px/EK.png",
          "travel_class": "Economy",
          "flight_number": "EK 206",
          "legroom": "32 in"
        },
        {
          "departure_airport": { "name": "Dubai International Airport", "id": "DXB", "time": "2026-06-11 02:50" },
          "arrival_airport": { "name": "Suvarnabhumi Airport", "id": "BKK", "time": "2026-06-11 12:30" },
          "duration": 400,
          "airplane": "Airbus A380",
          "airline": "Emirates",
          "airline_logo": "https://www.gstatic.com/flights/airline_logos/70px/EK.png",
          "travel_class": "Economy",
          "flight_number": "EK 384",
          "legroom": "32 in",
          "overnight": true
        }
      ],
      "layovers": [{ "duration": 270, "name": "Dubai International Airport", "id": "DXB", "overnight": true }],
      "total_duration": 1035,
      "carbon_emissions": { "this_flight": 730000, "typical_for_this_route": 628000, "difference_percent": 16 },
      "price": 624,
      "type": "Round trip",
      "departure_token": "mock_token_EK206"
    },
    {
      "flights": [
        {
          "departure_airport": { "name": "Milano Malpensa Airport", "id": "MXP", "time": "2026-06-10 11:25" },
          "arrival_airport": { "name": "Paris Charles de Gaulle Airport", "id": "CDG", "time": "2026-06-10 12:55" },
          "duration": 90,
          "airplane": "Embraer 190",
          "airline": "Air France",
          "airline_logo": "https://www.gstatic.com/flights/airline_logos/70px/AF.png",
          "travel_class": "Economy",
          "flight_number": "AF 1331",
          "legroom": "29 in"
        },
        {
          "departure_airport": { "name": "Paris Charles de Gaulle Airport", "id": "CDG", "time": "2026-06-10 16:40" },
          "arrival_airport": { "name": "Suvarnabhumi Airport", "id": "BKK", "time": "2026-06-11 09:15" },
          "duration": 695,
          "airplane": "Airbus A350",
          "airline": "Air France",
          "airline_logo": "https://www.gstatic.com/flights/airline_logos/70px/AF.png",
          "travel_class": "Economy",
          "flight_number": "AF 198",
          "legroom": "31 in",
          "overnight": true
        }
      ],
      "layovers": [{ "duration": 225, "name": "Paris Charles de Gaulle Airport", "id": "CDG" }],
      "total_duration": 1010,
      "carbon_emissions": { "this_flight": 636000, "typical_for_this_route": 628000, "difference_percent": 1 },
      "price": 640,
      "type": "Round trip",
      "departure_token": "mock_token_AF1331"
    },
    {
      "flights": [
        {
          "departure_airport": { "name": "Milano Malpensa Airport", "id": "MXP", "time": "2026-06-10 10:40" },
          "arrival_airport": { "name": "Istanbul Airport", "id": "IST", "time": "2026-06-10 14:35" },
          "duration": 175,
          "airplane": "Airbus A350",
          "airline": "Turkish Airlines",
          "airline_logo": "https://www.gstatic.com/flights/airline_logos/70px/TK.png",
          "travel_class": "Economy",
          "flight_number": "TK 1874",
          "legroom": "31 in"
        },
        {
          "departure_airport": { "name": "Istanbul Airport", "id": "IST", "time": "2026-06-10 15:50" },
          "arrival_airport": { "name": "Suvarnabhumi Airport", "id": "BKK", "time": "2026-06-11 05:10" },
          "duration": 560,
          "airplane": "Airbus A330",
          "airline": "Turkish Airlines",
          "airline_logo": "https://www.gstatic.com/flights/airline_logos/70px/TK.png",
          "travel_class": "Economy",
          "flight_number": "TK 58",
          "legroom": "31 in",
          "overnight": true
        }
      ],
      "layovers": [{ "duration": 75, "name": "Istanbul Airport", "id": "IST" }],
      "total_duration": 810,
      "carbon_emissions": { "this_flight": 602000, "typical_for_this_route": 628000, "difference_percent": -4 },
      "price": 842,
      "type": "Round trip",
      "departure_token": "mock_token_TK1874"
    },
    {
      "flights": [
        {
          "departure_airport": { "name": "Milano Malpensa Airport", "id": "MXP", "time": "2026-06-10 14:05" },
          "arrival_airport": { "name": "Suvarnabhumi Airport", "id": "BKK", "time": "2026-06-11 05:55" },
          "duration": 650,
          "airplane": "Boeing 787",
          "airline": "THAI",
          "airline_logo": "https://www.gstatic.com/flights/airline_logos/70px/TG.png",
          "travel_class": "Economy",
          "flight_number": "TG 941",
          "legroom": "32 in",
          "overnight": true
        }
      ],
      "total_duration": 650,
      "carbon_emissions": { "this_flight": 594000, "typical_for_this_route": 628000, "difference_percent": -5 },
      "price": 1176,
      "type": "Round trip",
      "departure_token": "mock_token_TG941"
    }
  ]
};

export async function search() {
  return MOCK_RESPONSE;
}
