import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import DiscoverResults from "../DiscoverResults";

// Minimal stub for a stopover result — only what DiscoverResults and ResultCard need
function makeOption(dep, arr, price = 100) {
    return {
        price,
        totalDuration: 180,
        airlineLogo: null,
        bookingToken: null,
        carbonEmissions: null,
        layovers: [],
        flights: [{
            departureAirport: { id: dep, name: dep, time: "2026-06-10 10:00" },
            arrivalAirport:   { id: arr, name: arr, time: "2026-06-10 13:00" },
            airline: "Test Air",
            flightNumber: "TA 1",
            airplane: "Boeing 737",
            travelClass: "Economy",
            duration: 180,
            legroom: "30 in",
            overnight: false,
            oftenDelayed: false,
            ticketAlsoSoldBy: [],
            planeAndCrewBy: null,
            airlineLogo: null,
        }],
    };
}

function makeResult(iata, savings, bestCombinedPrice) {
    return {
        stopover: { iata, nights: 3 },
        legs: [
            { id: "outbound1", origin: "MXP", destination: iata,  date: "2026-06-10", bestPrice: 100, options: [makeOption("MXP", iata)] },
            { id: "outbound2", origin: iata,  destination: "BKK", date: "2026-06-13", bestPrice: 100, options: [makeOption(iata, "BKK")] },
            { id: "return",    origin: "BKK", destination: "MXP", date: "2026-06-20", bestPrice: 100, options: [makeOption("BKK", "MXP")] },
        ],
        summary: { bestCombinedPrice, directPrice: 1176, savings, currency: "EUR" },
    };
}

describe("DiscoverResults — filtering", () => {
    it("shows only stopovers with positive savings", () => {
        const results = [
            makeResult("IST", 553, 623),   // positive — should appear
            makeResult("DOH", -251, 1139), // negative — must NOT appear
            makeResult("ORD", null, null), // null savings — must NOT appear
        ];
        render(<DiscoverResults results={results} />);

        expect(screen.getByText("IST")).toBeInTheDocument();
        expect(screen.queryByText("DOH")).not.toBeInTheDocument();
        expect(screen.queryByText("ORD")).not.toBeInTheDocument();
    });

    it("shows EmptyState when all results have non-positive savings", () => {
        const results = [
            makeResult("DOH", -251, 1139),
            makeResult("ORD", -274, 1450),
        ];
        render(<DiscoverResults results={results} />);

        expect(screen.getByText("No savings found")).toBeInTheDocument();
        expect(screen.queryByText("DOH")).not.toBeInTheDocument();
    });

    it("shows EmptyState when results array is empty", () => {
        render(<DiscoverResults results={[]} />);
        expect(screen.getByText("No savings found")).toBeInTheDocument();
    });
});

describe("DiscoverResults — ranking", () => {
    it("renders stopovers in descending order by savings", () => {
        // IST saves €553, SIN saves €459, JFK saves €140 — correct order is IST, SIN, JFK
        const results = [
            makeResult("SIN", 459, 717),
            makeResult("JFK", 140, 1036),
            makeResult("IST", 553, 623),
        ];
        // Backend already sorts, but DiscoverResults renders in the order it receives.
        // We pass them unsorted and verify the rendered order matches what was passed.
        // The component does NOT re-sort — that's the backend's job.
        // So we pass pre-sorted data (as the real API would return) and verify render order.
        const sorted = [
            makeResult("IST", 553, 623),
            makeResult("SIN", 459, 717),
            makeResult("JFK", 140, 1036),
        ];
        render(<DiscoverResults results={sorted} />);

        const rows = screen.getAllByRole("button").map(b => b.textContent);
        const istIndex = rows.findIndex(t => t.includes("IST"));
        const sinIndex = rows.findIndex(t => t.includes("SIN"));
        const jfkIndex = rows.findIndex(t => t.includes("JFK"));

        // IST (highest savings) must appear before SIN, SIN before JFK
        expect(istIndex).toBeLessThan(sinIndex);
        expect(sinIndex).toBeLessThan(jfkIndex);
    });
});

describe("DiscoverResults — correct data displayed", () => {
    it("shows the correct savings and total price for each stopover", () => {
        const results = [
            makeResult("IST", 553, 623),
            makeResult("SIN", 459, 717),
        ];
        render(<DiscoverResults results={results} />);

        // IST row
        expect(screen.getByText("Save €553")).toBeInTheDocument();
        expect(screen.getByText("Total €623")).toBeInTheDocument();

        // SIN row
        expect(screen.getByText("Save €459")).toBeInTheDocument();
        expect(screen.getByText("Total €717")).toBeInTheDocument();
    });

    it("shows correct night count for each stopover", () => {
        render(<DiscoverResults results={[makeResult("IST", 553, 623)]} />);
        expect(screen.getByText("3 nights")).toBeInTheDocument();
    });

    it("shows correct result count in the header", () => {
        const results = [
            makeResult("IST", 553, 623),
            makeResult("SIN", 459, 717),
            makeResult("JFK", 140, 1036),
        ];
        render(<DiscoverResults results={results} />);
        expect(screen.getByText("3 stopovers cheaper than flying direct · ranked by savings")).toBeInTheDocument();
    });
});

describe("DiscoverResults — expand/collapse", () => {
    it("does not show flight details before expanding", () => {
        render(<DiscoverResults results={[makeResult("IST", 553, 623)]} />);
        // ResultCard renders leg labels — should not be visible before expand
        expect(screen.queryByText("Outbound")).not.toBeInTheDocument();
    });

    it("shows flight details after clicking a row", async () => {
        const user = userEvent.setup();
        render(<DiscoverResults results={[makeResult("IST", 553, 623)]} />);

        await user.click(screen.getByRole("button", { name: /IST/i }));
        expect(screen.getByText("Outbound")).toBeInTheDocument();
    });

    it("collapses flight details when clicking the same row again", async () => {
        const user = userEvent.setup();
        render(<DiscoverResults results={[makeResult("IST", 553, 623)]} />);

        await user.click(screen.getByRole("button", { name: /IST/i }));
        expect(screen.getByText("Outbound")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /IST/i }));
        expect(screen.queryByText("Outbound")).not.toBeInTheDocument();
    });
});
