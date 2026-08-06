import { Pool } from "pg";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { config } from "dotenv";

// Load .env from packages/db/ regardless of where the process is invoked from
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "../../../.env");
config({ path: envPath });

/**
 * DEV-ONLY. Drops and recreates the `public` schema, wiping every table.
 * Refuses to run if NODE_ENV=production.
 *
 * Chain: npm run db:reset && npm run db:migrate && npm run db:seed
 */
async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to reset the database when NODE_ENV=production.");
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      `DATABASE_URL is not set. Expected .env at: ${envPath}`,
    );
  }

  const pool = new Pool({ connectionString: databaseUrl });

  console.log("Dropping and recreating schema `public`...");
  await pool.query("DROP SCHEMA public CASCADE;");
  await pool.query("CREATE SCHEMA public;");

  console.log("Dropping migration history schema `drizzle`...");
  await pool.query("DROP SCHEMA IF EXISTS drizzle CASCADE;");

  console.log("Schema reset. Run `npm run db:migrate` then `npm run db:seed` next.");

  await pool.end();
}

main().catch((error) => {
  console.error("Reset failed:", error);
  process.exit(1);
});
