/**
 * OemController
 * GET /api/oem?code=...
 */

import { type Request, type Response } from "express";
import { OemService } from "../services/oem.service.js";
import { logger } from "../lib/logger.js";

export class OemController {
  constructor(private readonly oemService: OemService) {}

  // GET /api/oem?code=04465-BZ160
  lookupByCode = async (req: Request, res: Response): Promise<void> => {
    const code = String(req.query.code ?? "").trim();
    try {
      if (!code) {
        res.status(400).json({ error: "Thiếu tham số code" });
        return;
      }
      const result = await this.oemService.lookupByCode(code);
      res.json({
        query: result.query,
        data: result.results,
        meta: { total: result.results.length },
      });
    } catch (err) {
      logger.error(`[OemController.lookupByCode] code=${code}`, err);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}
