import { eq } from "drizzle-orm";
import { type Database } from "../db/index.js";
import { productBrand } from "../db/schema/product.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Brand = typeof productBrand.$inferSelect;

export interface BrandInput {
  name: string;
  slug: string;
  isActive?: boolean;
}

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

  /** Return all brands (active and inactive) — used by admin list. */
  async findAllAdmin(): Promise<Brand[]> {
    return this.db.select().from(productBrand).orderBy(productBrand.name);
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

  async create(input: BrandInput): Promise<Brand> {
    const rows = await this.db
      .insert(productBrand)
      .values({ name: input.name, slug: input.slug, isActive: input.isActive ?? true })
      .returning();
    return rows[0]!;
  }

  async update(id: number, input: Partial<BrandInput>): Promise<Brand | undefined> {
    const rows = await this.db
      .update(productBrand)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(productBrand.id, id))
      .returning();
    return rows[0];
  }

  async remove(id: number): Promise<boolean> {
    const rows = await this.db
      .delete(productBrand)
      .where(eq(productBrand.id, id))
      .returning({ id: productBrand.id });
    return rows.length > 0;
  }
}
