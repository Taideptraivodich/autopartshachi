import { bigint, check, index, integer, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createdAtOnly } from "./_shared";
import { product } from "./product";
import { vehicleModel } from "./vehicle";

export const compatibility = pgTable(
  "compatibility",
  {
    id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    productId: bigint("product_id", { mode: "number" })
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    vehicleModelId: bigint("vehicle_model_id", { mode: "number" })
      .notNull()
      .references(() => vehicleModel.id, { onDelete: "cascade" }),
    yearStart: integer("year_start").notNull(),
    yearEnd: integer("year_end"),
    installationPosition: text("installation_position").notNull().default("chung"),
    notes: text("notes"),
    ...createdAtOnly(),
  },
  (table) => [
    uniqueIndex("idx_compatibility_unique").on(
      table.productId,
      table.vehicleModelId,
      table.yearStart,
      table.installationPosition,
    ),
    index("idx_compatibility_product_id").on(table.productId),
    index("idx_compatibility_vehicle_model_id").on(table.vehicleModelId),
    check(
      "chk_compatibility_position",
      sql`${table.installationPosition} IN ('chung', 'truoc', 'sau', 'truoc_trai', 'truoc_phai', 'sau_trai', 'sau_phai')`,
    ),
  ],
);
