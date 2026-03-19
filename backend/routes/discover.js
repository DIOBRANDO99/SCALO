import { Router } from "express";
import { discoverStopovers } from "../services/flights.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { origin, destination, outboundDate, returnDate, stopoverNights } = req.body;

    const missing = [];
    if (!origin) missing.push("origin");
    if (!destination) missing.push("destination");
    if (!outboundDate) missing.push("outboundDate");

    if (missing.length > 0) {
      return res.status(400).json({
        error: "Missing required fields",
        missing,
        example: {
          origin: "MXP",
          destination: "BKK",
          outboundDate: "2026-06-10",
          returnDate: "2026-06-20",
          stopoverNights: 3,
        },
      });
    }

    const iataRegex = /^[A-Z]{3}$/i;
    for (const [field, value] of [["origin", origin], ["destination", destination]]) {
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

    if (o === d) return res.status(400).json({ error: "origin and destination must be different" });
    if (returnDate && returnDate <= outboundDate) return res.status(400).json({ error: "returnDate must be after outboundDate" });

    const results = await discoverStopovers({
      origin: o,
      destination: d,
      outboundDate,
      returnDate: returnDate || null,
      stopoverNights: nights,
    });

    res.json(results);
  } catch (err) {
    console.error("POST /api/discover error:", err);

    if (err.message?.includes("quota") || err.message?.includes("rate")) {
      return res.status(429).json({ error: "API quota exceeded. Please try again later." });
    }

    res.status(500).json({ error: "Flight discovery failed. Please try again." });
  }
});

export default router;
