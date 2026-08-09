import { Router } from "express";
import { SearchController } from "../controllers/search.controller.js";

export function createSearchRouter(controller: SearchController): Router {
  const router = Router();
  // GET /api/search/goi-y?q=... — phải đặt TRƯỚC /search để tránh conflict
  router.get("/search/goi-y", controller.suggest);
  // GET /api/search?q=...&page=1&pageSize=24
  router.get("/search", controller.search);
  return router;
}
