/**
 * Admin routes
 * /api/admin/login  — public (no middleware)
 * /api/admin/*      — all other routes require JWT (requireAdmin middleware)
 *
 * Handover #2 will add product-CRUD sub-routes here under the protected router.
 */

import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { requireAdmin } from "../middleware/require-admin.js";

export function createAdminRouter(authController: AuthController): Router {
  const router = Router();

  // Public: login (no requireAdmin)
  router.post("/admin/login", authController.login);

  // Protected: all /api/admin/* routes below require valid JWT
  // Handover #2 mounts its sub-routers here, e.g.:
  //   router.use("/admin", requireAdmin, createProductAdminRouter(...))
  //
  // For now we register a simple health-check so the middleware can be tested.
  router.use("/admin", requireAdmin, ((_req, res) => {
    res.json({ ok: true, message: "Admin area — authenticated" });
  }) as Router);

  return router;
}
