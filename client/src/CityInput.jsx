import { useState, useRef, useEffect, useMemo } from "react";
import cities from "./data/cities.json";

const MAX_VISIBLE = 12;

// Strip diacritics: "Türkiye" → "Turkiye", "São Paulo" → "Sao Paulo"
function norm(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/**
 * Relevance score for an airport against a normalized query.
 * Higher = more relevant. Returns 0 if no match.
 *
 *  100  IATA exact match          (e.g. "bkk" → BKK)
 *   80  IATA starts-with          (e.g. "bk"  → BKK)
 *   60  City starts-with          (e.g. "bang" → Bangkok)
 *   50  City contains             (e.g. "kok"  → Bangkok)
 *   40  Airport name starts-with  (e.g. "suvar" → Suvarnabhumi)
 *   30  Airport name contains     (e.g. "bhumi" → Suvarnabhumi)
 *   20  Keywords contain          (e.g. "bergamo" → BGY via "Milan Bergamo Airport")
 *   10  Country name contains     (e.g. "italy" → all IT airports)
 *
 * Within the same score, large airports (size=1) sort before medium (size=0).
 */
function score(ap, q) {
    const iata = ap.iata.toLowerCase();
    const city = norm(ap.city || "");
    const name = norm(ap.name);
    const kw   = norm(ap.keywords || "");
    const ctr  = norm(ap.countryName);

    if (iata === q)              return 100;
    if (iata.startsWith(q))      return 80;
    if (city.startsWith(q))      return 60;
    if (city.includes(q))        return 50;
    if (name.startsWith(q))      return 40;
    if (name.includes(q))        return 30;
    if (kw.includes(q))          return 20;
    if (ctr.includes(q))         return 10;
    // Fallback: searchText includes country aliases (e.g. "turkey", "uk", "america")
    if (ap.searchText.includes(q)) return 10;
    return 0;
}

export default function CityInput({ name, placeholder, required }) {
    const [query, setQuery] = useState("");
    const [iata, setIata] = useState("");
    const [open, setOpen] = useState(false);
    const [activeIdx, setActiveIdx] = useState(-1);
    const wrapperRef = useRef(null);
    const listRef = useRef(null);

    // Scored + sorted results
    const { visible, totalMatches } = useMemo(() => {
        const q = norm(query.trim());
        if (q.length < 2) return { visible: [], totalMatches: 0 };

        // First pass: collect all matches with scores
        const scored = [];
        for (const ap of cities) {
            const s = score(ap, q);
            if (s > 0) scored.push({ ap, s });
        }

        // Sort by score desc, then large airports first, then city alphabetical
        scored.sort((a, b) =>
            b.s - a.s || b.ap.size - a.ap.size || a.ap.city.localeCompare(b.ap.city)
        );

        return {
            visible: scored.slice(0, MAX_VISIBLE).map(x => x.ap),
            totalMatches: scored.length,
        };
    }, [query]);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClick(e) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // Scroll active item into view
    useEffect(() => {
        if (activeIdx >= 0 && listRef.current) {
            const item = listRef.current.children[activeIdx];
            if (item) item.scrollIntoView({ block: "nearest" });
        }
    }, [activeIdx]);

    function select(ap) {
        setQuery(`${ap.city || ap.name} (${ap.iata})`);
        setIata(ap.iata);
        setOpen(false);
        setActiveIdx(-1);
    }

    function handleChange(e) {
        const val = e.target.value;
        setQuery(val);
        setIata("");
        setOpen(val.trim().length >= 2);
        setActiveIdx(-1);
    }

    function handleKeyDown(e) {
        if (!open || visible.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIdx(i => (i + 1) % visible.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIdx(i => (i - 1 + visible.length) % visible.length);
        } else if (e.key === "Enter" && activeIdx >= 0) {
            e.preventDefault();
            select(visible[activeIdx]);
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    }

    // Fallback: if user typed a raw 3-letter IATA without selecting, use it
    const resolvedIata = iata || (() => {
        const q = query.trim().toUpperCase();
        if (q.length === 3 && /^[A-Z]{3}$/.test(q)) return q;
        return "";
    })();

    const overflow = totalMatches - visible.length;

    return (
        <div ref={wrapperRef} className="relative">
            <input type="hidden" name={name} value={resolvedIata} />
            <input
                type="text"
                value={query}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={() => query.trim().length >= 2 && setOpen(true)}
                required={required}
                placeholder={placeholder}
                autoComplete="off"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {open && visible.length > 0 && (
                <ul
                    ref={listRef}
                    className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-y-auto"
                >
                    {visible.map((ap, i) => (
                        <li
                            key={ap.iata}
                            onMouseDown={() => select(ap)}
                            onMouseEnter={() => setActiveIdx(i)}
                            className={`px-3 py-2 cursor-pointer text-sm flex items-baseline gap-1.5 ${
                                i === activeIdx ? "bg-blue-50" : "hover:bg-gray-50"
                            }`}
                        >
                            <span className="font-semibold text-gray-900 shrink-0">{ap.iata}</span>
                            <span className="text-gray-600 truncate">
                {ap.city ? `${ap.city} — ` : ""}{ap.name}
              </span>
                            <span className="text-gray-400 text-xs shrink-0 ml-auto">{ap.countryName}</span>
                        </li>
                    ))}

                    {overflow > 0 && (
                        <li className="px-3 py-2 text-xs text-gray-400 text-center select-none">
                            +{overflow} more — keep typing to refine
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
}
