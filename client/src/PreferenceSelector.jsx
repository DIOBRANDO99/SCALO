import { useState } from "react";

// Matches the SECTION_TO_CATEGORY mapping in the backend adapter
export const SECTIONS = [
    { id: "See",   label: "Sights",     emoji: "🏛" },
    { id: "Do",    label: "Activities", emoji: "🎯" },
    { id: "Eat",   label: "Food",       emoji: "🍽" },
    { id: "Drink", label: "Nightlife",  emoji: "🍹" },
    { id: "Buy",   label: "Shopping",   emoji: "🛍" },
];

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
                What do you want to do in {hub.city || hub.name}?
            </h3>
            <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "16px" }}>
                Pick one or more categories — leave all unselected to see everything.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
                {SECTIONS.map(sec => {
                    const active = selected.includes(sec.id);
                    return (
                        <button
                            key={sec.id}
                            onClick={() => toggle(sec.id)}
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
                            {sec.label}
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
