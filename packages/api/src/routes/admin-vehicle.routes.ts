/**
 * Admin vehicle routes — mounted at /api/admin/hang-xe
 * CRUD 3 cấp: brand → model → generation.
 * Tất cả route đã được bọc requireAdmin ở index.ts.
 */

import { Router, type Request, type Response } from "express";
import { VehicleService } from "../services/vehicle.service.js";
import { logger } from "../lib/logger.js";

function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createAdminVehicleRouter(vehicleService: VehicleService): Router {
  const r = Router();

  // ── Brands ────────────────────────────────────────────────────────────

  // GET /api/admin/hang-xe
  r.get("/", async (_req: Request, res: Response) => {
    try {
      const data = await vehicleService.adminListBrands();
      res.json({ data });
    } catch (err) {
      logger.error("adminListBrands error", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // POST /api/admin/hang-xe
  r.post("/", async (req: Request, res: Response) => {
    try {
      const { name, countryOfOrigin, logoUrl, isActive } = req.body as {
        name?: string;
        countryOfOrigin?: string;
        logoUrl?: string;
        isActive?: boolean;
      };
      if (!name?.trim()) {
        res.status(400).json({ error: "name is required" });
        return;
      }
      const slug = slugify(name.trim());
      const brand = await vehicleService.adminCreateBrand({
        name: name.trim(),
        slug,
        countryOfOrigin,
        logoUrl,
        isActive,
      });
      res.status(201).json({ data: brand });
    } catch (err) {
      logger.error("adminCreateBrand error", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // PUT /api/admin/hang-xe/:id
  r.put("/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (!id) { res.status(400).json({ error: "Invalid id" }); return; }
      const { name, countryOfOrigin, logoUrl, isActive } = req.body as {
        name?: string;
        countryOfOrigin?: string;
        logoUrl?: string;
        isActive?: boolean;
      };
      const updates: {
        name?: string;
        slug?: string;
        countryOfOrigin?: string;
        logoUrl?: string;
        isActive?: boolean;
      } = {};
      if (name?.trim()) { updates.name = name.trim(); updates.slug = slugify(name.trim()); }
      if (typeof countryOfOrigin === "string") updates.countryOfOrigin = countryOfOrigin;
      if (typeof logoUrl === "string") updates.logoUrl = logoUrl;
      if (typeof isActive === "boolean") updates.isActive = isActive;
      const brand = await vehicleService.adminUpdateBrand(id, updates);
      if (!brand) { res.status(404).json({ error: "Not found" }); return; }
      res.json({ data: brand });
    } catch (err) {
      logger.error("adminUpdateBrand error", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // DELETE /api/admin/hang-xe/:id
  r.delete("/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (!id) { res.status(400).json({ error: "Invalid id" }); return; }
      const deleted = await vehicleService.adminDeleteBrand(id);
      if (!deleted) { res.status(404).json({ error: "Not found" }); return; }
      res.json({ ok: true });
    } catch (err) {
      logger.error("adminDeleteBrand error", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ── Models ────────────────────────────────────────────────────────────

  // GET /api/admin/hang-xe/:brandId/dong-xe
  r.get("/:brandId/dong-xe", async (req: Request, res: Response) => {
    try {
      const brandId = parseInt(String(req.params.brandId), 10);
      if (!brandId) { res.status(400).json({ error: "Invalid brandId" }); return; }
      const data = await vehicleService.adminListModels(brandId);
      res.json({ data });
    } catch (err) {
      logger.error("adminListModels error", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // POST /api/admin/hang-xe/:brandId/dong-xe
  r.post("/:brandId/dong-xe", async (req: Request, res: Response) => {
    try {
      const brandId = parseInt(String(req.params.brandId), 10);
      if (!brandId) { res.status(400).json({ error: "Invalid brandId" }); return; }
      const { name, segment, isActive } = req.body as {
        name?: string;
        segment?: string;
        isActive?: boolean;
      };
      if (!name?.trim()) {
        res.status(400).json({ error: "name is required" });
        return;
      }
      const slug = slugify(name.trim());
      const model = await vehicleService.adminCreateModel({
        vehicleBrandId: brandId,
        name: name.trim(),
        slug,
        segment,
        isActive,
      });
      res.status(201).json({ data: model });
    } catch (err) {
      logger.error("adminCreateModel error", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // PUT /api/admin/hang-xe/dong-xe/:id
  r.put("/dong-xe/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (!id) { res.status(400).json({ error: "Invalid id" }); return; }
      const { name, segment, isActive } = req.body as {
        name?: string;
        segment?: string;
        isActive?: boolean;
      };
      const updates: { name?: string; slug?: string; segment?: string; isActive?: boolean } = {};
      if (name?.trim()) { updates.name = name.trim(); updates.slug = slugify(name.trim()); }
      if (typeof segment === "string") updates.segment = segment;
      if (typeof isActive === "boolean") updates.isActive = isActive;
      const model = await vehicleService.adminUpdateModel(id, updates);
      if (!model) { res.status(404).json({ error: "Not found" }); return; }
      res.json({ data: model });
    } catch (err) {
      logger.error("adminUpdateModel error", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // DELETE /api/admin/hang-xe/dong-xe/:id
  r.delete("/dong-xe/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (!id) { res.status(400).json({ error: "Invalid id" }); return; }
      const deleted = await vehicleService.adminDeleteModel(id);
      if (!deleted) { res.status(404).json({ error: "Not found" }); return; }
      res.json({ ok: true });
    } catch (err) {
      logger.error("adminDeleteModel error", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ── Generations ───────────────────────────────────────────────────────

  // GET /api/admin/hang-xe/dong-xe/:modelId/doi-xe
  r.get("/dong-xe/:modelId/doi-xe", async (req: Request, res: Response) => {
    try {
      const modelId = parseInt(String(req.params.modelId), 10);
      if (!modelId) { res.status(400).json({ error: "Invalid modelId" }); return; }
      const data = await vehicleService.adminListGenerations(modelId);
      res.json({ data });
    } catch (err) {
      logger.error("adminListGenerations error", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // POST /api/admin/hang-xe/dong-xe/:modelId/doi-xe
  r.post("/dong-xe/:modelId/doi-xe", async (req: Request, res: Response) => {
    try {
      const modelId = parseInt(String(req.params.modelId), 10);
      if (!modelId) { res.status(400).json({ error: "Invalid modelId" }); return; }
      const { name, yearStart, yearEnd, isActive } = req.body as {
        name?: string;
        yearStart?: number;
        yearEnd?: number | null;
        isActive?: boolean;
      };
      if (!name?.trim() || typeof yearStart !== "number") {
        res.status(400).json({ error: "name and yearStart are required" });
        return;
      }
      const generation = await vehicleService.adminCreateGeneration({
        vehicleModelId: modelId,
        name: name.trim(),
        yearStart,
        yearEnd: yearEnd ?? null,
        isActive,
      });
      res.status(201).json({ data: generation });
    } catch (err) {
      logger.error("adminCreateGeneration error", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // PUT /api/admin/hang-xe/doi-xe/:id
  r.put("/doi-xe/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (!id) { res.status(400).json({ error: "Invalid id" }); return; }
      const { name, yearStart, yearEnd, isActive } = req.body as {
        name?: string;
        yearStart?: number;
        yearEnd?: number | null;
        isActive?: boolean;
      };
      const updates: { name?: string; yearStart?: number; yearEnd?: number | null; isActive?: boolean } = {};
      if (name?.trim()) updates.name = name.trim();
      if (typeof yearStart === "number") updates.yearStart = yearStart;
      if (yearEnd !== undefined) updates.yearEnd = yearEnd;
      if (typeof isActive === "boolean") updates.isActive = isActive;
      const generation = await vehicleService.adminUpdateGeneration(id, updates);
      if (!generation) { res.status(404).json({ error: "Not found" }); return; }
      res.json({ data: generation });
    } catch (err) {
      logger.error("adminUpdateGeneration error", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // DELETE /api/admin/hang-xe/doi-xe/:id
  r.delete("/doi-xe/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (!id) { res.status(400).json({ error: "Invalid id" }); return; }
      const deleted = await vehicleService.adminDeleteGeneration(id);
      if (!deleted) { res.status(404).json({ error: "Not found" }); return; }
      res.json({ ok: true });
    } catch (err) {
      logger.error("adminDeleteGeneration error", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return r;
}
