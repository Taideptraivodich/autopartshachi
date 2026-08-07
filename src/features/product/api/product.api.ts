import type {
  PaginatedResponse,
  ProductListItem,
  ProductDetail,
  CategoryDetailResponse,
  CategoryListItem,
} from './types';

const BASE = '/api';

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchProductList(page = 1, pageSize = 24): Promise<PaginatedResponse<ProductListItem>> {
  return apiFetch<PaginatedResponse<ProductListItem>>(`/san-pham?page=${page}&pageSize=${pageSize}`);
}

export async function fetchProductBySlug(slug: string): Promise<{ data: ProductDetail }> {
  return apiFetch<{ data: ProductDetail }>(`/san-pham/${encodeURIComponent(slug)}`);
}

export async function fetchProductsByCategoryId(categoryId: number, page = 1, pageSize = 24): Promise<PaginatedResponse<ProductListItem>> {
  return apiFetch<PaginatedResponse<ProductListItem>>(`/san-pham?categoryId=${categoryId}&page=${page}&pageSize=${pageSize}`);
}

export async function fetchAllCategories(): Promise<{ data: CategoryListItem[] }> {
  return apiFetch<{ data: CategoryListItem[] }>('/danh-muc');
}

export async function fetchCategoryBySlug(slug: string): Promise<CategoryDetailResponse> {
  return apiFetch<CategoryDetailResponse>(`/danh-muc/${encodeURIComponent(slug)}`);
}
