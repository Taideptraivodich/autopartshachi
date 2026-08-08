// ─── Product types (mirror API response shapes) ────────────────────────────────

export interface ProductBrandSummary {
  id: number;
  name: string;
  slug: string;
}

export interface CategorySummary {
  id: number;
  name: string;
  slug: string;
}

export interface ProductListItem {
  id: number;
  slug: string;
  name: string;
  sku: string;
  status: string;
  featuredImage: string | null;
  brand: ProductBrandSummary | null;
  categories: CategorySummary[];
}

export interface ProductImage {
  id: number;
  imageUrl: string;
  altText: string | null;
  isThumbnail: boolean;
  displayOrder: number;
}

export interface OemCode {
  id: number;
  code: string;
  status: string;
  matchConfidence: string;
  issuingBrand: string | null;
}

export interface CompatibilityEntry {
  brandName: string;
  brandSlug: string;
  modelName: string;
  modelSlug: string;
  generationName: string;
  yearStart: number;
  yearEnd: number | null;
  installationPosition: string;
  notes: string | null;
}

export interface ProductDetail extends ProductListItem {
  description: string | null;
  specification: string | null;
  images: ProductImage[];
  oemCodes: OemCode[];
  compatibility: CompatibilityEntry[];
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export interface CategoryDetail {
  id: number;
  name: string;
  slug: string;
  parentCategoryId: number | null;
  parent: CategorySummary | null;
  children: (CategorySummary & { displayOrder: number })[];
}

export interface CategoryListItem {
  id: number;
  name: string;
  slug: string;
  parentCategoryId: number | null;
  displayOrder: number;
}

// ─── API response wrappers ─────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; pageSize: number; total: number };
}

export interface ProductsByCategory {
  data: ProductListItem[];
  category: CategoryDetail;
  meta: { page: number; pageSize: number; total: number };
}

export interface CategoryDetailResponse {
  data: CategoryDetail;
}

// ── Brand (product brand / thương hiệu phụ tùng) ──────────────────────────
export interface BrandListItem { id: number; name: string; slug: string; }
export interface BrandDetail extends BrandListItem {}

export interface BrandDetailResponse {
  data: BrandDetail;
  products: PaginatedResponse<ProductListItem>;
}

// ── Vehicle brand (hãng xe) ────────────────────────────────────────────────
export interface VehicleBrandListItem {
  id: number; name: string; slug: string;
  countryOfOrigin: string | null; logoUrl: string | null;
}
export interface VehicleModelItem { id: number; name: string; slug: string; segment: string | null; }
export interface VehicleBrandDetail extends VehicleBrandListItem {
  models: VehicleModelItem[];
}
