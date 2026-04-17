import { useState } from "react";

const CATEGORY_STYLE = {
    Sights:     { bg: "#dbeafe", text: "#1d4ed8" },
    Activities: { bg: "#dcfce7", text: "#15803d" },
    Food:       { bg: "#fef9c3", text: "#854d0e" },
    Nightlife:  { bg: "#f3e8ff", text: "#7e22ce" },
    Shopping:   { bg: "#ffedd5", text: "#c2410c" },
};

function CategoryBadge({ category }) {
    const style = CATEGORY_STYLE[category] ?? { bg: "#f3f4f6", text: "#4b5563" };
    return (
        <span style={{
            backgroundColor: style.bg,
            color: style.text,
            borderRadius: "4px",
            padding: "2px 8px",
            fontSize: "11px",
            fontWeight: 500,
            whiteSpace: "nowrap",
        }}>
            {category}
        </span>
    );
}

function ListingCard({ listing, category }) {
    const [expanded, setExpanded] = useState(false);
    const hasMeta = listing.address || listing.hours || listing.price || listing.phone;

    return (
        <div
            style={{ borderBottom: "1px solid #f3f4f6", padding: "12px 0", cursor: listing.description || hasMeta ? "pointer" : "default" }}
            onClick={() => (listing.description || hasMeta) && setExpanded(e => !e)}
        >
            {/* Name row */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {listing.name}
                    </span>
                    <CategoryBadge category={category} />
                </div>
                {(listing.description || hasMeta) && (
                    <span style={{ fontSize: "11px", color: "#9ca3af", flexShrink: 0 }}>
                        {expanded ? "▲" : "▼"}
                    </span>
                )}
            </div>

            {/* Expanded details */}
            {expanded && (
                <div style={{ marginTop: "8px" }}>
                    {listing.description && (
                        <p style={{ fontSize: "12px", color: "#374151", lineHeight: "1.5", marginBottom: "6px" }}>
                            {listing.description}
                        </p>
                    )}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {listing.address && (
                            <span style={{ fontSize: "11px", color: "#6b7280" }}>
                                {listing.address}
                            </span>
                        )}
                        {listing.hours && (
                            <span style={{ fontSize: "11px", color: "#6b7280" }}>
                                {listing.hours}
                            </span>
                        )}
                        {listing.price && (
                            <span style={{ fontSize: "11px", color: "#6b7280" }}>
                                {listing.price}
                            </span>
                        )}
                        {listing.phone && (
                            <span style={{ fontSize: "11px", color: "#6b7280" }}>
                                {listing.phone}
                            </span>
                        )}
                    </div>
                    {listing.url && (
                        <a
                            href={listing.url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            style={{ fontSize: "12px", color: "#2563eb", display: "inline-block", marginTop: "4px" }}
                        >
                            Official website →
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}

export default function ActivityPanel({ hub, sections, loading, onBack }) {
    const [activeCategory, setActiveCategory] = useState("All");

    // Build flat category list from sections
    const allCategories = sections.map(s => s.category);
    const uniqueCategories = ["All", ...new Set(allCategories)];

    const totalCount = sections.reduce((n, s) => n + s.listings.length, 0);

    const filteredSections = activeCategory === "All"
        ? sections
        : sections.filter(s => s.category === activeCategory);

    const categoryCounts = {};
    for (const s of sections) {
        categoryCounts[s.category] = (categoryCounts[s.category] ?? 0) + s.listings.length;
    }

    return (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
            {onBack && (
                <button
                    onClick={onBack}
                    style={{ fontSize: "12px", color: "#2563eb", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: "12px", display: "block" }}
                >
                    ← Back to districts
                </button>
            )}
            <div style={{ marginBottom: "16px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "2px" }}>
                    Things to do in {hub.city || hub.name}
                </h3>
                <p style={{ fontSize: "12px", color: "#6b7280" }}>
                    {totalCount} places · via Wikivoyage
                </p>
            </div>

            {/* Category filter */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                {uniqueCategories.map(cat => (
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
                        {cat}{cat !== "All" && categoryCounts[cat] ? ` (${categoryCounts[cat]})` : ""}
                    </button>
                ))}
            </div>

            {/* Listings */}
            {loading && (
                <p style={{ fontSize: "13px", color: "#9ca3af", textAlign: "center", padding: "24px 0" }}>
                    Loading activities…
                </p>
            )}

            {!loading && sections.length === 0 && (
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>
                        No structured activity listings found for this city.
                    </p>
                    <p style={{ fontSize: "12px", color: "#9ca3af" }}>
                        Try searching "{hub.city || hub.name}" directly on{" "}
                        <a href={`https://en.wikivoyage.org/wiki/${encodeURIComponent(hub.city || hub.name)}`} target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>
                            Wikivoyage
                        </a>.
                    </p>
                </div>
            )}

            {!loading && sections.length > 0 && filteredSections.length === 0 && (
                <p style={{ fontSize: "13px", color: "#9ca3af", textAlign: "center", padding: "24px 0" }}>
                    No activities found for this category.
                </p>
            )}

            {!loading && filteredSections.map(sec =>
                sec.listings.map(listing => (
                    <ListingCard key={listing.name} listing={listing} category={sec.category} />
                ))
            )}
        </div>
    );
}
