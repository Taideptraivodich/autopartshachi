// ─── Filter / sort params ──────────────────────────────────────────────────────

export interface ProductFilterParams {
  brandId?: number;
  categoryId?: number;
  status?: "con_hang" | "het_hang" | "ngung_kinh_doanh" | "";
  sortBy?: "createdAt" | "name";
  sortDir?: "asc" | "desc";
  page?: number;
  vehicleModelId?: number;
  vehicleYear?: number;
}

export interface VehicleModelListResponse {
  data: VehicleModelItem[];
}

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
  isVisible?: boolean;
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

export interface BrandListItem {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
}
export interface BrandDetail extends BrandListItem {}

export interface BrandDetailResponse {
  data: BrandDetail;
  products: PaginatedResponse<ProductListItem>;
}

export interface VehicleBrandListItem {
  id: number;
  name: string;
  slug: string;
  countryOfOrigin: string | null;
  logoUrl: string | null;
}
export interface VehicleModelItem {
  id: number;
  name: string;
  slug: string;
  segment: string | null;
}
export interface VehicleBrandDetail extends VehicleBrandListItem {
  models: VehicleModelItem[];
}
export interface VehicleGenerationItem {
  id: number;
  name: string;
  yearStart: number;
  yearEnd: number | null;
}

export interface OemResult {
  productId: number;
  productName: string;
  productSlug: string;
  sku: string;
  matchedOemCode: string;
}

export interface SuggestionItem {
  type: "product" | "oem";
  label: string;
  value: string;
  slug?: string;
}

export interface SearchResult {
  id: number;
  slug: string;
  name: string;
  sku: string;
  featuredImage?: string | null;
}
