import { useState } from "react";

export default function SearchForm({ onSearch, loading }) {
    const [discoverMode, setDiscoverMode] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        const fd = new FormData(e.target);
        const outboundDate = fd.get("outboundDate");

        onSearch({
            mode: discoverMode ? "discover" : "search",
            origin:         fd.get("origin").trim().toUpperCase(),
            destination:    fd.get("destination").trim().toUpperCase(),
            stopover:       discoverMode ? undefined : fd.get("stopover").trim().toUpperCase(),
            outboundDate,
            returnDate:     fd.get("returnDate") || null,
            stopoverNights: parseInt(fd.get("stopoverNights"), 10) || 3,
        });
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Search Flights</h2>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <span className="text-sm text-gray-600">Discover best stopover</span>
                    <button
                        type="button"
                        onClick={() => setDiscoverMode(d => !d)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${discoverMode ? "bg-blue-600" : "bg-gray-300"}`}
                    >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${discoverMode ? "translate-x-5" : "translate-x-1"}`} />
                    </button>
                </label>
            </div>

            <div className={`grid gap-4 mb-4 ${discoverMode ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-3"}`}>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Origin <span className="text-red-500">*</span>
                    </label>
                    <input
                        name="origin"
                        type="text"
                        required
                        maxLength={3}
                        placeholder="MXP"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {!discoverMode && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Stopover <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="stopover"
                            type="text"
                            required
                            maxLength={3}
                            placeholder="IST"
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Destination <span className="text-red-500">*</span>
                    </label>
                    <input
                        name="destination"
                        type="text"
                        required
                        maxLength={3}
                        placeholder="BKK"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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
