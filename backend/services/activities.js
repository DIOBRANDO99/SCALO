const cache = new Map();

function getProvider() {
    return process.env.ACTIVITY_PROVIDER || "wikivoyage";
}

async function getAdapter() {
    const provider = getProvider();
    if (provider === "gyg") return import("../adapters/gyg.js");
    return import("../adapters/wikivoyage.js");
}

function formatDuration({ duration, unit }) {
    return `${duration} ${unit}${duration !== 1 ? "s" : ""}`;
}

function normalizeGYG(raw) {
    const tours = raw.data?.tours ?? [];
    const grouped = new Map();

    for (const tour of tours) {
        const cat = tour.categories?.[0]?.name ?? "Tours & Sightseeing";
        if (!grouped.has(cat)) grouped.set(cat, []);
        grouped.get(cat).push({
            name: tour.title,
            description: tour.description || tour.abstract || null,
            thumbnail: tour.pictures?.[0]?.ssl_url ?? null,
            rating: tour.overall_rating ?? null,
            reviews: tour.number_of_ratings ?? null,
            priceAmount: tour.price?.values?.amount ?? null,
            originalPrice: tour.price?.values?.special?.original_price ?? null,
            currency: "EUR",
            duration: tour.durations?.length ? formatDuration(tour.durations[0]) : null,
            bookingUrl: tour.url ?? null,
            cancellable: tour.cancellation_policy?.cancellable ?? false,
            lat: tour.coordinates?.lat ?? null,
            lon: tour.coordinates?.long ?? null,
        });
    }

    return {
        type: "listings",
        provider: "gyg",
        sections: [...grouped.entries()].map(([category, listings]) => ({ category, listings })),
    };
}

export async function getActivities({ city, district }) {
    const provider = getProvider();
    const cacheKey = `${provider}:${(district ?? city).toLowerCase()}`;

    if (!cache.has(cacheKey)) {
        const adapter = await getAdapter();
        const raw = district
            ? await adapter.fetchDistrictActivities(district)
            : await adapter.fetchActivitiesByCity(city);

        const data = provider === "gyg"
            ? normalizeGYG(raw)
            : { ...raw, provider: "wikivoyage" };

        cache.set(cacheKey, data);
    }

    return cache.get(cacheKey);
}
