import { timestamp } from "drizzle-orm/pg-core";

/**
 * Standard created_at / updated_at pair used by every table in the
 * Architecture doc that declares them (see 02B §2 table definitions).
 *
 * NOTE: updated_at is set at insert time with a DB default; bumping it on
 * UPDATE is an application/trigger concern, intentionally out of scope for
 * this Agent (no business logic here).
 */
export function timestamps() {
  return {
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  };
}

/** created_at only — used by pure bridge / append-only tables per 02B. */
export function createdAtOnly() {
  return {
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  };
}
