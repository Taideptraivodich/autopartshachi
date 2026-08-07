/**
 * Category routes
 * Chỉ wire Router → Controller. Không có logic ở đây.
 */

import { Router } from "express";
import { CategoryController } from "../controllers/category.controller.js";

export function createCategoryRouter(controller: CategoryController): Router {
  const router = Router();

  // GET /api/danh-muc
  router.get("/danh-muc", controller.getCategories);

  // GET /api/danh-muc/:slug
  router.get("/danh-muc/:slug", controller.getCategoryBySlug);

  return router;
}
