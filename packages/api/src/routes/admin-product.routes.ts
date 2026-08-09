/**
 * Admin product routes
 * Chỉ wire Router → Controller. Không có logic ở đây.
 * Mounted tại /api/admin/san-pham, đã được bọc requireAdmin ở index.ts.
 */

import { Router } from "express";
import { AdminProductController } from "../controllers/admin-product.controller.js";

export function createAdminProductRouter(ctrl: AdminProductController): Router {
  const r = Router();
  r.get("/", ctrl.list.bind(ctrl));
  r.get("/:id", ctrl.detail.bind(ctrl));
  r.post("/", ctrl.create.bind(ctrl));
  r.put("/:id", ctrl.update.bind(ctrl));
  r.delete("/:id", ctrl.remove.bind(ctrl));
  return r;
}
