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
  BrandRepository,
  VehicleRepository,
} from "autoparts-db/repositories";

import { ProductService } from "./services/product.service.js";
import { CategoryService } from "./services/category.service.js";
import { BrandService } from "./services/brand.service.js";
import { VehicleService } from "./services/vehicle.service.js";
import { ProductController } from "./controllers/product.controller.js";
import { CategoryController } from "./controllers/category.controller.js";
import { BrandController } from "./controllers/brand.controller.js";
import { VehicleController } from "./controllers/vehicle.controller.js";
import { createProductRouter } from "./routes/product.routes.js";
import { createCategoryRouter } from "./routes/category.routes.js";
import { createBrandRouter } from "./routes/brand.routes.js";
import { createVehicleRouter } from "./routes/vehicle.routes.js";
import { logger } from "./lib/logger.js";

// ---------------------------------------------------------------------------
// Khởi tạo dependency tree
// ---------------------------------------------------------------------------

// Repositories
const productRepo = new ProductRepository(db);
const categoryRepo = new CategoryRepository(db);
const brandRepo = new BrandRepository(db);
const vehicleRepo = new VehicleRepository(db);

// Services
const productService = new ProductService(productRepo, categoryRepo);
const categoryService = new CategoryService(categoryRepo);
const brandService = new BrandService(brandRepo, productRepo);
const vehicleService = new VehicleService(vehicleRepo);

// Controllers
const productController = new ProductController(productService);
const categoryController = new CategoryController(categoryService);
const brandController = new BrandController(brandService);
const vehicleController = new VehicleController(vehicleService);

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
app.use("/api", createBrandRouter(brandController));
app.use("/api", createVehicleRouter(vehicleController));

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
