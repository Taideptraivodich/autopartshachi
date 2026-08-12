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

export function createAdminCategoryRouter(categoryService: CategoryService): Router {
  const r = Router();

  // GET /api/admin/danh-muc  — flat list (dùng cho admin UI)
  r.get("/", async (_req: Request, res: Response) => {
    try {
      const data = await categoryService.getCategories();
      res.json({ data });
    } catch (err) {
      logger.error("adminListCategories error", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // POST /api/admin/danh-muc
  r.post("/", async (req: Request, res: Response) => {
    try {
      const { name, parentCategoryId, displayOrder, isActive } = req.body as {
        name?: string;
        parentCategoryId?: number | null;
        displayOrder?: number;
        isActive?: boolean;
      };
      if (!name?.trim()) {
        res.status(400).json({ error: "name is required" });
        return;
      }
      const slug = slugify(name.trim());
      const cat = await categoryService.adminCreate({
        name: name.trim(),
        slug,
        parentCategoryId: parentCategoryId ?? null,
        displayOrder: displayOrder ?? 0,
        isActive: isActive ?? true,
      });
      res.status(201).json({ data: cat });
    } catch (err) {
      logger.error("adminCreateCategory error", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // PUT /api/admin/danh-muc/:id
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
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // DELETE /api/admin/danh-muc/:id
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
