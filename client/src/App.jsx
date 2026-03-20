import { useState } from "react";

const HARDCODED_REQUEST = {
    origin: "MXP",
    destination: "BKK",
    stopover: "IST",
    outboundDate: "2026-06-10",
    returnDate: "2026-06-20",
    stopoverNights: 3,
};

export default function App() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    async function handleSearch() {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch("/api/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(HARDCODED_REQUEST),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || `HTTP ${res.status}`);
            }

            const data = await res.json();
            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-2">SCALO</h1>
            <p className="text-gray-600 mb-8">
                Smart Connection &amp; Layover Optimizer
            </p>

            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-lg font-semibold mb-4">Hardcoded Search Request</h2>
                <pre className="bg-gray-100 rounded p-4 text-sm mb-4 overflow-x-auto">
                    {JSON.stringify(HARDCODED_REQUEST, null, 2)}
                </pre>
                <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Searching…" : "Search Flights"}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-8">
                    <p className="font-medium">Error</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {result && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Raw JSON Response</h2>
                    <pre className="bg-gray-100 rounded p-4 text-sm overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
