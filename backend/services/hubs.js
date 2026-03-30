import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATASET_DIR = join(__dirname, "../../dataset");

let airports = null;
let routeGraph = null;
let airportStats = null;

function parseCSVLine(line) {
    const fields = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') inQuotes = !inQuotes;
        else if (ch === "," && !inQuotes) { fields.push(current); current = ""; }
        else current += ch;
    }
    fields.push(current);
    return fields;
}

function loadAirports() {
    if (airports) return airports;

    const raw = readFileSync(join(DATASET_DIR, "airports.csv"), "utf8");
    const lines = raw.split("\n");
    const header = parseCSVLine(lines[0]);
    const idx = {
        type:      header.indexOf("type"),
        lat:       header.indexOf("latitude_deg"),
        lon:       header.indexOf("longitude_deg"),
        iata:      header.indexOf("iata_code"),
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

function loadRouteGraph() {
    if (routeGraph) return { routeGraph, airportStats };

    const activeAirlines = new Set();
    const airlinesRaw = readFileSync(join(DATASET_DIR, "airlines.dat"), "utf8");
    for (const line of airlinesRaw.split("\n")) {
        if (!line.trim()) continue;
        const fields = line.split(",");
        // fields: ID, Name, Alias, IATA, ICAO, Callsign, Country, Active
        const iata = fields[3]?.replace(/"/g, "").trim();
        const active = fields[7]?.replace(/"/g, "").trim();
        if (active === "Y" && iata && iata.length >= 2 && iata !== "-" && iata !== "\\N") {
            activeAirlines.add(iata);
        }
    }
    console.log(`[hubs] Loaded ${activeAirlines.size} active airlines`);

    routeGraph = new Map();
    airportStats = new Map();

    const routesRaw = readFileSync(join(DATASET_DIR, "routes.dat"), "utf8");
    for (const line of routesRaw.split("\n")) {
        if (!line.trim()) continue;
        const fields = line.split(",");
        // fields: Airline, AirlineID, Source, SourceID, Dest, DestID, Codeshare, Stops, Equipment
        const airline = fields[0]?.trim();
        const source = fields[2]?.trim();
        const dest = fields[4]?.trim();

        if (!source || !dest || source === "\\N" || dest === "\\N") continue;
        if (source.length !== 3 || dest.length !== 3) continue;
        if (!activeAirlines.has(airline)) continue;

        // Route graph
        if (!routeGraph.has(source)) routeGraph.set(source, new Set());
        routeGraph.get(source).add(dest);

        // Airport stats
        if (!airportStats.has(source)) airportStats.set(source, { totalRoutes: 0, airlines: new Set() });
        airportStats.get(source).totalRoutes++;
        airportStats.get(source).airlines.add(airline);

        if (!airportStats.has(dest)) airportStats.set(dest, { totalRoutes: 0, airlines: new Set() });
        airportStats.get(dest).totalRoutes++;
        airportStats.get(dest).airlines.add(airline);
    }

    console.log(`[hubs] Built route graph: ${routeGraph.size} airports with outbound routes`);
    return { routeGraph, airportStats };
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
 */
export function findHubs(originIata, destinationIata, factor = 0.2) {
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
            const detourPercent = ((dAC + dCB - dAB) / dAB) * 100;
            hubs.push({ iata: airport.iata, detourPercent });
        }
    }

    console.log(`[hubs] ${originIata}→${destinationIata}: d=${Math.round(dAB)}km, ${hubs.length} airports in ellipse`);
    return hubs;
}

/**
 * Filters hubs to only those with routes A→S AND S→B.
 */
export function filterByRoutes(hubs, originIata, destinationIata) {
    const { routeGraph } = loadRouteGraph();

    const originDests = routeGraph.get(originIata) ?? new Set();
    const filtered = [];

    for (const hub of hubs) {
        const hasRouteFromA = originDests.has(hub.iata);
        const hubDests = routeGraph.get(hub.iata) ?? new Set();
        const hasRouteToB = hubDests.has(destinationIata);

        if (hasRouteFromA && hasRouteToB) {
            filtered.push(hub);
        }
    }

    console.log(`[hubs] Route filter: ${hubs.length} → ${filtered.length} (A→S and S→B exist)`);
    return filtered;
}

const FALLBACK_HUBS = [
    "IST", "AUH", "DOH", "DXB", "LHR",
    "CDG", "FRA", "ZRH", "WAW", "MCT",
    "BAH", "MAD", "SIN", "HKG", "JFK", "ORD",
];

/**
 * Pipeline: ellipse → route filter. Returns all hubs with verified routes.
 * @param {string} originIata
 * @param {string} destinationIata
 * @param {object} options
 * @param {number} options.factor - ellipse tolerance (default 0.1)
 * @returns {string[]} IATA codes of hubs with A→S and S→B routes
 */
export function selectBestHubs(originIata, destinationIata, { factor = 0.1 } = {}) {
    const ellipseHubs = findHubs(originIata, destinationIata, factor);
    if (!ellipseHubs || ellipseHubs.length === 0) {
        console.log(`[hubs] Ellipse returned nothing, using fallback`);
        return FALLBACK_HUBS;
    }

    const routed = filterByRoutes(ellipseHubs, originIata, destinationIata);
    if (routed.length === 0) {
        console.log(`[hubs] No routed hubs found, using fallback`);
        return FALLBACK_HUBS;
    }

    const result = routed.map((h) => h.iata);
    console.log(`[hubs] Selected ${result.length} routed hubs: ${result.join(", ")}`);
    return result;
}
