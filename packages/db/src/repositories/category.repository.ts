import { eq, isNull } from "drizzle-orm";
import { type Database } from "../db/index.js";
import { productCategory } from "../db/schema/product.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Category = typeof productCategory.$inferSelect;

// ---------------------------------------------------------------------------
// CategoryRepository
// ---------------------------------------------------------------------------

export class CategoryRepository {
  constructor(private readonly db: Database) {}

  /**
   * Return every category row, ordered by display_order then name.
   * Callers that need a tree can group by parentCategoryId in-memory.
   */
  async findAll(): Promise<Category[]> {
    return this.db
      .select()
      .from(productCategory)
      .orderBy(productCategory.displayOrder, productCategory.name);
  }

  /** Return only top-level (root) categories — parentCategoryId IS NULL. */
  async findRoots(): Promise<Category[]> {
    return this.db
      .select()
      .from(productCategory)
      .where(isNull(productCategory.parentCategoryId))
      .orderBy(productCategory.displayOrder, productCategory.name);
  }

  /** Return direct children of a given parent category. */
  async findChildren(parentCategoryId: number): Promise<Category[]> {
    return this.db
      .select()
      .from(productCategory)
      .where(eq(productCategory.parentCategoryId, parentCategoryId))
      .orderBy(productCategory.displayOrder, productCategory.name);
  }

  /** Find a category by primary key. Returns undefined when not found. */
  async findById(id: number): Promise<Category | undefined> {
    const rows = await this.db
      .select()
      .from(productCategory)
      .where(eq(productCategory.id, id))
      .limit(1);

    return rows[0];
  }

  /** Find a category by its URL-safe slug. Returns undefined when not found. */
  async findBySlug(slug: string): Promise<Category | undefined> {
    const rows = await this.db
      .select()
      .from(productCategory)
      .where(eq(productCategory.slug, slug))
      .limit(1);

    return rows[0];
  }
}
