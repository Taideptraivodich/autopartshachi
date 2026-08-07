/**
 * CategoryController
 * Nhận Request → validate input → gọi CategoryService → trả Response.
 * Không chứa business logic. Không query DB.
 *
 * Response contract (không thay đổi):
 *   Danh sách : { data: [] }
 *   Chi tiết  : { data: {} }
 *   404       : { error: "Not found" }
 *   500       : { error: "Internal server error" }
 */

import { type Request, type Response } from "express";
import { CategoryService } from "../services/category.service.js";
import { logger } from "../lib/logger.js";

export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // GET /api/danh-muc
  getCategories = async (_req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.categoryService.getCategories();
      res.json({ data });
    } catch (err) {
      logger.error("[CategoryController.getCategories]", err);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  // GET /api/danh-muc/:slug
  getCategoryBySlug = async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params;
    try {
      if (!slug || typeof slug !== "string") {
        res.status(400).json({ error: "Slug không hợp lệ" });
        return;
      }

      const data = await this.categoryService.getCategoryBySlug(slug);
      if (!data) {
        res.status(404).json({ error: "Not found" });
        return;
      }

      res.json({ data });
    } catch (err) {
      logger.error(
        `[CategoryController.getCategoryBySlug] slug=${slug}`,
        err,
      );
      res.status(500).json({ error: "Internal server error" });
    }
  };
}
