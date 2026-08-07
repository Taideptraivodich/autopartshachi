/**
 * Product routes
 * Chỉ wire Router → Controller. Không có logic ở đây.
 */

import { Router } from "express";
import { ProductController } from "../controllers/product.controller.js";

export function createProductRouter(controller: ProductController): Router {
  const router = Router();

  // GET /api/san-pham?page=1&pageSize=24
  router.get("/san-pham", controller.getProductList);

  // GET /api/san-pham/:slug/lien-quan — phải khai báo TRƯỚC /:slug
  router.get("/san-pham/:slug/lien-quan", controller.getRelatedProducts);

  // GET /api/san-pham/:slug
  router.get("/san-pham/:slug", controller.getProductBySlug);

  return router;
}
