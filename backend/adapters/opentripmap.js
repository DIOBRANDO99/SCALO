const BASE_URL = "https://api.opentripmap.com/0.1/en/places";

/**
 * Resolve a city name to city-center coordinates via OTM's geoname endpoint.
 * @param {string} city
 * @returns {Promise<{lat: number, lon: number}|null>}
 */
export async function resolveCity(city) {
    const url = new URL(`${BASE_URL}/geoname`);
    url.searchParams.set("name", city);
    url.searchParams.set("apikey", process.env.OPENTRIPMAP_KEY);

    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const data = await res.json();
    if (data.lat == null || data.lon == null) return null;
    return { lat: data.lat, lon: data.lon };
}

/**
 * Fetch POIs near a coordinate from OpenTripMap.
 * Returns only fields guaranteed to be present: xid, name, kinds, rate, lat, lon.
 * Filters out closed venues (names matching pattern like "2009:chiuso").
 *
 * @param {object} opts
 * @param {number} opts.lat
 * @param {number} opts.lon
 * @param {number} [opts.radius=10000]  search radius in metres
 * @param {string} [opts.kinds]         comma-separated OTM kind filter (default: interesting_places)
 * @param {number} [opts.limit=30]      max results
 * @returns {Promise<Array>}
 */
export async function fetchPOIs({ lat, lon, radius = 15000, kinds = "interesting_places", limit = 50 }) {
    const url = new URL(`${BASE_URL}/radius`);
    url.searchParams.set("lat", lat);
    url.searchParams.set("lon", lon);
    url.searchParams.set("radius", radius);
    url.searchParams.set("kinds", kinds);
    url.searchParams.set("limit", limit);
    url.searchParams.set("rate", "2");
    url.searchParams.set("format", "json");
    url.searchParams.set("apikey", process.env.OPENTRIPMAP_KEY);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`OpenTripMap error: ${res.status} ${res.statusText}`);

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    // Matches patterns like "Nome museo (2009:chiuso)" or anything with ":chiuso"
    const closedPattern = /:\s*chiuso|:\s*closed|:\s*demolished|:\s*defunct/i;

    return data
        .map(item => ({
            xid:   item.xid,
            name:  item.name,
            kinds: item.kinds,
            rate:  item.rate ?? 0,
            lat:   item.point?.lat ?? null,
            lon:   item.point?.lon ?? null,
        }))
        .filter(p => p.name && p.xid && !closedPattern.test(p.name));
}
