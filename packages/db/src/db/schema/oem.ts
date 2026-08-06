import {
  bigint,
  check,
  date,
  index,
  pgTable,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createdAtOnly, timestamps } from "./_shared";
import { vehicleBrand } from "./vehicle";
import { product } from "./product";

/**
 * OEM domain — 02B §2.3
 *
 * Three distinct relations on OemNumber, per 02A §3.3 (do not conflate):
 *  - OemMapping         : Product <-> OemNumber (n-n, has business attrs)
 *  - OemReplacement      : OemNumber self, DIRECTED, old -> new (chainable)
 *  - OemCrossReference   : OemNumber self, SYMMETRIC, canonical order a < b
 */

export const oemNumber = pgTable(
  "oem_number",
  {
    id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    // Original format preserved verbatim, case- and dash-sensitive (02A §6)
    oemNumber: text("oem_number").notNull(),
    issuingVehicleBrandId: bigint("issuing_vehicle_brand_id", {
      mode: "number",
    }).references(() => vehicleBrand.id, { onDelete: "restrict" }),
    status: text("status").notNull().default("hieu_luc"),
    // SEO Preparation field (02B.2 mission brief): stripped/uppercased form
    // of oem_number for lookup-tolerant search, e.g. "04465-BZ160" ->
    // "04465BZ160". Never used to alter or replace the original code.
    normalizedCode: text("normalized_code"),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("idx_oem_number_code").on(table.oemNumber),
    index("idx_oem_number_status").on(table.status),
    index("idx_oem_number_normalized_code").on(table.normalizedCode),
    check(
      "chk_oem_number_status",
      sql`${table.status} IN ('hieu_luc', 'ngung', 'da_bi_thay_the')`,
    ),
  ],
);

export const oemMapping = pgTable(
  "oem_mapping",
  {
    id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    productId: bigint("product_id", { mode: "number" })
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    oemNumberId: bigint("oem_number_id", { mode: "number" })
      .notNull()
      .references(() => oemNumber.id, { onDelete: "cascade" }),
    matchConfidence: text("match_confidence").notNull().default("khop_hoan_toan"),
    notes: text("notes"),
    ...createdAtOnly(),
  },
  (table) => [
    uniqueIndex("idx_oem_mapping_unique_pair").on(table.productId, table.oemNumberId),
    index("idx_oem_mapping_product_id").on(table.productId),
    index("idx_oem_mapping_oem_number_id").on(table.oemNumberId),
    check(
      "chk_oem_mapping_confidence",
      sql`${table.matchConfidence} IN ('khop_hoan_toan', 'khop_tuong_duong')`,
    ),
  ],
);

/** Directed, chainable: old code -> new code (A -> B -> C over time). */
export const oemReplacement = pgTable(
  "oem_replacement",
  {
    id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    oldOemNumberId: bigint("old_oem_number_id", { mode: "number" })
      .notNull()
      .references(() => oemNumber.id, { onDelete: "restrict" }),
    newOemNumberId: bigint("new_oem_number_id", { mode: "number" })
      .notNull()
      .references(() => oemNumber.id, { onDelete: "restrict" }),
    effectiveDate: date("effective_date"),
    ...createdAtOnly(),
  },
  (table) => [
    index("idx_oem_replacement_old_id").on(table.oldOemNumberId),
    index("idx_oem_replacement_new_id").on(table.newOemNumberId),
    check(
      "chk_oem_replacement_not_self",
      sql`${table.oldOemNumberId} <> ${table.newOemNumberId}`,
    ),
  ],
);

/** Symmetric, cross-brand equivalence. Canonical order (a < b) prevents duplicate pairs. */
export const oemCrossReference = pgTable(
  "oem_cross_reference",
  {
    id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    oemNumberIdA: bigint("oem_number_id_a", { mode: "number" })
      .notNull()
      .references(() => oemNumber.id, { onDelete: "cascade" }),
    oemNumberIdB: bigint("oem_number_id_b", { mode: "number" })
      .notNull()
      .references(() => oemNumber.id, { onDelete: "cascade" }),
    notes: text("notes"),
    ...createdAtOnly(),
  },
  (table) => [
    uniqueIndex("idx_oem_cross_reference_unique_pair").on(
      table.oemNumberIdA,
      table.oemNumberIdB,
    ),
    index("idx_oem_cross_reference_a").on(table.oemNumberIdA),
    index("idx_oem_cross_reference_b").on(table.oemNumberIdB),
    check(
      "chk_oem_cross_reference_canonical_order",
      sql`${table.oemNumberIdA} < ${table.oemNumberIdB}`,
    ),
  ],
);
