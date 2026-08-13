/**
 * Admin brand routes — mounted at /api/admin/thuong-hieu
 * All routes already wrapped in requireAdmin in index.ts.
 */

import { Router, type Request, type Response } from "express";
import { BrandService } from "../services/brand.service.js";
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

function isUniqueViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code?: unknown }).code === "23505";
}

export function createAdminBrandRouter(brandService: BrandService): Router {
  const r = Router();

  r.get("/", async (_req: Request, res: Response) => {
    try {
      const data = await brandService.adminListBrands();
      res.json({ data });
    } catch (err) {
      logger.error("adminListBrands error", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  r.post("/", async (req: Request, res: Response) => {
    try {
      const { name, isActive, logoUrl } = req.body as { name?: string; isActive?: boolean; logoUrl?: string | null };
      if (!name?.trim()) {
        res.status(400).json({ error: "Tên thương hiệu là bắt buộc" });
        return;
      }
      const trimmedName = name.trim();
      const slug = slugify(trimmedName);
      const existing = (await brandService.adminListBrands()).find((brand) => brand.slug === slug);
      if (existing) {
        res.status(409).json({ error: `Thương hiệu "${existing.name}" đã tồn tại.` });
        return;
      }
      const brand = await brandService.adminCreateBrand({ name: trimmedName, slug, isActive, logoUrl });
      res.status(201).json({ data: brand });
    } catch (err) {
      logger.error("adminCreateBrand error", err);
      if (isUniqueViolation(err)) {
        res.status(409).json({ error: "Thương hiệu này đã tồn tại." });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  r.put("/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (!id) { res.status(400).json({ error: "Invalid id" }); return; }
      const { name, isActive, logoUrl } = req.body as { name?: string; isActive?: boolean; logoUrl?: string | null };
      const updates: { name?: string; slug?: string; logoUrl?: string | null; isActive?: boolean } = {};
      if (name?.trim()) { updates.name = name.trim(); updates.slug = slugify(name.trim()); }
      if (typeof isActive === "boolean") updates.isActive = isActive;
      if (logoUrl !== undefined) updates.logoUrl = logoUrl;
      const brand = await brandService.adminUpdateBrand(id, updates);
      if (!brand) { res.status(404).json({ error: "Not found" }); return; }
      res.json({ data: brand });
    } catch (err) {
      logger.error("adminUpdateBrand error", err);
      if (isUniqueViolation(err)) {
        res.status(409).json({ error: "Tên thương hiệu hoặc slug đã tồn tại." });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  r.delete("/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (!id) { res.status(400).json({ error: "Invalid id" }); return; }
      const deleted = await brandService.adminDeleteBrand(id);
      if (!deleted) { res.status(404).json({ error: "Not found" }); return; }
      res.json({ ok: true });
    } catch (err) {
      logger.error("adminDeleteBrand error", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return r;
}
