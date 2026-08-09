import { Router } from 'express';
import { VehicleController } from '../controllers/vehicle.controller.js';

export function createVehicleRouter(controller: VehicleController): Router {
  const router = Router();
  router.get('/hang-xe', controller.getBrands);
  // Phải khai báo TRƯỚC /hang-xe/:slug để không bị nuốt bởi param route
  router.get('/hang-xe/dong-xe/:modelId/doi-xe', controller.getGenerationsByModel);
  router.get('/hang-xe/:slug', controller.getBrandBySlug);
  return router;
}
