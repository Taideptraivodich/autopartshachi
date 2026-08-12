import { adminApiFetch } from "./adminApiFetch";
import type { ProductListItem, PaginatedResponse } from "../../product/api/types";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface AdminProductListParams {
  page?: number;
  pageSize?: number;
  brandId?: number;
  categoryId?: number;
  status?: string;
  q?: string;
}

export interface AdminProductImagePayload {
  imageUrl: string;
  altText?: string;
  isThumbnail?: boolean;
  displayOrder?: number;
}

export interface AdminProductCompatibilityPayload {
  vehicleGenerationId: number;
  installationPosition: string;
}

export interface AdminProductPayload {
  productBrandId: number;
  sku: string;
  name: string;
  description?: string;
  specification?: string;
  status?: "con_hang" | "het_hang" | "ngung_kinh_doanh";
  categoryIds?: number[];
  images?: AdminProductImagePayload[];
  oemCodes?: string[];
  compatibility?: AdminProductCompatibilityPayload[];
}

export interface AdminProductDetail {
  id: number;
  productBrandId: number;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  specification: string | null;
  status: "con_hang" | "het_hang" | "ngung_kinh_doanh";
  metaTitle: string | null;
  metaDescription: string | null;
  images: AdminProductImagePayload[];
  categoryIds: number[];
  oemCodes: string[];
  compatibility: AdminProductCompatibilityPayload[];
}

// ─────────────────────────────────────────────────────────────
// API calls
// ─────────────────────────────────────────────────────────────

export async function listProductsAdmin(
  params: AdminProductListParams = {},
): Promise<PaginatedResponse<ProductListItem>> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.pageSize) qs.set("pageSize", String(params.pageSize));
  if (params.brandId) qs.set("brandId", String(params.brandId));
  if (params.categoryId) qs.set("categoryId", String(params.categoryId));
  if (params.status) qs.set("status", params.status);
  if (params.q) qs.set("q", params.q);

  const query = qs.toString();
  return adminApiFetch<PaginatedResponse<ProductListItem>>(
    `/admin/san-pham${query ? `?${query}` : ""}`,
  );
}

export async function toggleProductVisibility(
  id: number,
  isVisible: boolean,
): Promise<{ data: { id: number; isVisible: boolean } }> {
  return adminApiFetch<{ data: { id: number; isVisible: boolean } }>(
    `/admin/san-pham/${id}/visibility`,
    { method: "PATCH", body: JSON.stringify({ isVisible }) },
  );
}

export async function fetchProductAdminById(
  id: number,
): Promise<{ data: AdminProductDetail }> {
  return adminApiFetch<{ data: AdminProductDetail }>(`/admin/san-pham/${id}`);
}

export async function createProduct(
  payload: AdminProductPayload,
): Promise<{ data: { id: number } }> {
  return adminApiFetch<{ data: { id: number } }>("/admin/san-pham", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateProduct(
  id: number,
  payload: Partial<AdminProductPayload>,
): Promise<{ data: { id: number } }> {
  return adminApiFetch<{ data: { id: number } }>(`/admin/san-pham/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteProduct(id: number): Promise<void> {
  await adminApiFetch<void>(`/admin/san-pham/${id}`, { method: "DELETE" });
}
