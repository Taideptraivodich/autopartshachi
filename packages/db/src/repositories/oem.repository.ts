import { and, eq, ilike, or } from "drizzle-orm";
import { type Database } from "../db/index.js";
import { oemNumber, oemMapping } from "../db/schema/oem.js";
import { product, productBrand, productImage } from "../db/schema/product.js";
import { vehicleBrand } from "../db/schema/vehicle.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OemSearchResult {
  oemId: number;
  oemCode: string;
  status: string;
  normalizedCode: string | null;
  issuingVehicleBrand: string | null;
  matchConfidence: string;
  product: {
    id: number;
    slug: string;
    name: string;
    sku: string;
    status: string;
    featuredImage: string | null;
    brand: { id: number; name: string; slug: string } | null;
  };
}

// ---------------------------------------------------------------------------
// OemRepository
// ---------------------------------------------------------------------------

export class OemRepository {
  constructor(private readonly db: Database) {}

  /**
   * Tìm sản phẩm theo mã OEM (chính xác hoặc normalized).
   * Hỗ trợ: "04465-BZ160", "04465BZ160", "04465 BZ160"
   */
  async findProductsByOemCode(code: string): Promise<OemSearchResult[]> {
    if (!code || code.trim().length === 0) return [];

    const trimmed = code.trim();
    // Normalize: uppercase, remove dashes/spaces
    const normalized = trimmed.toUpperCase().replace(/[-\s]/g, "");

    // Look up matching oem_number rows
    const oemRows = await this.db
      .select()
      .from(oemNumber)
      .where(
        or(
          ilike(oemNumber.oemNumber, trimmed),
          ilike(oemNumber.normalizedCode, normalized),
        ),
      )
      .limit(20);

    if (oemRows.length === 0) return [];

    const oemIds = oemRows.map((r) => r.id);

    // Get oem_mapping rows for matched oem numbers
    const mappings = await this.db
      .select()
      .from(oemMapping)
      .where(
        oemIds.length === 1
          ? eq(oemMapping.oemNumberId, oemIds[0])
          : or(...oemIds.map((id) => eq(oemMapping.oemNumberId, id))),
      );

    if (mappings.length === 0) return [];

    const productIds = mappings.map((m) => m.productId);

    // Fetch products
    const products = await this.db
      .select()
      .from(product)
      .where(
        productIds.length === 1
          ? eq(product.id, productIds[0])
          : or(...productIds.map((id) => eq(product.id, id))),
      );

    // Fetch brands
    const brandIds = [...new Set(products.map((p) => p.productBrandId))];
    const brands =
      brandIds.length > 0
        ? await this.db
            .select()
            .from(productBrand)
            .where(
              brandIds.length === 1
                ? eq(productBrand.id, brandIds[0])
                : or(...brandIds.map((id) => eq(productBrand.id, id))),
            )
        : [];

    // Fetch thumbnails
    const thumbnails =
      productIds.length > 0
        ? await this.db
            .select()
            .from(productImage)
            .where(
              and(
                productIds.length === 1
                  ? eq(productImage.productId, productIds[0])
                  : or(...productIds.map((id) => eq(productImage.productId, id))),
                eq(productImage.isThumbnail, true),
              ),
            )
        : [];

    // Fetch issuing vehicle brands for matched oem numbers
    const vehicleBrandIds = [
      ...new Set(
        oemRows
          .filter((r) => r.issuingVehicleBrandId !== null)
          .map((r) => r.issuingVehicleBrandId as number),
      ),
    ];
    const vehicleBrands =
      vehicleBrandIds.length > 0
        ? await this.db
            .select()
            .from(vehicleBrand)
            .where(
              vehicleBrandIds.length === 1
                ? eq(vehicleBrand.id, vehicleBrandIds[0])
                : or(...vehicleBrandIds.map((id) => eq(vehicleBrand.id, id))),
            )
        : [];

    const brandMap = new Map(brands.map((b) => [b.id, b]));
    const thumbnailMap = new Map(thumbnails.map((t) => [t.productId, t]));
    const vehicleBrandMap = new Map(vehicleBrands.map((vb) => [vb.id, vb]));
    const oemMap = new Map(oemRows.map((o) => [o.id, o]));
    const productMap = new Map(products.map((p) => [p.id, p]));

    const results: OemSearchResult[] = [];
    for (const mapping of mappings) {
      const oem = oemMap.get(mapping.oemNumberId);
      const prod = productMap.get(mapping.productId);
      if (!oem || !prod) continue;

      const brand = brandMap.get(prod.productBrandId) ?? null;
      const thumbnail = thumbnailMap.get(prod.id) ?? null;
      const issuingVehicleBrand = oem.issuingVehicleBrandId
        ? (vehicleBrandMap.get(oem.issuingVehicleBrandId)?.name ?? null)
        : null;

      results.push({
        oemId: oem.id,
        oemCode: oem.oemNumber,
        status: oem.status,
        normalizedCode: oem.normalizedCode,
        issuingVehicleBrand,
        matchConfidence: mapping.matchConfidence,
        product: {
          id: prod.id,
          slug: prod.slug,
          name: prod.name,
          sku: prod.sku,
          status: prod.status,
          featuredImage: thumbnail?.imageUrl ?? null,
          brand: brand
            ? { id: brand.id, name: brand.name, slug: brand.slug }
            : null,
        },
      });
    }

    return results;
  }
}
