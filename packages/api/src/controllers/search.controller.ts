/**
 * SearchController
 * GET /api/search?q=...&page=1&pageSize=24
 */

import { type Request, type Response } from "express";
import { SearchService } from "../services/search.service.js";
import { logger } from "../lib/logger.js";

export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  search = async (req: Request, res: Response): Promise<void> => {
    const q = String(req.query.q ?? "").trim();
    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(String(req.query.pageSize ?? "24"), 10) || 24),
    );

    try {
      if (!q) {
        res.json({
          query: "",
          data: [],
          meta: { page: 1, pageSize, total: 0, totalPages: 0 },
        });
        return;
      }

      const result = await this.searchService.search(q, page, pageSize);
      res.json({
        query: result.query,
        data: result.data,
        meta: {
          page: result.page,
          pageSize: result.pageSize,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (err) {
      logger.error(`[SearchController.search] q=${q}`, err);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}
