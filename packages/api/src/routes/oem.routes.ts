import { Router } from "express";
import { OemController } from "../controllers/oem.controller.js";

export function createOemRouter(controller: OemController): Router {
  const router = Router();
  // GET /api/oem?code=04465-BZ160
  router.get("/oem", controller.lookupByCode);
  return router;
}
