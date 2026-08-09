/**
 * requireAdmin middleware
 * Verifies the Authorization: Bearer <token> header on every request to
 * /api/admin/* (except /api/admin/login which is handled before this middleware).
 *
 * On failure → 401 { error: "Unauthorized" }
 * On success → attaches decoded payload to res.locals.admin and calls next()
 */

import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET;

// jwtSecret is validated at startup in auth.service.ts — if we reach here it
// is always set, but we guard defensively anyway.
if (!jwtSecret) {
  throw new Error(
    "JWT_SECRET is not set. Add JWT_SECRET=<random-string> to packages/api/.env.",
  );
}

export interface AdminJwtPayload {
  sub: number;
  email: string;
  iat: number;
  exp: number;
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, jwtSecret as string) as AdminJwtPayload;
    res.locals.admin = payload;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}
