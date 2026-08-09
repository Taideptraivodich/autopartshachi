-- Migration: 0003_search_fts
-- Thêm full-text search vector cho bảng product

-- Thêm cột search_vector
ALTER TABLE "product"
  ADD COLUMN IF NOT EXISTS "search_vector" tsvector;

-- Tạo GIN index (nhanh cho FTS)
CREATE INDEX IF NOT EXISTS "idx_product_search_vector"
  ON "product" USING GIN ("search_vector");

-- Function cập nhật search_vector từ name + sku + description
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.sku, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger tự động cập nhật khi insert/update
DROP TRIGGER IF EXISTS product_search_vector_update ON "product";
CREATE TRIGGER product_search_vector_update
  BEFORE INSERT OR UPDATE ON "product"
  FOR EACH ROW EXECUTE FUNCTION update_product_search_vector();

-- Backfill cho data hiện có
UPDATE "product" SET
  "search_vector" =
    setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(sku, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(description, '')), 'C');
