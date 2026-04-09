import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function parseCSVLine(line) {
    const fields = [];
    let i = 0;
    while (i < line.length) {
        if (line[i] === '"') {
            let val = "";
            i++;
            while (i < line.length) {
                if (line[i] === '"' && line[i + 1] === '"') {
                    val += '"';
                    i += 2;
                } else if (line[i] === '"') {
                    i++;
                    break;
                } else {
                    val += line[i++];
                }
            }
            fields.push(val);
            if (line[i] === ",") i++;
        } else {
            const next = line.indexOf(",", i);
            if (next === -1) {
                fields.push(line.slice(i));
                break;
            }
            fields.push(line.slice(i, next));
            i = next + 1;
        }
    }
    return fields;
}
const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

function countryNameFor(iso) {
    try {
        return regionNames.of(iso) || iso;
    } catch {
        return iso;
    }
}

function stripDiacritics(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const COUNTRY_ALIASES = {
    TR: "Turkey",
    CI: "Ivory Coast",
    CZ: "Czech Republic",
    KR: "South Korea",
    KP: "North Korea",
    AE: "UAE Emirates",
    GB: "UK England Britain",
    US: "USA America",
    TW: "Taiwan",
    CD: "Congo DRC",
    TL: "East Timor",
};

const csv = readFileSync(join(ROOT, "dataset", "airports.csv"), "utf-8");
const lines = csv.split("\n").filter(Boolean);
const header = parseCSVLine(lines[0]);

// Find column indices
const COLUMNS = [
    "iata_code", "name", "municipality", "iso_country",
    "latitude_deg", "longitude_deg", "type", "scheduled_service", "keywords",
];
const col = {};
for (const c of COLUMNS) {
    col[c] = header.indexOf(c);
    if (col[c] === -1) {
        console.error(`Column "${c}" not found in CSV header`);
        process.exit(1);
    }
}

const VALID_TYPES = new Set(["large_airport", "medium_airport"]);

const airports = [];
const seen = new Set();

for (let i = 1; i < lines.length; i++) {
    const f = parseCSVLine(lines[i]);
    const iata = (f[col.iata_code] || "").trim();
    const type = (f[col.type] || "").trim();
    const scheduled = (f[col.scheduled_service] || "").trim();

    if (!iata || iata.length !== 3) continue;
    if (!VALID_TYPES.has(type)) continue;
    if (scheduled !== "yes") continue;
    if (seen.has(iata)) continue;
    seen.add(iata);

    const iso = (f[col.iso_country] || "").trim();
    const city = (f[col.municipality] || "").trim();
    const name = (f[col.name] || "").trim();
    const lat = parseFloat(f[col.latitude_deg]) || 0;
    const lon = parseFloat(f[col.longitude_deg]) || 0;
    const cName = countryNameFor(iso);
    const keywords = (f[col.keywords] || "").trim();
    const size = type === "large_airport" ? 1 : 0;

    const alias = COUNTRY_ALIASES[iso] || "";
    const searchText = stripDiacritics(
        [iata, city, name, cName, iso, keywords, alias].filter(Boolean).join(" ")
    ).toLowerCase();

    airports.push({
        iata, name, city, country: iso, countryName: cName,
        lat, lon, size, keywords, searchText,
    });
}

airports.sort((a, b) => b.size - a.size || a.city.localeCompare(b.city));

const outDir = join(ROOT, "client", "src", "data");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "cities.json");
writeFileSync(outPath, JSON.stringify(airports, null, 2), "utf-8");

const large = airports.filter(a => a.size === 1).length;
const medium = airports.filter(a => a.size === 0).length;
console.log(`Generated ${airports.length} airports (${large} large, ${medium} medium) → ${outPath}`);
