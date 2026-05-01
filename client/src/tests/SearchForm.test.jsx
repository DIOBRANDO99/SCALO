import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import SearchForm from "../SearchForm";

const PLACEHOLDER_STOPOVER = "City, airport or IATA (e.g. Istanbul)";
const CITY_INPUT_RE = /City, airport or IATA/;

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

        const [originInput, destinationInput] = screen.getAllByPlaceholderText(CITY_INPUT_RE);
        await user.type(originInput, "MXP");
        await user.type(destinationInput, "BKK");
        fireEvent.change(container.querySelector('input[name="outboundDate"]'), { target: { value: "2026-06-10" } });
        fireEvent.change(container.querySelector('input[name="returnDate"]'),   { target: { value: "2026-06-20" } });

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

        const [originInput, stopoverInput, destinationInput] = screen.getAllByPlaceholderText(CITY_INPUT_RE);
        await user.type(originInput, "MXP");
        await user.type(stopoverInput, "IST");
        await user.type(destinationInput, "BKK");
        fireEvent.change(container.querySelector('input[name="outboundDate"]'), { target: { value: "2026-06-10" } });
        fireEvent.change(container.querySelector('input[name="returnDate"]'),   { target: { value: "2026-06-20" } });

        await user.click(screen.getByRole("button", { name: "Search Flights" }));

        expect(onSearch).toHaveBeenCalledOnce();
        const params = onSearch.mock.calls[0][0];
        expect(params.mode).toBe("search");
        expect(params.origin).toBe("MXP");
        expect(params.stopover).toBe("IST");
        expect(params.destination).toBe("BKK");
    });
});

