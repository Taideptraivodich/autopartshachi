import { relations } from "drizzle-orm";
import { oemNumber, oemMapping, oemReplacement, oemCrossReference } from "../schema/oem";
import { vehicleBrand } from "../schema/vehicle";
import { product } from "../schema/product";

export const oemNumberRelations = relations(oemNumber, ({ one, many }) => ({
  issuingVehicleBrand: one(vehicleBrand, {
    fields: [oemNumber.issuingVehicleBrandId],
    references: [vehicleBrand.id],
  }),
  mappings: many(oemMapping),
  // Directed self-relation: this code as the OLD side of a replacement
  replacedBy: many(oemReplacement, { relationName: "oemReplacementOld" }),
  // Directed self-relation: this code as the NEW side of a replacement
  replaces: many(oemReplacement, { relationName: "oemReplacementNew" }),
  // Symmetric self-relation, canonical order a < b
  crossReferencesAsA: many(oemCrossReference, { relationName: "oemCrossReferenceA" }),
  crossReferencesAsB: many(oemCrossReference, { relationName: "oemCrossReferenceB" }),
}));

export const oemMappingRelations = relations(oemMapping, ({ one }) => ({
  product: one(product, {
    fields: [oemMapping.productId],
    references: [product.id],
  }),
  oemNumber: one(oemNumber, {
    fields: [oemMapping.oemNumberId],
    references: [oemNumber.id],
  }),
}));

export const oemReplacementRelations = relations(oemReplacement, ({ one }) => ({
  oldOemNumber: one(oemNumber, {
    fields: [oemReplacement.oldOemNumberId],
    references: [oemNumber.id],
    relationName: "oemReplacementOld",
  }),
  newOemNumber: one(oemNumber, {
    fields: [oemReplacement.newOemNumberId],
    references: [oemNumber.id],
    relationName: "oemReplacementNew",
  }),
}));

export const oemCrossReferenceRelations = relations(oemCrossReference, ({ one }) => ({
  oemNumberA: one(oemNumber, {
    fields: [oemCrossReference.oemNumberIdA],
    references: [oemNumber.id],
    relationName: "oemCrossReferenceA",
  }),
  oemNumberB: one(oemNumber, {
    fields: [oemCrossReference.oemNumberIdB],
    references: [oemNumber.id],
    relationName: "oemCrossReferenceB",
  }),
}));
