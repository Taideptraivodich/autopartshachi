-- Allow compatibility ranges to express "from before" and "all years".
-- year_start NULL = no lower bound; year_end NULL = no upper bound.

ALTER TABLE "compatibility"
  ALTER COLUMN "year_start" DROP NOT NULL;

ALTER TABLE "compatibility"
  DROP CONSTRAINT IF EXISTS "compatibility_year_start_end_check";

ALTER TABLE "compatibility"
  DROP CONSTRAINT IF EXISTS "chk_compatibility_year_range";

ALTER TABLE "compatibility"
  ADD CONSTRAINT "chk_compatibility_year_range"
  CHECK (
    "year_start" IS NULL
    OR "year_end" IS NULL
    OR "year_end" >= "year_start"
  );

DROP INDEX IF EXISTS "idx_compatibility_unique";

CREATE UNIQUE INDEX IF NOT EXISTS "idx_compatibility_unique"
  ON "compatibility" (
    "product_id",
    "vehicle_model_id",
    "year_start",
    "year_end",
    "installation_position"
  );
