/**
 * Admin settings routes
 * GET  /api/settings          — public read (frontend config)
 * GET  /api/admin/settings    — admin read
 * PATCH /api/admin/settings   — admin write (bulk upsert)
 */

import { Router } from "express";
import { AdminSettingsController } from "../controllers/admin-settings.controller.js";

export function createSettingsRouter(ctrl: AdminSettingsController): Router {
  const r = Router();
  r.get("/settings", ctrl.getAll);
  return r;
}

export function createAdminSettingsRouter(ctrl: AdminSettingsController): Router {
  const r = Router();
  r.get("/", ctrl.getAll);
  r.patch("/", ctrl.patchMany);
  return r;
}
