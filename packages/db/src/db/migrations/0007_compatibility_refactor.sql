-- Compatibility refactor: replace vehicle generation FK with model + year range.
-- Existing compatibility rows are migrated from vehicle_generation before the old FK is removed.

ALTER TABLE "compatibility"
  ADD COLUMN IF NOT EXISTS "vehicle_model_id" bigint,
  ADD COLUMN IF NOT EXISTS "year_start" integer,
  ADD COLUMN IF NOT EXISTS "year_end" integer;

UPDATE "compatibility" c
SET
  "vehicle_model_id" = vg."vehicle_model_id",
  "year_start" = vg."year_start",
  "year_end" = vg."year_end"
FROM "vehicle_generation" vg
WHERE vg."id" = c."vehicle_generation_id";

DROP INDEX IF EXISTS "idx_compatibility_unique";
DROP INDEX IF EXISTS "idx_compatibility_vehicle_generation_id";

ALTER TABLE "compatibility"
  DROP COLUMN IF EXISTS "vehicle_generation_id";

ALTER TABLE "compatibility"
  ALTER COLUMN "vehicle_model_id" SET NOT NULL,
  ALTER COLUMN "year_start" SET NOT NULL,
  ADD CONSTRAINT "compatibility_vehicle_model_id_fk"
    FOREIGN KEY ("vehicle_model_id")
    REFERENCES "vehicle_model"("id")
    ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS "idx_compatibility_unique"
  ON "compatibility" ("product_id", "vehicle_model_id", "year_start", "installation_position");

CREATE INDEX IF NOT EXISTS "idx_compatibility_product_id"
  ON "compatibility" ("product_id");

CREATE INDEX IF NOT EXISTS "idx_compatibility_vehicle_model_id"
  ON "compatibility" ("vehicle_model_id");
