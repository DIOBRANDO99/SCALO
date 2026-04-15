import { resolveCity, fetchPOIs } from "../adapters/opentripmap.js";

// In-memory caches
const coordsCache = new Map(); // city → {lat, lon}
const cache = new Map();       // "city::kinds" → pois

/**
 * Returns POIs for a given city name.
 * Resolves the city to city-center coordinates first via OTM geoname,
 * then fetches POIs around that point.
 *
 * @param {object} opts
 * @param {string} opts.city   city name (e.g. "Rome", "Istanbul")
 * @param {string} [opts.kinds]
 * @param {number} [opts.limit]
 * @returns {Promise<Array>}
 */
export async function getActivities({ city, kinds, limit }) {
    const cacheKey = `${city.toLowerCase()}::${kinds ?? "interesting_places"}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const cityKey = city.toLowerCase();
    let coords = coordsCache.get(cityKey);
    if (!coords) {
        coords = await resolveCity(city);
        if (!coords) throw new Error(`Could not resolve city coordinates for "${city}"`);
        coordsCache.set(cityKey, coords);
    }

    const pois = await fetchPOIs({ lat: coords.lat, lon: coords.lon, kinds, limit });
    cache.set(cacheKey, pois);
    return pois;
}
