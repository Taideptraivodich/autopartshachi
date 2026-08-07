/**
 * API Entry point — autoparts-api
 * Wire: db → repositories → services → controllers → routes → app
 */

import express from "express";
import cors from "cors";

import { db } from "autoparts-db";
import {
  ProductRepository,
  CategoryRepository,
} from "autoparts-db/repositories";

import { ProductService } from "./services/product.service.js";
import { CategoryService } from "./services/category.service.js";
import { ProductController } from "./controllers/product.controller.js";
import { CategoryController } from "./controllers/category.controller.js";
import { createProductRouter } from "./routes/product.routes.js";
import { createCategoryRouter } from "./routes/category.routes.js";
import { logger } from "./lib/logger.js";

// ---------------------------------------------------------------------------
// Khởi tạo dependency tree
// ---------------------------------------------------------------------------

// Repositories
const productRepo = new ProductRepository(db);
const categoryRepo = new CategoryRepository(db);

// Services
const productService = new ProductService(productRepo, categoryRepo);
const categoryService = new CategoryService(categoryRepo);

// Controllers
const productController = new ProductController(productService);
const categoryController = new CategoryController(categoryService);

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------

const app = express();
const PORT = process.env.API_PORT ?? 3001;

app.use(cors({ origin: ["http://localhost:3000", "http://localhost:5173"] }));
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "autoparts-api", version: "04B" });
});

// Routes
app.use("/api", createProductRouter(productController));
app.use("/api", createCategoryRouter(categoryController));

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

app.listen(PORT, () => {
  logger.info(`Server chạy tại http://localhost:${PORT}`);
  logger.info(`Health: http://localhost:${PORT}/api/health`);
});
