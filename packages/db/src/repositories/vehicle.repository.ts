import { eq } from "drizzle-orm";
import { type Database } from "../db/index.js";
import { vehicleBrand, vehicleGeneration, vehicleModel } from "../db/schema/vehicle.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type VehicleBrand = typeof vehicleBrand.$inferSelect;
export type VehicleModel = typeof vehicleModel.$inferSelect;
export type VehicleGeneration = typeof vehicleGeneration.$inferSelect;

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
      .where(eq(vehicleModel.vehicleBrandId, brandId) && eq(vehicleModel.isActive, true))
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
        eq(vehicleGeneration.vehicleModelId, modelId) &&
          eq(vehicleGeneration.isActive, true),
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
}
