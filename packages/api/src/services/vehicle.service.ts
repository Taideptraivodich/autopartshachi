/**
 * VehicleService
 * Business logic cho hãng xe / dòng xe.
 */

import { VehicleRepository, type VehicleBrand, type VehicleModel } from 'autoparts-db/repositories';

export interface VehicleBrandItem {
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

export interface VehicleBrandDetail extends VehicleBrandItem {
  models: VehicleModelItem[];
}

function mapBrand(b: VehicleBrand): VehicleBrandItem {
  return {
    id: b.id,
    name: b.name,
    slug: b.slug,
    countryOfOrigin: b.countryOfOrigin ?? null,
    logoUrl: b.logoUrl ?? null,
  };
}

function mapModel(m: VehicleModel): VehicleModelItem {
  return { id: m.id, name: m.name, slug: m.slug, segment: m.segment ?? null };
}

export class VehicleService {
  constructor(private readonly vehicleRepo: VehicleRepository) {}

  async getBrands(): Promise<VehicleBrandItem[]> {
    const rows = await this.vehicleRepo.findBrands();
    return rows.map(mapBrand);
  }

  async getBrandBySlug(slug: string): Promise<VehicleBrandDetail | null> {
    const brand = await this.vehicleRepo.findBrandBySlug(slug);
    if (!brand) return null;
    const models = await this.vehicleRepo.findModels(brand.id);
    return { ...mapBrand(brand), models: models.map(mapModel) };
  }
}
