/**
 * Admin category routes — mounted at /api/admin/danh-muc
 * All routes already wrapped in requireAdmin in index.ts.
 */

import { Router, type Request, type Response } from "express";
import { CategoryService } from "../services/category.service.js";
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

export function createAdminCategoryRouter(categoryService: CategoryService): Router {
  const r = Router();

  r.get("/", async (_req: Request, res: Response) => {
    try {
      const data = await categoryService.getCategories();
      res.json({ data });
    } catch (err) {
      logger.error("adminListCategories error", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  r.post("/", async (req: Request, res: Response) => {
    try {
      const { name, parentCategoryId, displayOrder, isActive } = req.body as {
        name?: string;
        parentCategoryId?: number | null;
        displayOrder?: number;
        isActive?: boolean;
      };
      if (!name?.trim()) {
        res.status(400).json({ error: "Tên danh mục là bắt buộc" });
        return;
      }
      const trimmedName = name.trim();
      const slug = slugify(trimmedName);
      const existing = (await categoryService.getCategories()).find((category) => category.slug === slug);
      if (existing) {
        res.status(409).json({ error: `Danh mục "${existing.name}" đã tồn tại.` });
        return;
      }
      const cat = await categoryService.adminCreate({
        name: trimmedName,
        slug,
        parentCategoryId: parentCategoryId ?? null,
        displayOrder: displayOrder ?? 0,
        isActive: isActive ?? true,
      });
      res.status(201).json({ data: cat });
    } catch (err) {
      logger.error("adminCreateCategory error", err);
      if (isUniqueViolation(err)) {
        res.status(409).json({ error: "Danh mục này đã tồn tại." });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  r.put("/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (!id) { res.status(400).json({ error: "Invalid id" }); return; }
      const { name, parentCategoryId, displayOrder, isActive } = req.body as {
        name?: string;
        parentCategoryId?: number | null;
        displayOrder?: number;
        isActive?: boolean;
      };
      const updates: { name?: string; slug?: string; parentCategoryId?: number | null; displayOrder?: number; isActive?: boolean } = {};
      if (name?.trim()) { updates.name = name.trim(); updates.slug = slugify(name.trim()); }
      if (parentCategoryId !== undefined) updates.parentCategoryId = parentCategoryId;
      if (typeof displayOrder === "number") updates.displayOrder = displayOrder;
      if (typeof isActive === "boolean") updates.isActive = isActive;
      const cat = await categoryService.adminUpdate(id, updates);
      if (!cat) { res.status(404).json({ error: "Not found" }); return; }
      res.json({ data: cat });
    } catch (err) {
      logger.error("adminUpdateCategory error", err);
      if (isUniqueViolation(err)) {
        res.status(409).json({ error: "Tên danh mục hoặc slug đã tồn tại." });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  r.delete("/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (!id) { res.status(400).json({ error: "Invalid id" }); return; }
      const deleted = await categoryService.adminDelete(id);
      if (!deleted) { res.status(404).json({ error: "Not found" }); return; }
      res.json({ ok: true });
    } catch (err) {
      logger.error("adminDeleteCategory error", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return r;
}
