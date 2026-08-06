import { eq } from "drizzle-orm";
import { type Database } from "../db/index.js";
import { productBrand } from "../db/schema/product.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Brand = typeof productBrand.$inferSelect;

// ---------------------------------------------------------------------------
// BrandRepository
// ---------------------------------------------------------------------------

export class BrandRepository {
  constructor(private readonly db: Database) {}

  /** Return all active brands, ordered by name. */
  async findAll(): Promise<Brand[]> {
    return this.db
      .select()
      .from(productBrand)
      .where(eq(productBrand.isActive, true))
      .orderBy(productBrand.name);
  }

  /** Find a brand by primary key. Returns undefined when not found. */
  async findById(id: number): Promise<Brand | undefined> {
    const rows = await this.db
      .select()
      .from(productBrand)
      .where(eq(productBrand.id, id))
      .limit(1);

    return rows[0];
  }

  /** Find a brand by its URL-safe slug. Returns undefined when not found. */
  async findBySlug(slug: string): Promise<Brand | undefined> {
    const rows = await this.db
      .select()
      .from(productBrand)
      .where(eq(productBrand.slug, slug))
      .limit(1);

    return rows[0];
  }
}
