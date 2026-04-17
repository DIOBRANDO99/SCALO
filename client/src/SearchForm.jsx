import { useState } from "react";
import CityInput from "./CityInput";

export default function SearchForm({ onSearch, loading }) {
    const [discoverMode, setDiscoverMode] = useState(true);
    const [showAdvanced, setShowAdvanced] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        const fd = new FormData(e.target);
        const outboundDate = fd.get("outboundDate");

        const params = {
            mode:           discoverMode ? "discover" : "search",
            origin:         fd.get("origin").trim().toUpperCase(),
            destination:    fd.get("destination").trim().toUpperCase(),
            outboundDate,
            returnDate:     fd.get("returnDate") || null,
            stopoverNights: parseInt(fd.get("stopoverNights"), 10) || 3,
            maxStops:       fd.get("maxStops") ?? "3",
            adults:         parseInt(fd.get("adults"), 10) || 1,
            travelClass:    fd.get("travelClass") ?? "1",
        };
        if (!discoverMode) {
            params.stopover = fd.get("stopover").trim().toUpperCase();
        }
        onSearch(params);
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Search Flights</h2>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <span className="text-sm text-gray-600">Choose stopover</span>
                    <button
                        type="button"
                        data-testid="mode-toggle"
                        onClick={() => setDiscoverMode(d => !d)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${!discoverMode ? "bg-blue-600" : "bg-gray-300"}`}
                    >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${!discoverMode ? "translate-x-5" : "translate-x-1"}`} />
                    </button>
                </label>
            </div>

            <div className={`grid gap-4 mb-4 ${discoverMode ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-3"}`}>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Origin <span className="text-red-500">*</span>
                    </label>
                    <CityInput name="origin" placeholder="City, airport or IATA (e.g. Milan)" required />
                </div>

                {!discoverMode && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Stopover <span className="text-red-500">*</span>
                        </label>
                        <CityInput name="stopover" placeholder="City, airport or IATA (e.g. Istanbul)" required />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Destination <span className="text-red-500">*</span>
                    </label>
                    <CityInput name="destination" placeholder="City, airport or IATA (e.g. Bangkok)" required />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Departure Date <span className="text-red-500">*</span>
                    </label>
                    <input
                        name="outboundDate"
                        type="date"
                        required
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nights at stopover <span className="text-red-500">*</span>
                    </label>
                    <input
                        name="stopoverNights"
                        type="number"
                        required
                        min={1}
                        max={14}
                        defaultValue={3}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Return Date
                    </label>
                    <input
                        name="returnDate"
                        type="date"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Advanced options */}
            <div className="mb-6">
                <button
                    type="button"
                    onClick={() => setShowAdvanced(a => !a)}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                    <span>{showAdvanced ? "▾" : "▸"}</span>
                    Advanced options
                </button>

                {showAdvanced && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Max stops per leg
                            </label>
                            <div className="flex gap-2">
                                {/* SerpAPI stops values: 1=nonstop, 2=≤1 stop, 3=≤2 stops */}
                                {[["1", "Direct only"], ["2", "Up to 1 stop"], ["3", "Up to 2 stops"]].map(([val, label]) => (
                                    <label key={val} className="flex items-center gap-1.5 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="maxStops"
                                            value={val}
                                            defaultChecked={val === "3"}
                                            className="accent-blue-600"
                                        />
                                        <span className="text-sm text-gray-600">{label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Passengers
                                </label>
                                <input
                                    name="adults"
                                    type="number"
                                    min={1}
                                    max={9}
                                    defaultValue={1}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Travel class
                                </label>
                                <select
                                    name="travelClass"
                                    defaultValue="1"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="1">Economy</option>
                                    <option value="2">Premium Economy</option>
                                    <option value="3">Business</option>
                                    <option value="4">First</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? "Searching…" : discoverMode ? "Discover" : "Search Flights"}
            </button>
        </form>
    );
}
