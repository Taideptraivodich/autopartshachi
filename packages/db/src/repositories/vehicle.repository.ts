import { and, eq } from "drizzle-orm";
import { type Database } from "../db/index.js";
import { vehicleBrand, vehicleGeneration, vehicleModel } from "../db/schema/vehicle.js";
import { compatibility } from "../db/schema/compatibility.js";

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

// ---------------------------------------------------------------------------
// VehicleRepository
// ---------------------------------------------------------------------------

export class VehicleRepository {
  constructor(private readonly db: Database) {}

  // ── Vehicle Brands ──────────────────────────────────────────────────────

  /** Return all active vehicle brands, ordered by name. */
  async findBrands(): Promise<VehicleBrand[]> {
    return this.db
      .select()
      .from(vehicleBrand)
      .where(eq(vehicleBrand.isActive, true))
      .orderBy(vehicleBrand.name);
  }

  /** Find a vehicle brand by primary key. Returns undefined when not found. */
  async findBrandById(id: number): Promise<VehicleBrand | undefined> {
    const rows = await this.db
      .select()
      .from(vehicleBrand)
      .where(eq(vehicleBrand.id, id))
      .limit(1);

    return rows[0];
  }

  /** Find a vehicle brand by slug. Returns undefined when not found. */
  async findBrandBySlug(slug: string): Promise<VehicleBrand | undefined> {
    const rows = await this.db
      .select()
      .from(vehicleBrand)
      .where(eq(vehicleBrand.slug, slug))
      .limit(1);

    return rows[0];
  }

  // ── Vehicle Models ───────────────────────────────────────────────────────

  /**
   * Return all active models for a given vehicle brand, ordered by name.
   * Used to populate the model dropdown after the user selects a brand.
   */
  async findModels(brandId: number): Promise<VehicleModel[]> {
    return this.db
      .select()
      .from(vehicleModel)
      .where(and(eq(vehicleModel.vehicleBrandId, brandId), eq(vehicleModel.isActive, true)))
      .orderBy(vehicleModel.name);
  }

  /** Find a vehicle model by primary key. Returns undefined when not found. */
  async findModelById(id: number): Promise<VehicleModel | undefined> {
    const rows = await this.db
      .select()
      .from(vehicleModel)
      .where(eq(vehicleModel.id, id))
      .limit(1);

    return rows[0];
  }

  // ── Vehicle Generations ──────────────────────────────────────────────────

  /**
   * Return all active generations for a given vehicle model, ordered by
   * yearStart ascending (oldest first).
   * Used to populate the generation/year-range dropdown.
   */
  async findGenerations(modelId: number): Promise<VehicleGeneration[]> {
    return this.db
      .select()
      .from(vehicleGeneration)
      .where(
        and(
          eq(vehicleGeneration.vehicleModelId, modelId),
          eq(vehicleGeneration.isActive, true),
        ),
      )
      .orderBy(vehicleGeneration.yearStart);
  }

  /** Find a vehicle generation by primary key. Returns undefined when not found. */
  async findGenerationById(id: number): Promise<VehicleGeneration | undefined> {
    const rows = await this.db
      .select()
      .from(vehicleGeneration)
      .where(eq(vehicleGeneration.id, id))
      .limit(1);

    return rows[0];
  }

  // ── Admin CRUD — Brands ──────────────────────────────────────────────────

  /** Return all vehicle brands (active and inactive) — used by admin list. */
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

  // ── Admin CRUD — Models ──────────────────────────────────────────────────

  /** Return all models for a brand (active and inactive) — used by admin list. */
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

  // ── Admin CRUD — Generations ─────────────────────────────────────────────

  /** Return all generations for a model (active and inactive) — used by admin list. */
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

  // ── Admin CRUD (Handover #2) ────────────────────────────────────────────

  /**
   * Xóa toàn bộ compatibility của productId rồi insert lại.
   */
  async setCompatibility(
    productId: number,
    entries: { vehicleGenerationId: number; installationPosition: string }[],
  ): Promise<void> {
    await this.db.delete(compatibility).where(eq(compatibility.productId, productId));

    if (entries.length === 0) return;

    await this.db.insert(compatibility).values(
      entries.map((e) => ({
        productId,
        vehicleGenerationId: e.vehicleGenerationId,
        installationPosition: e.installationPosition,
      })),
    );
  }

  /** Return compatibility entries currently linked to a product (admin edit form). */
  async findCompatibilityByProductId(
    productId: number,
  ): Promise<{ vehicleGenerationId: number; installationPosition: string }[]> {
    const rows = await this.db
      .select({
        vehicleGenerationId: compatibility.vehicleGenerationId,
        installationPosition: compatibility.installationPosition,
      })
      .from(compatibility)
      .where(eq(compatibility.productId, productId));

    return rows;
  }
}
