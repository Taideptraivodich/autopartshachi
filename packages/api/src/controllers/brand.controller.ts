import { type Request, type Response } from 'express';
import { BrandService } from '../services/brand.service.js';
import { logger } from '../lib/logger.js';

export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  // GET /api/thuong-hieu
  getBrands = async (_req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.brandService.getBrands();
      res.json({ data });
    } catch (err) {
      logger.error('[BrandController.getBrands]', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  // GET /api/thuong-hieu/:slug
  getBrandBySlug = async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params;
    try {
      const brand = await this.brandService.getBrandBySlug(slug);
      if (!brand) { res.status(404).json({ error: 'Not found' }); return; }

      const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
      const pageSize = Math.min(100, Math.max(1, parseInt(String(req.query.pageSize ?? '24'), 10) || 24));

      const result = await this.brandService.getProductsByBrand(slug, page, pageSize);
      if (!result) { res.status(404).json({ error: 'Not found' }); return; }

      res.json({
        data: result.brand,
        products: {
          data: result.items,
          meta: { page: result.page, pageSize: result.pageSize, total: result.total },
        },
      });
    } catch (err) {
      logger.error(`[BrandController.getBrandBySlug] slug=${slug}`, err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
