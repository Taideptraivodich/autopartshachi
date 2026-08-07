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

// ---------------------------------------------------------------------------
// Types trả về cho Controller / API
// ---------------------------------------------------------------------------

/** Item trong danh sách sản phẩm — đủ để render card */
export interface ProductListItem {
  id: number;
  slug: string;
  name: string;
  sku: string;
  status: string;
  featuredImage: string | null;
  brand: { id: number; name: string; slug: string } | null;
}

/** Kết quả phân trang cho danh sách sản phẩm */
export interface ProductListResult {
  items: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
}

/** Tham số lọc + phân trang cho danh sách sản phẩm */
export interface GetProductListParams {
  page?: number;
  pageSize?: number;
  brandId?: number;
  categoryId?: number;
  status?: "con_hang" | "het_hang" | "ngung_kinh_doanh";
}

/** Chi tiết đầy đủ 1 sản phẩm */
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
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pickFeaturedImage(
  thumbnail: { imageUrl: string } | null,
): string | null {
  return thumbnail?.imageUrl ?? null;
}

function mapSummaryToListItem(p: ProductSummary): ProductListItem {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    sku: p.sku,
    status: p.status,
    featuredImage: pickFeaturedImage(p.thumbnail),
    brand: p.brand
      ? { id: p.brand.id, name: p.brand.name, slug: p.brand.slug }
      : null,
  };
}

function mapDetailToResult(p: ProductDetail): ProductDetailResult {
  const thumbnail = p.images.find((img) => img.isThumbnail);
  const featuredImage =
    thumbnail?.imageUrl ??
    [...p.images].sort((a, b) => a.displayOrder - b.displayOrder)[0]
      ?.imageUrl ??
    null;

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
    brand: p.brand
      ? { id: p.brand.id, name: p.brand.name, slug: p.brand.slug }
      : null,
    images: [...p.images]
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((img) => ({
        id: img.id,
        imageUrl: img.imageUrl,
        altText: img.altText ?? null,
        isThumbnail: img.isThumbnail,
        displayOrder: img.displayOrder,
      })),
  };
}

// ---------------------------------------------------------------------------
// ProductService
// ---------------------------------------------------------------------------

export class ProductService {
  constructor(
    private readonly productRepo: ProductRepository,
    // categoryRepo được inject để có thể dùng sau này (resolve slug → id)
    private readonly _categoryRepo: CategoryRepository,
  ) {}

  /**
   * Lấy danh sách sản phẩm có phân trang + lọc.
   */
  async getProductList(
    params: GetProductListParams = {},
  ): Promise<ProductListResult> {
    const { page = 1, pageSize = 24, brandId, categoryId, status } = params;

    const result: PaginatedResult<ProductSummary> =
      await this.productRepo.findMany({
        page,
        pageSize,
        brandId,
        categoryId,
        status,
        sortBy: "createdAt",
        sortDir: "desc",
      });

    return {
      items: result.data.map(mapSummaryToListItem),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }

  /**
   * Lấy chi tiết sản phẩm theo slug.
   * Trả về null nếu không tìm thấy.
   */
  async getProductBySlug(slug: string): Promise<ProductDetailResult | null> {
    const detail = await this.productRepo.findBySlug(slug);
    if (!detail) return null;
    return mapDetailToResult(detail);
  }

  /**
   * Lấy sản phẩm liên quan — sản phẩm mới nhất, loại trừ sản phẩm hiện tại.
   */
  async getRelatedProducts(
    currentSlug: string,
    limit = 8,
  ): Promise<ProductListItem[]> {
    const current = await this.productRepo.findBySlug(currentSlug);
    if (!current) return [];

    // Lấy thêm 1 để bù trừ việc loại trừ sản phẩm hiện tại
    const result = await this.productRepo.findMany({
      page: 1,
      pageSize: limit + 1,
      sortBy: "createdAt",
      sortDir: "desc",
    });

    return result.data
      .filter((p) => p.id !== current.id)
      .slice(0, limit)
      .map(mapSummaryToListItem);
  }
}
