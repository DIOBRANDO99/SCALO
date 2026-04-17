const API_BASE = "https://en.wikivoyage.org/w/api.php";

// Map Wikivoyage section titles → display category
const SECTION_TO_CATEGORY = {
    "See":                  "Sights",
    "Do":                   "Activities",
    "Eat":                  "Food",
    "Eat and drink":        "Food",
    "Drink":                "Nightlife",
    "Drink and nightlife":  "Nightlife",
    "Buy":                  "Shopping",
};

async function apiGet(params) {
    const url = new URL(API_BASE);
    url.searchParams.set("format", "json");
    url.searchParams.set("formatversion", "2");
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

    const res = await fetch(url.toString(), {
        headers: { "User-Agent": "SCALO/1.1 (university project; https://github.com/DIOBRANDO99/SCALO)" },
    });
    if (!res.ok) throw new Error(`Wikivoyage API error: ${res.status} ${res.statusText}`);
    return res.json();
}

/**
 * Find the best-matching Wikivoyage page title for a city name.
 * Returns null if nothing useful is found.
 */
export async function findPageTitle(city) {
    const data = await apiGet({
        action: "query",
        list: "search",
        srsearch: city,
        srnamespace: "0",
        srlimit: "5",
    });
    const results = data?.query?.search ?? [];
    if (results.length === 0) return null;
    // Prefer an exact or prefix match on the city name
    const lower = city.toLowerCase();
    const exact = results.find(r => r.title.toLowerCase() === lower);
    if (exact) return exact.title;
    const prefix = results.find(r => r.title.toLowerCase().startsWith(lower));
    return (prefix ?? results[0]).title;
}

/**
 * Fetch raw wikitext for a page title.
 */
async function fetchWikitext(title) {
    const data = await apiGet({
        action: "query",
        titles: title,
        prop: "revisions",
        rvprop: "content",
        rvslots: "main",
    });
    const page = (data?.query?.pages ?? [])[0];
    if (!page || page.missing) return null;
    return page.revisions?.[0]?.slots?.main?.content ?? null;
}

/**
 * Parse wikitext into sections of activity listings.
 * Returns an array of { section, category, listings[] }.
 */
function parseWikitextListings(wikitext) {
    const sections = splitSections(wikitext);
    const result = [];

    for (const [title, body] of sections) {
        const category = SECTION_TO_CATEGORY[title];
        if (!category) continue;
        const listings = extractListings(body);
        if (listings.length > 0) result.push({ section: title, category, listings });
    }

    return result;
}

/**
 * Split wikitext into [sectionTitle, sectionBody] pairs.
 * Only handles level-2 headings (== Heading ==).
 */
function splitSections(wikitext) {
    const sections = [];
    let current = null;
    let lines = [];

    for (const line of wikitext.split("\n")) {
        const h2 = /^==\s*([^=]+?)\s*==\s*$/.exec(line);
        if (h2) {
            if (current !== null) sections.push([current, lines.join("\n")]);
            current = h2[1].trim();
            lines = [];
        } else if (current !== null) {
            lines.push(line);
        }
    }
    if (current !== null) sections.push([current, lines.join("\n")]);
    return sections;
}

/**
 * Extract all {{listing|...}}, {{see|...}}, {{do|...}}, {{eat|...}},
 * {{drink|...}}, {{buy|...}} templates from a section body.
 */
function extractListings(text) {
    const listings = [];
    // Match opening {{ for any of the listing-type templates
    const templateRe = /\{\{\s*(?:listing|see|do|eat|drink|buy|sleep|go)\s*\|/gi;
    let match;

    while ((match = templateRe.exec(text)) !== null) {
        const start = match.index;
        const inner = extractTemplateInner(text, start);
        if (inner === null) continue;
        const params = parseParams(inner);
        if (!params.name) continue;
        listings.push({
            name:        cleanWiki(params.name),
            description: cleanWiki(params.content ?? params.description ?? null),
            address:     cleanWiki(params.address ?? null),
            url:         params.url?.trim() || null,
            hours:       cleanWiki(params.hours ?? null),
            price:       cleanWiki(params.price ?? null),
            phone:       cleanWiki(params.phone ?? params.tollfree ?? null),
            lat:         parseFloat(params.lat) || null,
            lon:         parseFloat(params.long) || null,
        });
    }

    return listings;
}

/**
 * Given text and the index of '{{', walk forward counting braces to find the
 * matching '}}' and return everything between them (excluding the outer {{ }}).
 */
function extractTemplateInner(text, start) {
    let depth = 0;
    let i = start;
    while (i < text.length) {
        if (text[i] === "{" && text[i + 1] === "{") { depth++; i += 2; }
        else if (text[i] === "}" && text[i + 1] === "}") {
            depth--;
            if (depth === 0) {
                // Return only the inner part (skip opening {{ and closing }})
                const inner = text.slice(start + 2, i);
                // Strip the template name prefix up to the first |
                const pipeIdx = inner.indexOf("|");
                return pipeIdx === -1 ? null : inner.slice(pipeIdx + 1);
            }
            i += 2;
        } else {
            i++;
        }
    }
    return null;
}

/**
 * Split template parameters on | respecting nested {{ }} and [[ ]].
 * Returns { paramName: value } object.
 */
function parseParams(inner) {
    const parts = smartSplit(inner, "|");
    const params = {};
    for (const part of parts) {
        const eq = part.indexOf("=");
        if (eq === -1) continue;
        const key = part.slice(0, eq).trim().toLowerCase();
        const val = part.slice(eq + 1).trim();
        if (key) params[key] = val;
    }
    return params;
}

function smartSplit(str, delim) {
    const parts = [];
    let depth = 0;
    let cur = "";
    for (let i = 0; i < str.length; i++) {
        const c = str[i];
        if ((c === "{" || c === "[") && str[i + 1] === c) { depth++; cur += c; continue; }
        if ((c === "}" || c === "]") && str[i + 1] === c) {
            depth--;
            cur += c;
            continue;
        }
        if (c === delim && depth === 0) { parts.push(cur); cur = ""; }
        else cur += c;
    }
    if (cur) parts.push(cur);
    return parts;
}

/**
 * Strip basic wiki markup from a string so it's clean plain text.
 */
function cleanWiki(s) {
    if (!s) return null;
    return s
        .replace(/\[\[([^\]|]+\|)?([^\]]+)\]\]/g, "$2") // [[link|text]] or [[text]]
        .replace(/\[https?:\/\/\S+ ([^\]]+)\]/g, "$1")   // [url text]
        .replace(/'{2,3}/g, "")                           // '' or '''
        .replace(/<[^>]+>/g, "")                          // HTML tags
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .trim() || null;
}

/**
 * Returns true if the page delegates its activity sections to district sub-pages.
 */
function hasDistricts(wikitext) {
    return /\{\{(?:printDistricts|seeDistricts)\b/i.test(wikitext);
}

/**
 * Extract all [[PageTitle/District]] links from the wikitext.
 * Returns [{ name: "Sultanahmet", slug: "Istanbul/Sultanahmet" }, ...]
 */
function extractDistrictLinks(wikitext, pageTitle) {
    const escaped = pageTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Exclude ], |, /, # from district name so we don't pick up anchor fragments
    const re = new RegExp(`\\[\\[${escaped}/([^\\]|/#]+?)(?:[#|][^\\]]*)?\\]\\]`, "g");
    const seen = new Set();
    const districts = [];
    for (const m of wikitext.matchAll(re)) {
        // Wikivoyage uses spaces in page titles; underscores are equivalent
        const name = m[1].trim().replace(/_/g, " ");
        if (name && !seen.has(name)) {
            seen.add(name);
            districts.push({ name, slug: `${pageTitle}/${name}` });
        }
    }
    return districts;
}

/**
 * Fetch listings for a specific district sub-page (e.g. "Istanbul/Sultanahmet").
 * Returns { type: "listings", sections: [...] }
 */
export async function fetchDistrictActivities(slug) {
    const wikitext = await fetchWikitext(slug);
    if (!wikitext) throw new Error(`No Wikivoyage content found for "${slug}"`);
    return { type: "listings", sections: parseWikitextListings(wikitext) };
}

/**
 * Main export: fetch activity data for a city.
 * Returns one of:
 *   { type: "listings",  sections: [...] }        — city has direct listings
 *   { type: "districts", pageTitle, districts: [...] } — city splits into sub-pages
 */
export async function fetchActivitiesByCity(city) {
    const title = await findPageTitle(city);
    if (!title) throw new Error(`No Wikivoyage page found for "${city}"`);

    const wikitext = await fetchWikitext(title);
    if (!wikitext) throw new Error(`Could not retrieve Wikivoyage content for "${title}"`);

    if (hasDistricts(wikitext)) {
        const districts = extractDistrictLinks(wikitext, title);
        if (districts.length > 0) {
            return { type: "districts", pageTitle: title, districts };
        }
    }

    return { type: "listings", sections: parseWikitextListings(wikitext) };
}
