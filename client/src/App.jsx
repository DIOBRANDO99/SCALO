import { useState, useEffect } from "react";
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

    const [activityProvider, setActivityProvider] = useState("wikivoyage");

    const [outboundTotalPrice, setOutboundTotalPrice] = useState(null);
    const [returnTotalPrice, setReturnTotalPrice] = useState(null);

    // Phase 2 — return journey
    const [returnHubData, setReturnHubData] = useState(null);
    const [returnResult, setReturnResult] = useState(null);
    const [returnLoading, setReturnLoading] = useState(false);
    const [returnSelectedHub, setReturnSelectedHub] = useState(null);
    const [returnShowNegative, setReturnShowNegative] = useState(false);
    const [returnStopoverNights, setReturnStopoverNights] = useState(3);
    const [returnActivityHub, setReturnActivityHub] = useState(null);
    const [returnActivityData, setReturnActivityData] = useState(null);
    const [returnActivityParent, setReturnActivityParent] = useState(null);
    const [returnActivityLoading, setReturnActivityLoading] = useState(false);

    useEffect(() => {
        fetch("/health")
            .then(r => r.json())
            .then(d => setActivityProvider(d.activityProvider || "wikivoyage"))
            .catch(() => {});
    }, []);

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
        setOutboundTotalPrice(null);
        setReturnTotalPrice(null);
        setReturnHubData(null);
        setReturnResult(null);
        setReturnSelectedHub(null);
        setReturnShowNegative(false);
        setReturnStopoverNights(3);
        setReturnActivityHub(null);
        setReturnActivityData(null);
        setReturnActivityParent(null);

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
                body: JSON.stringify({ ...body, oneWay: true }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || `HTTP ${res.status}`);
            }

            setResult(await res.json());
            setPendingParams(body);
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
        setOutboundTotalPrice(null);
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
                body: JSON.stringify({ ...pendingParams, stopover: hub.iata, oneWay: true }),
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

    async function handleReturnDiscover() {
        setReturnLoading(true);
        setReturnResult(null);
        setReturnSelectedHub(null);
        setReturnShowNegative(false);
        setError(null);
        try {
            const res = await fetch(`/api/hubs?origin=${pendingParams.destination}&destination=${pendingParams.origin}&auto=true`);
            if (!res.ok) throw new Error((await res.json()).error || `HTTP ${res.status}`);
            setReturnHubData(await res.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setReturnLoading(false);
        }
    }

    async function handleReturnShowAll() {
        setReturnLoading(true);
        setReturnResult(null);
        setReturnSelectedHub(null);
        try {
            const res = await fetch(`/api/hubs?origin=${pendingParams.destination}&destination=${pendingParams.origin}`);
            if (!res.ok) throw new Error((await res.json()).error || `HTTP ${res.status}`);
            setReturnHubData(await res.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setReturnLoading(false);
        }
    }

    async function handleReturnShowBest() {
        setReturnLoading(true);
        setReturnResult(null);
        setReturnSelectedHub(null);
        try {
            const res = await fetch(`/api/hubs?origin=${pendingParams.destination}&destination=${pendingParams.origin}&auto=true`);
            if (!res.ok) throw new Error((await res.json()).error || `HTTP ${res.status}`);
            setReturnHubData(await res.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setReturnLoading(false);
        }
    }

    async function handleReturnHubSelect(hub) {
        setReturnLoading(true);
        setReturnResult(null);
        setReturnShowNegative(false);
        setReturnTotalPrice(null);
        setReturnSelectedHub(hub.iata);
        if (returnActivityHub && returnActivityHub.iata !== hub.iata) {
            setReturnActivityHub(null);
            setReturnActivityData(null);
            setReturnActivityParent(null);
        }
        const d = new Date(pendingParams.returnDate);
        d.setDate(d.getDate() - returnStopoverNights);
        const returnDepartureDate = d.toISOString().split("T")[0];

        try {
            const res = await fetch("/api/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    origin: pendingParams.destination,
                    destination: pendingParams.origin,
                    stopover: hub.iata,
                    outboundDate: returnDepartureDate,
                    stopoverNights: returnStopoverNights,
                    maxStops: pendingParams.maxStops,
                    adults: pendingParams.adults,
                    travelClass: pendingParams.travelClass,
                    oneWay: true,
                }),
            });
            if (!res.ok) throw new Error((await res.json()).error || `HTTP ${res.status}`);
            setReturnResult(await res.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setReturnLoading(false);
        }
    }

    async function handleExploreReturnActivities(hub) {
        setReturnActivityHub(hub);
        setReturnActivityData(null);
        setReturnActivityParent(null);
        setReturnActivityLoading(true);
        try {
            const res = await fetch(`/api/activities?city=${encodeURIComponent(hub.city || hub.name)}`);
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || `HTTP ${res.status}`);
            }
            setReturnActivityData(await res.json());
        } catch (err) {
            setError(err.message);
            setReturnActivityHub(null);
        } finally {
            setReturnActivityLoading(false);
        }
    }

    async function handleReturnDistrictSelect(slug) {
        setReturnActivityParent(returnActivityData);
        setReturnActivityData(null);
        setReturnActivityLoading(true);
        try {
            const params = new URLSearchParams({
                city: returnActivityHub.city || returnActivityHub.name,
                district: slug,
            });
            const res = await fetch(`/api/activities?${params}`);
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || `HTTP ${res.status}`);
            }
            setReturnActivityData(await res.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setReturnActivityLoading(false);
        }
    }

    const emptyLegs = result
        ? result.legs.filter((leg) => !leg.options || leg.options.length === 0)
        : [];
    const hasEmptyLegs = emptyLegs.length > 0;
    const savingsNull = result && result.summary.savings === null;

    const returnEmptyLegs = returnResult
        ? returnResult.legs.filter((leg) => !leg.options || leg.options.length === 0)
        : [];
    const returnHasEmptyLegs = returnEmptyLegs.length > 0;
    const returnSavingsNull = returnResult && returnResult.summary.savings === null;

    const showReturnPhase = result && !pendingParams?.oneWay && pendingParams?.returnDate;
    const isWide = hubData || returnHubData;

    return (
        <div className={`${isWide ? "max-w-5xl" : "max-w-3xl"} mx-auto px-4 py-12`}>
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
                    provider={activityData.provider || activityProvider}
                    loading={false}
                    onBack={activityParent ? () => setActivityData(activityParent) : null}
                    onClose={() => { setActivityHub(null); setActivityData(null); setActivityParent(null); }}
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
                        <ResultCard
                            result={result}
                            onClose={() => { setResult(null); setShowNegative(false); setSelectedHub(null); setOutboundTotalPrice(null); }}
                            onTotalPriceChange={setOutboundTotalPrice}
                        />
                        {activityHub?.iata !== result.stopover.iata && (
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
            {/* Phase 2: Return journey */}
            {showReturnPhase && (
                <div className="mt-4">
                    <div className="flex items-center gap-3 mb-4">
                        <h2 className="text-lg font-semibold">
                            Return: {pendingParams.destination} → {pendingParams.origin}
                        </h2>
                        <label className="flex items-center gap-2 text-sm text-gray-600">
                            Nights at stopover:
                            <input
                                type="number"
                                min={1}
                                max={14}
                                value={returnStopoverNights}
                                onChange={e => setReturnStopoverNights(parseInt(e.target.value, 10) || 3)}
                                className="w-16 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </label>
                        {!returnHubData && !returnResult && !returnLoading && (
                            <button
                                onClick={handleReturnDiscover}
                                style={{ backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "6px", padding: "6px 14px", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}
                            >
                                Discover return stopovers
                            </button>
                        )}
                    </div>

                    {returnLoading && <LoadingSpinner />}

                    {returnHubData && (
                        <HubMap
                            hubData={returnHubData}
                            onHubSelect={handleReturnHubSelect}
                            onShowAll={handleReturnShowAll}
                            onShowBest={handleReturnShowBest}
                            onExploreActivities={handleExploreReturnActivities}
                            loading={returnLoading}
                        />
                    )}

                    {returnSelectedHub && (
                        <p className="text-sm text-gray-500 mb-4">
                            Showing return results for stopover: <strong>{returnSelectedHub}</strong>
                        </p>
                    )}

                    {returnResult && returnHasEmptyLegs && (
                        <EmptyState
                            title="No flights found"
                            description={`We couldn't find any flights for: ${returnEmptyLegs
                                .map((leg) => `${leg.origin} → ${leg.destination} on ${leg.date}`)
                                .join(", ")}. Try a different return stopover.`}
                        />
                    )}

                    {returnResult && !returnHasEmptyLegs && returnSavingsNull && (
                        <EmptyState
                            title="No direct return flight available"
                            description="We found return stopover flights but couldn't find a direct route to compare against."
                        >
                            <button
                                className="mt-4 text-sm text-blue-600 underline"
                                onClick={() => setReturnShowNegative(true)}
                            >
                                Show return flights
                            </button>
                        </EmptyState>
                    )}

                    {returnResult && !returnHasEmptyLegs && !returnSavingsNull && returnResult.summary.savings < 0 && !returnShowNegative && (
                        <EmptyState
                            title="No savings on return with this stopover"
                            description={`Flying back via ${returnResult.stopover.iata} costs €${Math.abs(returnResult.summary.savings)} more than the direct return (€${returnResult.summary.directPrice}).`}
                        >
                            <button
                                onClick={() => setReturnShowNegative(true)}
                                style={{ backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "6px", padding: "6px 14px", fontSize: "13px", fontWeight: 500, cursor: "pointer", marginTop: "12px" }}
                            >
                                Show return flights anyway
                            </button>
                        </EmptyState>
                    )}

                    {returnResult && !returnHasEmptyLegs && returnResult.summary.bestCombinedPrice !== null &&
                        ((!returnSavingsNull && returnResult.summary.savings >= 0) || returnShowNegative) && (
                        <>
                            <ResultCard
                                result={returnResult}
                                onClose={() => { setReturnResult(null); setReturnShowNegative(false); setReturnSelectedHub(null); setReturnTotalPrice(null); }}
                                onTotalPriceChange={setReturnTotalPrice}
                            />
                            {returnActivityHub?.iata !== returnResult.stopover.iata && (
                                <div className="mt-4 mb-4">
                                    {(() => {
                                        const ap = cities.find(c => c.iata === returnResult.stopover.iata);
                                        const hub = { iata: returnResult.stopover.iata, city: ap?.city, name: ap?.name || returnResult.stopover.iata };
                                        return (
                                            <button
                                                onClick={() => handleExploreReturnActivities(hub)}
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
                    {/* Return activities flow */}
                    {returnActivityHub && (
                        <div className="mt-4">
                            {returnActivityLoading && <LoadingSpinner />}
                            {!returnActivityLoading && returnActivityData?.type === "districts" && (
                                <DistrictSelector
                                    hub={returnActivityHub}
                                    districts={returnActivityData.districts}
                                    onSelect={handleReturnDistrictSelect}
                                />
                            )}
                            {!returnActivityLoading && returnActivityData?.type === "listings" && (
                                <ActivityPanel
                                    hub={returnActivityHub}
                                    sections={returnActivityData.sections}
                                    provider={returnActivityData.provider || activityProvider}
                                    loading={false}
                                    onBack={returnActivityParent ? () => setReturnActivityData(returnActivityParent) : null}
                                    onClose={() => { setReturnActivityHub(null); setReturnActivityData(null); setReturnActivityParent(null); }}
                                />
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Combined trip summary */}
            {result && !hasEmptyLegs && result.summary.bestCombinedPrice !== null &&
             returnResult && !returnHasEmptyLegs && returnResult.summary.bestCombinedPrice !== null && (() => {
                const combinedTotal = (outboundTotalPrice ?? result.summary.bestCombinedPrice) + (returnTotalPrice ?? returnResult.summary.bestCombinedPrice);
                const combinedDirect = (result.summary.directPrice ?? 0) + (returnResult.summary.directPrice ?? 0);
                const combinedSavings = result.summary.directPrice !== null && returnResult.summary.directPrice !== null
                    ? combinedDirect - combinedTotal : null;
                const adults = result.adults ?? 1;
                return (
                    <div className="bg-white rounded-lg shadow p-6 mb-8 mt-4">
                        <h3 className="text-base font-semibold mb-3">Full trip summary</h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total for both journeys</p>
                                <p className="text-2xl font-bold">€{combinedTotal}</p>
                                {adults > 1 && (
                                    <p className="text-xs text-gray-400">€{Math.round(combinedTotal / adults)} per person</p>
                                )}
                            </div>
                            {combinedSavings !== null && (
                                <div className={`text-right ${combinedSavings >= 0 ? "text-green-600" : "text-red-500"}`}>
                                    <p className="text-2xl font-bold">
                                        {combinedSavings >= 0 ? `Save €${combinedSavings}` : `+€${Math.abs(combinedSavings)} vs direct`}
                                    </p>
                                    <p className="text-xs text-gray-400">vs €{combinedDirect} direct both ways</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
