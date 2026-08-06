import { bigint, check, index, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createdAtOnly } from "./_shared";
import { product } from "./product";
import { vehicleGeneration } from "./vehicle";

/**
 * Compatibility — 02B §2.4
 * Business bridge entity (has its own attributes) linking Product to
 * VehicleGeneration. Always attached at the Generation level, never
 * Model/Brand (02A rule). No free-text vehicle description is stored —
 * every display query joins vehicle_generation -> vehicle_model -> vehicle_brand.
 */
export const compatibility = pgTable(
  "compatibility",
  {
    id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    productId: bigint("product_id", { mode: "number" })
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    vehicleGenerationId: bigint("vehicle_generation_id", { mode: "number" })
      .notNull()
      .references(() => vehicleGeneration.id, { onDelete: "cascade" }),
    installationPosition: text("installation_position").notNull().default("chung"),
    applicationCondition: text("application_condition"),
    notes: text("notes"),
    ...createdAtOnly(),
  },
  (table) => [
    uniqueIndex("idx_compatibility_unique").on(
      table.productId,
      table.vehicleGenerationId,
      table.installationPosition,
    ),
    index("idx_compatibility_product_id").on(table.productId),
    index("idx_compatibility_vehicle_generation_id").on(table.vehicleGenerationId),
    check(
      "chk_compatibility_position",
      sql`${table.installationPosition} IN ('chung', 'truoc', 'sau', 'truoc_trai', 'truoc_phai', 'sau_trai', 'sau_phai')`,
    ),
  ],
);
