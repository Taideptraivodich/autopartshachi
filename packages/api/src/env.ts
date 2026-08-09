import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
// src/ -> api/ -> packages/ -> root (3 cấp)
config({ path: join(__dirname, "../../../.env") });
