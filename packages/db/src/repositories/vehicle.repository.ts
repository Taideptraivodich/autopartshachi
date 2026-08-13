import { and, eq } from "drizzle-orm";
import { type Database } from "../db/index.js";
import { vehicleBrand, vehicleGeneration, vehicleModel } from "../db/schema/vehicle.js";
import { compatibility } from "../db/schema/compatibility.js";
import { product } from "../db/schema/product.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type VehicleBrand = typeof vehicleBrand.$inferSelect;
export type VehicleModel = typeof vehicleModel.$inferSelect;
export type VehicleGeneration = typeof vehicleGeneration.$inferSelect;

export interface VehicleBrandInput {
  name: string;
  slug: string;
  countryOfOrigin?: string | null;
  logoUrl?: string | null;
  isActive?: boolean;
}

export interface VehicleModelInput {
  vehicleBrandId: number;
  name: string;
  slug: string;
  segment?: string | null;
  isActive?: boolean;
}

export interface VehicleGenerationInput {
  vehicleModelId: number;
  name: string;
  yearStart: number;
  yearEnd?: number | null;
  isActive?: boolean;
}

export interface VehicleCompatibilityYearRange {
  yearStart: number;
  yearEnd: number | null;
}

// ---------------------------------------------------------------------------
// VehicleRepository
// ---------------------------------------------------------------------------

export class VehicleRepository {
  constructor(private readonly db: Database) {}

  async findBrands(): Promise<VehicleBrand[]> {
    return this.db
      .select()
      .from(vehicleBrand)
      .where(eq(vehicleBrand.isActive, true))
      .orderBy(vehicleBrand.name);
  }

  async findBrandById(id: number): Promise<VehicleBrand | undefined> {
    const rows = await this.db
      .select()
      .from(vehicleBrand)
      .where(eq(vehicleBrand.id, id))
      .limit(1);
    return rows[0];
  }

  async findBrandBySlug(slug: string): Promise<VehicleBrand | undefined> {
    const rows = await this.db
      .select()
      .from(vehicleBrand)
      .where(eq(vehicleBrand.slug, slug))
      .limit(1);
    return rows[0];
  }

  async findModels(brandId: number): Promise<VehicleModel[]> {
    return this.db
      .select()
      .from(vehicleModel)
      .where(and(eq(vehicleModel.vehicleBrandId, brandId), eq(vehicleModel.isActive, true)))
      .orderBy(vehicleModel.name);
  }

  async findModelById(id: number): Promise<VehicleModel | undefined> {
    const rows = await this.db
      .select()
      .from(vehicleModel)
      .where(eq(vehicleModel.id, id))
      .limit(1);
    return rows[0];
  }

  async findGenerations(modelId: number): Promise<VehicleGeneration[]> {
    return this.db
      .select()
      .from(vehicleGeneration)
      .where(and(eq(vehicleGeneration.vehicleModelId, modelId), eq(vehicleGeneration.isActive, true)))
      .orderBy(vehicleGeneration.yearStart);
  }

  async findGenerationById(id: number): Promise<VehicleGeneration | undefined> {
    const rows = await this.db
      .select()
      .from(vehicleGeneration)
      .where(eq(vehicleGeneration.id, id))
      .limit(1);
    return rows[0];
  }

  async findCompatibilityYearRangesByModelId(modelId: number): Promise<VehicleCompatibilityYearRange[]> {
    return this.db
      .selectDistinct({
        yearStart: compatibility.yearStart,
        yearEnd: compatibility.yearEnd,
      })
      .from(compatibility)
      .innerJoin(product, eq(compatibility.productId, product.id))
      .where(
        and(
          eq(compatibility.vehicleModelId, modelId),
          eq(product.isVisible, true),
        ),
      )
      .orderBy(compatibility.yearStart, compatibility.yearEnd);
  }

  async findAllBrandsAdmin(): Promise<VehicleBrand[]> {
    return this.db.select().from(vehicleBrand).orderBy(vehicleBrand.name);
  }

  async createBrand(input: VehicleBrandInput): Promise<VehicleBrand> {
    const rows = await this.db
      .insert(vehicleBrand)
      .values({
        name: input.name,
        slug: input.slug,
        countryOfOrigin: input.countryOfOrigin,
        logoUrl: input.logoUrl,
        isActive: input.isActive ?? true,
      })
      .returning();
    return rows[0]!;
  }

  async updateBrand(id: number, input: Partial<VehicleBrandInput>): Promise<VehicleBrand | undefined> {
    const rows = await this.db
      .update(vehicleBrand)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(vehicleBrand.id, id))
      .returning();
    return rows[0];
  }

  async deleteBrand(id: number): Promise<boolean> {
    const rows = await this.db
      .delete(vehicleBrand)
      .where(eq(vehicleBrand.id, id))
      .returning({ id: vehicleBrand.id });
    return rows.length > 0;
  }

  async findAllModelsAdmin(brandId: number): Promise<VehicleModel[]> {
    return this.db
      .select()
      .from(vehicleModel)
      .where(eq(vehicleModel.vehicleBrandId, brandId))
      .orderBy(vehicleModel.name);
  }

  async createModel(input: VehicleModelInput): Promise<VehicleModel> {
    const rows = await this.db
      .insert(vehicleModel)
      .values({
        vehicleBrandId: input.vehicleBrandId,
        name: input.name,
        slug: input.slug,
        segment: input.segment,
        isActive: input.isActive ?? true,
      })
      .returning();
    return rows[0]!;
  }

  async updateModel(id: number, input: Partial<VehicleModelInput>): Promise<VehicleModel | undefined> {
    const rows = await this.db
      .update(vehicleModel)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(vehicleModel.id, id))
      .returning();
    return rows[0];
  }

  async deleteModel(id: number): Promise<boolean> {
    const rows = await this.db
      .delete(vehicleModel)
      .where(eq(vehicleModel.id, id))
      .returning({ id: vehicleModel.id });
    return rows.length > 0;
  }

  async findAllGenerationsAdmin(modelId: number): Promise<VehicleGeneration[]> {
    return this.db
      .select()
      .from(vehicleGeneration)
      .where(eq(vehicleGeneration.vehicleModelId, modelId))
      .orderBy(vehicleGeneration.yearStart);
  }

  async createGeneration(input: VehicleGenerationInput): Promise<VehicleGeneration> {
    const rows = await this.db
      .insert(vehicleGeneration)
      .values({
        vehicleModelId: input.vehicleModelId,
        name: input.name,
        yearStart: input.yearStart,
        yearEnd: input.yearEnd,
        isActive: input.isActive ?? true,
      })
      .returning();
    return rows[0]!;
  }

  async updateGeneration(
    id: number,
    input: Partial<VehicleGenerationInput>,
  ): Promise<VehicleGeneration | undefined> {
    const rows = await this.db
      .update(vehicleGeneration)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(vehicleGeneration.id, id))
      .returning();
    return rows[0];
  }

  async deleteGeneration(id: number): Promise<boolean> {
    const rows = await this.db
      .delete(vehicleGeneration)
      .where(eq(vehicleGeneration.id, id))
      .returning({ id: vehicleGeneration.id });
    return rows.length > 0;
  }

  // ── Compatibility ──────────────────────────────────────────────────────

  async setCompatibility(
    productId: number,
    entries: {
      vehicleModelId: number;
      yearStart: number;
      yearEnd?: number | null;
      installationPosition: string;
      notes?: string | null;
    }[],
  ): Promise<void> {
    await this.db.delete(compatibility).where(eq(compatibility.productId, productId));
    if (entries.length === 0) return;

    await this.db.insert(compatibility).values(
      entries.map((e) => ({
        productId,
        vehicleModelId: e.vehicleModelId,
        yearStart: e.yearStart,
        yearEnd: e.yearEnd ?? null,
        installationPosition: e.installationPosition,
        notes: e.notes ?? null,
      })),
    );
  }

  async findCompatibilityByProductId(
    productId: number,
  ): Promise<{
    vehicleModelId: number;
    yearStart: number;
    yearEnd: number | null;
    installationPosition: string;
    notes: string | null;
  }[]> {
    return this.db
      .select({
        vehicleModelId: compatibility.vehicleModelId,
        yearStart: compatibility.yearStart,
        yearEnd: compatibility.yearEnd,
        installationPosition: compatibility.installationPosition,
        notes: compatibility.notes,
      })
      .from(compatibility)
      .where(eq(compatibility.productId, productId));
  }
}
