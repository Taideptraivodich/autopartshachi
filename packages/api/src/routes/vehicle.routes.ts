import { Router } from 'express';
import { VehicleController } from '../controllers/vehicle.controller.js';

export function createVehicleRouter(controller: VehicleController): Router {
  const router = Router();
  router.get('/hang-xe', controller.getBrands);
  router.get('/hang-xe/:slug', controller.getBrandBySlug);
  return router;
}
