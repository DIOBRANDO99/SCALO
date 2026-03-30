import { findHubs } from "../services/hubs.js";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CSV_PATH = join(__dirname, "../../dataset/airports.csv");

function parseCSVLine(line) {
    const fields = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') inQuotes = !inQuotes;
        else if (ch === "," && !inQuotes) { fields.push(current); current = ""; }
        else current += ch;
    }
    fields.push(current);
    return fields;
}

const raw = readFileSync(CSV_PATH, "utf8");
const lines = raw.split("\n");
const header = parseCSVLine(lines[0]);
const col = {
    iata: header.indexOf("iata_code"),
    lat:  header.indexOf("latitude_deg"),
    lon:  header.indexOf("longitude_deg"),
    name: header.indexOf("name"),
};

const airportMap = new Map();
for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const f = parseCSVLine(lines[i]);
    const iata = f[col.iata];
    if (iata && iata.length === 3) {
        airportMap.set(iata, {
            lat: parseFloat(f[col.lat]),
            lon: parseFloat(f[col.lon]),
            name: f[col.name],
        });
    }
}

function getCoords(iata) {
    const a = airportMap.get(iata);
    return a ? { iata, lat: a.lat, lon: a.lon, name: a.name } : null;
}

function greatCircleArc(lat1, lon1, lat2, lon2, numPoints = 100) {
    const toRad = (d) => (d * Math.PI) / 180;
    const toDeg = (r) => (r * 180) / Math.PI;
    const phi1 = toRad(lat1), lam1 = toRad(lon1);
    const phi2 = toRad(lat2), lam2 = toRad(lon2);
    const dPhi = phi2 - phi1, dLam = lam2 - lam1;
    const a = Math.sin(dPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLam / 2) ** 2;
    const d = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const points = [];
    for (let i = 0; i <= numPoints; i++) {
        const f = i / numPoints;
        const A = Math.sin((1 - f) * d) / Math.sin(d);
        const B = Math.sin(f * d) / Math.sin(d);
        const x = A * Math.cos(phi1) * Math.cos(lam1) + B * Math.cos(phi2) * Math.cos(lam2);
        const y = A * Math.cos(phi1) * Math.sin(lam1) + B * Math.cos(phi2) * Math.sin(lam2);
        const z = A * Math.sin(phi1) + B * Math.sin(phi2);
        points.push([toDeg(Math.atan2(z, Math.sqrt(x * x + y * y))), toDeg(Math.atan2(y, x))]);
    }
    return points;
}

const routes = [
    ["MXP", "BKK"],
    ["MXP", "JFK"],
    ["MXP", "LHR"],
    ["GRU", "NRT"],
];

const routeData = [];
for (const [originIata, destIata] of routes) {
    const hubs = findHubs(originIata, destIata);
    console.log(`${originIata}→${destIata}: ${hubs ? hubs.length : 0} hubs`);

    const origin = getCoords(originIata);
    const dest = getCoords(destIata);
    const hubPoints = (hubs || []).map((iata) => getCoords(iata)).filter(Boolean);
    const arc = greatCircleArc(origin.lat, origin.lon, dest.lat, dest.lon);

    routeData.push({ origin, dest, hubs: hubPoints, arc });
}

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>SCALO — Ellipse Hub Finder</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
  <style>
    body { margin: 0; font-family: sans-serif; }
    #controls { padding: 12px 16px; background: #1e293b; color: white; display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    #controls button { padding: 6px 14px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; }
    #controls button.active { background: #3b82f6; color: white; }
    #controls button:not(.active) { background: #475569; color: #cbd5e1; }
    #info { margin-left: auto; font-size: 13px; color: #94a3b8; }
    .legend { font-size: 12px; color: #94a3b8; display: flex; gap: 16px; margin-left: 12px; }
    .legend span { display: flex; align-items: center; gap: 4px; }
    .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
    .line-sample { width: 20px; height: 0; display: inline-block; border-top: 2px; }
    #map { height: calc(100vh - 48px); }
  </style>
</head>
<body>
  <div id="controls">
    ${routes.map(([a, b], i) => `<button onclick="showRoute(${i})" id="btn${i}">${a} → ${b}</button>`).join("\n    ")}
    <div class="legend">
      <span><span class="dot" style="background:#dc2626"></span> Origin/Dest</span>
      <span><span class="dot" style="background:#3b82f6"></span> Hub candidates</span>
      <span style="color:#16a34a">— Great circle</span>
      <span style="color:#dc2626">--- Mercator straight</span>
    </div>
    <span id="info"></span>
  </div>
  <div id="map"></div>
  <script>
    const routeData = ${JSON.stringify(routeData)};

    const map = L.map("map").setView([30, 30], 3);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 10,
    }).addTo(map);

    let layers = [];

    function clearLayers() {
      layers.forEach(l => map.removeLayer(l));
      layers = [];
    }

    function showRoute(idx) {
      clearLayers();
      const r = routeData[idx];

      document.querySelectorAll("#controls button").forEach((b, i) => {
        b.className = i === idx ? "active" : "";
      });

      // Mercator straight line — dashed red
      layers.push(L.polyline(
        [[r.origin.lat, r.origin.lon], [r.dest.lat, r.dest.lon]],
        { color: "#dc2626", weight: 1.5, dashArray: "6,5", opacity: 0.4 }
      ).addTo(map));

      // Great circle arc — solid green
      layers.push(L.polyline(r.arc, {
        color: "#16a34a", weight: 2.5, opacity: 0.8
      }).addTo(map));

      // Origin
      layers.push(L.circleMarker([r.origin.lat, r.origin.lon], {
        radius: 9, color: "#dc2626", fillColor: "#dc2626", fillOpacity: 1, weight: 2,
      }).addTo(map).bindPopup("<b>" + r.origin.iata + "</b><br>" + r.origin.name));

      // Destination
      layers.push(L.circleMarker([r.dest.lat, r.dest.lon], {
        radius: 9, color: "#dc2626", fillColor: "#dc2626", fillOpacity: 1, weight: 2,
      }).addTo(map).bindPopup("<b>" + r.dest.iata + "</b><br>" + r.dest.name));

      // Hub airports
      r.hubs.forEach(h => {
        layers.push(L.circleMarker([h.lat, h.lon], {
          radius: 5, color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.8, weight: 1,
        }).addTo(map).bindPopup("<b>" + h.iata + "</b><br>" + h.name));
      });

      const allPoints = [[r.origin.lat, r.origin.lon], [r.dest.lat, r.dest.lon],
        ...r.hubs.map(h => [h.lat, h.lon])];
      map.fitBounds(allPoints, { padding: [40, 40] });

      document.getElementById("info").textContent =
        r.origin.iata + " → " + r.dest.iata + ": " + r.hubs.length + " airports in ellipse";
    }

    showRoute(0);
  <\/script>
</body>
</html>`;

const outPath = join(__dirname, "hub_map.html");
writeFileSync(outPath, html);
console.log(`\\nMap saved to: ${outPath}`);
console.log(`Open: open ${outPath}`);
