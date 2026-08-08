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
}
