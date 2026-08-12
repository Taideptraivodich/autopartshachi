import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * site_settings — key/value store cho cấu hình toàn site.
 * Được đọc từ /api/settings (public GET) và sửa từ /api/admin/settings (PATCH).
 * Seed mặc định trong migration 0005.
 */
export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
