/**
 * Admin lead routes — mounted at /api/admin/lead
 * GET    /api/admin/lead          — danh sách lead (phân trang, lọc unread)
 * PATCH  /api/admin/lead/:id/read — đánh dấu đã đọc / chưa đọc
 * DELETE /api/admin/lead/:id      — xóa lead
 */

import { Router, type Request, type Response } from "express";
import { LeadService } from "../services/lead.service.js";
import { logger } from "../lib/logger.js";

export function createAdminLeadRouter(leadService: LeadService): Router {
  const r = Router();

  // GET /api/admin/lead?page=1&pageSize=30&onlyUnread=true
  r.get("/", async (req: Request, res: Response) => {
    try {
      const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
      const pageSize = Math.min(
        100,
        Math.max(1, parseInt(String(req.query.pageSize ?? "30"), 10) || 30),
      );
      const onlyUnread = req.query.onlyUnread === "true";

      const result = await leadService.adminListLeads({ page, pageSize, onlyUnread });
      res.json({
        data: result.items,
        meta: { page: result.page, pageSize: result.pageSize, total: result.total },
      });
    } catch (err) {
      logger.error("adminListLeads error", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // PATCH /api/admin/lead/:id/read
  r.patch("/:id/read", async (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (!id) { res.status(400).json({ error: "Invalid id" }); return; }
      const isRead = req.body?.isRead !== false; // default true
      const row = await leadService.adminMarkRead(id, isRead);
      if (!row) { res.status(404).json({ error: "Not found" }); return; }
      res.json({ data: row });
    } catch (err) {
      logger.error("adminMarkRead error", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // DELETE /api/admin/lead/:id
  r.delete("/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (!id) { res.status(400).json({ error: "Invalid id" }); return; }
      const deleted = await leadService.adminDeleteLead(id);
      if (!deleted) { res.status(404).json({ error: "Not found" }); return; }
      res.json({ ok: true });
    } catch (err) {
      logger.error("adminDeleteLead error", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return r;
}
