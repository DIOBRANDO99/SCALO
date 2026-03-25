export default function SearchForm({ onSearch, loading }) {
    function handleSubmit(e) {
        e.preventDefault();
        const fd = new FormData(e.target);

        const outboundDate = fd.get("outboundDate");
        const stopoverDepartureDate = fd.get("stopoverDepartureDate");

        const msPerDay = 1000 * 60 * 60 * 24;
        const stopoverNights = Math.round(
            (new Date(stopoverDepartureDate) - new Date(outboundDate)) / msPerDay
        );

        onSearch({
            origin:         fd.get("origin").trim().toUpperCase(),
            destination:    fd.get("destination").trim().toUpperCase(),
            stopover:       fd.get("stopover").trim().toUpperCase(),
            outboundDate,
            returnDate:     fd.get("returnDate") || null,
            stopoverNights,
        });
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold mb-6">Search Flights</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
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
                        Stopover Departure <span className="text-red-500">*</span>
                    </label>
                    <input
                        name="stopoverDepartureDate"
                        type="date"
                        required
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
                {loading ? "Searching…" : "Search Flights"}
            </button>
        </form>
    );
}
