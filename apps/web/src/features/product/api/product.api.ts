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
  VehicleGenerationItem,
  VehicleModelListResponse,
  OemResult,
  SearchResult,
  SuggestionItem,
  ProductFilterParams,
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
  filters: Omit<ProductFilterParams, "page"> = {},
): Promise<PaginatedResponse<ProductListItem>> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  if (filters.brandId) params.set("brandId", String(filters.brandId));
  if (filters.categoryId) params.set("categoryId", String(filters.categoryId));
  if (filters.status) params.set("status", filters.status);
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortDir) params.set("sortDir", filters.sortDir);
  if (filters.vehicleGenerationId) params.set("vehicleGenerationId", String(filters.vehicleGenerationId));
  return apiFetch<PaginatedResponse<ProductListItem>>(`/san-pham?${params}`);
}

export async function fetchRelatedProducts(
  slug: string,
  limit = 8,
): Promise<{ data: ProductListItem[] }> {
  return apiFetch<{ data: ProductListItem[] }>(
    `/san-pham/${encodeURIComponent(slug)}/lien-quan?limit=${limit}`,
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

export async function fetchAllCategories(): Promise<{
  data: CategoryListItem[];
}> {
  return apiFetch<{ data: CategoryListItem[] }>("/danh-muc");
}

export async function fetchCategoryBySlug(
  slug: string,
): Promise<{ data: CategoryDetail }> {
  return apiFetch<{ data: CategoryDetail }>(
    `/danh-muc/${encodeURIComponent(slug)}`,
  );
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

export async function fetchAllVehicleBrands(): Promise<{
  data: VehicleBrandListItem[];
}> {
  return apiFetch<{ data: VehicleBrandListItem[] }>("/hang-xe");
}

export async function fetchVehicleBrandBySlug(
  slug: string,
): Promise<{ data: VehicleBrandDetail }> {
  return apiFetch<{ data: VehicleBrandDetail }>(
    `/hang-xe/${encodeURIComponent(slug)}`,
  );
}

export async function fetchVehicleGenerationsByModelId(
  modelId: number,
): Promise<{ data: VehicleGenerationItem[] }> {
  return apiFetch<{ data: VehicleGenerationItem[] }>(
    `/hang-xe/dong-xe/${modelId}/doi-xe`,
  );
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

// ─────────────────────────────────────────────────────────────
// Search
// ─────────────────────────────────────────────────────────────

export async function fetchSearch(
  keyword: string,
): Promise<{ data: SearchResult[] }> {
  return apiFetch<{ data: SearchResult[] }>(
    `/search?q=${encodeURIComponent(keyword)}`,
  );
}

export async function fetchSearchSuggestions(
  query: string,
): Promise<{ data: SuggestionItem[] }> {
  return apiFetch<{ data: SuggestionItem[] }>(
    `/search/goi-y?q=${encodeURIComponent(query)}`,
  );
}

// ─────────────────────────────────────────────────────────────
// OEM lookup
// ─────────────────────────────────────────────────────────────

export async function fetchOemLookup(
  code: string,
): Promise<{ data: OemResult[] }> {
  return apiFetch<{ data: OemResult[] }>(
    `/oem?code=${encodeURIComponent(code)}`,
  );
}

// Lấy models theo brandId — dùng cho VehicleSelector dropdown
export async function fetchModelsByBrandId(
  brandId: number,
): Promise<VehicleModelListResponse> {
  return apiFetch<VehicleModelListResponse>(`/hang-xe/${brandId}/dong-xe`);
}

// Lấy sản phẩm tương thích với đời xe
export async function fetchProductsByVehicle(
  vehicleGenerationId: number,
  page = 1,
  pageSize = 24,
): Promise<PaginatedResponse<ProductListItem>> {
  return apiFetch<PaginatedResponse<ProductListItem>>(
    `/san-pham?vehicleGenerationId=${vehicleGenerationId}&page=${page}&pageSize=${pageSize}`,
  );
}

export type { OemResult, SuggestionItem };
