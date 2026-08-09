/**
 * AuthService
 * Handles admin login: password verification + JWT signing.
 * No business logic beyond auth — does not touch product domain.
 *
 * Kiến trúc: Controller → Service → Repository → Database
 */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AdminRepository } from "autoparts-db/repositories";

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error(
    "JWT_SECRET is not set. Add JWT_SECRET=<random-string> to packages/api/.env " +
      "(copy from packages/api/.env.example).",
  );
}

export class AuthService {
  constructor(private readonly adminRepo: AdminRepository) {}

  /**
   * Verify email + password and return a signed JWT on success.
   * Returns null when credentials are invalid (wrong email or wrong password).
   */
  async login(
    email: string,
    password: string,
  ): Promise<{ token: string } | null> {
    const admin = await this.adminRepo.findByEmail(email);
    if (!admin) return null;

    const passwordMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!passwordMatch) return null;

    const token = jwt.sign(
      { sub: admin.id, email: admin.email },
      jwtSecret as string,
      { expiresIn: "7d" },
    );

    return { token };
  }
}
