import { bigint, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { timestamps } from "./_shared";

export const adminUser = pgTable(
  "admin_user",
  {
    id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    ...timestamps(),
  },
  (table) => [uniqueIndex("idx_admin_user_email").on(table.email)],
);
