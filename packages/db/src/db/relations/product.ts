import { relations } from "drizzle-orm";
import {
  productBrand,
  productCategory,
  product,
  productImage,
  productCategoryMap,
} from "../schema/product";
import { compatibility } from "../schema/compatibility";
import { oemMapping } from "../schema/oem";

export const productBrandRelations = relations(productBrand, ({ many }) => ({
  products: many(product),
}));

export const productCategoryRelations = relations(productCategory, ({ one, many }) => ({
  parent: one(productCategory, {
    fields: [productCategory.parentCategoryId],
    references: [productCategory.id],
    relationName: "categoryParentChild",
  }),
  children: many(productCategory, { relationName: "categoryParentChild" }),
  categoryMaps: many(productCategoryMap),
}));

export const productRelations = relations(product, ({ one, many }) => ({
  brand: one(productBrand, {
    fields: [product.productBrandId],
    references: [productBrand.id],
  }),
  images: many(productImage),
  categoryMaps: many(productCategoryMap),
  compatibilities: many(compatibility),
  oemMappings: many(oemMapping),
}));

export const productImageRelations = relations(productImage, ({ one }) => ({
  product: one(product, {
    fields: [productImage.productId],
    references: [product.id],
  }),
}));

export const productCategoryMapRelations = relations(productCategoryMap, ({ one }) => ({
  product: one(product, {
    fields: [productCategoryMap.productId],
    references: [product.id],
  }),
  category: one(productCategory, {
    fields: [productCategoryMap.categoryId],
    references: [productCategory.id],
  }),
}));
