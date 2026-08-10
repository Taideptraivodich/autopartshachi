import { Router } from 'express';
import { VehicleController } from '../controllers/vehicle.controller.js';

export function createVehicleRouter(controller: VehicleController): Router {
  const router = Router();
  router.get('/hang-xe', controller.getBrands);
  // Phải khai báo TRƯỚC /hang-xe/:slug và /hang-xe/:brandId/dong-xe để không bị nuốt bởi param route
  router.get('/hang-xe/dong-xe/:modelId/doi-xe', controller.getGenerationsByModel);
  // GET /hang-xe/:brandId/dong-xe — list models by brand ID (dùng cho VehicleSelector)
  router.get('/hang-xe/:brandId/dong-xe', controller.getModelsByBrand);
  router.get('/hang-xe/:slug', controller.getBrandBySlug);
  return router;
}
