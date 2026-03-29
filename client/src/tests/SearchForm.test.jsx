import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import SearchForm from "../SearchForm";

describe("SearchForm", () => {
    it("renders search mode fields by default", () => {
        render(<SearchForm onSearch={vi.fn()} loading={false} />);
        expect(screen.getByPlaceholderText("MXP")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("IST")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("BKK")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Search Flights" })).toBeInTheDocument();
    });

    it("hides stopover field and changes button label when discover mode is toggled", async () => {
        const user = userEvent.setup();
        render(<SearchForm onSearch={vi.fn()} loading={false} />);

        await user.click(screen.getByRole("button", { name: /discover best stopover/i }));

        expect(screen.queryByPlaceholderText("IST")).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Discover" })).toBeInTheDocument();
    });

    it("calls onSearch with mode=search and stopover when in search mode", async () => {
        const user = userEvent.setup();
        const onSearch = vi.fn();
        const { container } = render(<SearchForm onSearch={onSearch} loading={false} />);

        await user.type(screen.getByPlaceholderText("MXP"), "MXP");
        await user.type(screen.getByPlaceholderText("IST"), "IST");
        await user.type(screen.getByPlaceholderText("BKK"), "BKK");
        fireEvent.change(container.querySelector('input[name="outboundDate"]'), { target: { value: "2026-06-10" } });

        await user.click(screen.getByRole("button", { name: "Search Flights" }));

        expect(onSearch).toHaveBeenCalledOnce();
        const params = onSearch.mock.calls[0][0];
        expect(params.mode).toBe("search");
        expect(params.stopover).toBe("IST");
        expect(params.origin).toBe("MXP");
        expect(params.destination).toBe("BKK");
    });

    it("calls onSearch with mode=discover and no stopover key when in discover mode", async () => {
        const user = userEvent.setup();
        const onSearch = vi.fn();
        const { container } = render(<SearchForm onSearch={onSearch} loading={false} />);

        await user.click(screen.getByRole("button", { name: /discover best stopover/i }));
        await user.type(screen.getByPlaceholderText("MXP"), "MXP");
        await user.type(screen.getByPlaceholderText("BKK"), "BKK");
        fireEvent.change(container.querySelector('input[name="outboundDate"]'), { target: { value: "2026-06-10" } });

        await user.click(screen.getByRole("button", { name: "Discover" }));

        expect(onSearch).toHaveBeenCalledOnce();
        const params = onSearch.mock.calls[0][0];
        expect(params.mode).toBe("discover");
        expect(params).not.toHaveProperty("stopover");
    });
});
