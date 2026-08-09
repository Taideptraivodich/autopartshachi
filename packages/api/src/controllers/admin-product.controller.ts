/**
 * AdminProductController
 * Nhận Request → validate input → gọi AdminProductService → trả Response.
 * Không chứa business logic. Không query DB.
 *
 * `list` tái dùng ProductService (read-only, public) vì logic phân trang/lọc
 * giống hệt trang public — chỉ khác là route này nằm sau requireAdmin.
 */

import { type Request, type Response } from "express";
import {
  AdminProductService,
  type CreateProductPayload,
  type UpdateProductPayload,
} from "../services/admin-product.service.js";
import { ProductService } from "../services/product.service.js";
import { logger } from "../lib/logger.js";

const VALID_STATUSES = ["con_hang", "het_hang", "ngung_kinh_doanh"] as const;

function parseId(raw: string): number | null {
  const id = parseInt(raw, 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export class AdminProductController {
  constructor(
    private readonly adminProductService: AdminProductService,
    private readonly productService: ProductService,
  ) {}

  // GET /api/admin/san-pham?page=&pageSize=&brandId=&categoryId=&status=
  list = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
      const pageSize = Math.min(
        100,
        Math.max(1, parseInt(String(req.query.pageSize ?? "20"), 10) || 20),
      );
      const brandId = req.query.brandId
        ? parseInt(String(req.query.brandId), 10) || undefined
        : undefined;
      const categoryId = req.query.categoryId
        ? parseInt(String(req.query.categoryId), 10) || undefined
        : undefined;
      const rawStatus = req.query.status ? String(req.query.status) : undefined;
      const status =
        rawStatus && (VALID_STATUSES as readonly string[]).includes(rawStatus)
          ? (rawStatus as (typeof VALID_STATUSES)[number])
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
        meta: { page: result.page, pageSize: result.pageSize, total: result.total },
      });
    } catch (err) {
      logger.error("[AdminProductController.list]", err);
      res.status(400).json({ error: (err as Error).message });
    }
  };

  // GET /api/admin/san-pham/:id
  detail = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseId(String(req.params.id ?? ""));
      if (id === null) {
        res.status(400).json({ error: "id không hợp lệ" });
        return;
      }

      const data = await this.adminProductService.findAdminDetail(id);
      if (!data) {
        res.status(404).json({ error: "Not found" });
        return;
      }

      res.json({ data });
    } catch (err) {
      logger.error("[AdminProductController.detail]", err);
      res.status(400).json({ error: (err as Error).message });
    }
  };

  // POST /api/admin/san-pham
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const payload = req.body as CreateProductPayload;
      const { id } = await this.adminProductService.create(payload);
      res.status(201).json({ data: { id } });
    } catch (err) {
      logger.error("[AdminProductController.create]", err);
      res.status(400).json({ error: (err as Error).message });
    }
  };

  // PUT /api/admin/san-pham/:id
  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseId(String(req.params.id ?? ""));
      if (id === null) {
        res.status(400).json({ error: "id không hợp lệ" });
        return;
      }

      const payload = req.body as UpdateProductPayload;
      const { id: updatedId } = await this.adminProductService.update(id, payload);
      res.json({ data: { id: updatedId } });
    } catch (err) {
      logger.error("[AdminProductController.update]", err);
      res.status(400).json({ error: (err as Error).message });
    }
  };

  // DELETE /api/admin/san-pham/:id
  remove = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseId(String(req.params.id ?? ""));
      if (id === null) {
        res.status(400).json({ error: "id không hợp lệ" });
        return;
      }

      await this.adminProductService.remove(id);
      res.status(204).send();
    } catch (err) {
      logger.error("[AdminProductController.remove]", err);
      res.status(400).json({ error: (err as Error).message });
    }
  };
}
