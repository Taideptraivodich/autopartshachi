import { bigint, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const searchAnalytics = pgTable("search_analytics", {
  id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
  keyword: text("keyword").notNull(),
  count: integer("count").notNull().default(1),
  lastSearchedAt: timestamp("last_searched_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});
