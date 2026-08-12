/**
 * BrandService
 * Business logic cho thương hiệu phụ tùng (product_brand).
 */

import { BrandRepository, type Brand, type BrandInput } from 'autoparts-db/repositories';
import { ProductRepository, type ProductSummary } from 'autoparts-db/repositories';

export interface BrandItem {
  id: number;
  name: string;
  slug: string;
}

export interface BrandDetail extends BrandItem {
  // Có thể mở rộng thêm sau
}

export interface BrandProductsResult {
  brand: BrandDetail;
  items: {
    id: number; slug: string; name: string; sku: string;
    status: string; featuredImage: string | null;
  }[];
  total: number;
  page: number;
  pageSize: number;
}

function mapBrand(b: Brand): BrandItem {
  return { id: b.id, name: b.name, slug: b.slug };
}

export class BrandService {
  constructor(
    private readonly brandRepo: BrandRepository,
    private readonly productRepo: ProductRepository,
  ) {}

  async getBrands(): Promise<BrandItem[]> {
    const rows = await this.brandRepo.findAll();
    return rows.map(mapBrand);
  }

  async getBrandBySlug(slug: string): Promise<BrandDetail | null> {
    const brand = await this.brandRepo.findBySlug(slug);
    if (!brand) return null;
    return mapBrand(brand);
  }

  // ── Admin CRUD ──────────────────────────────────────────────────────────

  async adminListBrands(): Promise<Brand[]> {
    return this.brandRepo.findAllAdmin();
  }

  async adminCreateBrand(input: BrandInput): Promise<Brand> {
    return this.brandRepo.create(input);
  }

  async adminUpdateBrand(id: number, input: Partial<BrandInput>): Promise<Brand | null> {
    const row = await this.brandRepo.update(id, input);
    return row ?? null;
  }

  async adminDeleteBrand(id: number): Promise<boolean> {
    return this.brandRepo.remove(id);
  }

  // ── Public ───────────────────────────────────────────────────────────────

  async getProductsByBrand(
    slug: string,
    page = 1,
    pageSize = 24,
  ): Promise<BrandProductsResult | null> {
    const brand = await this.brandRepo.findBySlug(slug);
    if (!brand) return null;

    const result = await this.productRepo.findMany({
      page,
      pageSize,
      brandId: brand.id,
      sortBy: 'createdAt',
      sortDir: 'desc',
    });

    return {
      brand: mapBrand(brand),
      items: result.data.map((p: ProductSummary) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        sku: p.sku,
        status: p.status,
        featuredImage: p.thumbnail?.imageUrl ?? null,
      })),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }
}
