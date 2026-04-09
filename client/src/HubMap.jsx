import { useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function greatCirclePoints(lat1, lon1, lat2, lon2, n = 60) {
    const toRad = d => d * Math.PI / 180;
    const toDeg = r => r * 180 / Math.PI;
    const phi1 = toRad(lat1), lam1 = toRad(lon1);
    const phi2 = toRad(lat2), lam2 = toRad(lon2);
    const dPhi = phi2 - phi1, dLam = lam2 - lam1;
    const a = Math.sin(dPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLam / 2) ** 2;
    const d = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    if (d === 0) return [[lat1, lon1], [lat2, lon2]];
    const points = [];
    for (let i = 0; i <= n; i++) {
        const f = i / n;
        const A = Math.sin((1 - f) * d) / Math.sin(d);
        const B = Math.sin(f * d) / Math.sin(d);
        const x = A * Math.cos(phi1) * Math.cos(lam1) + B * Math.cos(phi2) * Math.cos(lam2);
        const y = A * Math.cos(phi1) * Math.sin(lam1) + B * Math.cos(phi2) * Math.sin(lam2);
        const z = A * Math.sin(phi1) + B * Math.sin(phi2);
        points.push([toDeg(Math.atan2(z, Math.sqrt(x * x + y * y))), toDeg(Math.atan2(y, x))]);
    }
    // Fix antimeridian crossing: make longitudes continuous so Leaflet doesn't draw
    // a horizontal line across the map when the path crosses ±180°
    for (let i = 1; i < points.length; i++) {
        const dLon = points[i][1] - points[i - 1][1];
        if (dLon > 180) points[i][1] -= 360;
        else if (dLon < -180) points[i][1] += 360;
    }
    return points;
}

async function fetchWikiSummary(city, fallback) {
    async function tryFetch(term) {
        try {
            const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term)}`);
            if (!res.ok) return null;
            const data = await res.json();
            if (data.type === "disambiguation") return null;
            return { extract: data.extract, pageUrl: data.content_urls?.desktop?.page, thumbnail: data.thumbnail?.source ?? null };
        } catch {
            return null;
        }
    }
    if (!city) return null;
    return (await tryFetch(city)) ?? (fallback ? await tryFetch(fallback) : null);
}

export default function HubMap({ hubData, onHubSelect, onShowAll, onShowBest, loading }) {
    const { origin, destination, hubs, totalHubs } = hubData;
    const [wikiCache, setWikiCache] = useState({});

    async function handleHover(hub) {
        if (!hub.city || wikiCache[hub.iata] !== undefined) return;
        setWikiCache(prev => ({ ...prev, [hub.iata]: null })); // mark as loading
        const result = await fetchWikiSummary(hub.city, hub.name);
        setWikiCache(prev => ({ ...prev, [hub.iata]: result }));
    }

    const arc = greatCirclePoints(origin.lat, origin.lon, destination.lat, destination.lon);
    const originPos = arc[0];
    const destPos = arc[arc.length - 1];
    const center = [(originPos[0] + destPos[0]) / 2, (originPos[1] + destPos[1]) / 2];
    const maxRoutes = Math.max(...hubs.map(h => h.routeCount), 1);
    const hubRadius = hub => 4 + Math.round((hub.routeCount / maxRoutes) * 8);

    return (
        <div className="mb-8 rounded-lg overflow-hidden shadow">
            {/* Map + overlay buttons */}
            <div style={{ position: "relative" }}>
                <MapContainer center={center} zoom={3} style={{ height: "420px" }} scrollWheelZoom={false}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <Polyline
                        positions={arc}
                        pathOptions={{ color: "#16a34a", weight: 2, opacity: 0.6, dashArray: "6 4" }}
                    />

                    {hubs.map(hub => (
                        <CircleMarker
                            key={hub.iata}
                            center={[hub.lat, hub.lon]}
                            radius={hubRadius(hub)}
                            pathOptions={{ color: "#d97706", fillColor: "#f59e0b", fillOpacity: 0.85, weight: 1.5 }}
                            eventHandlers={{ mouseover: () => handleHover(hub) }}
                        >
                            <Tooltip direction="top" offset={[0, -6]} sticky={false}>
                                <div style={{ width: "260px", whiteSpace: "normal", wordBreak: "break-word" }}>
                                    <div style={{ fontWeight: 600, fontSize: "13px" }}>{hub.city || hub.name}</div>
                                    <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>{hub.name}</div>
                                    {wikiCache[hub.iata] === undefined && hub.city && (
                                        <div style={{ fontSize: "11px", color: "#9ca3af" }}>Loading…</div>
                                    )}
                                    {wikiCache[hub.iata] === null && (
                                        <div style={{ fontSize: "11px", color: "#9ca3af" }}>Loading…</div>
                                    )}
                                    {wikiCache[hub.iata]?.extract && (
                                        <div style={{ fontSize: "11px", color: "#374151", marginBottom: "4px" }}>
                                            {wikiCache[hub.iata].extract.slice(0, 150)}…
                                        </div>
                                    )}
                                </div>
                            </Tooltip>
                            <Popup maxWidth={320}>
                                <div style={{ maxWidth: "300px" }}>
                                    {/* Header row: text + image side by side */}
                                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "8px" }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "2px" }}>{hub.city || hub.name}</div>
                                            <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>{hub.name}</div>
                                            {/* debug info — uncomment to inspect scoring inputs
                                            <div style={{ fontSize: "11px", color: "#6b7280" }}>
                                                {hub.routeCount} routes · {hub.detourPercent}% detour
                                            </div>
                                            */}
                                        </div>
                                        {wikiCache[hub.iata]?.thumbnail && (
                                            <img
                                                src={wikiCache[hub.iata].thumbnail}
                                                alt={hub.city || hub.name}
                                                style={{ width: "72px", height: "72px", objectFit: "cover", borderRadius: "6px", flexShrink: 0 }}
                                            />
                                        )}
                                    </div>
                                    {wikiCache[hub.iata]?.extract && (
                                        <>
                                            <div style={{ fontSize: "12px", color: "#374151", marginBottom: "6px", lineHeight: "1.4" }}>
                                                {wikiCache[hub.iata].extract.slice(0, 200)}…
                                            </div>
                                            <a href={wikiCache[hub.iata].pageUrl} target="_blank" rel="noreferrer" style={{ fontSize: "12px", color: "#2563eb", display: "block", marginBottom: "8px" }}>
                                                See more on Wikipedia →
                                            </a>
                                        </>
                                    )}
                                    <button
                                        onClick={() => !loading && onHubSelect(hub)}
                                        style={{ display: "block", width: "100%", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "6px", padding: "6px 10px", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}
                                    >
                                        Search this stopover
                                    </button>
                                </div>
                            </Popup>
                        </CircleMarker>
                    ))}

                    <CircleMarker
                        center={originPos}
                        radius={10}
                        pathOptions={{ color: "#dc2626", fillColor: "#dc2626", fillOpacity: 1, weight: 2 }}
                    >
                        <Popup><strong>{origin.iata}</strong> — {origin.name}</Popup>
                    </CircleMarker>

                    <CircleMarker
                        center={destPos}
                        radius={10}
                        pathOptions={{ color: "#dc2626", fillColor: "#dc2626", fillOpacity: 1, weight: 2 }}
                    >
                        <Popup><strong>{destination.iata}</strong> — {destination.name}</Popup>
                    </CircleMarker>
                </MapContainer>

                {/* Show all / Show best — top-right overlay */}
                <div style={{ position: "absolute", top: "10px", right: "10px", zIndex: 1000, display: "flex", gap: "6px" }}>
                    {totalHubs > hubs.length && (
                        <button
                            onClick={() => !loading && onShowAll()}
                            disabled={loading}
                            style={{ backgroundColor: "white", border: "1px solid #d1d5db", color: "#374151", borderRadius: "6px", padding: "6px 12px", fontSize: "13px", fontWeight: 500, cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.15)", opacity: loading ? 0.5 : 1 }}
                        >
                            Show all {totalHubs}
                        </button>
                    )}
                    {totalHubs === undefined && (
                        <button
                            onClick={() => !loading && onShowBest()}
                            disabled={loading}
                            style={{ backgroundColor: "#2563eb", border: "none", color: "white", borderRadius: "6px", padding: "6px 12px", fontSize: "13px", fontWeight: 500, cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.2)", opacity: loading ? 0.5 : 1 }}
                        >
                            Show best
                        </button>
                    )}
                </div>
            </div>

            {/* Legend */}
            <div className="bg-white border-t px-4 py-2 flex flex-wrap gap-4 text-xs text-gray-500 items-center">
                <span><span style={{ color: "#dc2626" }}>●</span> Origin / Destination</span>
                <span><span style={{ color: "#f59e0b" }}>●</span> Hub candidate</span>
                <span>{hubs.length} hub{hubs.length !== 1 ? "s" : ""} shown</span>
            </div>

            {/* Usage guide */}
            <div className="bg-gray-50 border-t px-4 py-3 text-xs text-gray-500 flex flex-wrap gap-x-6 gap-y-1">
                <span><strong className="text-gray-600">Hover</strong> a hub to preview the city</span>
                <span><strong className="text-gray-600">Click</strong> a hub, then "Search this stopover" to get flight prices</span>
                <span><strong className="text-gray-600">Show all / Show best</strong> to toggle between every hub and the top 10 picks</span>
            </div>
        </div>
    );
}
