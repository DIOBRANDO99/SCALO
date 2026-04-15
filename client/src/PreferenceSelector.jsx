import { useState } from "react";

export const PREFERENCES = [
    { id: "nature",    label: "Nature",            kinds: "natural,beaches,nature_reserves,geological_formations,water,glaciers,islands" },
    { id: "history",   label: "History",            kinds: "historic,fortifications,monuments_and_memorials,archaeology,burial_places,historical_places" },
    { id: "culture",   label: "Culture",            kinds: "cultural,museums,theatres_and_entertainments,urban_environment,architecture,historic_architecture" },
    { id: "religion",  label: "Religion",           kinds: "religion,churches,mosques,synagogues,buddhist_temples,hindu_temples,monasteries,cathedrals" },
    { id: "food",      label: "Food & Drink",       kinds: "foods,restaurants,cafes,bars,pubs,biergartens,marketplaces,bakeries" },
    { id: "sport",     label: "Sport & Adventure",  kinds: "sport,amusements,diving,climbing,surfing,skiing,baths_and_saunas,amusement_parks,water_parks" },
    { id: "nightlife", label: "Nightlife",          kinds: "adult,nightclubs,casino,alcohol,hookah" },
];

export function buildKinds(selectedIds) {
    if (selectedIds.length === 0) return "interesting_places";
    return selectedIds
        .map(id => PREFERENCES.find(p => p.id === id)?.kinds)
        .filter(Boolean)
        .join(",");
}

export default function PreferenceSelector({ hub, onSearch, loading }) {
    const [selected, setSelected] = useState([]);

    function toggle(id) {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "4px" }}>
                What are you interested in?
            </h3>
            <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "16px" }}>
                Select one or more — leave all unselected to see everything.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
                {PREFERENCES.map(pref => {
                    const active = selected.includes(pref.id);
                    return (
                        <button
                            key={pref.id}
                            onClick={() => toggle(pref.id)}
                            style={{
                                padding: "6px 14px",
                                borderRadius: "999px",
                                fontSize: "13px",
                                fontWeight: 500,
                                border: active ? "none" : "1px solid #d1d5db",
                                backgroundColor: active ? "#2563eb" : "white",
                                color: active ? "white" : "#374151",
                                cursor: "pointer",
                                transition: "all 0.15s",
                            }}
                        >
                            {pref.label}
                        </button>
                    );
                })}
            </div>

            <button
                onClick={() => onSearch(hub, selected)}
                disabled={loading}
                style={{
                    backgroundColor: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 20px",
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.5 : 1,
                }}
            >
                {loading ? "Loading…" : `Explore ${hub.city || hub.name}`}
            </button>
        </div>
    );
}
