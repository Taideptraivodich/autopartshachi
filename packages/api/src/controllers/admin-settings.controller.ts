/**
 * AdminSettingsController
 * GET /api/settings          — public (read site config)
 * GET /api/admin/settings    — admin read (same data, behind auth)
 * PATCH /api/admin/settings  — admin write (bulk upsert)
 */

import { type Request, type Response } from "express";
import { SiteSettingsService } from "../services/settings.service.js";

export class AdminSettingsController {
  constructor(private readonly settingsService: SiteSettingsService) {}

  getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.settingsService.getAll();
      res.json({ data });
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  };

  patchMany = async (req: Request, res: Response): Promise<void> => {
    try {
      const body = req.body as Record<string, unknown>;
      // Accept only string values; skip the rest
      const updates: Record<string, string> = {};
      for (const [key, val] of Object.entries(body)) {
        if (typeof val === "string") updates[key] = val;
      }
      if (Object.keys(updates).length === 0) {
        res.status(400).json({ error: "No valid string key-value pairs provided" });
        return;
      }
      await this.settingsService.setMany(updates);
      const data = await this.settingsService.getAll();
      res.json({ data });
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  };
}
