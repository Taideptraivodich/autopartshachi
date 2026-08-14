/**
 * AdminProductService
 * Business logic cho CRUD sản phẩm (admin only).
 * Chỉ được gọi Repository, không được query DB trực tiếp.
 *
 * Kiến trúc: Controller → Service → Repository → Database
 */

import {
  ProductRepository,
  type NewProductInput,
} from "autoparts-db/repositories";
import { OemRepository, VehicleRepository } from "autoparts-db/repositories";

export interface CreateProductPayload {
  productBrandId: number;
  sku: string;
  name: string;
  description?: string;
  specification?: string;
  status?: "con_hang" | "het_hang" | "ngung_kinh_doanh";
  metaTitle?: string;
  metaDescription?: string;
  categoryIds?: number[];
  images?: {
    imageUrl: string;
    altText?: string;
    isThumbnail?: boolean;
    displayOrder?: number;
  }[];
  oemCodes?: string[];
  compatibility?: {
    vehicleModelId: number;
    yearStart: number | null;
    yearEnd?: number | null;
    installationPosition: string;
    notes?: string | null;
  }[];
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

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
  images: {
    imageUrl: string;
    altText: string | null;
    isThumbnail: boolean;
    displayOrder: number;
  }[];
  categoryIds: number[];
  oemCodes: string[];
  compatibility: {
    vehicleModelId: number;
    yearStart: number | null;
    yearEnd: number | null;
    installationPosition: string;
    notes: string | null;
  }[];
}

function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export class AdminProductService {
  constructor(
    private readonly productRepo: ProductRepository,
    private readonly oemRepo: OemRepository,
    private readonly vehicleRepo: VehicleRepository,
  ) {}

  private async generateUniqueSlug(name: string): Promise<string> {
    const slugBase = slugify(name);
    const existing = await this.productRepo.findBySlugLike(slugBase);
    if (!existing.includes(slugBase)) return slugBase;
    let n = 2;
    while (existing.includes(`${slugBase}-${n}`)) n += 1;
    return `${slugBase}-${n}`;
  }

  async create(payload: CreateProductPayload): Promise<{ id: number }> {
    const slug = await this.generateUniqueSlug(payload.name);
    const newProduct: NewProductInput = {
      productBrandId: payload.productBrandId,
      sku: payload.sku,
      name: payload.name,
      slug,
      description: payload.description,
      specification: payload.specification,
      status: payload.status,
      metaTitle: payload.metaTitle,
      metaDescription: payload.metaDescription,
    };

    const id = await this.productRepo.create(newProduct);
    if (payload.categoryIds !== undefined) await this.productRepo.setCategories(id, payload.categoryIds);
    if (payload.images !== undefined) await this.productRepo.setImages(id, payload.images);
    if (payload.oemCodes !== undefined) {
      const oemNumberIds = await Promise.all(
        payload.oemCodes.map((code) => this.oemRepo.findOrCreateByCode(code)),
      );
      await this.oemRepo.setOemMappings(id, oemNumberIds);
    }
    if (payload.compatibility !== undefined) await this.vehicleRepo.setCompatibility(id, payload.compatibility);

    return { id };
  }

  async update(id: number, payload: UpdateProductPayload): Promise<{ id: number }> {
    const fields: Partial<NewProductInput> = {};
    if (payload.productBrandId !== undefined) fields.productBrandId = payload.productBrandId;
    if (payload.sku !== undefined) fields.sku = payload.sku;
    if (payload.name !== undefined) fields.name = payload.name;
    if (payload.description !== undefined) fields.description = payload.description;
    if (payload.specification !== undefined) fields.specification = payload.specification;
    if (payload.status !== undefined) fields.status = payload.status;
    if (payload.metaTitle !== undefined) fields.metaTitle = payload.metaTitle;
    if (payload.metaDescription !== undefined) fields.metaDescription = payload.metaDescription;

    if (Object.keys(fields).length > 0) await this.productRepo.update(id, fields);
    if (payload.categoryIds !== undefined) await this.productRepo.setCategories(id, payload.categoryIds);
    if (payload.images !== undefined) await this.productRepo.setImages(id, payload.images);
    if (payload.oemCodes !== undefined) {
      const oemNumberIds = await Promise.all(
        payload.oemCodes.map((code) => this.oemRepo.findOrCreateByCode(code)),
      );
      await this.oemRepo.setOemMappings(id, oemNumberIds);
    }
    if (payload.compatibility !== undefined) await this.vehicleRepo.setCompatibility(id, payload.compatibility);

    return { id };
  }

  async remove(id: number): Promise<void> {
    await this.productRepo.delete(id);
  }

  async findAdminDetail(id: number): Promise<AdminProductDetail | null> {
    const detail = await this.productRepo.findById(id);
    if (!detail) return null;

    const [categoryIds, oemCodes, compatibility] = await Promise.all([
      this.productRepo.findCategoryIdsByProductId(id),
      this.oemRepo.findOemCodesByProductId(id),
      this.vehicleRepo.findCompatibilityByProductId(id),
    ]);

    return {
      id: detail.id,
      productBrandId: detail.productBrandId,
      sku: detail.sku,
      name: detail.name,
      slug: detail.slug,
      description: detail.description ?? null,
      specification: detail.specification ?? null,
      status: detail.status as "con_hang" | "het_hang" | "ngung_kinh_doanh",
      metaTitle: detail.metaTitle ?? null,
      metaDescription: detail.metaDescription ?? null,
      images: detail.images.map((img) => ({
        imageUrl: img.imageUrl,
        altText: img.altText,
        isThumbnail: img.isThumbnail,
        displayOrder: img.displayOrder,
      })),
      categoryIds,
      oemCodes: oemCodes.map((o) => o.code),
      compatibility,
    };
  }

  async setVisibility(id: number, isVisible: boolean): Promise<{ id: number; isVisible: boolean } | undefined> {
    return this.productRepo.setVisibility(id, isVisible);
  }
}
