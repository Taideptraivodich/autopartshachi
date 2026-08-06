import {
  type AnyPgColumn,
  bigint,
  boolean,
  check,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createdAtOnly, timestamps } from "./_shared";

/**
 * Product domain — 02B §2.2
 * ProductBrand (1) -> Product (n) -> ProductImage (n)
 * Product (n) <-> ProductCategory (n) via product_category_map (pure bridge
 * table, no business attributes — see 02B "Ghi chú thiết kế")
 * ProductCategory self-references for parent/child category tree.
 */

export const productBrand = pgTable(
  "product_brand",
  {
    id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps(),
  },
  (table) => [uniqueIndex("idx_product_brand_slug").on(table.slug)],
);

export const productCategory = pgTable(
  "product_category",
  {
    id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    parentCategoryId: bigint("parent_category_id", { mode: "number" }).references(
      (): AnyPgColumn => productCategory.id,
      { onDelete: "restrict" },
    ),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    displayOrder: integer("display_order").notNull().default(0),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("idx_product_category_slug").on(table.slug),
    index("idx_product_category_parent_id").on(table.parentCategoryId),
    check(
      "chk_product_category_not_self_parent",
      sql`${table.parentCategoryId} IS DISTINCT FROM ${table.id}`,
    ),
  ],
);

export const product = pgTable(
  "product",
  {
    id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    productBrandId: bigint("product_brand_id", { mode: "number" })
      .notNull()
      .references(() => productBrand.id, { onDelete: "restrict" }),
    sku: text("sku").notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    specification: text("specification"),
    status: text("status").notNull().default("con_hang"),
    // --- SEO Preparation fields (02B.2 mission brief, not in 02B data
    // dictionary) — additive columns only, no new business entity/relation.
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("idx_product_sku").on(table.sku),
    uniqueIndex("idx_product_slug").on(table.slug),
    index("idx_product_brand_id").on(table.productBrandId),
    index("idx_product_status").on(table.status),
    check(
      "chk_product_status",
      sql`${table.status} IN ('con_hang', 'het_hang', 'ngung_kinh_doanh')`,
    ),
  ],
);

export const productImage = pgTable(
  "product_image",
  {
    id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    productId: bigint("product_id", { mode: "number" })
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    displayOrder: integer("display_order").notNull().default(0),
    isThumbnail: boolean("is_thumbnail").notNull().default(false),
    // SEO Preparation field (02B.2 mission brief)
    altText: text("alt_text"),
    ...createdAtOnly(),
  },
  (table) => [index("idx_product_image_product_id").on(table.productId)],
);

/**
 * product_category_map — pure technical bridge table.
 * NOT a business entity: no attributes beyond the FK pair. Realizes the
 * Product n<->n ProductCategory relation confirmed in 02A but missing a
 * dedicated bridge entity (see 02B "Ghi chú thiết kế").
 */
export const productCategoryMap = pgTable(
  "product_category_map",
  {
    productId: bigint("product_id", { mode: "number" })
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    categoryId: bigint("category_id", { mode: "number" })
      .notNull()
      .references(() => productCategory.id, { onDelete: "cascade" }),
    ...createdAtOnly(),
  },
  (table) => [
    primaryKey({ columns: [table.productId, table.categoryId] }),
    // product_id is already covered by the PK (leading column);
    // category_id needs its own index for the reverse lookup direction.
    index("idx_product_category_map_category_id").on(table.categoryId),
  ],
);
