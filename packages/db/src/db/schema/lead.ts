import { bigint, boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const lead = pgTable("lead", {
  id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  message: text("message"),
  // Sản phẩm quan tâm (optional — từ ContactQuickForm)
  productName: text("product_name"),
  productSku: text("product_sku"),
  // Metadata
  source: text("source").notNull().default("website"), // "website" | "oem_page" | "search_page" | "product_page"
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});
