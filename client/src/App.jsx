import { useState } from "react";
import SearchForm from "./SearchForm";
import ResultCard from "./ResultCard";
import LoadingSpinner from "./LoadingSpinner";
import EmptyState from "./EmptyState";
import HubMap from "./HubMap";

export default function App() {
    const [result, setResult] = useState(null);
    const [hubData, setHubData] = useState(null);
    const [pendingParams, setPendingParams] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showNegative, setShowNegative] = useState(false);
    const [selectedHub, setSelectedHub] = useState(null);

    async function handleSearch(params) {
        setLoading(true);
        setError(null);
        setResult(null);
        setHubData(null);
        setPendingParams(null);
        setShowNegative(false);
        setSelectedHub(null);

        const { mode, ...body } = params;

        if (mode === "discover") {
            try {
                const res = await fetch(`/api/hubs?origin=${body.origin}&destination=${body.destination}&auto=true`);
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || `HTTP ${res.status}`);
                }
                const data = await res.json();
                setHubData(data);
                setPendingParams(body);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
            return;
        }

        try {
            const res = await fetch("/api/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || `HTTP ${res.status}`);
            }

            setResult(await res.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleShowAll() {
        setLoading(true);
        setError(null);
        setResult(null);
        setShowNegative(false);
        setSelectedHub(null);

        try {
            const res = await fetch(`/api/hubs?origin=${pendingParams.origin}&destination=${pendingParams.destination}`);
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || `HTTP ${res.status}`);
            }
            setHubData(await res.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleShowBest() {
        setLoading(true);
        setError(null);
        setResult(null);
        setShowNegative(false);
        setSelectedHub(null);

        try {
            const res = await fetch(`/api/hubs?origin=${pendingParams.origin}&destination=${pendingParams.destination}&auto=true`);
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || `HTTP ${res.status}`);
            }
            setHubData(await res.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleHubSelect(hub) {
        setLoading(true);
        setError(null);
        setResult(null);
        setShowNegative(false);
        setSelectedHub(hub.iata);

        try {
            const res = await fetch("/api/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...pendingParams, stopover: hub.iata }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || `HTTP ${res.status}`);
            }

            setResult(await res.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const emptyLegs = result
        ? result.legs.filter((leg) => !leg.options || leg.options.length === 0)
        : [];
    const hasEmptyLegs = emptyLegs.length > 0;
    const savingsNull = result && result.summary.savings === null;

    return (
        <div className={`${hubData ? "max-w-5xl" : "max-w-3xl"} mx-auto px-4 py-12`}>
            <h1 className="text-3xl font-bold mb-2">SCALO</h1>
            <p className="text-gray-600 mb-8">
                Smart Connection And Layover Optimizer
            </p>

            <SearchForm onSearch={handleSearch} loading={loading} />

            {loading && <LoadingSpinner />}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-8">
                    <p className="font-medium">Error</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Discover mode: hub map */}
            {hubData && (
                <HubMap hubData={hubData} onHubSelect={handleHubSelect} onShowAll={handleShowAll} onShowBest={handleShowBest} loading={loading} />
            )}

            {/* Selected hub indicator */}
            {selectedHub && (
                <p className="text-sm text-gray-500 mb-4">
                    Showing results for stopover: <strong>{selectedHub}</strong>
                </p>
            )}

            {/* Scenario A: one or more legs have no flight options */}
            {result && hasEmptyLegs && (
                <EmptyState
                    title="No flights found"
                    description={`We couldn't find any flights for: ${emptyLegs
                        .map((leg) => `${leg.origin} → ${leg.destination} on ${leg.date}`)
                        .join(", ")}. Try different dates or a different stopover city.`}
                />
            )}

            {/* Scenario B: flights found but no direct price to compare */}
            {result && !hasEmptyLegs && savingsNull && (
                <EmptyState
                    title="No direct flight available"
                    description="We found stopover flights but couldn't find a direct route to compare against. The savings calculation is not available for this route."
                >
                    <button
                        className="mt-4 text-sm text-blue-600 underline"
                        onClick={() => setShowNegative(true)}
                    >
                        Show stopover flights
                    </button>
                </EmptyState>
            )}

            {/* Scenario C: stopover costs more than direct */}
            {result &&
                !hasEmptyLegs &&
                !savingsNull &&
                result.summary.savings < 0 &&
                !showNegative && (
                    <EmptyState
                        title="No savings with this stopover"
                        description={`Flying via ${result.stopover.iata} costs €${Math.abs(result.summary.savings)} more than the direct flight (€${result.summary.directPrice}). This stopover is not worth it for price — but you might still want to visit!`}
                    >
                        {pendingParams?.maxStops && pendingParams.maxStops !== "3" && (
                            <p className="mt-3 text-sm text-gray-500">
                                You're searching with restricted connections — try increasing <strong>Max stops per leg</strong> in Advanced options for more options.
                            </p>
                        )}
                        <button
                            className="mt-4 text-sm text-blue-600 underline"
                            onClick={() => setShowNegative(true)}
                        >
                            Show flights anyway
                        </button>
                    </EmptyState>
                )}

            {/* Show ResultCard only when legs are complete, prices are available, and savings are positive OR user clicked "show anyway" */}
            {result &&
                !hasEmptyLegs &&
                result.summary.bestCombinedPrice !== null &&
                ((!savingsNull && result.summary.savings >= 0) || showNegative) && (
                    <ResultCard result={result} />
                )}
        </div>
    );
}
