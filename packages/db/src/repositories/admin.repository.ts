import { eq } from "drizzle-orm";
import { type Database } from "../db/index.js";
import { adminUser } from "../db/schema/admin.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AdminUser = typeof adminUser.$inferSelect;

// ---------------------------------------------------------------------------
// AdminRepository
// ---------------------------------------------------------------------------

export class AdminRepository {
  constructor(private readonly db: Database) {}

  /**
   * Find an admin user by email.
   * Returns undefined when no match.
   */
  async findByEmail(email: string): Promise<AdminUser | undefined> {
    const rows = await this.db
      .select()
      .from(adminUser)
      .where(eq(adminUser.email, email))
      .limit(1);

    return rows[0];
  }
}
