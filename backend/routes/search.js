import { Router } from "express";
import { searchWithStopover } from "../services/flights.js";

const router = Router();

router.post("/", async (req, res) => {
    try {
        const { origin, destination, stopover, outboundDate, returnDate, stopoverNights } = req.body;

        const missing = [];
        if (!origin) missing.push("origin");
        if (!destination) missing.push("destination");
        if (!stopover) missing.push("stopover");
        if (!outboundDate) missing.push("outboundDate");

        if (missing.length > 0) {
            return res.status(400).json({
                error: "Missing required fields",
                missing,
                example: {
                    origin: "MXP",
                    destination: "BKK",
                    stopover: "IST",
                    outboundDate: "2026-06-10",
                    returnDate: "2026-06-20",
                    stopoverNights: 3,
                },
            });
        }

        const iataRegex = /^[A-Z]{3}$/i;
        for (const [field, value] of [["origin", origin], ["destination", destination], ["stopover", stopover]]) {
            if (!iataRegex.test(value)) {
                return res.status(400).json({ error: `Invalid IATA code for ${field}: "${value}". Must be 3 letters.` });
            }
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(outboundDate)) {
            return res.status(400).json({ error: "outboundDate must be YYYY-MM-DD" });
        }
        if (returnDate && !dateRegex.test(returnDate)) {
            return res.status(400).json({ error: "returnDate must be YYYY-MM-DD" });
        }

        const nights = stopoverNights ?? 3;
        if (typeof nights !== "number" || nights < 1 || nights > 14) {
            return res.status(400).json({ error: "stopoverNights must be between 1 and 14" });
        }

        const o = origin.toUpperCase();
        const d = destination.toUpperCase();
        const s = stopover.toUpperCase();

        if (o === d) return res.status(400).json({ error: "origin and destination must be different" });
        if (o === s || d === s) return res.status(400).json({ error: "stopover must be different from origin and destination" });
        if (returnDate && returnDate <= outboundDate) return res.status(400).json({ error: "returnDate must be after outboundDate" });

        // --- Execute search ---
        const result = await searchWithStopover({
            origin: o,
            destination: d,
            stopover: s,
            outboundDate,
            returnDate: returnDate || null,
            stopoverNights: nights,
        });

        res.json(result);
    } catch (err) {
        console.error("POST /api/search error:", err);

        if (err.message?.includes("quota") || err.message?.includes("rate")) {
            return res.status(429).json({ error: "API quota exceeded. Please try again later." });
        }

        res.status(500).json({ error: "Flight search failed. Please try again." });
    }
});

export default router;
