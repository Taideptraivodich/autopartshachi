import { relations } from "drizzle-orm";
import { compatibility } from "../schema/compatibility";
import { product } from "../schema/product";
import { vehicleModel } from "../schema/vehicle";

export const compatibilityRelations = relations(compatibility, ({ one }) => ({
  product: one(product, {
    fields: [compatibility.productId],
    references: [product.id],
  }),
  vehicleModel: one(vehicleModel, {
    fields: [compatibility.vehicleModelId],
    references: [vehicleModel.id],
  }),
}));
