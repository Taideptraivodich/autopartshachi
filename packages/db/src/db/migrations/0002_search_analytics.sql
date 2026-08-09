-- Migration: 0002_search_analytics
-- Tạo bảng search_analytics để track keyword tìm kiếm

CREATE TABLE IF NOT EXISTS "search_analytics" (
  "id" bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "keyword" text NOT NULL,
  "count" integer NOT NULL DEFAULT 1,
  "last_searched_at" timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_search_analytics_keyword"
  ON "search_analytics" ("keyword");

CREATE INDEX IF NOT EXISTS "idx_search_analytics_count"
  ON "search_analytics" ("count" DESC);
