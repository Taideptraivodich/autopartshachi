import { relations } from "drizzle-orm";
import { vehicleBrand, vehicleModel, vehicleGeneration } from "../schema/vehicle";
import { compatibility } from "../schema/compatibility";
import { oemNumber } from "../schema/oem";

export const vehicleBrandRelations = relations(vehicleBrand, ({ many }) => ({
  models: many(vehicleModel),
  // A VehicleBrand can also be the issuer of OemNumbers (02B §2.3)
  issuedOemNumbers: many(oemNumber),
}));

export const vehicleModelRelations = relations(vehicleModel, ({ one, many }) => ({
  brand: one(vehicleBrand, {
    fields: [vehicleModel.vehicleBrandId],
    references: [vehicleBrand.id],
  }),
  generations: many(vehicleGeneration),
}));

export const vehicleGenerationRelations = relations(vehicleGeneration, ({ one, many }) => ({
  model: one(vehicleModel, {
    fields: [vehicleGeneration.vehicleModelId],
    references: [vehicleModel.id],
  }),
  compatibilities: many(compatibility),
}));
