import { and, desc, eq, ilike, or, inArray, sql } from "drizzle-orm";
import { type Database } from "../db/index.js";
import { product, productBrand, productImage } from "../db/schema/product.js";
import { oemNumber, oemMapping } from "../db/schema/oem.js";
import { searchAnalytics } from "../db/schema/analytics.js";

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

export interface SuggestionItem {
  type: "product" | "oem";
  label: string;
  value: string;
  slug?: string;
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

    // Step 3: Collect all matching product IDs — FTS với fallback ilike
    let directIds: number[] = [];
    try {
      // FTS prefix match: mỗi từ thêm :* để match prefix
      const ftsQuery = q
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => `${w}:*`)
        .join(" & ");

      const ftsRows = await this.db
        .select({ id: product.id })
        .from(product)
        .where(sql`${product.searchVector} @@ to_tsquery('simple', ${ftsQuery})`);

      directIds = ftsRows.map((r) => r.id);

      // Nếu FTS không trả kết quả (ví dụ DB chưa migrate), fallback ilike
      if (directIds.length === 0) {
        throw new Error("fts_empty");
      }
    } catch {
      // Fallback: ilike trên name, sku và brand
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
      const ilikeRows = await this.db
        .select({ id: product.id })
        .from(product)
        .where(or(...directConditions));
      directIds = ilikeRows.map((r) => r.id);
    }

    // Brand match cũng cộng vào directIds nếu FTS không tính brand
    if (matchedBrandIds.length > 0) {
      const brandProductRows = await this.db
        .select({ id: product.id })
        .from(product)
        .where(
          matchedBrandIds.length === 1
            ? eq(product.productBrandId, matchedBrandIds[0])
            : inArray(product.productBrandId, matchedBrandIds),
        );
      for (const r of brandProductRows) {
        if (!directIds.includes(r.id)) directIds.push(r.id);
      }
    }

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

  /**
   * Gợi ý tìm kiếm theo prefix — dùng cho dropdown suggestion.
   * Prefix match (q%) thay vì full ilike để tận dụng index.
   */
  async suggest(query: string, limit = 8): Promise<SuggestionItem[]> {
    if (!query || query.trim().length < 2) return [];

    const q = query.trim();
    const pattern = `${q}%`;

    // Query song song: product name + oem code
    const [productRows, oemRows] = await Promise.all([
      this.db
        .select({ id: product.id, name: product.name, slug: product.slug })
        .from(product)
        .where(ilike(product.name, pattern))
        .limit(limit),
      this.db
        .select({ oemNumber: oemNumber.oemNumber })
        .from(oemNumber)
        .where(
          or(
            ilike(oemNumber.oemNumber, pattern),
            ilike(
              oemNumber.normalizedCode,
              q.toUpperCase().replace(/[-\s]/g, "") + "%",
            ),
          ),
        )
        .limit(limit),
    ]);

    const productSuggestions: SuggestionItem[] = productRows.map((p) => ({
      type: "product",
      label: p.name,
      value: p.name,
      slug: p.slug,
    }));

    const oemSuggestions: SuggestionItem[] = oemRows.map((o) => ({
      type: "oem",
      label: `Mã OEM: ${o.oemNumber}`,
      value: o.oemNumber,
    }));

    // Merge, dedup theo value, giới hạn limit
    const seen = new Set<string>();
    const merged: SuggestionItem[] = [];
    for (const item of [...productSuggestions, ...oemSuggestions]) {
      if (!seen.has(item.value)) {
        seen.add(item.value);
        merged.push(item);
      }
      if (merged.length >= limit) break;
    }

    return merged;
  }

  /**
   * Ghi log keyword tìm kiếm vào analytics table.
   * Upsert: tăng count nếu keyword đã có, insert mới nếu chưa.
   * Fire-and-forget — caller không cần await.
   */
  async logSearch(keyword: string): Promise<void> {
    if (!keyword || keyword.trim().length === 0) return;
    const kw = keyword.trim().toLowerCase();

    await this.db
      .insert(searchAnalytics)
      .values({ keyword: kw, count: 1, lastSearchedAt: new Date() })
      .onConflictDoUpdate({
        target: searchAnalytics.keyword,
        set: {
          count: sql`${searchAnalytics.count} + 1`,
          lastSearchedAt: new Date(),
        },
      });
  }
  /**
   * Lấy keyword phổ biến từ search_analytics, ORDER BY count DESC.
   */
  async getPopularKeywords(limit = 4): Promise<string[]> {
    const rows = await this.db
      .select({ keyword: searchAnalytics.keyword })
      .from(searchAnalytics)
      .orderBy(desc(searchAnalytics.count))
      .limit(limit);
    return rows.map((r) => r.keyword);
  }
}
