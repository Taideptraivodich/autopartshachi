/**
 * ProductService
 * Tầng business logic cho sản phẩm.
 * Chỉ được gọi Repository, không được query DB trực tiếp.
 *
 * Kiến trúc: Controller → Service → Repository → Database
 */

import {
  ProductRepository,
  CategoryRepository,
  type PaginatedResult,
  type ProductSummary,
  type ProductDetail,
} from "autoparts-db/repositories";

export interface ProductListItem {
  id: number;
  slug: string;
  name: string;
  sku: string;
  status: string;
  isVisible: boolean;
  featuredImage: string | null;
  brand: { id: number; name: string; slug: string } | null;
}

export interface ProductListResult {
  items: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface GetProductListParams {
  page?: number;
  pageSize?: number;
  brandId?: number;
  categoryId?: number;
  status?: "con_hang" | "het_hang" | "ngung_kinh_doanh";
  sortBy?: "name" | "createdAt";
  sortDir?: "asc" | "desc";
  vehicleModelId?: number;
  vehicleYear?: number;
  q?: string;
  onlyVisible?: boolean;
}

export interface ProductDetailResult {
  id: number;
  slug: string;
  name: string;
  sku: string;
  status: string;
  description: string | null;
  specification: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  featuredImage: string | null;
  brand: { id: number; name: string; slug: string } | null;
  images: {
    id: number;
    imageUrl: string;
    altText: string | null;
    isThumbnail: boolean;
    displayOrder: number;
  }[];
  categories: { id: number; name: string; slug: string }[];
  oemCodes: {
    id: number;
    code: string;
    status: string;
    matchConfidence: string;
    issuingBrand: string | null;
  }[];
  compatibility: {
    brandName: string;
    brandSlug: string;
    modelName: string;
    modelSlug: string;
    yearStart: number;
    yearEnd: number | null;
    installationPosition: string;
    notes: string | null;
  }[];
}

function pickFeaturedImage(thumbnail: { imageUrl: string } | null): string | null {
  return thumbnail?.imageUrl ?? null;
}

function mapSummaryToListItem(p: ProductSummary): ProductListItem {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    sku: p.sku,
    status: p.status,
    isVisible: p.isVisible,
    featuredImage: pickFeaturedImage(p.thumbnail),
    brand: p.brand ? { id: p.brand.id, name: p.brand.name, slug: p.brand.slug } : null,
  };
}

function mapDetailToResult(p: ProductDetail): ProductDetailResult {
  const thumbnail = p.images.find((img) => img.isThumbnail);
  const featuredImage = thumbnail?.imageUrl ?? [...p.images].sort((a, b) => a.displayOrder - b.displayOrder)[0]?.imageUrl ?? null;

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    sku: p.sku,
    status: p.status,
    description: p.description ?? null,
    specification: p.specification ?? null,
    metaTitle: p.metaTitle ?? null,
    metaDescription: p.metaDescription ?? null,
    featuredImage,
    brand: p.brand ? { id: p.brand.id, name: p.brand.name, slug: p.brand.slug } : null,
    images: [...p.images]
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((img) => ({
        id: img.id,
        imageUrl: img.imageUrl,
        altText: img.altText ?? null,
        isThumbnail: img.isThumbnail,
        displayOrder: img.displayOrder,
      })),
    categories: p.categories ?? [],
    oemCodes: (p.oemCodes ?? []).map((o) => ({
      id: o.id,
      code: o.oemNumber,
      status: o.status,
      matchConfidence: o.matchConfidence,
      issuingBrand: null,
    })),
    compatibility: (p.compatibility ?? []).map((c) => ({
      brandName: c.brandName,
      brandSlug: c.brandSlug,
      modelName: c.modelName,
      modelSlug: c.modelSlug,
      yearStart: c.yearStart,
      yearEnd: c.yearEnd,
      installationPosition: c.installationPosition,
      notes: c.notes,
    })),
  };
}

export class ProductService {
  constructor(
    private readonly productRepo: ProductRepository,
    private readonly _categoryRepo: CategoryRepository,
  ) {}

  async getProductList(params: GetProductListParams = {}): Promise<ProductListResult> {
    const { page = 1, pageSize = 24, brandId, categoryId, status } = params;
    const result: PaginatedResult<ProductSummary> = await this.productRepo.findMany({
      page,
      pageSize,
      brandId,
      categoryId,
      status,
      sortBy: params.sortBy ?? "createdAt",
      sortDir: params.sortDir ?? "desc",
      vehicleModelId: params.vehicleModelId,
      vehicleYear: params.vehicleYear,
      q: params.q,
      onlyVisible: params.onlyVisible,
    });

    return {
      items: result.data.map(mapSummaryToListItem),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }

  async getProductBySlug(slug: string): Promise<ProductDetailResult | null> {
    const detail = await this.productRepo.findBySlug(slug);
    if (!detail) return null;
    return mapDetailToResult(detail);
  }

  async getRelatedProducts(currentSlug: string, limit = 8): Promise<ProductListItem[]> {
    const current = await this.productRepo.findBySlug(currentSlug);
    if (!current) return [];

    const result = await this.productRepo.findMany({
      page: 1,
      pageSize: limit + 1,
      sortBy: "createdAt",
      sortDir: "desc",
    });

    return result.data.filter((p) => p.id !== current.id).slice(0, limit).map(mapSummaryToListItem);
  }
}
