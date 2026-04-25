import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync, existsSync } from "fs";

const SAMPLES_DIR = join(dirname(fileURLToPath(import.meta.url)), "../../doc/samples/gyg");
const GYG_API_BASE = "https://api.getyourguide.com/1";
const EMPTY = { _metadata: { status: "OK", totalCount: 0 }, data: { tours: [] } };

async function fetchFromAPI(city) {
    const url = `${GYG_API_BASE}/tours?${new URLSearchParams({
        q: city,
        cnt_language: "en",
        currency: "EUR",
        limit: "20",
    })}`;
    const res = await fetch(url, {
        headers: { "X-ACCESS-TOKEN": process.env.GYG_API_KEY },
    });
    if (!res.ok) throw new Error(`GYG API ${res.status}`);
    return res.json();
}

function fetchFromSample(city) {
    const file = join(SAMPLES_DIR, `gyg_tours_${city.trim().toLowerCase()}.json`);
    if (!existsSync(file)) return EMPTY;
    return JSON.parse(readFileSync(file, "utf-8"));
}

export async function fetchActivitiesByCity(city) {
    if (process.env.GYG_API_KEY) return fetchFromAPI(city);
    return fetchFromSample(city);
}

export async function fetchDistrictActivities(_slug) {
    throw new Error("GYG provider does not support district sub-pages.");
}
