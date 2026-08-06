import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { config } from "dotenv";

// Load .env from packages/db/ regardless of where the process is invoked from
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "../../../.env");
config({ path: envPath });

/**
 * Applies all pending migrations from src/db/migrations.
 * Run with: npm run db:migrate  (from root or packages/db)
 */
async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      `DATABASE_URL is not set. Expected .env at: ${envPath}`,
    );
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool);

  // Absolute path to migrations folder — safe regardless of cwd
  const migrationsFolder = join(__dirname, "../migrations");

  console.log("Running migrations from:", migrationsFolder);
  await migrate(db, { migrationsFolder });
  console.log("Migrations applied successfully.");

  await pool.end();
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
