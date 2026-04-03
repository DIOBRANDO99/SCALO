import { MapContainer, TileLayer, CircleMarker, Polyline, Popup } from "react-leaflet";
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

export default function HubMap({ hubData, onHubSelect, loading }) {
    const { origin, destination, hubs } = hubData;

    const arc = greatCirclePoints(origin.lat, origin.lon, destination.lat, destination.lon);
    const originPos = arc[0];
    const destPos = arc[arc.length - 1];
    const center = [(originPos[0] + destPos[0]) / 2, (originPos[1] + destPos[1]) / 2];
    const maxRoutes = Math.max(...hubs.map(h => h.routeCount), 1);
    const hubRadius = hub => 4 + Math.round((hub.routeCount / maxRoutes) * 8);

    return (
        <div className="mb-8 rounded-lg overflow-hidden shadow">
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
                        eventHandlers={{}}
                    >
                        <Popup>
                            <div style={{ minWidth: "140px" }}>
                                <strong>{hub.iata}</strong> — {hub.name}<br />
                                <span style={{ fontSize: "11px", color: "#6b7280" }}>
                                    {hub.routeCount} routes · {hub.detourPercent}% detour
                                </span><br />
                                <button
                                    onClick={() => !loading && onHubSelect(hub)}
                                    style={{ marginTop: "6px", color: "#2563eb", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: "13px" }}
                                >
                                    Search this stopover →
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

            <div className="bg-white border-t px-4 py-2 flex flex-wrap gap-4 text-xs text-gray-500">
                <span><span style={{ color: "#dc2626" }}>●</span> Origin / Destination</span>
                <span><span style={{ color: "#f59e0b" }}>●</span> Hub candidate — click to search</span>
                <span><span style={{ color: "#16a34a" }}>—</span> Direct route</span>
                <span className="ml-auto">{hubs.length} hub{hubs.length !== 1 ? "s" : ""} found</span>
            </div>
        </div>
    );
}
