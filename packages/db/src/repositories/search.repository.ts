import { and, eq, ilike, or, inArray } from "drizzle-orm";
import { type Database } from "../db/index.js";
import { product, productBrand, productImage } from "../db/schema/product.js";
import { oemNumber, oemMapping } from "../db/schema/oem.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SearchResultItem {
  id: number;
  slug: string;
  name: string;
  sku: string;
  status: string;
  featuredImage: string | null;
  brand: { id: number; name: string; slug: string } | null;
}

export interface SearchResult {
  data: SearchResultItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// SearchRepository
// ---------------------------------------------------------------------------

export class SearchRepository {
  constructor(private readonly db: Database) {}

  /**
   * Full-text search across: product name, SKU, OEM code, brand name.
   * Uses ilike for case-insensitive partial match.
   */
  async search(
    query: string,
    page = 1,
    pageSize = 24,
  ): Promise<SearchResult> {
    if (!query || query.trim().length === 0) {
      return { data: [], total: 0, page, pageSize, totalPages: 0 };
    }

    const q = query.trim();
    const pattern = `%${q}%`;
    const safePage = Math.max(1, page);
    const safePageSize = Math.min(100, Math.max(1, pageSize));
    const offset = (safePage - 1) * safePageSize;

    // Step 1: Find product IDs matching by OEM code
    const oemMatches = await this.db
      .select({ oemNumberId: oemNumber.id })
      .from(oemNumber)
      .where(
        or(
          ilike(oemNumber.oemNumber, pattern),
          ilike(oemNumber.normalizedCode, q.toUpperCase().replace(/[-\s]/g, "")),
        ),
      );

    let oemProductIds: number[] = [];
    if (oemMatches.length > 0) {
      const oemIds = oemMatches.map((r) => r.oemNumberId);
      const mappings = await this.db
        .select({ productId: oemMapping.productId })
        .from(oemMapping)
        .where(
          oemIds.length === 1
            ? eq(oemMapping.oemNumberId, oemIds[0])
            : or(...oemIds.map((id) => eq(oemMapping.oemNumberId, id))),
        );
      oemProductIds = mappings.map((m) => m.productId);
    }

    // Step 2: Find brand IDs matching brand name
    const brandMatches = await this.db
      .select({ id: productBrand.id })
      .from(productBrand)
      .where(ilike(productBrand.name, pattern));
    const matchedBrandIds = brandMatches.map((b) => b.id);

    // Step 3: Collect all matching product IDs via direct filters
    // We'll fetch all matching products, then deduplicate
    const directConditions = [
      ilike(product.name, pattern),
      ilike(product.sku, pattern),
    ];
    if (matchedBrandIds.length > 0) {
      directConditions.push(
        matchedBrandIds.length === 1
          ? eq(product.productBrandId, matchedBrandIds[0])
          : inArray(product.productBrandId, matchedBrandIds),
      );
    }

    // Direct match on product fields
    const directRows = await this.db
      .select({ id: product.id })
      .from(product)
      .where(or(...directConditions));

    const directIds = directRows.map((r) => r.id);

    // Merge all matching product IDs (deduplicate)
    const allIds = [...new Set([...directIds, ...oemProductIds])];

    if (allIds.length === 0) {
      return { data: [], total: 0, page: safePage, pageSize: safePageSize, totalPages: 0 };
    }

    const total = allIds.length;
    const totalPages = Math.ceil(total / safePageSize);

    // Paginate the merged IDs
    const pageIds = allIds.slice(offset, offset + safePageSize);
    if (pageIds.length === 0) {
      return { data: [], total, page: safePage, pageSize: safePageSize, totalPages };
    }

    // Fetch full product rows for this page
    const rows = await this.db
      .select()
      .from(product)
      .where(
        pageIds.length === 1
          ? eq(product.id, pageIds[0])
          : inArray(product.id, pageIds),
      );

    // Sort by original merge order
    const orderMap = new Map(allIds.map((id, i) => [id, i]));
    rows.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));

    // Batch-fetch brands & thumbnails
    const brandIds = [...new Set(rows.map((r) => r.productBrandId))];
    const productIds = rows.map((r) => r.id);

    const [brands, thumbnails] = await Promise.all([
      brandIds.length > 0
        ? this.db
            .select()
            .from(productBrand)
            .where(
              brandIds.length === 1
                ? eq(productBrand.id, brandIds[0])
                : inArray(productBrand.id, brandIds),
            )
        : [],
      productIds.length > 0
        ? this.db
            .select()
            .from(productImage)
            .where(
              and(
                productIds.length === 1
                  ? eq(productImage.productId, productIds[0])
                  : inArray(productImage.productId, productIds),
                eq(productImage.isThumbnail, true),
              ),
            )
        : [],
    ]);

    const brandMap = new Map(brands.map((b) => [b.id, b]));
    const thumbnailMap = new Map(thumbnails.map((t) => [t.productId, t]));

    const data: SearchResultItem[] = rows.map((p) => {
      const brand = brandMap.get(p.productBrandId) ?? null;
      const thumbnail = thumbnailMap.get(p.id) ?? null;
      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        sku: p.sku,
        status: p.status,
        featuredImage: thumbnail?.imageUrl ?? null,
        brand: brand
          ? { id: brand.id, name: brand.name, slug: brand.slug }
          : null,
      };
    });

    return { data, total, page: safePage, pageSize: safePageSize, totalPages };
  }
}
