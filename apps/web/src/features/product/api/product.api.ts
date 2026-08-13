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

const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001/api";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

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
  if (filters.vehicleModelId) params.set("vehicleModelId", String(filters.vehicleModelId));
  if (filters.vehicleYear) params.set("vehicleYear", String(filters.vehicleYear));
  return apiFetch<PaginatedResponse<ProductListItem>>(`/san-pham?${params}`);
}

export async function fetchRelatedProducts(slug: string, limit = 8): Promise<{ data: ProductListItem[] }> {
  return apiFetch<{ data: ProductListItem[] }>(`/san-pham/${encodeURIComponent(slug)}/lien-quan?limit=${limit}`);
}

export async function fetchProductBySlug(slug: string): Promise<{ data: ProductDetail }> {
  return apiFetch<{ data: ProductDetail }>(`/san-pham/${encodeURIComponent(slug)}`);
}

export async function fetchProductsByCategoryId(
  categoryId: number,
  page = 1,
  pageSize = 24,
): Promise<PaginatedResponse<ProductListItem>> {
  return apiFetch<PaginatedResponse<ProductListItem>>(`/san-pham?categoryId=${categoryId}&page=${page}&pageSize=${pageSize}`);
}

export async function fetchAllCategories(): Promise<{ data: CategoryListItem[] }> {
  return apiFetch<{ data: CategoryListItem[] }>("/danh-muc");
}

export async function fetchCategoryBySlug(slug: string): Promise<{ data: CategoryDetail }> {
  return apiFetch<{ data: CategoryDetail }>(`/danh-muc/${encodeURIComponent(slug)}`);
}

export async function fetchAllBrands(): Promise<{ data: BrandListItem[] }> {
  return apiFetch<{ data: BrandListItem[] }>("/thuong-hieu");
}

export async function fetchBrandBySlug(slug: string, page = 1, pageSize = 24): Promise<BrandDetailResponse> {
  return apiFetch<BrandDetailResponse>(`/thuong-hieu/${encodeURIComponent(slug)}?page=${page}&pageSize=${pageSize}`);
}

export async function fetchAllVehicleBrands(): Promise<{ data: VehicleBrandListItem[] }> {
  return apiFetch<{ data: VehicleBrandListItem[] }>("/hang-xe");
}

export async function fetchVehicleBrandBySlug(slug: string): Promise<{ data: VehicleBrandDetail }> {
  return apiFetch<{ data: VehicleBrandDetail }>(`/hang-xe/${encodeURIComponent(slug)}`);
}

export async function fetchVehicleGenerationsByModelId(modelId: number): Promise<{ data: VehicleGenerationItem[] }> {
  return apiFetch<{ data: VehicleGenerationItem[] }>(`/hang-xe/dong-xe/${modelId}/doi-xe`);
}

export async function fetchFeaturedProducts(pageSize = 8): Promise<PaginatedResponse<ProductListItem>> {
  return apiFetch<PaginatedResponse<ProductListItem>>(`/san-pham?page=1&pageSize=${pageSize}`);
}

export async function fetchSearch(keyword: string): Promise<{ data: SearchResult[] }> {
  return apiFetch<{ data: SearchResult[] }>(`/search?q=${encodeURIComponent(keyword)}`);
}

export async function fetchSearchSuggestions(query: string): Promise<{ data: SuggestionItem[] }> {
  return apiFetch<{ data: SuggestionItem[] }>(`/search/goi-y?q=${encodeURIComponent(query)}`);
}

export async function fetchOemLookup(code: string): Promise<{ data: OemResult[] }> {
  return apiFetch<{ data: OemResult[] }>(`/oem?code=${encodeURIComponent(code)}`);
}

export async function fetchModelsByBrandId(brandId: number): Promise<VehicleModelListResponse> {
  return apiFetch<VehicleModelListResponse>(`/hang-xe/${brandId}/dong-xe`);
}

export async function fetchProductsByVehicle(
  vehicleModelId: number,
  vehicleYear: number,
  page = 1,
  pageSize = 24,
): Promise<PaginatedResponse<ProductListItem>> {
  return fetchProductList(page, pageSize, { vehicleModelId, vehicleYear });
}

export type { OemResult, SuggestionItem };

export async function submitLead(payload: {
  name: string;
  phone: string;
  message?: string;
  productName?: string;
  productSku?: string;
  source?: string;
}): Promise<{ data: { id: number } }> {
  const res = await fetch(`${BASE}/lien-he`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<{ data: { id: number } }>;
}
