import { useState } from "react";

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

function formatTime(datetime) {
  return datetime ? datetime.split(" ")[1] : "—";
}

function LegOption({ option, selected, onSelect, href }) {
  const [showDetails, setShowDetails] = useState(false);
  const firstFlight = option.flights[0];
  const lastFlight = option.flights[option.flights.length - 1];
  const stops = option.flights.length - 1;
  const hasDelay = option.flights.some((f) => f.oftenDelayed);

  return (
    <div
      onClick={onSelect}
      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
        selected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {option.airlineLogo && (
            <img src={option.airlineLogo} alt="" className="h-5 w-5 object-contain shrink-0" />
          )}
          <div className="min-w-0">
            <div className="text-sm font-medium">
              {formatTime(firstFlight.departureAirport?.time)} →{" "}
              {formatTime(lastFlight.arrivalAirport?.time)}
            </div>
            <div className="text-xs text-gray-500">
              {stops === 0 ? "Direct" : `${stops} stop${stops > 1 ? "s" : ""}`}{" "}
              · {formatDuration(option.totalDuration)}
              {hasDelay && (
                <span className="ml-2 text-amber-600">⚠ Often delayed</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-semibold">€{option.price}</div>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-blue-600 hover:underline"
          >
            Book →
          </a>
        </div>
      </div>

      <button
        className="text-xs text-blue-500 mt-2 hover:underline"
        onClick={(e) => {
          e.stopPropagation();
          setShowDetails(!showDetails);
        }}
      >
        {showDetails ? "Hide details" : "Show details"}
      </button>

      {showDetails && (
        <div className="mt-2 text-xs text-gray-600 space-y-1 border-t pt-2">
          {option.flights.map((f, i) => (
            <div key={i}>
              <span className="font-medium">{f.flightNumber}</span> ·{" "}
              {f.airplane} · Legroom: {f.legroom ?? "—"}
            </div>
          ))}
          {option.carbonEmissions && (
            <div>
              CO₂: {Math.round(option.carbonEmissions.grams / 1000)}kg{" "}
              <span
                className={
                  option.carbonEmissions.differencePercent > 0
                    ? "text-red-500"
                    : "text-green-600"
                }
              >
                ({option.carbonEmissions.differencePercent > 0 ? "+" : ""}
                {option.carbonEmissions.differencePercent}% vs typical)
              </span>
            </div>
          )}
          {option.layovers.length > 0 && (
            <div>
              Layover:{" "}
              {option.layovers
                .map((l) => `${l.name} (${formatDuration(l.duration)})`)
                .join(", ")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const LEG_LABELS = { outbound1: "Outbound", outbound2: "Onward", return: "Return" };

function LegSection({ leg, selectedIdx, onSelect }) {
  const [expanded, setExpanded] = useState(false);
  const selectedOption = leg.options[selectedIdx];

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            {LEG_LABELS[leg.id] ?? leg.id}
          </span>
          <span className="text-sm font-medium text-gray-700">
            {leg.origin} → {leg.destination}
          </span>
          <span className="text-xs text-gray-400">{leg.date}</span>
        </div>
        <button
          className="text-xs text-blue-600 hover:underline shrink-0"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Close" : `Change (${leg.options.length} options)`}
        </button>
      </div>

      <LegOption option={selectedOption} selected={true} onSelect={() => {}} href={bookingUrl(selectedOption, leg)} />

      {expanded && (
        <div className="mt-2 space-y-2">
          {leg.options.map(
            (opt, i) =>
              i !== selectedIdx && (
                <LegOption
                  key={i}
                  option={opt}
                  selected={false}
                  href={bookingUrl(opt, leg)}
                  onSelect={() => {
                    onSelect(i);
                    setExpanded(false);
                  }}
                />
              )
          )}
        </div>
      )}
    </div>
  );
}

function bookingUrl(option, leg) {
  const dep = option.flights[0].departureAirport?.id ?? leg.origin;
  const arr = option.flights[option.flights.length - 1].arrivalAirport?.id ?? leg.destination;
  const date = leg.date ? leg.date.replace(/-/g, "").slice(2) : ""; // 2026-04-14 → 260414
  return `https://www.skyscanner.net/transport/flights/${dep.toLowerCase()}/${arr.toLowerCase()}/${date}/`;
}

export default function ResultCard({ result }) {
  const { legs, summary, stopover } = result;

  const [selectedIdx, setSelectedIdx] = useState(() =>
    legs.map((leg) => {
      const validOptions = leg.options.filter((o) => typeof o.price === "number");
      if (validOptions.length === 0) return 0;
      const minPrice = Math.min(...validOptions.map((o) => o.price));
      return leg.options.findIndex((o) => o.price === minPrice);
    })
  );

  const selectedOptions = legs.map((leg, i) => leg.options[selectedIdx[i]]);
  const totalPrice = selectedOptions.reduce((sum, o) => sum + (o?.price ?? 0), 0);
  const savings = summary.directPrice != null ? summary.directPrice - totalPrice : null;

  const destination = legs.find((l) => l.id === "outbound2")?.destination ?? legs[1]?.destination;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold">
            {legs[0].origin} → {stopover.iata} → {destination}
          </h2>
          <p className="text-sm text-gray-500">
            {stopover.nights} night{stopover.nights !== 1 ? "s" : ""} in {stopover.iata}
          </p>
        </div>
        {savings != null && (
          <div className={`text-right shrink-0 ${savings >= 0 ? "text-green-600" : "text-red-500"}`}>
            <div className="text-2xl font-bold">
              {savings >= 0 ? `Save €${savings}` : `+€${Math.abs(savings)} vs direct`}
            </div>
            <div className="text-xs text-gray-400">
              Direct: €{summary.directPrice}
            </div>
          </div>
        )}
      </div>

      {/* Legs */}
      {legs.map((leg, i) => (
        <LegSection
          key={leg.id}
          leg={leg}
          selectedIdx={selectedIdx[i]}
          onSelect={(optIdx) => {
            const next = [...selectedIdx];
            next[i] = optIdx;
            setSelectedIdx(next);
          }}
        />
      ))}

      {/* Footer */}
      <div className="border-t pt-4">
        <p className="text-xs text-gray-400 mb-1">Total selected</p>
        <p className="text-2xl font-bold">€{totalPrice}</p>
        {savings != null && totalPrice !== summary.bestCombinedPrice && (
          <p className="text-xs text-gray-400">
            Best possible: €{summary.bestCombinedPrice}
          </p>
        )}
      </div>
    </div>
  );
}
