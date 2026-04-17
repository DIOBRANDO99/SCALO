import { useState } from "react";
import cities from "./data/cities.json";
import SearchForm from "./SearchForm";
import ResultCard from "./ResultCard";
import LoadingSpinner from "./LoadingSpinner";
import EmptyState from "./EmptyState";
import HubMap from "./HubMap";
import ActivityPanel from "./ActivityPanel";
import DistrictSelector from "./DistrictSelector";

export default function App() {
    const [result, setResult] = useState(null);
    const [hubData, setHubData] = useState(null);
    const [pendingParams, setPendingParams] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showNegative, setShowNegative] = useState(false);
    const [selectedHub, setSelectedHub] = useState(null);
    const [activityHub, setActivityHub] = useState(null);
    const [activityData, setActivityData] = useState(null);       // { type: "listings"|"districts", ... }
    const [activityParent, setActivityParent] = useState(null);   // saved districts data for back button
    const [activityLoading, setActivityLoading] = useState(false);

    async function handleSearch(params) {
        setLoading(true);
        setError(null);
        setResult(null);
        setHubData(null);
        setPendingParams(null);
        setShowNegative(false);
        setSelectedHub(null);
        setActivityHub(null);
        setActivityData(null);
        setActivityParent(null);

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
        // clear activity results only if they belong to a different city
        if (activityHub && activityHub.iata !== hub.iata) {
            setActivityHub(null);
            setActivityData(null);
            setActivityParent(null);
        }

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

    async function handleExploreActivities(hub) {
        setActivityHub(hub);
        setActivityData(null);
        setActivityParent(null);
        setActivityLoading(true);
        // clear flight results only if they belong to a different city
        if (result && result.stopover.iata !== hub.iata) {
            setResult(null);
            setShowNegative(false);
            setSelectedHub(null);
        }
        try {
            const res = await fetch(`/api/activities?city=${encodeURIComponent(hub.city || hub.name)}`);
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || `HTTP ${res.status}`);
            }
            setActivityData(await res.json());
        } catch (err) {
            setError(err.message);
            setActivityHub(null);
        } finally {
            setActivityLoading(false);
        }
    }

    async function handleDistrictSelect(slug) {
        setActivityParent(activityData);   // save districts list for back button
        setActivityData(null);
        setActivityLoading(true);
        try {
            const params = new URLSearchParams({
                city: activityHub.city || activityHub.name,
                district: slug,
            });
            const res = await fetch(`/api/activities?${params}`);
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || `HTTP ${res.status}`);
            }
            setActivityData(await res.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setActivityLoading(false);
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
                <HubMap
                    hubData={hubData}
                    onHubSelect={handleHubSelect}
                    onShowAll={handleShowAll}
                    onShowBest={handleShowBest}
                    onExploreActivities={handleExploreActivities}
                    loading={loading}
                />
            )}

            {/* Activities flow */}
            {activityHub && activityLoading && <LoadingSpinner />}
            {activityHub && !activityLoading && activityData && pendingParams && hubData && !result && (
                <div className="mb-4">
                    <button
                        onClick={() => handleHubSelect(activityHub)}
                        style={{ backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "6px", padding: "6px 14px", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}
                    >
                        Search flights
                    </button>
                </div>
            )}
            {activityHub && !activityLoading && activityData?.type === "districts" && (
                <DistrictSelector
                    hub={activityHub}
                    districts={activityData.districts}
                    onSelect={handleDistrictSelect}
                />
            )}
            {activityHub && !activityLoading && activityData?.type === "listings" && (
                <ActivityPanel
                    hub={activityHub}
                    sections={activityData.sections}
                    loading={false}
                    onBack={activityParent ? () => setActivityData(activityParent) : null}
                />
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
                        <div className="mt-4 flex flex-wrap gap-3">
                            <button
                                onClick={() => setShowNegative(true)}
                                style={{ backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "6px", padding: "6px 14px", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}
                            >
                                Show flights anyway
                            </button>
                            {!activityHub && (
                                <button
                                    onClick={() => {
                                        const ap = cities.find(c => c.iata === result.stopover.iata);
                                        handleExploreActivities({ iata: result.stopover.iata, city: ap?.city, name: ap?.name || result.stopover.iata });
                                    }}
                                    style={{ backgroundColor: "white", color: "#2563eb", border: "1px solid #2563eb", borderRadius: "6px", padding: "6px 14px", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}
                                >
                                    Search activities
                                </button>
                            )}
                        </div>
                    </EmptyState>
                )}

            {/* Show ResultCard only when legs are complete, prices are available, and savings are positive OR user clicked "show anyway" */}
            {result &&
                !hasEmptyLegs &&
                result.summary.bestCombinedPrice !== null &&
                ((!savingsNull && result.summary.savings >= 0) || showNegative) && (
                    <>
                        <ResultCard result={result} />
                        {!activityHub && (
                            <div className="mt-4 mb-8">
                                {(() => {
                                    const ap = cities.find(c => c.iata === result.stopover.iata);
                                    const hub = { iata: result.stopover.iata, city: ap?.city, name: ap?.name || result.stopover.iata };
                                    return (
                                        <button
                                            onClick={() => handleExploreActivities(hub)}
                                            style={{ backgroundColor: "white", color: "#2563eb", border: "1px solid #2563eb", borderRadius: "6px", padding: "6px 14px", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}
                                        >
                                            Search activities
                                        </button>
                                    );
                                })()}
                            </div>
                        )}
                    </>
                )}
        </div>
    );
}
