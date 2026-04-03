import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import App from "../App";

// Helper: submit the search form with minimal valid input
async function submitSearch(user, { origin = "MXP", stopover = "IST", destination = "BKK" } = {}) {
    const { container } = render(<App />);
    await user.type(screen.getByPlaceholderText("MXP"), origin);
    await user.type(screen.getByPlaceholderText("IST"), stopover);
    await user.type(screen.getByPlaceholderText("BKK"), destination);
    fireEvent.change(container.querySelector('input[name="outboundDate"]'), { target: { value: "2026-06-10" } });
    await user.click(screen.getByRole("button", { name: "Search Flights" }));
}

beforeEach(() => {
    vi.restoreAllMocks();
});

describe("App — Scenario A: no flights found", () => {
    it("shows 'No flights found' when one or more legs have no options", async () => {
        const user = userEvent.setup();

        // Leg with no options — the backend returns options: [] for one leg
        const mockResult = {
            stopover: { iata: "IST", nights: 3 },
            legs: [
                { id: "outbound1", origin: "MXP", destination: "IST", date: "2026-06-10", bestPrice: null, options: [] },
                { id: "outbound2", origin: "IST", destination: "BKK", date: "2026-06-13", bestPrice: 245, options: [{ price: 245 }] },
                { id: "return",    origin: "BKK", destination: "MXP", date: "2026-06-20", bestPrice: 266, options: [{ price: 266 }] },
            ],
            summary: { bestCombinedPrice: null, directPrice: 1176, savings: null, currency: "EUR" },
        };

        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
            ok: true,
            json: async () => mockResult,
        });

        await submitSearch(user);

        expect(screen.getByText("No flights found")).toBeInTheDocument();
        // Must NOT show ResultCard (no leg titles)
        expect(screen.queryByText("Outbound")).not.toBeInTheDocument();
    });
});

describe("App — Scenario B: no direct flight to compare", () => {
    it("shows 'No direct flight available' when savings is null but legs have options", async () => {
        const user = userEvent.setup();

        const mockResult = {
            stopover: { iata: "IST", nights: 3 },
            legs: [
                { id: "outbound1", origin: "MXP", destination: "IST", date: "2026-06-10", bestPrice: 82,  options: [{ price: 82  }] },
                { id: "outbound2", origin: "IST", destination: "BKK", date: "2026-06-13", bestPrice: 275, options: [{ price: 275 }] },
                { id: "return",    origin: "BKK", destination: "MXP", date: "2026-06-20", bestPrice: 266, options: [{ price: 266 }] },
            ],
            summary: { bestCombinedPrice: 623, directPrice: null, savings: null, currency: "EUR" },
        };

        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
            ok: true,
            json: async () => mockResult,
        });

        await submitSearch(user);

        expect(screen.getByText("No direct flight available")).toBeInTheDocument();
        expect(screen.queryByText("Outbound")).not.toBeInTheDocument();
    });

    it("shows ResultCard after clicking 'Show stopover flights'", async () => {
        const user = userEvent.setup();

        const option = {
            price: 82, totalDuration: 180, airlineLogo: null, bookingToken: null,
            carbonEmissions: null, layovers: [],
            flights: [{
                departureAirport: { id: "MXP", name: "MXP", time: "2026-06-10 10:00" },
                arrivalAirport:   { id: "IST", name: "IST", time: "2026-06-10 13:00" },
                airline: "Test Air", flightNumber: "TA 1", airplane: "737",
                travelClass: "Economy", duration: 180, legroom: "30 in",
                overnight: false, oftenDelayed: false, ticketAlsoSoldBy: [], planeAndCrewBy: null, airlineLogo: null,
            }],
        };

        const mockResult = {
            stopover: { iata: "IST", nights: 3 },
            legs: [
                { id: "outbound1", origin: "MXP", destination: "IST", date: "2026-06-10", bestPrice: 82,  options: [option] },
                { id: "outbound2", origin: "IST", destination: "BKK", date: "2026-06-13", bestPrice: 275, options: [{ ...option, flights: [{ ...option.flights[0], departureAirport: { id: "IST", name: "IST", time: "2026-06-13 10:00" }, arrivalAirport: { id: "BKK", name: "BKK", time: "2026-06-13 17:00" } }] }] },
                { id: "return",    origin: "BKK", destination: "MXP", date: "2026-06-20", bestPrice: 266, options: [{ ...option, flights: [{ ...option.flights[0], departureAirport: { id: "BKK", name: "BKK", time: "2026-06-20 10:00" }, arrivalAirport: { id: "MXP", name: "MXP", time: "2026-06-20 20:00" } }] }] },
            ],
            summary: { bestCombinedPrice: 623, directPrice: null, savings: null, currency: "EUR" },
        };

        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
            ok: true,
            json: async () => mockResult,
        });

        await submitSearch(user);
        await user.click(screen.getByText("Show stopover flights"));

        expect(screen.getByText("Outbound")).toBeInTheDocument();
    });
});

describe("App — Scenario C: stopover more expensive than direct", () => {
    it("shows 'No savings with this stopover' when savings is negative", async () => {
        const user = userEvent.setup();

        const mockResult = {
            stopover: { iata: "ORD", nights: 3 },
            legs: [
                { id: "outbound1", origin: "MXP", destination: "ORD", date: "2026-06-10", bestPrice: 415, options: [{ price: 415 }] },
                { id: "outbound2", origin: "ORD", destination: "BKK", date: "2026-06-13", bestPrice: 769, options: [{ price: 769 }] },
                { id: "return",    origin: "BKK", destination: "MXP", date: "2026-06-20", bestPrice: 266, options: [{ price: 266 }] },
            ],
            // 415+769+266=1450, direct=1176, savings=-274
            summary: { bestCombinedPrice: 1450, directPrice: 1176, savings: -274, currency: "EUR" },
        };

        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
            ok: true,
            json: async () => mockResult,
        });

        await submitSearch(user, { stopover: "ORD" });

        expect(screen.getByText("No savings with this stopover")).toBeInTheDocument();
        // Message must include the correct cost difference and direct price
        expect(screen.getByText(/costs €274 more than the direct flight \(€1176\)/)).toBeInTheDocument();
        expect(screen.queryByText("Outbound")).not.toBeInTheDocument();
    });
});
