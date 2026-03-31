import "dotenv/config";
import hubsRouter from "./routes/hubsRoute.js";
import express from "express";
import cors from "cors";
import searchRouter from "./routes/search.js";
import discoverRouter from "./routes/discover.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use("/api/hubs", hubsRouter);

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    provider: process.env.FLIGHT_PROVIDER || "serpapi",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/search", searchRouter);
app.use("/api/discover", discoverRouter);

// --- Global error handler ---
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`SCALO backend listening on http://localhost:${PORT}`);
  console.log(`Flight provider: ${process.env.FLIGHT_PROVIDER || "serpapi"}`);
});
