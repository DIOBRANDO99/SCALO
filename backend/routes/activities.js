import { Router } from "express";
import { getActivities } from "../services/activities.js";

const router = Router();

// GET /api/activities?city=Istanbul
// GET /api/activities?city=Istanbul&district=Istanbul%2FSultanahmet
router.get("/", async (req, res) => {
    try {
        const { city, district } = req.query;

        if (!city || !city.trim()) {
            return res.status(400).json({
                error: "Missing required query param: city",
                example: "/api/activities?city=Istanbul",
            });
        }

        const data = await getActivities({
            city: city.trim(),
            district: district?.trim() || null,
        });
        res.json(data);
    } catch (err) {
        console.error("GET /api/activities error:", err);
        res.status(500).json({ error: err.message || "Failed to fetch activities." });
    }
});

export default router;
