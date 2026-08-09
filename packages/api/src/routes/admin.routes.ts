/**
 * Admin routes
 * /api/admin/login  — public (no middleware)
 * /api/admin/*      — all other routes require JWT (requireAdmin middleware)
 *
 * Product-CRUD sub-routes (Handover #2) are mounted separately in index.ts
 * at /api/admin/san-pham, ahead of the generic health-check below.
 */

import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { requireAdmin } from "../middleware/require-admin.js";

export function createAdminRouter(authController: AuthController): Router {
  const router = Router();

  // Public: login (no requireAdmin)
  router.post("/admin/login", authController.login);

  // Protected health-check — only responds at exactly /admin or /admin/,
  // so it never shadows sub-routers (e.g. /admin/san-pham/*) mounted
  // elsewhere in index.ts.
  router.get("/admin", requireAdmin, (_req, res) => {
    res.json({ ok: true, message: "Admin area — authenticated" });
  });

  return router;
}
