import { Router } from "express";
import { getActivities } from "../services/activities.js";

const router = Router();

router.get("/", async (req, res) => {
    try {
        const { city, kinds, limit } = req.query;

        if (!city) {
            return res.status(400).json({
                error: "Missing required query param: city",
                example: "/api/activities?city=Rome",
            });
        }

        const pois = await getActivities({
            city,
            kinds: kinds ?? "interesting_places",
            limit: limit ? parseInt(limit, 10) : 50,
        });

        res.json(pois);
    } catch (err) {
        console.error("GET /api/activities error:", err);
        res.status(500).json({ error: "Failed to fetch activities. Please try again." });
    }
});

export default router;
