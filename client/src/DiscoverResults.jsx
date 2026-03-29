import { useState } from "react";
import ResultCard from "./ResultCard";
import EmptyState from "./EmptyState";

export default function DiscoverResults({ results }) {
    const [expandedIdx, setExpandedIdx] = useState(null);

    const positive = results.filter(
        r => r.summary?.savings !== null && r.summary?.savings > 0
    );

    if (positive.length === 0) {
        return (
            <EmptyState
                title="No savings found"
                description="None of the major stopover hubs offers a cheaper route than flying direct for these dates. Try different dates."
            />
        );
    }

    return (
        <div className="mb-8">
            <p className="text-sm text-gray-500 mb-3">
                {positive.length} stopover{positive.length > 1 ? "s" : ""} cheaper than flying direct · ranked by savings
            </p>
            <div className="space-y-2">
                {positive.map((r, idx) => (
                    <div key={r.stopover.iata} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                            type="button"
                            className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 text-left"
                            onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                        >
                            <div className="flex items-center gap-4">
                                <span className="font-mono font-bold text-gray-800 w-10">{r.stopover.iata}</span>
                                <span className="text-sm text-gray-500">{r.stopover.nights} night{r.stopover.nights > 1 ? "s" : ""}</span>
                                <span className="text-sm text-gray-700">Total €{r.summary.bestCombinedPrice}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                                    Save €{r.summary.savings}
                                </span>
                                <span className="text-gray-400 text-xs">{expandedIdx === idx ? "▲" : "▼"}</span>
                            </div>
                        </button>
                        {expandedIdx === idx && (
                            <div className="border-t border-gray-200 p-4">
                                <ResultCard result={r} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
