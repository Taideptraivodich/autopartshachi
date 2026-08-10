import { type Request, type Response } from 'express';
import { VehicleService } from '../services/vehicle.service.js';
import { logger } from '../lib/logger.js';

export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  // GET /api/hang-xe
  getBrands = async (_req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.vehicleService.getBrands();
      res.json({ data });
    } catch (err) {
      logger.error('[VehicleController.getBrands]', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  // GET /api/hang-xe/:slug
  getBrandBySlug = async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params;
    try {
      const data = await this.vehicleService.getBrandBySlug(slug);
      if (!data) { res.status(404).json({ error: 'Not found' }); return; }
      res.json({ data });
    } catch (err) {
      logger.error(`[VehicleController.getBrandBySlug] slug=${slug}`, err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  // GET /api/hang-xe/:brandId/dong-xe
  getModelsByBrand = async (req: Request, res: Response): Promise<void> => {
    const brandId = parseInt(String(req.params.brandId ?? ""), 10);
    if (!Number.isFinite(brandId) || brandId <= 0) {
      res.status(400).json({ error: "brandId không hợp lệ" });
      return;
    }
    try {
      const data = await this.vehicleService.getModelsByBrandId(brandId);
      res.json({ data });
    } catch (err) {
      logger.error(`[VehicleController.getModelsByBrand] brandId=${brandId}`, err);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  // GET /api/hang-xe/dong-xe/:modelId/doi-xe
  getGenerationsByModel = async (req: Request, res: Response): Promise<void> => {
    const modelId = parseInt(String(req.params.modelId ?? ""), 10);
    try {
      if (!Number.isFinite(modelId) || modelId <= 0) {
        res.status(400).json({ error: 'modelId không hợp lệ' });
        return;
      }
      const data = await this.vehicleService.getGenerationsByModelId(modelId);
      res.json({ data });
    } catch (err) {
      logger.error(`[VehicleController.getGenerationsByModel] modelId=${modelId}`, err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
