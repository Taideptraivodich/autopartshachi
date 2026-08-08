import type {
  PaginatedResponse,
  ProductListItem,
  ProductDetail,
  CategoryDetail,
  CategoryListItem,
  BrandListItem,
  BrandDetailResponse,
  VehicleBrandListItem,
  VehicleBrandDetail,
} from "./types";

const BASE = "http://localhost:3001/api";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ─────────────────────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────────────────────

export async function fetchProductList(
  page = 1,
  pageSize = 24,
): Promise<PaginatedResponse<ProductListItem>> {
  return apiFetch<PaginatedResponse<ProductListItem>>(
    `/san-pham?page=${page}&pageSize=${pageSize}`,
  );
}

export async function fetchProductBySlug(
  slug: string,
): Promise<{ data: ProductDetail }> {
  return apiFetch<{ data: ProductDetail }>(
    `/san-pham/${encodeURIComponent(slug)}`,
  );
}

export async function fetchProductsByCategoryId(
  categoryId: number,
  page = 1,
  pageSize = 24,
): Promise<PaginatedResponse<ProductListItem>> {
  return apiFetch<PaginatedResponse<ProductListItem>>(
    `/san-pham?categoryId=${categoryId}&page=${page}&pageSize=${pageSize}`,
  );
}

// ─────────────────────────────────────────────────────────────
// Categories
// ─────────────────────────────────────────────────────────────

export async function fetchAllCategories(): Promise<{ data: CategoryListItem[] }> {
  return apiFetch<{ data: CategoryListItem[] }>("/danh-muc");
}

export async function fetchCategoryBySlug(slug: string): Promise<{ data: CategoryDetail }> {
  return apiFetch<{ data: CategoryDetail }>(`/danh-muc/${encodeURIComponent(slug)}`);
}

// ─────────────────────────────────────────────────────────────
// Brands (product brand / thương hiệu phụ tùng)
// ─────────────────────────────────────────────────────────────

export async function fetchAllBrands(): Promise<{ data: BrandListItem[] }> {
  return apiFetch<{ data: BrandListItem[] }>("/thuong-hieu");
}

export async function fetchBrandBySlug(
  slug: string,
  page = 1,
  pageSize = 24,
): Promise<BrandDetailResponse> {
  return apiFetch<BrandDetailResponse>(
    `/thuong-hieu/${encodeURIComponent(slug)}?page=${page}&pageSize=${pageSize}`,
  );
}

// ─────────────────────────────────────────────────────────────
// Vehicle brands (hãng xe)
// ─────────────────────────────────────────────────────────────

export async function fetchAllVehicleBrands(): Promise<{ data: VehicleBrandListItem[] }> {
  return apiFetch<{ data: VehicleBrandListItem[] }>("/hang-xe");
}

export async function fetchVehicleBrandBySlug(slug: string): Promise<{ data: VehicleBrandDetail }> {
  return apiFetch<{ data: VehicleBrandDetail }>(`/hang-xe/${encodeURIComponent(slug)}`);
}

// ─────────────────────────────────────────────────────────────
// Home page featured data
// ─────────────────────────────────────────────────────────────

export async function fetchFeaturedProducts(
  pageSize = 8,
): Promise<PaginatedResponse<ProductListItem>> {
  return apiFetch<PaginatedResponse<ProductListItem>>(
    `/san-pham?page=1&pageSize=${pageSize}`,
  );
}
