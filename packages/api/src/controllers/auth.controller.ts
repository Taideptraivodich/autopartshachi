/**
 * AuthController
 * Handles POST /api/admin/login.
 * Validates request shape → delegates to AuthService → returns token or 401.
 */

import { type Request, type Response } from "express";
import { AuthService } from "../services/auth.service.js";
import { logger } from "../lib/logger.js";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /api/admin/login
  login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body as { email?: unknown; password?: unknown };

    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
      res.status(400).json({ error: "email và password là bắt buộc" });
      return;
    }

    try {
      const result = await this.authService.login(email, password);

      if (!result) {
        res.status(401).json({ error: "Email hoặc mật khẩu không đúng" });
        return;
      }

      res.json({ token: result.token });
    } catch (err) {
      logger.error("[AuthController.login]", err);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}
