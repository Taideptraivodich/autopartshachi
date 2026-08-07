/**
 * ProductController
 * Nhận Request → validate input → gọi ProductService → trả Response.
 * Không chứa business logic. Không query DB.
 *
 * Response contract (không thay đổi):
 *   Danh sách : { data: [], meta: { page, pageSize, total } }
 *   Chi tiết  : { data: {} }
 *   404       : { error: "Not found" }
 *   500       : { error: "Internal server error" }
 */

import { type Request, type Response } from "express";
import { ProductService } from "../services/product.service.js";
import { logger } from "../lib/logger.js";

export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // GET /api/san-pham?page=1&pageSize=24&brandId=...&categoryId=...&status=...
  getProductList = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = Math.max(
        1,
        parseInt(String(req.query.page ?? "1"), 10) || 1,
      );
      const pageSize = Math.min(
        100,
        Math.max(1, parseInt(String(req.query.pageSize ?? "24"), 10) || 24),
      );

      // Filter params — undefined nếu không có trong query
      const brandId = req.query.brandId
        ? parseInt(String(req.query.brandId), 10) || undefined
        : undefined;
      const categoryId = req.query.categoryId
        ? parseInt(String(req.query.categoryId), 10) || undefined
        : undefined;

      // Validate status nếu có
      const rawStatus = req.query.status
        ? String(req.query.status)
        : undefined;
      const validStatuses = ["con_hang", "het_hang", "ngung_kinh_doanh"];
      const status =
        rawStatus && validStatuses.includes(rawStatus)
          ? (rawStatus as "con_hang" | "het_hang" | "ngung_kinh_doanh")
          : undefined;

      const result = await this.productService.getProductList({
        page,
        pageSize,
        brandId,
        categoryId,
        status,
      });

      res.json({
        data: result.items,
        meta: {
          page: result.page,
          pageSize: result.pageSize,
          total: result.total,
        },
      });
    } catch (err) {
      logger.error("[ProductController.getProductList]", err);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  // GET /api/san-pham/:slug
  getProductBySlug = async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params;
    try {
      if (!slug || typeof slug !== "string") {
        res.status(400).json({ error: "Slug không hợp lệ" });
        return;
      }

      const data = await this.productService.getProductBySlug(slug);
      if (!data) {
        res.status(404).json({ error: "Not found" });
        return;
      }

      res.json({ data });
    } catch (err) {
      logger.error(`[ProductController.getProductBySlug] slug=${slug}`, err);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  // GET /api/san-pham/:slug/lien-quan?limit=8
  getRelatedProducts = async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params;
    try {
      const limit = Math.min(
        20,
        Math.max(1, parseInt(String(req.query.limit ?? "8"), 10) || 8),
      );

      const data = await this.productService.getRelatedProducts(String(slug), limit);
      res.json({
        data,
        meta: { page: 1, pageSize: limit, total: data.length },
      });
    } catch (err) {
      logger.error(
        `[ProductController.getRelatedProducts] slug=${slug}`,
        err,
      );
      res.status(500).json({ error: "Internal server error" });
    }
  };
}
