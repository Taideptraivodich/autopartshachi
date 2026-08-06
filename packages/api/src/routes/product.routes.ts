import { Router, type Request, type Response } from "express";
import {
  getProductList,
  getProductBySlug,
  getProductsByCategory,
  getCategoryBySlug,
  getAllCategories,
} from "../services/product.service.js";

const router = Router();

// GET /api/san-pham?page=1&pageSize=24
router.get("/san-pham", async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(String(req.query.pageSize ?? "24"), 10) || 24));
    const result = await getProductList({ page, pageSize });
    res.json({ data: result.items, meta: { page, pageSize, total: result.total } });
  } catch (err) {
    console.error("[GET /san-pham]", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// GET /api/san-pham/:slug
router.get("/san-pham/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const data = await getProductBySlug(slug);
    if (!data) {
      res.status(404).json({ error: "Không tìm thấy sản phẩm" });
      return;
    }
    res.json({ data });
  } catch (err) {
    console.error(`[GET /san-pham/${req.params.slug}]`, err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// GET /api/danh-muc — all categories (tree)
router.get("/danh-muc", async (_req: Request, res: Response) => {
  try {
    const data = await getAllCategories();
    res.json({ data });
  } catch (err) {
    console.error("[GET /danh-muc]", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// GET /api/danh-muc/:slug?page=1&pageSize=24
router.get("/danh-muc/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(String(req.query.pageSize ?? "24"), 10) || 24));
    const result = await getProductsByCategory(slug, { page, pageSize });
    if (!result.category) {
      res.status(404).json({ error: "Không tìm thấy danh mục" });
      return;
    }
    res.json({ data: result.items, category: result.category, meta: { page, pageSize, total: result.total } });
  } catch (err) {
    console.error(`[GET /danh-muc/${req.params.slug}]`, err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

export default router;
