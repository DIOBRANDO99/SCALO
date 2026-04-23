const cache = new Map();

async function getAdapter() {
    const provider = process.env.ACTIVITY_PROVIDER || "wikivoyage";
    if (provider === "gyg_mock") return import("../adapters/gyg_mock.js");
    return import("../adapters/wikivoyage.js");
}

/**
 * Return activity data for a city or a specific district sub-page.
 *
 * Provider is selected via the ACTIVITY_PROVIDER env var:
 *   - "wikivoyage" (default): live data from Wikivoyage
 *   - "gyg_mock": GetYourGuide-style mock data for 5 demo cities
 *
 * @param {object} opts
 * @param {string}  opts.city     City name (e.g. "Istanbul")
 * @param {string}  [opts.district] Full district slug (e.g. "Istanbul/Sultanahmet")
 * @returns {Promise<{type: string, ...}>}
 */
export async function getActivities({ city, district }) {
    const key = (district ?? city).toLowerCase();

    if (!cache.has(key)) {
        const adapter = await getAdapter();
        const data = district
            ? await adapter.fetchDistrictActivities(district)
            : await adapter.fetchActivitiesByCity(city);
        cache.set(key, data);
    }

    return cache.get(key);
}