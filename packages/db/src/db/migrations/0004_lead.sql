CREATE TABLE IF NOT EXISTS "lead" (
  "id" bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "name" text NOT NULL,
  "phone" text NOT NULL,
  "message" text,
  "product_name" text,
  "product_sku" text,
  "source" text NOT NULL DEFAULT 'website',
  "is_read" boolean NOT NULL DEFAULT false,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_lead_created_at" ON "lead" ("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_lead_is_read" ON "lead" ("is_read");
