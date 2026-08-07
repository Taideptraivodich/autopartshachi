export interface ProductBrandSummary { id: number; name: string; slug: string; }
export interface CategorySummary { id: number; name: string; slug: string; }

export interface ProductListItem {
  id: number; slug: string; name: string; sku: string; status: string;
  featuredImage: string | null; brand: ProductBrandSummary | null;
}

export interface ProductImage { id: number; imageUrl: string; altText: string | null; isThumbnail: boolean; displayOrder: number; }

export interface ProductDetail extends ProductListItem {
  description: string | null; specification: string | null;
  metaTitle: string | null; metaDescription: string | null;
  images: ProductImage[];
}

export interface CategoryDetail {
  id: number; name: string; slug: string; parentCategoryId: number | null; displayOrder: number;
  parent: { id: number; name: string; slug: string } | null;
  children: { id: number; name: string; slug: string; displayOrder: number }[];
}

export interface CategoryListItem { id: number; name: string; slug: string; parentCategoryId: number | null; displayOrder: number; }

export interface PaginatedResponse<T> { data: T[]; meta: { page: number; pageSize: number; total: number }; }

export interface CategoryDetailResponse { data: CategoryDetail; }

export interface OemCode { id: number; code: string; status: string; matchConfidence: string; issuingBrand: string | null; }

export interface CompatibilityEntry {
  brandName: string; brandSlug: string; modelName: string; modelSlug: string;
  generationName: string; yearStart: number; yearEnd: number | null;
  installationPosition: string; notes: string | null;
}
