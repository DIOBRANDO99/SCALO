import { Router } from "express";
import { getHubsWithDetails } from "../services/hubs.js";

const router = Router();

router.get("/", (req, res) => {
    const { origin, destination } = req.query;

    // Validation
    if (!origin || !destination) {
        return res.status(400).json({
            error: "Missing required query params: origin and destination",
            example: "/api/hubs?origin=MXP&destination=BKK",
        });
    }

    const iataRegex = /^[A-Z]{3}$/i;
    if (!iataRegex.test(origin)) {
        return res.status(400).json({ error: `Invalid IATA code for origin: "${origin}". Must be 3 letters.` });
    }
    if (!iataRegex.test(destination)) {
        return res.status(400).json({ error: `Invalid IATA code for destination: "${destination}". Must be 3 letters.` });
    }

    const o = origin.toUpperCase();
    const d = destination.toUpperCase();

    if (o === d) {
        return res.status(400).json({ error: "origin and destination must be different" });
    }

    const result = getHubsWithDetails(o, d);

    if (!result) {
        return res.status(404).json({ error: `Could not find coordinates for ${o} or ${d} in airport database` });
    }

    res.json(result);
});

export default router;
