import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { config } from "dotenv";

// Load .env from packages/db/ regardless of where the process is invoked from.
// This runs before drizzle/pg so DATABASE_URL is always available.
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "../../.env") });

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema/index";
import * as relations from "./relations/index";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Copy packages/db/.env.example to packages/db/.env and fill in your PostgreSQL connection string.",
  );
}

const poolMax = Number(process.env.DB_POOL_MAX ?? 10);

export const pool = new Pool({
  connectionString: databaseUrl,
  max: Number.isFinite(poolMax) && poolMax > 0 ? poolMax : 10,
});

/**
 * The single Drizzle instance for the whole app. Downstream Agents (03+)
 * should import `db` from here rather than creating their own connections.
 */
export const db = drizzle(pool, {
  schema: { ...schema, ...relations },
});

export type Database = typeof db;

/** Call on process shutdown (e.g. in tests or CLI scripts) to close the pool cleanly. */
export async function closeDb(): Promise<void> {
  await pool.end();
}
