import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATASET_DIR = join(__dirname, "../../dataset");

let airports = null;
let routeGraph = null;
let airportStats = null;
let nameMap = null;

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

function buildNameMap() {
    if (nameMap) return nameMap;

    const raw = readFileSync(join(DATASET_DIR, "airports.csv"), "utf8");
    const lines = raw.split("\n");
    const header = parseCSVLine(lines[0]);
    const iataIdx = header.indexOf("iata_code");
    const nameIdx = header.indexOf("name");

    nameMap = new Map();
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const fields = parseCSVLine(lines[i]);
        const iata = fields[iataIdx];
        const name = fields[nameIdx];
        if (iata && iata.length === 3 && name) {
            nameMap.set(iata, name);
        }
    }
    return nameMap;
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

function hasRoute(fromIata, toIata) {
    const { routeGraph } = loadRouteGraph();
    const dests = routeGraph.get(fromIata);
    return dests ? dests.has(toIata) : false;
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
            hubs.push(airport.iata);
        }
    }

    console.log(`[hubs] ${originIata}→${destinationIata}: d=${Math.round(dAB)}km, ${hubs.length} airports in ellipse`);
    return hubs;
}

/**
 * Returns hub candidates with full details for the frontend map.
 * Pipeline: ellipse filter → route existence filter → enrich with details.
 * @param {string} originIata
 * @param {string} destinationIata
 * @param {number} factor - ellipse tolerance (default 0.2)
 * @returns {object|null} { origin, destination, directDistance, hubs[] }
 */
export function getHubsWithDetails(originIata, destinationIata, factor = 0.2) {
    const allAirports = loadAirports();

    const origin = allAirports.find((a) => a.iata === originIata);
    const dest = allAirports.find((a) => a.iata === destinationIata);

    if (!origin || !dest) return null;

    const dAB = haversine(origin.lat, origin.lon, dest.lat, dest.lon);
    const dMax = (1 + factor) * dAB;

    const names = buildNameMap();
    const { airportStats } = loadRouteGraph();

    const hubs = [];
    for (const airport of allAirports) {
        if (airport.iata === originIata || airport.iata === destinationIata) continue;

        const dAC = haversine(origin.lat, origin.lon, airport.lat, airport.lon);
        const dCB = haversine(airport.lat, airport.lon, dest.lat, dest.lon);

        if (dAC + dCB <= dMax) {
            if (!hasRoute(originIata, airport.iata) || !hasRoute(airport.iata, destinationIata)) continue;

            const detourPercent = Math.round(((dAC + dCB - dAB) / dAB) * 1000) / 10;
            const stats = airportStats.get(airport.iata);

            hubs.push({
                iata: airport.iata,
                lat: airport.lat,
                lon: airport.lon,
                name: names.get(airport.iata) ?? airport.iata,
                routeCount: stats?.totalRoutes ?? 0,
                detourPercent,
            });
        }
    }

    console.log(`[hubs] getHubsWithDetails ${originIata}→${destinationIata}: ${hubs.length} hubs with details`);

    return {
        origin: { iata: originIata, lat: origin.lat, lon: origin.lon, name: names.get(originIata) ?? originIata },
        destination: { iata: destinationIata, lat: dest.lat, lon: dest.lon, name: names.get(destinationIata) ?? destinationIata },
        directDistance: Math.round(dAB),
        hubs,
    };
}
