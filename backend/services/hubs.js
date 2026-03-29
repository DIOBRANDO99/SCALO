import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CSV_PATH = join(__dirname, "../../dataset/airports.csv");

let airports = null;

function parseCSVLine(line) {
    const fields = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            inQuotes = !inQuotes;
        } else if (ch === "," && !inQuotes) {
            fields.push(current);
            current = "";
        } else {
            current += ch;
        }
    }
    fields.push(current);
    return fields;
}

function loadAirports() {
    if (airports) return airports;

    const raw = readFileSync(CSV_PATH, "utf8");
    const lines = raw.split("\n");
    const header = parseCSVLine(lines[0]);

    // Find column indices by name
    const idx = {
        type:     header.indexOf("type"),
        lat:      header.indexOf("latitude_deg"),
        lon:      header.indexOf("longitude_deg"),
        iata:     header.indexOf("iata_code"),
        scheduled: header.indexOf("scheduled_service"),
    };

    airports = [];
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const fields = parseCSVLine(lines[i]);

        const type = fields[idx.type];
        const scheduled = fields[idx.scheduled];
        const iata = fields[idx.iata];
        const lat = parseFloat(fields[idx.lat]);
        const lon = parseFloat(fields[idx.lon]);

        if (type !== "large_airport") continue;
        if (scheduled !== "yes") continue;
        if (!iata || iata.length !== 3) continue;
        if (isNaN(lat) || isNaN(lon)) continue;

        airports.push({ iata, lat, lon });
    }

    console.log(`[hubs] Loaded ${airports.length} large airports`);
    return airports;
}

function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Returns IATA codes of large airports inside the ellipse A→B.
 * @param {string} originIata
 * @param {string} destinationIata
 * @param {number} factor - detour tolerance (default 0.2 = 20%)
 * @returns {string[]|null} IATA codes, or null if origin/dest not found
 */
export function findHubs(originIata, destinationIata, factor = 0.1) {
    const allAirports = loadAirports();

    const origin = allAirports.find((a) => a.iata === originIata);
    const dest = allAirports.find((a) => a.iata === destinationIata);

    if (!origin || !dest) return null;

    const dAB = haversine(origin.lat, origin.lon, dest.lat, dest.lon);
    const dMax = (1 + factor) * dAB;

    const hubs = [];

    for (const airport of allAirports) {
        if (airport.iata === originIata || airport.iata === destinationIata) continue;

        const dAC = haversine(origin.lat, origin.lon, airport.lat, airport.lon);
        const dCB = haversine(airport.lat, airport.lon, dest.lat, dest.lon);

        if (dAC + dCB <= dMax) {
            hubs.push(airport.iata);
        }
    }

    console.log(`[hubs] ${originIata}→${destinationIata}: d=${Math.round(dAB)}km, ${hubs.length} airports in ellipse`);
    return hubs;
}
