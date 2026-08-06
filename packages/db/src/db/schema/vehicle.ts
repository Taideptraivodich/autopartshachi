import {
  bigint,
  boolean,
  check,
  index,
  pgTable,
  smallint,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { timestamps } from "./_shared";

/**
 * Vehicle domain — 02B §2.1
 * VehicleBrand (1) -> VehicleModel (n) -> VehicleGeneration (n)
 */

export const vehicleBrand = pgTable(
  "vehicle_brand",
  {
    id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    countryOfOrigin: text("country_of_origin"),
    logoUrl: text("logo_url"),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps(),
  },
  (table) => [uniqueIndex("idx_vehicle_brand_slug").on(table.slug)],
);

export const vehicleModel = pgTable(
  "vehicle_model",
  {
    id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    vehicleBrandId: bigint("vehicle_brand_id", { mode: "number" })
      .notNull()
      .references(() => vehicleBrand.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    segment: text("segment"),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps(),
  },
  (table) => [
    // UNIQUE(vehicle_brand_id, slug) — 02B §3: model names can repeat across brands
    uniqueIndex("idx_vehicle_model_brand_slug").on(table.vehicleBrandId, table.slug),
    index("idx_vehicle_model_brand_id").on(table.vehicleBrandId),
  ],
);

export const vehicleGeneration = pgTable(
  "vehicle_generation",
  {
    id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    vehicleModelId: bigint("vehicle_model_id", { mode: "number" })
      .notNull()
      .references(() => vehicleModel.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    yearStart: smallint("year_start").notNull(),
    yearEnd: smallint("year_end"), // NULL = đang sản xuất (02A)
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("idx_vehicle_generation_unique_range").on(
      table.vehicleModelId,
      table.yearStart,
      table.yearEnd,
    ),
    index("idx_vehicle_generation_model_id").on(table.vehicleModelId),
    check(
      "chk_vehicle_generation_year",
      sql`${table.yearEnd} IS NULL OR ${table.yearEnd} >= ${table.yearStart}`,
    ),
  ],
);
