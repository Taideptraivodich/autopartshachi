import { Router } from "express";
import { SearchController } from "../controllers/search.controller.js";

export function createSearchRouter(controller: SearchController): Router {
  const router = Router();
  // Các route cụ thể phải đặt TRƯỚC route có param hoặc wildcard
  // GET /api/search/goi-y?q=...
  router.get("/search/goi-y", controller.suggest);
  // GET /api/search/pho-bien?limit=4
  router.get("/search/pho-bien", controller.popular);
  // GET /api/search?q=...&page=1&pageSize=24
  router.get("/search", controller.search);
  return router;
}
