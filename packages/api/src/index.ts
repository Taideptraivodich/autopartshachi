/**
 * API Entry point — autoparts-api
 * Wire: db → repositories → services → controllers → routes → app
 */

// env.ts PHẢI là import đầu tiên — load .env trước mọi module khác
import "./env.js";

import express from "express";
import cors from "cors";
import { join } from "node:path";

import { db } from "autoparts-db";
import {
  ProductRepository,
  CategoryRepository,
  BrandRepository,
  VehicleRepository,
  SearchRepository,
  OemRepository,
  AdminRepository,
  LeadRepository,
  SiteSettingsRepository,
} from "autoparts-db/repositories";

import { AuthService } from "./services/auth.service.js";
import { ProductService } from "./services/product.service.js";
import { CategoryService } from "./services/category.service.js";
import { BrandService } from "./services/brand.service.js";
import { VehicleService } from "./services/vehicle.service.js";
import { SearchService } from "./services/search.service.js";
import { OemService } from "./services/oem.service.js";
import { AdminProductService } from "./services/admin-product.service.js";
import { LeadService } from "./services/lead.service.js";
import { SiteSettingsService } from "./services/settings.service.js";

import { AuthController } from "./controllers/auth.controller.js";
import { ProductController } from "./controllers/product.controller.js";
import { CategoryController } from "./controllers/category.controller.js";
import { BrandController } from "./controllers/brand.controller.js";
import { VehicleController } from "./controllers/vehicle.controller.js";
import { SearchController } from "./controllers/search.controller.js";
import { OemController } from "./controllers/oem.controller.js";
import { AdminProductController } from "./controllers/admin-product.controller.js";
import { LeadController } from "./controllers/lead.controller.js";
import { AdminSettingsController } from "./controllers/admin-settings.controller.js";

import { createAdminRouter } from "./routes/admin.routes.js";
import { createProductRouter } from "./routes/product.routes.js";
import { createCategoryRouter } from "./routes/category.routes.js";
import { createBrandRouter } from "./routes/brand.routes.js";
import { createVehicleRouter } from "./routes/vehicle.routes.js";
import { createSearchRouter } from "./routes/search.routes.js";
import { createOemRouter } from "./routes/oem.routes.js";
import { createAdminProductRouter } from "./routes/admin-product.routes.js";
import { createLeadRouter } from "./routes/lead.routes.js";
import { createSettingsRouter, createAdminSettingsRouter } from "./routes/admin-settings.routes.js";
import { createAdminBrandRouter } from "./routes/admin-brand.routes.js";
import { createAdminCategoryRouter } from "./routes/admin-category.routes.js";
import { createAdminVehicleRouter } from "./routes/admin-vehicle.routes.js";
import { createAdminLeadRouter } from "./routes/admin-lead.routes.js";
import { createAdminUploadRouter } from "./routes/admin-upload.routes.js";

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
const leadRepo = new LeadRepository(db);
const settingsRepo = new SiteSettingsRepository(db);

// Services
const authService = new AuthService(adminRepo);
const productService = new ProductService(productRepo, categoryRepo);
const categoryService = new CategoryService(categoryRepo);
const brandService = new BrandService(brandRepo, productRepo);
const vehicleService = new VehicleService(vehicleRepo);
const searchService = new SearchService(searchRepo);
const oemService = new OemService(oemRepo);
const adminProductService = new AdminProductService(productRepo, oemRepo, vehicleRepo);
const settingsService = new SiteSettingsService(settingsRepo);
const leadService = new LeadService(
  leadRepo,
  process.env.TELEGRAM_BOT_TOKEN,
  process.env.TELEGRAM_CHAT_ID,
);

// Controllers
const authController = new AuthController(authService);
const productController = new ProductController(productService);
const categoryController = new CategoryController(categoryService);
const brandController = new BrandController(brandService);
const vehicleController = new VehicleController(vehicleRepo);
const searchController = new SearchController(searchService);
const oemController = new OemController(oemService);
const adminProductController = new AdminProductController(adminProductService, productService);
const leadController = new LeadController(leadService);
const adminSettingsController = new AdminSettingsController(settingsService);

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------

const app = express();
const PORT = process.env.API_PORT ?? 3001;
const SITE_URL = "https://phutunghachi.com";

app.use(cors({ origin: ["http://localhost:3000", "http://localhost:5173"] }));
app.use(express.json({ limit: "10mb" })); // tăng limit cho base64 ảnh

// Serve uploaded images publicly
app.use("/uploads", express.static(join(process.cwd(), "public", "uploads")));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "autoparts-api", version: "06" });
});

function xmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function sitemapUrl(path: string, lastmod?: Date | null): string {
  const lastmodTag = lastmod ? `<lastmod>${lastmod.toISOString()}</lastmod>` : "";
  return `<url><loc>${xmlEscape(`${SITE_URL}${path}`)}</loc>${lastmodTag}</url>`;
}

// Dynamic sitemap: keeps product/category/brand/vehicle URLs in sync with the DB.
app.get("/sitemap.xml", async (_req, res) => {
  try {
    const urls: string[] = [
      sitemapUrl("/"),
      sitemapUrl("/san-pham"),
      sitemapUrl("/hang-xe"),
      sitemapUrl("/danh-muc"),
      sitemapUrl("/thuong-hieu"),
      sitemapUrl("/blog"),
      sitemapUrl("/lien-he"),
    ];

    const [categories, brands, vehicleBrands] = await Promise.all([
      categoryRepo.findAll(),
      brandRepo.findAll(),
      vehicleRepo.findBrands(),
    ]);

    for (const category of categories) {
      if (category.isActive) {
        urls.push(sitemapUrl(`/danh-muc/${category.slug}`, category.updatedAt));
      }
    }

    for (const brand of brands) {
      urls.push(sitemapUrl(`/thuong-hieu/${brand.slug}`, brand.updatedAt));
    }

    for (const vehicleBrand of vehicleBrands) {
      urls.push(sitemapUrl(`/hang-xe/${vehicleBrand.slug}`, vehicleBrand.updatedAt));
      const models = await vehicleRepo.findModels(vehicleBrand.id);
      for (const model of models) {
        urls.push(sitemapUrl(`/hang-xe/${vehicleBrand.slug}/${model.slug}`, model.updatedAt));
      }
    }

    const pageSize = 100;
    let page = 1;
    while (true) {
      const result = await productRepo.findMany({
        page,
        pageSize,
        onlyVisible: true,
        sortBy: "createdAt",
        sortDir: "asc",
      });

      for (const product of result.data) {
        urls.push(sitemapUrl(`/san-pham/${product.slug}`, product.updatedAt ?? product.createdAt));
      }

      if (page >= result.totalPages || result.data.length === 0) break;
      page += 1;
    }

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls,
      "</urlset>",
    ].join("\n");

    res.type("application/xml").set("Cache-Control", "public, max-age=300").send(xml);
  } catch (error) {
    logger.error("Failed to generate sitemap", error);
    res.status(500).type("text/plain").send("Sitemap generation failed");
  }
});

// Routes — admin (login public, rest protected by requireAdmin middleware)
app.use("/api", createAdminRouter(authController));
app.use("/api/admin/san-pham", requireAdmin, createAdminProductRouter(adminProductController));
app.use("/api/admin/thuong-hieu", requireAdmin, createAdminBrandRouter(brandService));
app.use("/api/admin/danh-muc", requireAdmin, createAdminCategoryRouter(categoryService));
app.use("/api/admin/hang-xe", requireAdmin, createAdminVehicleRouter(vehicleService));
app.use("/api/admin/settings", requireAdmin, createAdminSettingsRouter(adminSettingsController));
app.use("/api/admin/lead", requireAdmin, createAdminLeadRouter(leadService));
app.use("/api/admin/upload", requireAdmin, createAdminUploadRouter());

// Routes — public catalog
app.use("/api", createSettingsRouter(adminSettingsController));
app.use("/api", createProductRouter(productController));
app.use("/api", createCategoryRouter(categoryController));
app.use("/api", createBrandRouter(brandController));
app.use("/api", createVehicleRouter(vehicleController));
app.use("/api", createSearchRouter(searchController));
app.use("/api", createOemRouter(oemController));

// Routes — lead (public — không cần auth)
app.use("/api", createLeadRouter(leadController));

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

app.listen(PORT, "0.0.0.0", () => {
  logger.info(`Server chạy tại http://localhost:${PORT}`);
  logger.info(`Health: http://localhost:${PORT}/api/health`);
});
