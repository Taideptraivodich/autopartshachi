import { and, asc, count, desc, eq, inArray, like, or, SQL } from "drizzle-orm";
import { type Database } from "../db/index.js";
import { product, productBrand, productCategoryMap, productImage } from "../db/schema/product.js";
import { compatibility } from "../db/schema/compatibility.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Product = typeof product.$inferSelect;
export type ProductBrand = typeof productBrand.$inferSelect;
export type ProductImage = typeof productImage.$inferSelect;

/** Product row joined with its brand and thumbnail image. */
export type ProductSummary = Product & {
  brand: ProductBrand | null;
  thumbnail: ProductImage | null;
};

/** Full product detail — includes all images. */
export type ProductDetail = Product & {
  brand: ProductBrand | null;
  images: ProductImage[];
};

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export type ProductSortField = "name" | "createdAt" | "updatedAt";
export type SortDirection = "asc" | "desc";

export interface FindManyParams {
  /** Filter by product brand id. */
  brandId?: number;
  /** Filter by category id (via bridge table). */
  categoryId?: number;
  /** Filter by status. Defaults to all statuses when omitted. */
  status?: "con_hang" | "het_hang" | "ngung_kinh_doanh";
  /** Field to sort by. Defaults to "createdAt". */
  sortBy?: ProductSortField;
  /** Sort direction. Defaults to "desc". */
  sortDir?: SortDirection;
  /** 1-based page number. Defaults to 1. */
  page?: number;
  /** Rows per page. Defaults to 20, max 100. */
  pageSize?: number;
  /** Filter by vehicle generation compatibility. */
  vehicleGenerationId?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Input for creating/updating a product row (admin CRUD — Handover #2). */
export type NewProductInput = {
  productBrandId: number;
  sku: string;
  name: string;
  slug: string;
  description?: string;
  specification?: string;
  status?: "con_hang" | "het_hang" | "ngung_kinh_doanh";
  metaTitle?: string;
  metaDescription?: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;

function buildOrderBy(
  sortBy: ProductSortField = "createdAt",
  sortDir: SortDirection = "desc",
): SQL {
  const dirFn = sortDir === "asc" ? asc : desc;

  switch (sortBy) {
    case "name":
      return dirFn(product.name);
    case "updatedAt":
      return dirFn(product.updatedAt);
    case "createdAt":
    default:
      return dirFn(product.createdAt);
  }
}

// ---------------------------------------------------------------------------
// ProductRepository
// ---------------------------------------------------------------------------

export class ProductRepository {
  constructor(private readonly db: Database) {}

  // ── findMany ─────────────────────────────────────────────────────────────

  /**
   * Paginated product listing with optional filters and sorting.
   * Returns a lightweight ProductSummary (brand + thumbnail) to keep payloads
   * small; full image arrays are fetched only in findById / findBySlug.
   */
  async findMany(params: FindManyParams = {}): Promise<PaginatedResult<ProductSummary>> {
    const {
      brandId,
      categoryId,
      status,
      sortBy = "createdAt",
      sortDir = "desc",
      page = 1,
      pageSize = DEFAULT_PAGE_SIZE,
      vehicleGenerationId,
    } = params;

    const safePage = Math.max(1, Math.floor(page));
    const safePageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(pageSize)));
    const offset = (safePage - 1) * safePageSize;

    // ── Build WHERE clauses ──────────────────────────────────────────────
    const conditions: SQL[] = [];

    if (brandId !== undefined) {
      conditions.push(eq(product.productBrandId, brandId));
    }
    if (status !== undefined) {
      conditions.push(eq(product.status, status));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // ── Category filter via subquery on bridge table ─────────────────────
    // When categoryId is present we first collect matching productIds, then
    // apply an inArray filter. This keeps the main query a simple select
    // without an extra join that would duplicate rows.
    let productIds: number[] | undefined;
    if (categoryId !== undefined) {
      const mappings = await this.db
        .select({ productId: productCategoryMap.productId })
        .from(productCategoryMap)
        .where(eq(productCategoryMap.categoryId, categoryId));

      productIds = mappings.map((m) => m.productId);

      // No products in this category — return early.
      if (productIds.length === 0) {
        return { data: [], total: 0, page: safePage, pageSize: safePageSize, totalPages: 0 };
      }
    }

    // ── Combine all WHERE conditions ─────────────────────────────────────
    const finalConditions: SQL[] = whereClause ? [whereClause] : [];
    if (productIds !== undefined) {
      finalConditions.push(inArray(product.id, productIds));
    }

    if (vehicleGenerationId !== undefined) {
      const compatRows = await this.db
        .select({ productId: compatibility.productId })
        .from(compatibility)
        .where(eq(compatibility.vehicleGenerationId, vehicleGenerationId));

      const compatIds = compatRows.map((r) => r.productId);

      if (compatIds.length === 0) {
        return { data: [], total: 0, page: safePage, pageSize: safePageSize, totalPages: 0 };
      }

      finalConditions.push(inArray(product.id, compatIds));
    }
    const finalWhere =
      finalConditions.length > 0 ? and(...finalConditions) : undefined;

    // ── Count total matching rows ─────────────────────────────────────────
    const countResult = await this.db
      .select({ total: count() })
      .from(product)
      .where(finalWhere);

    const totalInt = Number(countResult[0]?.total ?? 0);
    const totalPages = Math.ceil(totalInt / safePageSize);

    if (totalInt === 0) {
      return { data: [], total: 0, page: safePage, pageSize: safePageSize, totalPages: 0 };
    }

    // ── Fetch product rows ────────────────────────────────────────────────
    const rows = await this.db
      .select()
      .from(product)
      .where(finalWhere)
      .orderBy(buildOrderBy(sortBy, sortDir))
      .limit(safePageSize)
      .offset(offset);

    if (rows.length === 0) {
      return { data: [], total: totalInt, page: safePage, pageSize: safePageSize, totalPages };
    }

    // ── Batch-fetch brands and thumbnails ────────────────────────────────
    const fetchedIds = rows.map((r) => r.id);
    const brandIds = [...new Set(rows.map((r) => r.productBrandId))];

    const [brands, thumbnails] = await Promise.all([
      this.db
        .select()
        .from(productBrand)
        .where(inArray(productBrand.id, brandIds)),
      this.db
        .select()
        .from(productImage)
        .where(
          and(
            inArray(productImage.productId, fetchedIds),
            eq(productImage.isThumbnail, true),
          ),
        ),
    ]);

    const brandMap = new Map(brands.map((b) => [b.id, b]));
    const thumbnailMap = new Map(thumbnails.map((img) => [img.productId, img]));

    const data: ProductSummary[] = rows.map((p) => ({
      ...p,
      brand: brandMap.get(p.productBrandId) ?? null,
      thumbnail: thumbnailMap.get(p.id) ?? null,
    }));

    return { data, total: totalInt, page: safePage, pageSize: safePageSize, totalPages };
  }

  // ── findById ──────────────────────────────────────────────────────────────

  /**
   * Fetch a single product with its brand and all images.
   * Returns undefined when no product matches.
   */
  async findById(id: number): Promise<ProductDetail | undefined> {
    return this._findDetail(eq(product.id, id));
  }

  // ── findBySlug ────────────────────────────────────────────────────────────

  /**
   * Fetch a single product by URL-safe slug with its brand and all images.
   * Returns undefined when no product matches.
   */
  async findBySlug(slug: string): Promise<ProductDetail | undefined> {
    return this._findDetail(eq(product.slug, slug));
  }

  // ── Internal: shared detail fetcher ──────────────────────────────────────

  private async _findDetail(condition: SQL): Promise<ProductDetail | undefined> {
    const rows = await this.db
      .select()
      .from(product)
      .where(condition)
      .limit(1);

    const p = rows[0];
    if (p === undefined) return undefined;

    const [brands, images] = await Promise.all([
      this.db
        .select()
        .from(productBrand)
        .where(eq(productBrand.id, p.productBrandId))
        .limit(1),
      this.db
        .select()
        .from(productImage)
        .where(eq(productImage.productId, p.id))
        .orderBy(asc(productImage.displayOrder)),
    ]);

    const result: ProductDetail = {
      ...p,
      brand: brands[0] ?? null,
      images,
    };

    return result;
  }

  // ── Admin CRUD (Handover #2) ────────────────────────────────────────────

  /** Insert a new product row. Returns the newly generated id. */
  async create(data: NewProductInput): Promise<number> {
    const rows = await this.db
      .insert(product)
      .values({
        productBrandId: data.productBrandId,
        sku: data.sku,
        name: data.name,
        slug: data.slug,
        description: data.description,
        specification: data.specification,
        status: data.status,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
      })
      .returning({ id: product.id });

    return rows[0]!.id;
  }

  /** Partially update a product row by id. */
  async update(id: number, data: Partial<NewProductInput>): Promise<void> {
    await this.db.update(product).set(data).where(eq(product.id, id));
  }

  /** Delete a product row by id. Cascading FKs clean up dependent rows. */
  async delete(id: number): Promise<void> {
    await this.db.delete(product).where(eq(product.id, id));
  }

  /** Replace the full set of category links for a product. */
  async setCategories(productId: number, categoryIds: number[]): Promise<void> {
    await this.db
      .delete(productCategoryMap)
      .where(eq(productCategoryMap.productId, productId));

    if (categoryIds.length === 0) return;

    await this.db
      .insert(productCategoryMap)
      .values(categoryIds.map((categoryId) => ({ productId, categoryId })));
  }

  /** Replace the full set of images for a product. */
  async setImages(
    productId: number,
    images: {
      imageUrl: string;
      altText?: string;
      isThumbnail?: boolean;
      displayOrder?: number;
    }[],
  ): Promise<void> {
    await this.db.delete(productImage).where(eq(productImage.productId, productId));

    if (images.length === 0) return;

    await this.db.insert(productImage).values(
      images.map((img) => ({
        productId,
        imageUrl: img.imageUrl,
        altText: img.altText,
        isThumbnail: img.isThumbnail ?? false,
        displayOrder: img.displayOrder ?? 0,
      })),
    );
  }

  /**
   * Return every existing slug equal to slugBase or matching the
   * "slugBase-N" pattern — used to compute a unique slug on create.
   */
  async findBySlugLike(slugBase: string): Promise<string[]> {
    const rows = await this.db
      .select({ slug: product.slug })
      .from(product)
      .where(or(eq(product.slug, slugBase), like(product.slug, `${slugBase}-%`)));

    return rows.map((r) => r.slug);
  }

  /** Return the category ids currently linked to a product (admin edit form). */
  async findCategoryIdsByProductId(productId: number): Promise<number[]> {
    const rows = await this.db
      .select({ categoryId: productCategoryMap.categoryId })
      .from(productCategoryMap)
      .where(eq(productCategoryMap.productId, productId));

    return rows.map((r) => r.categoryId);
  }
}
