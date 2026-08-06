import { defineConfig } from "drizzle-kit";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { config } from "dotenv";

// Load .env from packages/db/ regardless of where drizzle-kit is invoked from
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, ".env") });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env inside packages/db/ and fill in your PostgreSQL connection string.",
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: join(__dirname, "./src/db/schema/index.ts"),
  out: join(__dirname, "./src/db/migrations"),
  dbCredentials: {
    url: databaseUrl,
  },
  strict: true,
  verbose: true,
});
