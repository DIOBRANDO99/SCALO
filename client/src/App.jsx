import { useState } from "react";
import SearchForm from "./SearchForm";
import ResultCard from "./ResultCard";
import LoadingSpinner from "./LoadingSpinner";

export default function App() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showNegative, setShowNegative] = useState(false);

    async function handleSearch(params) {
        setLoading(true);
        setError(null);
        setResult(null);
        setShowNegative(false);

        try {
            const res = await fetch("/api/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(params),
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
            <p className="text-gray-600 mb-8">Smart Connection &amp; Layover Optimizer</p>

            <SearchForm onSearch={handleSearch} loading={loading} />

            {loading && <LoadingSpinner />}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-8">
                    <p className="font-medium">Error</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {result && result.summary.savings < 0 && !showNegative && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 mb-4 flex items-center justify-between">
                    <p className="text-sm">This stopover costs more than flying direct.</p>
                    <button
                        className="text-sm underline ml-4 shrink-0"
                        onClick={() => setShowNegative(true)}
                    >
                        Show anyway
                    </button>
                </div>
            )}

            {result && (result.summary.savings >= 0 || showNegative) && (
                <ResultCard result={result} />
            )}
        </div>
    );
}
