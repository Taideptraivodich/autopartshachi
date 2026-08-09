/**
 * API Entry point — autoparts-api
 * Wire: db → repositories → services → controllers → routes → app
 */

// env.ts PHẢI là import đầu tiên — load .env trước mọi module khác
import "./env.js";

import express from "express";
import cors from "cors";

import { db } from "autoparts-db";
import {
  ProductRepository,
  CategoryRepository,
  BrandRepository,
  VehicleRepository,
  SearchRepository,
  OemRepository,
  AdminRepository,
} from "autoparts-db/repositories";

import { AuthService } from "./services/auth.service.js";
import { ProductService } from "./services/product.service.js";
import { CategoryService } from "./services/category.service.js";
import { BrandService } from "./services/brand.service.js";
import { VehicleService } from "./services/vehicle.service.js";
import { SearchService } from "./services/search.service.js";
import { OemService } from "./services/oem.service.js";
import { AdminProductService } from "./services/admin-product.service.js";
import { AuthController } from "./controllers/auth.controller.js";
import { ProductController } from "./controllers/product.controller.js";
import { CategoryController } from "./controllers/category.controller.js";
import { BrandController } from "./controllers/brand.controller.js";
import { VehicleController } from "./controllers/vehicle.controller.js";
import { SearchController } from "./controllers/search.controller.js";
import { OemController } from "./controllers/oem.controller.js";
import { AdminProductController } from "./controllers/admin-product.controller.js";
import { createAdminRouter } from "./routes/admin.routes.js";
import { createProductRouter } from "./routes/product.routes.js";
import { createCategoryRouter } from "./routes/category.routes.js";
import { createBrandRouter } from "./routes/brand.routes.js";
import { createVehicleRouter } from "./routes/vehicle.routes.js";
import { createSearchRouter } from "./routes/search.routes.js";
import { createOemRouter } from "./routes/oem.routes.js";
import { createAdminProductRouter } from "./routes/admin-product.routes.js";
import { requireAdmin } from "./middleware/require-admin.js";
import { logger } from "./lib/logger.js";

// ---------------------------------------------------------------------------
// Khởi tạo dependency tree
// ---------------------------------------------------------------------------

// Repositories
const adminRepo = new AdminRepository(db);
const productRepo = new ProductRepository(db);
const categoryRepo = new CategoryRepository(db);
const brandRepo = new BrandRepository(db);
const vehicleRepo = new VehicleRepository(db);
const searchRepo = new SearchRepository(db);
const oemRepo = new OemRepository(db);

// Services
const authService = new AuthService(adminRepo);
const productService = new ProductService(productRepo, categoryRepo);
const categoryService = new CategoryService(categoryRepo);
const brandService = new BrandService(brandRepo, productRepo);
const vehicleService = new VehicleService(vehicleRepo);
const searchService = new SearchService(searchRepo);
const oemService = new OemService(oemRepo);
const adminProductService = new AdminProductService(productRepo, oemRepo, vehicleRepo);

// Controllers
const authController = new AuthController(authService);
const productController = new ProductController(productService);
const categoryController = new CategoryController(categoryService);
const brandController = new BrandController(brandService);
const vehicleController = new VehicleController(vehicleService);
const searchController = new SearchController(searchService);
const oemController = new OemController(oemService);
const adminProductController = new AdminProductController(adminProductService, productService);

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

// Routes — admin (login public, rest protected by requireAdmin middleware)
app.use("/api", createAdminRouter(authController));
app.use("/api/admin/san-pham", requireAdmin, createAdminProductRouter(adminProductController));

// Routes — public catalog
app.use("/api", createProductRouter(productController));
app.use("/api", createCategoryRouter(categoryController));
app.use("/api", createBrandRouter(brandController));
app.use("/api", createVehicleRouter(vehicleController));
app.use("/api", createSearchRouter(searchController));
app.use("/api", createOemRouter(oemController));

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
