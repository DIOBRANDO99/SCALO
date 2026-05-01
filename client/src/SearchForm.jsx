import { useState } from "react";
import CityInput from "./CityInput";

export default function SearchForm({ onSearch, loading }) {
    const [discoverMode, setDiscoverMode] = useState(true);
    const [oneWay, setOneWay] = useState(false);
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
            oneWay,
            returnDate:     oneWay ? null : (fd.get("returnDate") || null),
            stopoverNights: parseInt(fd.get("stopoverNights"), 10) || 3,
            returnStopoverNights: oneWay ? null : (parseInt(fd.get("returnStopoverNights"), 10) || 3),
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
                <h2 className="text-lg font-semibold">{discoverMode ? "Discover stopovers" : "Search flights"}</h2>
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <span className="text-sm text-gray-600">One way</span>
                        <button
                            type="button"
                            onClick={() => setOneWay(o => !o)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${oneWay ? "bg-blue-600" : "bg-gray-300"}`}
                        >
                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${oneWay ? "translate-x-5" : "translate-x-1"}`} />
                        </button>
                    </label>
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
            </div>

            <div className={`grid gap-4 mb-4 ${discoverMode ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-3"}`}>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Origin <span className="text-red-500">*</span>
                    </label>
                    <CityInput name="origin" placeholder="City, airport or IATA" required />
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
                    <CityInput name="destination" placeholder="City, airport or IATA" required />
                </div>
            </div>

            <div className={`grid gap-4 mb-6 ${oneWay ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 sm:grid-cols-4"}`}>
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
                        {oneWay ? "Nights at stopover" : "Outbound nights"} <span className="text-red-500">*</span>
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

                {!oneWay && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Return Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="returnDate"
                            type="date"
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                )}

                {!oneWay && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Return nights <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="returnStopoverNights"
                            type="number"
                            required
                            min={1}
                            max={14}
                            defaultValue={3}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                )}
            </div>

            {/* Passengers & class */}
            <div className="mb-6">
                <button
                    type="button"
                    onClick={() => setShowAdvanced(a => !a)}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                    <span>{showAdvanced ? "▾" : "▸"}</span>
                    Passengers & class
                </button>

                {showAdvanced && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-4">

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
