import bcrypt from "bcryptjs";
import { type Database } from "../index.js";
import { adminUser } from "../schema/admin.js";

/**
 * Seed the first admin user.
 *
 * Reads credentials from environment variables to avoid committing plaintext
 * passwords to git:
 *   ADMIN_SEED_EMAIL    — email address (default: admin@autopartshachi.vn)
 *   ADMIN_SEED_PASSWORD — plaintext password (REQUIRED, no default)
 *
 * Safe to re-run: uses onConflictDoNothing on unique email index.
 */
export async function seedAdmin(db: Database): Promise<void> {
  const email = process.env.ADMIN_SEED_EMAIL ?? "admin@autopartshachi.vn";
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!password) {
    console.warn(
      "[seedAdmin] ADMIN_SEED_PASSWORD is not set — skipping admin seed. " +
        "Set it in packages/db/.env to create the first admin account.",
    );
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db
    .insert(adminUser)
    .values({ email, passwordHash })
    .onConflictDoNothing();

  console.log(`[seedAdmin] Admin seeded: ${email}`);
}
