/**
 * VehicleService
 * Business logic cho hãng xe / dòng xe.
 */

import {
  VehicleRepository,
  type VehicleBrand,
  type VehicleModel,
  type VehicleGeneration,
  type VehicleBrandInput,
  type VehicleModelInput,
  type VehicleGenerationInput,
} from 'autoparts-db/repositories';

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

export interface VehicleGenerationItem {
  id: number;
  name: string;
  yearStart: number;
  yearEnd: number | null;
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

function mapGeneration(g: VehicleGeneration): VehicleGenerationItem {
  return { id: g.id, name: g.name, yearStart: g.yearStart, yearEnd: g.yearEnd ?? null };
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

  async getModelsByBrandId(brandId: number): Promise<VehicleModelItem[]> {
    const models = await this.vehicleRepo.findModels(brandId);
    return models.map(mapModel);
  }

  /** Return generations for a given model id — used by the admin compatibility form. */
  async getGenerationsByModelId(modelId: number): Promise<VehicleGenerationItem[]> {
    const rows = await this.vehicleRepo.findGenerations(modelId);
    return rows.map(mapGeneration);
  }

  // ── Admin CRUD — Brands ──────────────────────────────────────────────────

  async adminListBrands(): Promise<VehicleBrand[]> {
    return this.vehicleRepo.findAllBrandsAdmin();
  }

  async adminCreateBrand(input: VehicleBrandInput): Promise<VehicleBrand> {
    return this.vehicleRepo.createBrand(input);
  }

  async adminUpdateBrand(id: number, input: Partial<VehicleBrandInput>): Promise<VehicleBrand | null> {
    const row = await this.vehicleRepo.updateBrand(id, input);
    return row ?? null;
  }

  async adminDeleteBrand(id: number): Promise<boolean> {
    return this.vehicleRepo.deleteBrand(id);
  }

  // ── Admin CRUD — Models ──────────────────────────────────────────────────

  async adminListModels(brandId: number): Promise<VehicleModel[]> {
    return this.vehicleRepo.findAllModelsAdmin(brandId);
  }

  async adminCreateModel(input: VehicleModelInput): Promise<VehicleModel> {
    return this.vehicleRepo.createModel(input);
  }

  async adminUpdateModel(id: number, input: Partial<VehicleModelInput>): Promise<VehicleModel | null> {
    const row = await this.vehicleRepo.updateModel(id, input);
    return row ?? null;
  }

  async adminDeleteModel(id: number): Promise<boolean> {
    return this.vehicleRepo.deleteModel(id);
  }

  // ── Admin CRUD — Generations ─────────────────────────────────────────────

  async adminListGenerations(modelId: number): Promise<VehicleGeneration[]> {
    return this.vehicleRepo.findAllGenerationsAdmin(modelId);
  }

  async adminCreateGeneration(input: VehicleGenerationInput): Promise<VehicleGeneration> {
    return this.vehicleRepo.createGeneration(input);
  }

  async adminUpdateGeneration(
    id: number,
    input: Partial<VehicleGenerationInput>,
  ): Promise<VehicleGeneration | null> {
    const row = await this.vehicleRepo.updateGeneration(id, input);
    return row ?? null;
  }

  async adminDeleteGeneration(id: number): Promise<boolean> {
    return this.vehicleRepo.deleteGeneration(id);
  }
}
