import { Router } from "express";
import { getActivities } from "../services/activities.js";

const router = Router();

router.get("/", async (req, res) => {
    try {
        const { lat, lon, kinds, limit } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({
                error: "Missing required query params: lat and lon",
                example: "/api/activities?lat=41.01&lon=28.98",
            });
        }

        const latNum = parseFloat(lat);
        const lonNum = parseFloat(lon);

        if (isNaN(latNum) || isNaN(lonNum)) {
            return res.status(400).json({ error: "lat and lon must be valid numbers" });
        }

        const pois = await getActivities({
            lat: latNum,
            lon: lonNum,
            kinds: kinds ?? "interesting_places",
            limit: limit ? parseInt(limit, 10) : 20,
        });

        res.json(pois);
    } catch (err) {
        console.error("GET /api/activities error:", err);
        res.status(500).json({ error: "Failed to fetch activities. Please try again." });
    }
});

export default router;
