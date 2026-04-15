const BASE_URL = "https://api.opentripmap.com/0.1/en/places";

/**
 * Fetch POIs near a coordinate from OpenTripMap.
 * Returns only fields guaranteed to be present: xid, name, kinds, rate, lat, lon.
 *
 * @param {object} opts
 * @param {number} opts.lat
 * @param {number} opts.lon
 * @param {number} [opts.radius=5000]   search radius in metres
 * @param {string} [opts.kinds]         comma-separated OTM kind filter (default: interesting_places)
 * @param {number} [opts.limit=20]      max results
 * @returns {Promise<Array>}
 */
export async function fetchPOIs({ lat, lon, radius = 5000, kinds = "interesting_places", limit = 20 }) {
    const url = new URL(`${BASE_URL}/radius`);
    url.searchParams.set("lat", lat);
    url.searchParams.set("lon", lon);
    url.searchParams.set("radius", radius);
    url.searchParams.set("kinds", kinds);
    url.searchParams.set("limit", limit);
    url.searchParams.set("rate", "2");           // skip very minor POIs
    url.searchParams.set("format", "json");
    url.searchParams.set("apikey", process.env.OPENTRIPMAP_KEY);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`OpenTripMap error: ${res.status} ${res.statusText}`);

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map(item => ({
        xid:   item.xid,
        name:  item.name,
        kinds: item.kinds,
        rate:  item.rate ?? 0,
        lat:   item.point?.lat ?? null,
        lon:   item.point?.lon ?? null,
    })).filter(p => p.name && p.xid);
}
