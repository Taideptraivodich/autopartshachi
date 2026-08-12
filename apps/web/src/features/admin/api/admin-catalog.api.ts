/**
 * Admin catalog API — thương hiệu, danh mục, cài đặt, hãng xe
 */
import { adminApiFetch } from "./adminApiFetch";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface AdminBrand {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
}

export interface AdminCategory {
  id: number;
  name: string;
  slug: string;
  parentCategoryId: number | null;
  isActive: boolean;
}

export interface AdminSetting {
  key: string;
  value: string;
}

export interface AdminVehicleBrand {
  id: number;
  name: string;
  slug: string;
  countryOfOrigin: string | null;
  logoUrl: string | null;
  isActive: boolean;
}

export interface AdminVehicleModel {
  id: number;
  vehicleBrandId: number;
  name: string;
  slug: string;
  segment: string | null;
  isActive: boolean;
}

export interface AdminVehicleGeneration {
  id: number;
  vehicleModelId: number;
  name: string;
  yearStart: number;
  yearEnd: number | null;
  isActive: boolean;
}

// ─────────────────────────────────────────────────────────────
// Product Brands (thương hiệu sản phẩm)
// ─────────────────────────────────────────────────────────────

export async function listAdminBrands(): Promise<AdminBrand[]> {
  const res = await adminApiFetch<{ data: AdminBrand[] }>("/admin/thuong-hieu");
  return res.data;
}

export async function createAdminBrand(
  name: string,
  isActive = true,
): Promise<AdminBrand> {
  const res = await adminApiFetch<{ data: AdminBrand }>("/admin/thuong-hieu", {
    method: "POST",
    body: JSON.stringify({ name, isActive }),
  });
  return res.data;
}

export async function updateAdminBrand(
  id: number,
  payload: { name?: string; isActive?: boolean },
): Promise<AdminBrand> {
  const res = await adminApiFetch<{ data: AdminBrand }>(`/admin/thuong-hieu/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deleteAdminBrand(id: number): Promise<void> {
  await adminApiFetch<void>(`/admin/thuong-hieu/${id}`, { method: "DELETE" });
}

// ─────────────────────────────────────────────────────────────
// Categories (danh mục)
// ─────────────────────────────────────────────────────────────

export async function listAdminCategories(): Promise<AdminCategory[]> {
  const res = await adminApiFetch<{ data: AdminCategory[] }>("/admin/danh-muc");
  return res.data;
}

export async function createAdminCategory(payload: {
  name: string;
  parentCategoryId?: number | null;
  isActive?: boolean;
}): Promise<AdminCategory> {
  const res = await adminApiFetch<{ data: AdminCategory }>("/admin/danh-muc", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function updateAdminCategory(
  id: number,
  payload: { name?: string; parentCategoryId?: number | null; isActive?: boolean },
): Promise<AdminCategory> {
  const res = await adminApiFetch<{ data: AdminCategory }>(`/admin/danh-muc/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deleteAdminCategory(id: number): Promise<void> {
  await adminApiFetch<void>(`/admin/danh-muc/${id}`, { method: "DELETE" });
}

// ─────────────────────────────────────────────────────────────
// Site Settings (cài đặt)
// ─────────────────────────────────────────────────────────────

export async function listAdminSettings(): Promise<AdminSetting[]> {
  const res = await adminApiFetch<{ data: Record<string, string> }>("/admin/settings");
  // Backend trả về flat map { key: value } — convert sang array
  return Object.entries(res.data).map(([key, value]) => ({ key, value }));
}

export async function updateAdminSettings(
  settings: Record<string, string>,
): Promise<AdminSetting[]> {
  const res = await adminApiFetch<{ data: Record<string, string> }>("/admin/settings", {
    method: "PATCH",
    body: JSON.stringify(settings),
  });
  return Object.entries(res.data).map(([key, value]) => ({ key, value }));
}

// ─────────────────────────────────────────────────────────────
// Vehicle Brands / Models / Generations (hãng xe)
// ─────────────────────────────────────────────────────────────

export async function listAdminVehicleBrands(): Promise<AdminVehicleBrand[]> {
  const res = await adminApiFetch<{ data: AdminVehicleBrand[] }>("/admin/hang-xe");
  return res.data;
}

export async function createAdminVehicleBrand(payload: {
  name: string;
  countryOfOrigin?: string;
  logoUrl?: string;
  isActive?: boolean;
}): Promise<AdminVehicleBrand> {
  const res = await adminApiFetch<{ data: AdminVehicleBrand }>("/admin/hang-xe", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function updateAdminVehicleBrand(
  id: number,
  payload: { name?: string; countryOfOrigin?: string; logoUrl?: string; isActive?: boolean },
): Promise<AdminVehicleBrand> {
  const res = await adminApiFetch<{ data: AdminVehicleBrand }>(`/admin/hang-xe/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deleteAdminVehicleBrand(id: number): Promise<void> {
  await adminApiFetch<void>(`/admin/hang-xe/${id}`, { method: "DELETE" });
}

export async function listAdminVehicleModels(brandId: number): Promise<AdminVehicleModel[]> {
  const res = await adminApiFetch<{ data: AdminVehicleModel[] }>(
    `/admin/hang-xe/${brandId}/dong-xe`,
  );
  return res.data;
}

export async function createAdminVehicleModel(
  brandId: number,
  payload: { name: string; segment?: string; isActive?: boolean },
): Promise<AdminVehicleModel> {
  const res = await adminApiFetch<{ data: AdminVehicleModel }>(
    `/admin/hang-xe/${brandId}/dong-xe`,
    { method: "POST", body: JSON.stringify(payload) },
  );
  return res.data;
}

export async function updateAdminVehicleModel(
  id: number,
  payload: { name?: string; segment?: string; isActive?: boolean },
): Promise<AdminVehicleModel> {
  const res = await adminApiFetch<{ data: AdminVehicleModel }>(
    `/admin/hang-xe/dong-xe/${id}`,
    { method: "PUT", body: JSON.stringify(payload) },
  );
  return res.data;
}

export async function deleteAdminVehicleModel(id: number): Promise<void> {
  await adminApiFetch<void>(`/admin/hang-xe/dong-xe/${id}`, { method: "DELETE" });
}

export async function listAdminVehicleGenerations(
  modelId: number,
): Promise<AdminVehicleGeneration[]> {
  const res = await adminApiFetch<{ data: AdminVehicleGeneration[] }>(
    `/admin/hang-xe/dong-xe/${modelId}/doi-xe`,
  );
  return res.data;
}

export async function createAdminVehicleGeneration(
  modelId: number,
  payload: { name: string; yearStart: number; yearEnd?: number | null; isActive?: boolean },
): Promise<AdminVehicleGeneration> {
  const res = await adminApiFetch<{ data: AdminVehicleGeneration }>(
    `/admin/hang-xe/dong-xe/${modelId}/doi-xe`,
    { method: "POST", body: JSON.stringify(payload) },
  );
  return res.data;
}

export async function updateAdminVehicleGeneration(
  id: number,
  payload: { name?: string; yearStart?: number; yearEnd?: number | null; isActive?: boolean },
): Promise<AdminVehicleGeneration> {
  const res = await adminApiFetch<{ data: AdminVehicleGeneration }>(
    `/admin/hang-xe/doi-xe/${id}`,
    { method: "PUT", body: JSON.stringify(payload) },
  );
  return res.data;
}

export async function deleteAdminVehicleGeneration(id: number): Promise<void> {
  await adminApiFetch<void>(`/admin/hang-xe/doi-xe/${id}`, { method: "DELETE" });
}

// ─────────────────────────────────────────────────────────────
// Leads
// ─────────────────────────────────────────────────────────────

export interface AdminLead {
  id: number;
  name: string;
  phone: string;
  message: string | null;
  productName: string | null;
  productSku: string | null;
  source: string;
  isRead: boolean;
  createdAt: string;
}

export interface AdminLeadListResult {
  data: AdminLead[];
  meta: { page: number; pageSize: number; total: number };
}

export async function listAdminLeads(params: {
  page?: number;
  pageSize?: number;
  onlyUnread?: boolean;
}): Promise<AdminLeadListResult> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.pageSize) qs.set("pageSize", String(params.pageSize));
  if (params.onlyUnread) qs.set("onlyUnread", "true");
  const query = qs.toString();
  return adminApiFetch<AdminLeadListResult>(`/admin/lead${query ? `?${query}` : ""}`);
}

export async function markLeadRead(id: number, isRead: boolean): Promise<AdminLead> {
  const res = await adminApiFetch<{ data: AdminLead }>(`/admin/lead/${id}/read`, {
    method: "PATCH",
    body: JSON.stringify({ isRead }),
  });
  return res.data;
}

export async function deleteAdminLead(id: number): Promise<void> {
  await adminApiFetch<void>(`/admin/lead/${id}`, { method: "DELETE" });
}

// ─────────────────────────────────────────────────────────────
// Image upload
// ─────────────────────────────────────────────────────────────

/**
 * Upload một ảnh từ File object → server lưu disk → trả về URL công khai.
 * Dùng trong AdminProductFormPage thay cho nhập URL tay.
 */
export async function uploadImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = reader.result as string;
        const res = await adminApiFetch<{ url: string }>("/admin/upload", {
          method: "POST",
          body: JSON.stringify({ dataUrl }),
        });
        resolve(res.url);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Không đọc được file"));
    reader.readAsDataURL(file);
  });
}
