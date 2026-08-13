import { and, asc, count, desc, eq, gte, inArray, isNull, like, lte, or, SQL } from "drizzle-orm";
import { type Database } from "../db/index.js";
import {
  product,
  productBrand,
  productCategory,
  productCategoryMap,
  productImage,
} from "../db/schema/product.js";
import { compatibility } from "../db/schema/compatibility.js";
import { oemMapping, oemNumber } from "../db/schema/oem.js";
import { vehicleBrand, vehicleModel } from "../db/schema/vehicle.js";

export type Product = typeof product.$inferSelect;
export type ProductBrand = typeof productBrand.$inferSelect;
export type ProductImage = typeof productImage.$inferSelect;

export type ProductSummary = Product & {
  brand: ProductBrand | null;
  thumbnail: ProductImage | null;
};

export type ProductDetail = Product & {
  brand: ProductBrand | null;
  images: ProductImage[];
  categories: { id: number; name: string; slug: string }[];
  oemCodes: {
    id: number;
    oemNumber: string;
    status: string;
    matchConfidence: string;
    issuingVehicleBrandId: number | null;
  }[];
  compatibility: {
    compatId: number;
    installationPosition: string;
    notes: string | null;
    brandName: string;
    brandSlug: string;
    modelName: string;
    modelSlug: string;
    yearStart: number;
    yearEnd: number | null;
  }[];
};

export type ProductSortField = "name" | "createdAt" | "updatedAt";
export type SortDirection = "asc" | "desc";

export interface FindManyParams {
  brandId?: number;
  categoryId?: number;
  status?: "con_hang" | "het_hang" | "ngung_kinh_doanh";
  sortBy?: ProductSortField;
  sortDir?: SortDirection;
  page?: number;
  pageSize?: number;
  vehicleModelId?: number;
  vehicleYear?: number;
  q?: string;
  onlyVisible?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

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

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;

function buildOrderBy(
  sortBy: ProductSortField = "createdAt",
  sortDir: SortDirection = "desc",
): SQL {
  const dirFn = sortDir === "asc" ? asc : desc;
  switch (sortBy) {
    case "name": return dirFn(product.name);
    case "updatedAt": return dirFn(product.updatedAt);
    case "createdAt":
    default: return dirFn(product.createdAt);
  }
}

export class ProductRepository {
  constructor(private readonly db: Database) {}

  async findMany(params: FindManyParams = {}): Promise<PaginatedResult<ProductSummary>> {
    const {
      brandId,
      categoryId,
      status,
      sortBy = "createdAt",
      sortDir = "desc",
      page = 1,
      pageSize = DEFAULT_PAGE_SIZE,
      vehicleModelId,
      vehicleYear,
      q,
      onlyVisible = true,
    } = params;

    const safePage = Math.max(1, Math.floor(page));
    const safePageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(pageSize)));
    const offset = (safePage - 1) * safePageSize;
    const conditions: SQL[] = [];

    if (brandId !== undefined) conditions.push(eq(product.productBrandId, brandId));
    if (status !== undefined) conditions.push(eq(product.status, status));
    if (onlyVisible) conditions.push(eq(product.isVisible, true));
    if (q && q.trim().length > 0) {
      const term = `%${q.trim()}%`;
      conditions.push(or(like(product.name, term), like(product.sku, term))!);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let productIds: number[] | undefined;
    if (categoryId !== undefined) {
      const mappings = await this.db
        .select({ productId: productCategoryMap.productId })
        .from(productCategoryMap)
        .where(eq(productCategoryMap.categoryId, categoryId));
      productIds = mappings.map((m) => m.productId);
      if (productIds.length === 0) {
        return { data: [], total: 0, page: safePage, pageSize: safePageSize, totalPages: 0 };
      }
    }

    const finalConditions: SQL[] = whereClause ? [whereClause] : [];
    if (productIds !== undefined) finalConditions.push(inArray(product.id, productIds));

    if (vehicleModelId !== undefined) {
      const compatibilityConditions: SQL[] = [eq(compatibility.vehicleModelId, vehicleModelId)];
      if (vehicleYear !== undefined) {
        compatibilityConditions.push(lte(compatibility.yearStart, vehicleYear));
        compatibilityConditions.push(
          or(isNull(compatibility.yearEnd), gte(compatibility.yearEnd, vehicleYear))!,
        );
      }

      const compatRows = await this.db
        .select({ productId: compatibility.productId })
        .from(compatibility)
        .where(and(...compatibilityConditions));
      const compatIds = [...new Set(compatRows.map((r) => r.productId))];

      if (compatIds.length === 0) {
        return { data: [], total: 0, page: safePage, pageSize: safePageSize, totalPages: 0 };
      }
      finalConditions.push(inArray(product.id, compatIds));
    }

    const finalWhere = finalConditions.length > 0 ? and(...finalConditions) : undefined;
    const countResult = await this.db.select({ total: count() }).from(product).where(finalWhere);
    const totalInt = Number(countResult[0]?.total ?? 0);
    const totalPages = Math.ceil(totalInt / safePageSize);

    if (totalInt === 0) {
      return { data: [], total: 0, page: safePage, pageSize: safePageSize, totalPages: 0 };
    }

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

    const fetchedIds = rows.map((r) => r.id);
    const brandIds = [...new Set(rows.map((r) => r.productBrandId))];
    const [brands, thumbnails] = await Promise.all([
      this.db.select().from(productBrand).where(inArray(productBrand.id, brandIds)),
      this.db
        .select()
        .from(productImage)
        .where(and(inArray(productImage.productId, fetchedIds), eq(productImage.isThumbnail, true))),
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

  async findById(id: number): Promise<ProductDetail | undefined> {
    return this._findDetail(eq(product.id, id));
  }

  async findBySlug(slug: string): Promise<ProductDetail | undefined> {
    return this._findDetail(eq(product.slug, slug));
  }

  private async _findDetail(condition: SQL): Promise<ProductDetail | undefined> {
    const rows = await this.db.select().from(product).where(condition).limit(1);
    const p = rows[0];
    if (p === undefined) return undefined;

    const [brands, images, categories, oemCodes, compatRows] = await Promise.all([
      this.db.select().from(productBrand).where(eq(productBrand.id, p.productBrandId)).limit(1),
      this.db.select().from(productImage).where(eq(productImage.productId, p.id)).orderBy(asc(productImage.displayOrder)),
      this.db
        .select({ id: productCategory.id, name: productCategory.name, slug: productCategory.slug })
        .from(productCategoryMap)
        .innerJoin(productCategory, eq(productCategoryMap.categoryId, productCategory.id))
        .where(eq(productCategoryMap.productId, p.id)),
      this.db
        .select({
          id: oemMapping.id,
          oemNumber: oemNumber.oemNumber,
          status: oemNumber.status,
          matchConfidence: oemMapping.matchConfidence,
          issuingVehicleBrandId: oemNumber.issuingVehicleBrandId,
        })
        .from(oemMapping)
        .innerJoin(oemNumber, eq(oemMapping.oemNumberId, oemNumber.id))
        .where(eq(oemMapping.productId, p.id)),
      this.db
        .select({
          compatId: compatibility.id,
          installationPosition: compatibility.installationPosition,
          notes: compatibility.notes,
          brandName: vehicleBrand.name,
          brandSlug: vehicleBrand.slug,
          modelName: vehicleModel.name,
          modelSlug: vehicleModel.slug,
          yearStart: compatibility.yearStart,
          yearEnd: compatibility.yearEnd,
        })
        .from(compatibility)
        .innerJoin(vehicleModel, eq(vehicleModel.id, compatibility.vehicleModelId))
        .innerJoin(vehicleBrand, eq(vehicleBrand.id, vehicleModel.vehicleBrandId))
        .where(eq(compatibility.productId, p.id)),
    ]);

    return {
      ...p,
      brand: brands[0] ?? null,
      images,
      categories,
      oemCodes,
      compatibility: compatRows,
    };
  }

  async create(data: NewProductInput): Promise<number> {
    const rows = await this.db.insert(product).values({
      productBrandId: data.productBrandId,
      sku: data.sku,
      name: data.name,
      slug: data.slug,
      description: data.description,
      specification: data.specification,
      status: data.status,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
    }).returning({ id: product.id });
    return rows[0]!.id;
  }

  async update(id: number, data: Partial<NewProductInput>): Promise<void> {
    await this.db.update(product).set(data).where(eq(product.id, id));
  }

  async delete(id: number): Promise<void> {
    await this.db.delete(product).where(eq(product.id, id));
  }

  async setCategories(productId: number, categoryIds: number[]): Promise<void> {
    await this.db.delete(productCategoryMap).where(eq(productCategoryMap.productId, productId));
    if (categoryIds.length === 0) return;
    await this.db.insert(productCategoryMap).values(categoryIds.map((categoryId) => ({ productId, categoryId })));
  }

  async setImages(productId: number, images: { imageUrl: string; altText?: string; isThumbnail?: boolean; displayOrder?: number }[]): Promise<void> {
    await this.db.delete(productImage).where(eq(productImage.productId, productId));
    if (images.length === 0) return;
    await this.db.insert(productImage).values(images.map((img) => ({
      productId,
      imageUrl: img.imageUrl,
      altText: img.altText,
      isThumbnail: img.isThumbnail ?? false,
      displayOrder: img.displayOrder ?? 0,
    })));
  }

  async findBySlugLike(slugBase: string): Promise<string[]> {
    const rows = await this.db.select({ slug: product.slug }).from(product).where(
      or(eq(product.slug, slugBase), like(product.slug, `${slugBase}-%`)),
    );
    return rows.map((r) => r.slug);
  }

  async findCategoryIdsByProductId(productId: number): Promise<number[]> {
    const rows = await this.db.select({ categoryId: productCategoryMap.categoryId }).from(productCategoryMap).where(eq(productCategoryMap.productId, productId));
    return rows.map((r) => r.categoryId);
  }

  async setVisibility(id: number, isVisible: boolean): Promise<{ id: number; isVisible: boolean } | undefined> {
    const rows = await this.db.update(product).set({ isVisible }).where(eq(product.id, id)).returning({ id: product.id, isVisible: product.isVisible });
    return rows[0];
  }
}
