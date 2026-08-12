-- Migration 0005: product.is_visible + site_settings
-- ──────────────────────────────────────────────────────────────────────────

-- ① Toggle visibility trên product
ALTER TABLE product ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true;
CREATE INDEX IF NOT EXISTS idx_product_is_visible ON product (is_visible);

-- ⑦ Bảng cấu hình site (key-value store)
CREATE TABLE IF NOT EXISTS site_settings (
  key   text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed giá trị mặc định
INSERT INTO site_settings (key, value) VALUES
  ('zalo_phone',    '0901234567'),
  ('hotline',       '0901234567'),
  ('show_oem',      'false'),
  ('working_hours', 'Thứ 2 – Thứ 7: 8:00 – 17:30')
ON CONFLICT (key) DO NOTHING;
