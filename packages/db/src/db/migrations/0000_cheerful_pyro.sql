CREATE TABLE IF NOT EXISTS "vehicle_brand" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "vehicle_brand_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"country_of_origin" text,
	"logo_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vehicle_generation" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "vehicle_generation_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"vehicle_model_id" bigint NOT NULL,
	"name" text NOT NULL,
	"year_start" smallint NOT NULL,
	"year_end" smallint,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_vehicle_generation_year" CHECK ("vehicle_generation"."year_end" IS NULL OR "vehicle_generation"."year_end" >= "vehicle_generation"."year_start")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vehicle_model" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "vehicle_model_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"vehicle_brand_id" bigint NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"segment" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "product_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"product_brand_id" bigint NOT NULL,
	"sku" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"specification" text,
	"status" text DEFAULT 'con_hang' NOT NULL,
	"meta_title" text,
	"meta_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_product_status" CHECK ("product"."status" IN ('con_hang', 'het_hang', 'ngung_kinh_doanh'))
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_brand" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "product_brand_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_category" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "product_category_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"parent_category_id" bigint,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_product_category_not_self_parent" CHECK ("product_category"."parent_category_id" IS DISTINCT FROM "product_category"."id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_category_map" (
	"product_id" bigint NOT NULL,
	"category_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_category_map_product_id_category_id_pk" PRIMARY KEY("product_id","category_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_image" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "product_image_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"product_id" bigint NOT NULL,
	"image_url" text NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_thumbnail" boolean DEFAULT false NOT NULL,
	"alt_text" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "oem_cross_reference" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "oem_cross_reference_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"oem_number_id_a" bigint NOT NULL,
	"oem_number_id_b" bigint NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_oem_cross_reference_canonical_order" CHECK ("oem_cross_reference"."oem_number_id_a" < "oem_cross_reference"."oem_number_id_b")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "oem_mapping" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "oem_mapping_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"product_id" bigint NOT NULL,
	"oem_number_id" bigint NOT NULL,
	"match_confidence" text DEFAULT 'khop_hoan_toan' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_oem_mapping_confidence" CHECK ("oem_mapping"."match_confidence" IN ('khop_hoan_toan', 'khop_tuong_duong'))
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "oem_number" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "oem_number_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"oem_number" text NOT NULL,
	"issuing_vehicle_brand_id" bigint,
	"status" text DEFAULT 'hieu_luc' NOT NULL,
	"normalized_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_oem_number_status" CHECK ("oem_number"."status" IN ('hieu_luc', 'ngung', 'da_bi_thay_the'))
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "oem_replacement" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "oem_replacement_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"old_oem_number_id" bigint NOT NULL,
	"new_oem_number_id" bigint NOT NULL,
	"effective_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_oem_replacement_not_self" CHECK ("oem_replacement"."old_oem_number_id" <> "oem_replacement"."new_oem_number_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "compatibility" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "compatibility_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"product_id" bigint NOT NULL,
	"vehicle_generation_id" bigint NOT NULL,
	"installation_position" text DEFAULT 'chung' NOT NULL,
	"application_condition" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_compatibility_position" CHECK ("compatibility"."installation_position" IN ('chung', 'truoc', 'sau', 'truoc_trai', 'truoc_phai', 'sau_trai', 'sau_phai'))
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vehicle_generation" ADD CONSTRAINT "vehicle_generation_vehicle_model_id_vehicle_model_id_fk" FOREIGN KEY ("vehicle_model_id") REFERENCES "public"."vehicle_model"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vehicle_model" ADD CONSTRAINT "vehicle_model_vehicle_brand_id_vehicle_brand_id_fk" FOREIGN KEY ("vehicle_brand_id") REFERENCES "public"."vehicle_brand"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product" ADD CONSTRAINT "product_product_brand_id_product_brand_id_fk" FOREIGN KEY ("product_brand_id") REFERENCES "public"."product_brand"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_category" ADD CONSTRAINT "product_category_parent_category_id_product_category_id_fk" FOREIGN KEY ("parent_category_id") REFERENCES "public"."product_category"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_category_map" ADD CONSTRAINT "product_category_map_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_category_map" ADD CONSTRAINT "product_category_map_category_id_product_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_category"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_image" ADD CONSTRAINT "product_image_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oem_cross_reference" ADD CONSTRAINT "oem_cross_reference_oem_number_id_a_oem_number_id_fk" FOREIGN KEY ("oem_number_id_a") REFERENCES "public"."oem_number"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oem_cross_reference" ADD CONSTRAINT "oem_cross_reference_oem_number_id_b_oem_number_id_fk" FOREIGN KEY ("oem_number_id_b") REFERENCES "public"."oem_number"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oem_mapping" ADD CONSTRAINT "oem_mapping_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oem_mapping" ADD CONSTRAINT "oem_mapping_oem_number_id_oem_number_id_fk" FOREIGN KEY ("oem_number_id") REFERENCES "public"."oem_number"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oem_number" ADD CONSTRAINT "oem_number_issuing_vehicle_brand_id_vehicle_brand_id_fk" FOREIGN KEY ("issuing_vehicle_brand_id") REFERENCES "public"."vehicle_brand"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oem_replacement" ADD CONSTRAINT "oem_replacement_old_oem_number_id_oem_number_id_fk" FOREIGN KEY ("old_oem_number_id") REFERENCES "public"."oem_number"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oem_replacement" ADD CONSTRAINT "oem_replacement_new_oem_number_id_oem_number_id_fk" FOREIGN KEY ("new_oem_number_id") REFERENCES "public"."oem_number"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "compatibility" ADD CONSTRAINT "compatibility_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "compatibility" ADD CONSTRAINT "compatibility_vehicle_generation_id_vehicle_generation_id_fk" FOREIGN KEY ("vehicle_generation_id") REFERENCES "public"."vehicle_generation"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_vehicle_brand_slug" ON "vehicle_brand" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_vehicle_generation_unique_range" ON "vehicle_generation" USING btree ("vehicle_model_id","year_start","year_end");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vehicle_generation_model_id" ON "vehicle_generation" USING btree ("vehicle_model_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_vehicle_model_brand_slug" ON "vehicle_model" USING btree ("vehicle_brand_id","slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vehicle_model_brand_id" ON "vehicle_model" USING btree ("vehicle_brand_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_product_sku" ON "product" USING btree ("sku");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_product_slug" ON "product" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_product_brand_id" ON "product" USING btree ("product_brand_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_product_status" ON "product" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_product_brand_slug" ON "product_brand" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_product_category_slug" ON "product_category" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_product_category_parent_id" ON "product_category" USING btree ("parent_category_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_product_category_map_category_id" ON "product_category_map" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_product_image_product_id" ON "product_image" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_oem_cross_reference_unique_pair" ON "oem_cross_reference" USING btree ("oem_number_id_a","oem_number_id_b");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_oem_cross_reference_a" ON "oem_cross_reference" USING btree ("oem_number_id_a");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_oem_cross_reference_b" ON "oem_cross_reference" USING btree ("oem_number_id_b");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_oem_mapping_unique_pair" ON "oem_mapping" USING btree ("product_id","oem_number_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_oem_mapping_product_id" ON "oem_mapping" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_oem_mapping_oem_number_id" ON "oem_mapping" USING btree ("oem_number_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_oem_number_code" ON "oem_number" USING btree ("oem_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_oem_number_status" ON "oem_number" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_oem_number_normalized_code" ON "oem_number" USING btree ("normalized_code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_oem_replacement_old_id" ON "oem_replacement" USING btree ("old_oem_number_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_oem_replacement_new_id" ON "oem_replacement" USING btree ("new_oem_number_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_compatibility_unique" ON "compatibility" USING btree ("product_id","vehicle_generation_id","installation_position");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_compatibility_product_id" ON "compatibility" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_compatibility_vehicle_generation_id" ON "compatibility" USING btree ("vehicle_generation_id");