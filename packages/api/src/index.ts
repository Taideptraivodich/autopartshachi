import express from "express";
import cors from "cors";
import productRoutes from "./routes/product.routes.js";

const app = express();
const PORT = process.env.API_PORT ?? 3001;

app.use(cors({ origin: ["http://localhost:3000", "http://localhost:5173"] }));
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "autoparts-api", version: "03" });
});

// Product catalog routes
app.use("/api", productRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Route không tồn tại" });
});

app.listen(PORT, () => {
  console.log(`[autoparts-api] Server chạy tại http://localhost:${PORT}`);
  console.log(`[autoparts-api] Health: http://localhost:${PORT}/api/health`);
});
