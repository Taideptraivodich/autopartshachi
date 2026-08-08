import { Router } from "express";
import { SearchController } from "../controllers/search.controller.js";

export function createSearchRouter(controller: SearchController): Router {
  const router = Router();
  // GET /api/search?q=...&page=1&pageSize=24
  router.get("/search", controller.search);
  return router;
}
