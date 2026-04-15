import { fetchPOIs } from "../adapters/opentripmap.js";

// Simple in-memory cache keyed by "lat,lon"
const cache = new Map();

/**
 * Returns POIs near the given coordinates.
 * Results are cached for the lifetime of the server process.
 *
 * @param {object} opts
 * @param {number} opts.lat
 * @param {number} opts.lon
 * @param {string} [opts.kinds]
 * @param {number} [opts.limit]
 * @returns {Promise<Array>}
 */
export async function getActivities({ lat, lon, kinds, limit }) {
    const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const pois = await fetchPOIs({ lat, lon, kinds, limit });
    cache.set(cacheKey, pois);
    return pois;
}
