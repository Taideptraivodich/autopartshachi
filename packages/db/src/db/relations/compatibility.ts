import { relations } from "drizzle-orm";
import { compatibility } from "../schema/compatibility";
import { product } from "../schema/product";
import { vehicleGeneration } from "../schema/vehicle";

export const compatibilityRelations = relations(compatibility, ({ one }) => ({
  product: one(product, {
    fields: [compatibility.productId],
    references: [product.id],
  }),
  vehicleGeneration: one(vehicleGeneration, {
    fields: [compatibility.vehicleGenerationId],
    references: [vehicleGeneration.id],
  }),
}));
