import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { config } from "dotenv";

// Load .env from packages/db/ regardless of where the process is invoked from
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "../../../.env");
config({ path: envPath });

import { db, closeDb } from "../index";
import { vehicleBrand, vehicleModel, vehicleGeneration } from "../schema/vehicle";
import { productBrand, productCategory } from "../schema/product";
import { oemNumber } from "../schema/oem";
import { seedProducts } from "./product.seed";

/**
 * Development-only seed data.
 * Idempotent: safe to re-run (onConflictDoNothing on unique slugs/codes).
 */
async function main() {
  console.log("Seeding vehicle_brand...");
  await db
    .insert(vehicleBrand)
    .values([
      { name: "Toyota", slug: "toyota", countryOfOrigin: "Nhật Bản", isActive: true },
      { name: "Honda", slug: "honda", countryOfOrigin: "Nhật Bản", isActive: true },
      { name: "Ford", slug: "ford", countryOfOrigin: "Hoa Kỳ", isActive: true },
      { name: "Hyundai", slug: "hyundai", countryOfOrigin: "Hàn Quốc", isActive: true },
      { name: "Kia", slug: "kia", countryOfOrigin: "Hàn Quốc", isActive: true },
    ])
    .onConflictDoNothing();

  const brands = await db.query.vehicleBrand.findMany();
  const brandBySlug = new Map(brands.map((b) => [b.slug, b]));
  const toyota = brandBySlug.get("toyota")!;
  const honda = brandBySlug.get("honda")!;

  console.log("Seeding vehicle_model...");
  await db
    .insert(vehicleModel)
    .values([
      { vehicleBrandId: toyota.id, name: "Vios", slug: "vios", segment: "Sedan hạng B", isActive: true },
      { vehicleBrandId: toyota.id, name: "Innova", slug: "innova", segment: "MPV", isActive: true },
      { vehicleBrandId: toyota.id, name: "Camry", slug: "camry", segment: "Sedan hạng D", isActive: true },
      { vehicleBrandId: honda.id, name: "Civic", slug: "civic", segment: "Sedan hạng C", isActive: true },
      { vehicleBrandId: honda.id, name: "City", slug: "city", segment: "Sedan hạng B", isActive: true },
    ])
    .onConflictDoNothing();

  const models = await db.query.vehicleModel.findMany();
  const modelBySlug = new Map(models.map((m) => [m.slug, m]));
  const vios = modelBySlug.get("vios")!;
  const civic = modelBySlug.get("civic")!;

  console.log("Seeding vehicle_generation...");
  await db
    .insert(vehicleGeneration)
    .values([
      { vehicleModelId: vios.id, name: "Thế hệ 2", yearStart: 2014, yearEnd: 2018, isActive: true },
      { vehicleModelId: vios.id, name: "Thế hệ 3", yearStart: 2019, yearEnd: 2022, isActive: true },
      { vehicleModelId: civic.id, name: "Thế hệ 10", yearStart: 2016, yearEnd: 2021, isActive: true },
    ])
    .onConflictDoNothing();

  console.log("Seeding product_brand...");
  await db
    .insert(productBrand)
    .values([
      { name: "Toyota Genuine Parts", slug: "toyota-genuine-parts", isActive: true },
      { name: "Honda Genuine Parts", slug: "honda-genuine-parts", isActive: true },
      { name: "Bosch", slug: "bosch", isActive: true },
      { name: "Denso", slug: "denso", isActive: true },
      { name: "Aisin", slug: "aisin", isActive: true },
      { name: "NGK", slug: "ngk", isActive: true },
    ])
    .onConflictDoNothing();

  console.log("Seeding product_category...");
  await db
    .insert(productCategory)
    .values([
      { name: "Hệ thống phanh", slug: "he-thong-phanh", displayOrder: 1 },
      { name: "Hệ thống lọc", slug: "he-thong-loc", displayOrder: 2 },
    ])
    .onConflictDoNothing();

  const topCategories = await db.query.productCategory.findMany();
  const categoryBySlug = new Map(topCategories.map((c) => [c.slug, c]));
  const brakeSystem = categoryBySlug.get("he-thong-phanh")!;
  const filterSystem = categoryBySlug.get("he-thong-loc")!;

  await db
    .insert(productCategory)
    .values([
      { parentCategoryId: brakeSystem.id, name: "Má phanh", slug: "ma-phanh", displayOrder: 1 },
      { parentCategoryId: brakeSystem.id, name: "Đĩa phanh", slug: "dia-phanh", displayOrder: 2 },
      { parentCategoryId: brakeSystem.id, name: "Dầu phanh", slug: "dau-phanh", displayOrder: 3 },
      { parentCategoryId: filterSystem.id, name: "Lọc dầu", slug: "loc-dau", displayOrder: 1 },
      { parentCategoryId: filterSystem.id, name: "Lọc gió", slug: "loc-gio", displayOrder: 2 },
    ])
    .onConflictDoNothing();

  console.log("Seeding oem_number...");
  await db
    .insert(oemNumber)
    .values([
      {
        oemNumber: "04465-BZ160",
        normalizedCode: "04465BZ160",
        issuingVehicleBrandId: toyota.id,
        status: "hieu_luc",
      },
      {
        oemNumber: "45022-S5A-J01",
        normalizedCode: "45022S5AJ01",
        issuingVehicleBrandId: honda.id,
        status: "hieu_luc",
      },
    ])
    .onConflictDoNothing();

  // ── Product seed (Agent 04C) ──────────────────────────────────────────────
  await seedProducts(db);

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
