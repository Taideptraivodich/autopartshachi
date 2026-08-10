import { Router } from "express";
import { LeadController } from "../controllers/lead.controller.js";

export function createLeadRouter(controller: LeadController): Router {
  const r = Router();
  r.post("/lien-he", controller.create);
  return r;
}
