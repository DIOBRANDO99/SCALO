export default function DistrictSelector({ hub, districts, onSelect }) {
    return (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "4px" }}>
                {hub.city || hub.name} is split into districts
            </h3>
            <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "16px" }}>
                Pick a district to see its activities.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {districts.map(d => (
                    <button
                        key={d.slug}
                        onClick={() => onSelect(d.slug)}
                        style={{
                            padding: "6px 16px",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: 500,
                            border: "1px solid #d1d5db",
                            backgroundColor: "white",
                            color: "#374151",
                            cursor: "pointer",
                            transition: "all 0.15s",
                        }}
                        onMouseEnter={e => { e.target.style.backgroundColor = "#f3f4f6"; }}
                        onMouseLeave={e => { e.target.style.backgroundColor = "white"; }}
                    >
                        {d.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
