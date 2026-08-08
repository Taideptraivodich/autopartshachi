import { Router } from 'express';
import { BrandController } from '../controllers/brand.controller.js';

export function createBrandRouter(controller: BrandController): Router {
  const router = Router();
  router.get('/thuong-hieu', controller.getBrands);
  router.get('/thuong-hieu/:slug', controller.getBrandBySlug);
  return router;
}
