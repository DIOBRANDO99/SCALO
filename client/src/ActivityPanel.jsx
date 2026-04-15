import { useState } from "react";

// Maps OTM kind strings to display categories
const KIND_TO_CATEGORY = {
    // Culture
    cultural:                      "Culture",
    museums:                       "Culture",
    other_museums:                 "Culture",
    historic_architecture:         "Culture",
    historic:                      "Culture",
    architecture:                  "Culture",
    historic_object:               "Culture",
    historical_places:             "Culture",
    tourist_object:                "Culture",
    tourist_facilities:            "Culture",
    fortifications:                "Culture",
    defensive_walls:               "Culture",
    monuments:                     "Culture",
    monuments_and_memorials:       "Culture",
    sculptures:                    "Culture",
    palaces:                       "Culture",
    manor_houses:                  "Culture",
    theatres_and_entertainments:   "Culture",
    theatres:                      "Culture",
    other_theatres:                "Culture",
    music_venues:                  "Culture",
    cinemas:                       "Culture",
    religion:                      "Culture",
    churches:                      "Culture",
    catholic_churches:             "Culture",
    other_churches:                "Culture",
    other_temples:                 "Culture",
    mosques:                       "Culture",
    temples:                       "Culture",
    synagogues:                    "Culture",
    // History
    archaeology:                   "History",
    other_archaeological_sites:    "History",
    amphitheatres:                 "History",
    aqueducts:                     "History",
    roman_villas:                  "History",
    necropolises:                  "History",
    mausoleums:                    "History",
    burial_places:                 "History",
    settlements:                   "History",
    // Nature
    natural:                       "Nature",
    parks:                         "Nature",
    beaches:                       "Nature",
    scenic_viewpoints:             "Nature",
    gardens:                       "Nature",
    forests:                       "Nature",
    mountains:                     "Nature",
    waterfalls:                    "Nature",
    // Food
    foods:                         "Food",
    restaurants:                   "Food",
    cafes:                         "Food",
    bars:                          "Food",
    fast_food:                     "Food",
    markets:                       "Food",
    // Adventure
    amusements:                    "Adventure",
    sport:                         "Adventure",
    outdoor_activities:            "Adventure",
    amusement_parks:               "Adventure",
    water_parks:                   "Adventure",
    zoos_and_aquariums:            "Adventure",
};

const CATEGORY_STYLE = {
    Culture:   { bg: "#dbeafe", text: "#1d4ed8" },
    History:   { bg: "#fef9c3", text: "#854d0e" },
    Nature:    { bg: "#dcfce7", text: "#15803d" },
    Food:      { bg: "#f3e8ff", text: "#7e22ce" },
    Adventure: { bg: "#ffedd5", text: "#c2410c" },
    Other:     { bg: "#f3f4f6", text: "#4b5563" },
};

const ALL_CATEGORIES = ["Culture", "History", "Nature", "Food", "Adventure", "Other"];

const CATEGORY_PRIORITY = ["Food", "Adventure", "Nature", "History", "Culture"];

function getCategories(kinds) {
    const cats = new Set(
        kinds.split(",").map(k => KIND_TO_CATEGORY[k.trim()]).filter(Boolean)
    );
    return cats.size > 0 ? [...cats] : ["Other"];
}

function getPrimaryCategory(kinds) {
    const cats = getCategories(kinds);
    for (const priority of CATEGORY_PRIORITY) {
        if (cats.includes(priority)) return priority;
    }
    return "Other";
}

function CategoryChip({ category, small = false }) {
    const style = CATEGORY_STYLE[category] ?? CATEGORY_STYLE.Other;
    return (
        <span style={{
            backgroundColor: style.bg,
            color: style.text,
            borderRadius: "4px",
            padding: small ? "1px 6px" : "2px 8px",
            fontSize: small ? "10px" : "11px",
            fontWeight: 500,
        }}>
            {category}
        </span>
    );
}

function POIItem({ poi }) {
    const [expanded, setExpanded] = useState(false);
    const category = getPrimaryCategory(poi.kinds);

    return (
        <div
            style={{ borderBottom: "1px solid #f3f4f6", padding: "10px 0", cursor: "pointer" }}
            onClick={() => setExpanded(e => !e)}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {poi.name}
                    </span>
                    <CategoryChip category={category} small />
                </div>
                <span style={{ fontSize: "11px", color: "#9ca3af", flexShrink: 0 }}>
                    {expanded ? "▲" : "▼"}
                </span>
            </div>

            {expanded && (
                <div style={{ marginTop: "6px", fontSize: "11px", color: "#9ca3af" }}>
                    {getCategories(poi.kinds).join(" · ")}
                </div>
            )}
        </div>
    );
}

export default function ActivityPanel({ hub, pois, loading }) {
    const [activeCategory, setActiveCategory] = useState("All");

    const filtered = activeCategory === "All"
        ? pois
        : pois.filter(p => getCategories(p.kinds).includes(activeCategory));

    const categoryCounts = {};
    for (const p of pois) {
        for (const cat of getCategories(p.kinds)) {
            categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1;
        }
    }

    return (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div style={{ marginBottom: "16px" }}>
                <p style={{ fontSize: "12px", color: "#6b7280" }}>{pois.length} places found</p>
            </div>

            {/* Category filter chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                {["All", ...ALL_CATEGORIES.filter(c => categoryCounts[c])].map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        style={{
                            padding: "4px 12px",
                            borderRadius: "999px",
                            fontSize: "12px",
                            fontWeight: 500,
                            border: activeCategory === cat ? "none" : "1px solid #d1d5db",
                            backgroundColor: activeCategory === cat ? "#2563eb" : "white",
                            color: activeCategory === cat ? "white" : "#374151",
                            cursor: "pointer",
                        }}
                    >
                        {cat} {cat !== "All" && categoryCounts[cat] ? `(${categoryCounts[cat]})` : ""}
                    </button>
                ))}
            </div>

            {/* POI list */}
            {loading && (
                <p style={{ fontSize: "13px", color: "#9ca3af", textAlign: "center", padding: "24px 0" }}>Loading activities…</p>
            )}

            {!loading && filtered.length === 0 && (
                <p style={{ fontSize: "13px", color: "#9ca3af", textAlign: "center", padding: "24px 0" }}>No activities found for this category.</p>
            )}

            {!loading && filtered.map(poi => (
                <POIItem key={poi.xid} poi={poi} />
            ))}
        </div>
    );
}
