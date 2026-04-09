import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import SearchForm from "../SearchForm";

const PLACEHOLDER_ORIGIN      = "City, airport or IATA (e.g. Milan)";
const PLACEHOLDER_STOPOVER    = "City, airport or IATA (e.g. Istanbul)";
const PLACEHOLDER_DESTINATION = "City, airport or IATA (e.g. Bangkok)";

describe("SearchForm — mode toggle", () => {
    it("defaults to discover mode: no stopover field, Discover button", () => {
        render(<SearchForm onSearch={vi.fn()} loading={false} />);
        expect(screen.queryByPlaceholderText(PLACEHOLDER_STOPOVER)).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Discover" })).toBeInTheDocument();
    });

    it("switching to search mode shows stopover field and Search Flights button", async () => {
        const user = userEvent.setup();
        render(<SearchForm onSearch={vi.fn()} loading={false} />);

        await user.click(screen.getByTestId("mode-toggle"));

        expect(screen.getByPlaceholderText(PLACEHOLDER_STOPOVER)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Search Flights" })).toBeInTheDocument();
    });

    it("switching back to discover mode hides the stopover field again", async () => {
        const user = userEvent.setup();
        render(<SearchForm onSearch={vi.fn()} loading={false} />);

        await user.click(screen.getByTestId("mode-toggle")); // → search
        await user.click(screen.getByTestId("mode-toggle")); // → discover

        expect(screen.queryByPlaceholderText(PLACEHOLDER_STOPOVER)).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Discover" })).toBeInTheDocument();
    });
});

describe("SearchForm — onSearch payload", () => {
    it("emits mode=discover with no stopover property in discover mode", async () => {
        const user = userEvent.setup();
        const onSearch = vi.fn();
        const { container } = render(<SearchForm onSearch={onSearch} loading={false} />);

        await user.type(screen.getByPlaceholderText(PLACEHOLDER_ORIGIN), "MXP");
        await user.type(screen.getByPlaceholderText(PLACEHOLDER_DESTINATION), "BKK");
        fireEvent.change(container.querySelector('input[name="outboundDate"]'), { target: { value: "2026-06-10" } });

        await user.click(screen.getByRole("button", { name: "Discover" }));

        expect(onSearch).toHaveBeenCalledOnce();
        const params = onSearch.mock.calls[0][0];
        expect(params.mode).toBe("discover");
        expect(params.origin).toBe("MXP");
        expect(params.destination).toBe("BKK");
        expect(params).not.toHaveProperty("stopover");
    });

    it("emits mode=search with stopover in search mode", async () => {
        const user = userEvent.setup();
        const onSearch = vi.fn();
        const { container } = render(<SearchForm onSearch={onSearch} loading={false} />);

        await user.click(screen.getByTestId("mode-toggle")); // switch to search mode

        await user.type(screen.getByPlaceholderText(PLACEHOLDER_ORIGIN), "MXP");
        await user.type(screen.getByPlaceholderText(PLACEHOLDER_STOPOVER), "IST");
        await user.type(screen.getByPlaceholderText(PLACEHOLDER_DESTINATION), "BKK");
        fireEvent.change(container.querySelector('input[name="outboundDate"]'), { target: { value: "2026-06-10" } });

        await user.click(screen.getByRole("button", { name: "Search Flights" }));

        expect(onSearch).toHaveBeenCalledOnce();
        const params = onSearch.mock.calls[0][0];
        expect(params.mode).toBe("search");
        expect(params.origin).toBe("MXP");
        expect(params.stopover).toBe("IST");
        expect(params.destination).toBe("BKK");
    });
});

describe("SearchForm — advanced options", () => {
    it("advanced options are collapsed by default", () => {
        render(<SearchForm onSearch={vi.fn()} loading={false} />);
        expect(screen.getByText("Advanced options")).toBeInTheDocument();
        expect(screen.queryByLabelText(/direct only/i)).not.toBeInTheDocument();
    });

    it("clicking Advanced options reveals the max stops radio buttons", async () => {
        const user = userEvent.setup();
        render(<SearchForm onSearch={vi.fn()} loading={false} />);

        await user.click(screen.getByText("Advanced options"));

        expect(screen.getByLabelText(/direct only/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/up to 1 stop/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/up to 2 stops/i)).toBeInTheDocument();
    });

    it("Up to 2 stops is selected by default when advanced options are opened", async () => {
        const user = userEvent.setup();
        render(<SearchForm onSearch={vi.fn()} loading={false} />);

        await user.click(screen.getByText("Advanced options"));

        expect(screen.getByLabelText(/up to 2 stops/i)).toBeChecked();
        expect(screen.getByLabelText(/direct only/i)).not.toBeChecked();
    });

    it("selected max stops value is passed in the onSearch payload", async () => {
        const user = userEvent.setup();
        const onSearch = vi.fn();
        const { container } = render(<SearchForm onSearch={onSearch} loading={false} />);

        await user.click(screen.getByText("Advanced options"));
        await user.click(screen.getByLabelText(/direct only/i));

        await user.type(screen.getByPlaceholderText(PLACEHOLDER_ORIGIN), "MXP");
        await user.type(screen.getByPlaceholderText(PLACEHOLDER_DESTINATION), "BKK");
        fireEvent.change(container.querySelector('input[name="outboundDate"]'), { target: { value: "2026-06-10" } });

        await user.click(screen.getByRole("button", { name: "Discover" }));

        const params = onSearch.mock.calls[0][0];
        expect(params.maxStops).toBe("1"); // SerpAPI value for nonstop only
    });
});
