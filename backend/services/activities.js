import { fetchActivitiesByCity, fetchDistrictActivities } from "../adapters/wikivoyage.js";

// Cache keyed by lowercase city name or district slug
const cache = new Map();

/**
 * Return activity data for a city or a specific district sub-page.
 *
 * @param {object} opts
 * @param {string}  opts.city     City name (e.g. "Istanbul")
 * @param {string}  [opts.district] Full district slug (e.g. "Istanbul/Sultanahmet")
 * @returns {Promise<{type: string, ...}>}
 */
export async function getActivities({ city, district }) {
    const key = (district ?? city).toLowerCase();

    if (!cache.has(key)) {
        const data = district
            ? await fetchDistrictActivities(district)
            : await fetchActivitiesByCity(city);
        cache.set(key, data);
    }

    return cache.get(key);
}
