/**
 * Product Seed — Agent 04C
 * 15 sản phẩm demo phụ tùng ô tô để test API, UI, pagination.
 * Idempotent: onConflictDoNothing trên slug và sku unique.
 */

import { type Database } from "../index.js";
import {
  product,
  productBrand,
  productCategory,
  productImage,
  productCategoryMap,
} from "../schema/product.js";
import { eq } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getBrandId(db: Database, slug: string): Promise<number> {
  const rows = await db
    .select({ id: productBrand.id })
    .from(productBrand)
    .where(eq(productBrand.slug, slug))
    .limit(1);
  if (!rows[0]) throw new Error(`productBrand slug="${slug}" không tìm thấy. Hãy chạy master seed trước.`);
  return rows[0].id;
}

async function getCategoryId(db: Database, slug: string): Promise<number> {
  const rows = await db
    .select({ id: productCategory.id })
    .from(productCategory)
    .where(eq(productCategory.slug, slug))
    .limit(1);
  if (!rows[0]) throw new Error(`productCategory slug="${slug}" không tìm thấy. Hãy chạy master seed trước.`);
  return rows[0].id;
}

// ---------------------------------------------------------------------------
// Seed function
// ---------------------------------------------------------------------------

export async function seedProducts(db: Database): Promise<void> {
  console.log("Seeding products...");

  // ── Lấy brand IDs ─────────────────────────────────────────────────────────
  const [
    idAisin,
    idBosch,
    idDenso,
    idNgk,
    idToyotaGenuine,
    idHondaGenuine,
  ] = await Promise.all([
    getBrandId(db, "aisin"),
    getBrandId(db, "bosch"),
    getBrandId(db, "denso"),
    getBrandId(db, "ngk"),
    getBrandId(db, "toyota-genuine-parts"),
    getBrandId(db, "honda-genuine-parts"),
  ]);

  // ── Lấy category IDs ──────────────────────────────────────────────────────
  const [
    idMaPhanh,
    idDiaPhanh,
    idLocDau,
    idLocGio,
  ] = await Promise.all([
    getCategoryId(db, "ma-phanh"),
    getCategoryId(db, "dia-phanh"),
    getCategoryId(db, "loc-dau"),
    getCategoryId(db, "loc-gio"),
  ]);

  // ── Định nghĩa 15 sản phẩm demo ───────────────────────────────────────────
  const productDefs: {
    sku: string;
    slug: string;
    name: string;
    brandId: number;
    categoryIds: number[];
    description: string;
    specification: string;
    status: "con_hang" | "het_hang" | "ngung_kinh_doanh";
  }[] = [
    // --- Má phanh (6 sản phẩm) ---
    {
      sku: "AISIN-AN-804WK",
      slug: "ma-phanh-truoc-aisin-toyota-vios-2014-2022",
      name: "Má phanh trước Aisin Toyota Vios 2014-2022",
      brandId: idAisin,
      categoryIds: [idMaPhanh],
      description: "Má phanh trước chính hãng Aisin dành cho Toyota Vios thế hệ 2 và 3 (2014–2022). Chất liệu semi-metallic cho khả năng tản nhiệt tốt, giảm tiếng ồn khi phanh.",
      specification: "Loại: Bán kim loại | Vị trí: Trước | Số miếng/bộ: 4 | Tiêu chuẩn: JASO C406",
      status: "con_hang",
    },
    {
      sku: "AISIN-AN-805WK",
      slug: "ma-phanh-truoc-aisin-toyota-innova-2016-2022",
      name: "Má phanh trước Aisin Toyota Innova 2016-2022",
      brandId: idAisin,
      categoryIds: [idMaPhanh],
      description: "Má phanh trước Aisin dành cho Toyota Innova thế hệ 2 (2016–2022). Phù hợp điều kiện đường Việt Nam, bền bỉ trong môi trường nhiệt đới.",
      specification: "Loại: Bán kim loại | Vị trí: Trước | Số miếng/bộ: 4 | Tiêu chuẩn: JASO C406",
      status: "con_hang",
    },
    {
      sku: "AISIN-AN-891WK",
      slug: "ma-phanh-sau-aisin-toyota-camry-2019-2023",
      name: "Má phanh sau Aisin Toyota Camry 2019-2023",
      brandId: idAisin,
      categoryIds: [idMaPhanh],
      description: "Má phanh sau Aisin cho Toyota Camry thế hệ XV70 (2019–2023). Độ mòn thấp, tuổi thọ cao, phù hợp xe sedan hạng D vận hành đường trường.",
      specification: "Loại: Ceramic | Vị trí: Sau | Số miếng/bộ: 4 | Tiêu chuẩn: JASO C406",
      status: "con_hang",
    },
    {
      sku: "BOSCH-BP-967",
      slug: "ma-phanh-truoc-bosch-honda-civic-2016-2021",
      name: "Má phanh trước Bosch Honda Civic 2016-2021",
      brandId: idBosch,
      categoryIds: [idMaPhanh],
      description: "Má phanh trước Bosch QuietCast dành cho Honda Civic thế hệ 10 (2016–2021). Công nghệ chống rung tích hợp, giảm tiếng kẽo kẹt, không bụi.",
      specification: "Loại: Ceramic | Vị trí: Trước | Số miếng/bộ: 4 | Công nghệ: QuietCast",
      status: "con_hang",
    },
    {
      sku: "BOSCH-BP-1045",
      slug: "ma-phanh-truoc-bosch-honda-city-2020-2023",
      name: "Má phanh trước Bosch Honda City 2020-2023",
      brandId: idBosch,
      categoryIds: [idMaPhanh],
      description: "Má phanh trước Bosch dành cho Honda City thế hệ 5 (2020–2023). Hệ số ma sát ổn định ở nhiệt độ cao, an toàn trong điều kiện phanh gấp đô thị.",
      specification: "Loại: Ceramic | Vị trí: Trước | Số miếng/bộ: 4 | Công nghệ: QuietCast",
      status: "con_hang",
    },
    {
      sku: "TOYG-0446502200",
      slug: "ma-phanh-sau-toyota-genuine-vios-2019-2022",
      name: "Má phanh sau Toyota Genuine Vios 2019-2022",
      brandId: idToyotaGenuine,
      categoryIds: [idMaPhanh],
      description: "Má phanh sau chính hãng Toyota dành cho Vios thế hệ 3 (2019–2022). Đảm bảo khớp hoàn toàn với hệ thống phanh OEM, duy trì hiệu năng theo tiêu chuẩn nhà máy.",
      specification: "Loại: OEM | Vị trí: Sau | Số miếng/bộ: 4 | Mã OEM: 04466-BZ100",
      status: "con_hang",
    },

    // --- Đĩa phanh (3 sản phẩm) ---
    {
      sku: "AISIN-DSTY-001",
      slug: "dia-phanh-truoc-aisin-toyota-vios-2014-2022",
      name: "Đĩa phanh trước Aisin Toyota Vios 2014-2022",
      brandId: idAisin,
      categoryIds: [idDiaPhanh],
      description: "Đĩa phanh trước Aisin thép đúc nguyên khối cho Toyota Vios 2014–2022. Bề mặt xử lý chống gỉ, cân bằng tốt, ít rung khi phanh tốc độ cao.",
      specification: "Đường kính: 255mm | Dày: 22mm | Loại: Thông gió | Vật liệu: Gang xám GG25",
      status: "con_hang",
    },
    {
      sku: "BOSCH-BD-1441",
      slug: "dia-phanh-truoc-bosch-toyota-innova-2016-2022",
      name: "Đĩa phanh trước Bosch Toyota Innova 2016-2022",
      brandId: idBosch,
      categoryIds: [idDiaPhanh],
      description: "Đĩa phanh trước Bosch dành cho Toyota Innova thế hệ 2 (2016–2022). Cánh tản nhiệt tối ưu, chịu được tải trọng lớn của MPV 7 chỗ trong điều kiện đèo dốc.",
      specification: "Đường kính: 296mm | Dày: 26mm | Loại: Thông gió | Vật liệu: Gang xám GG25",
      status: "con_hang",
    },
    {
      sku: "HONDAG-45251-TBA-A00",
      slug: "dia-phanh-truoc-honda-genuine-civic-2016-2021",
      name: "Đĩa phanh trước Honda Genuine Civic 2016-2021",
      brandId: idHondaGenuine,
      categoryIds: [idDiaPhanh],
      description: "Đĩa phanh trước chính hãng Honda dành cho Civic thế hệ 10 (2016–2021). Tương thích hoàn toàn với hệ thống ABS và VSA tiêu chuẩn, không cần hiệu chỉnh thêm.",
      specification: "Đường kính: 282mm | Dày: 25mm | Loại: Thông gió | Mã OEM: 45251-TBA-A00",
      status: "con_hang",
    },

    // --- Lọc dầu (3 sản phẩm) ---
    {
      sku: "DENSO-DOFC-101",
      slug: "loc-dau-dong-co-denso-toyota-vios-innova",
      name: "Lọc dầu động cơ Denso Toyota Vios / Innova",
      brandId: idDenso,
      categoryIds: [idLocDau],
      description: "Lọc dầu động cơ Denso dùng chung cho Toyota Vios (1NZ-FE/2NZ-FE) và Innova (1TR-FE/2TR-FE). Lõi lọc sợi tổng hợp, lọc hạt xuống 10 micron, khoảng cách thay 5.000km dầu khoáng hoặc 10.000km dầu tổng hợp.",
      specification: "Kích thước: M20×1.5 | Lưu lượng: 200 L/h | Lọc đến: 10 micron | Áp suất vỡ: 14 bar",
      status: "con_hang",
    },
    {
      sku: "BOSCH-0451103079",
      slug: "loc-dau-dong-co-bosch-honda-civic-city",
      name: "Lọc dầu động cơ Bosch Honda Civic / City",
      brandId: idBosch,
      categoryIds: [idLocDau],
      description: "Lọc dầu động cơ Bosch dùng chung cho Honda Civic (K20C2) và City (L15Z4). Tích hợp van chống hồi dầu và van áp suất bypass, bảo vệ động cơ khi khởi động lạnh.",
      specification: "Kích thước: M20×1.5 | Lưu lượng: 180 L/h | Lọc đến: 10 micron | Áp suất vỡ: 14 bar",
      status: "con_hang",
    },
    {
      sku: "DENSO-DOFC-205",
      slug: "loc-dau-dong-co-denso-toyota-camry-2019-2023",
      name: "Lọc dầu động cơ Denso Toyota Camry 2019-2023",
      brandId: idDenso,
      categoryIds: [idLocDau],
      description: "Lọc dầu động cơ Denso dành cho Toyota Camry XV70 2019–2023 (động cơ A25A-FKS). Thiết kế lõi lọc kép cho dầu tổng hợp full-synthetic, khoảng thay 15.000km.",
      specification: "Kích thước: M20×1.5 | Lưu lượng: 220 L/h | Lọc đến: 8 micron | Áp suất vỡ: 16 bar",
      status: "con_hang",
    },

    // --- Lọc gió (3 sản phẩm) ---
    {
      sku: "DENSO-DAF-086",
      slug: "loc-gio-dong-co-denso-toyota-vios-2014-2022",
      name: "Lọc gió động cơ Denso Toyota Vios 2014-2022",
      brandId: idDenso,
      categoryIds: [idLocGio],
      description: "Lọc gió động cơ Denso cho Toyota Vios 2014–2022 (1NZ-FE). Chất liệu giấy lọc nhiều lớp, hiệu suất lọc bụi ≥98.6%, không ảnh hưởng lưu lượng khí nạp.",
      specification: "Kích thước: 265×185×35mm | Hiệu suất lọc: ≥98.6% | Khoảng thay: 15.000–20.000km",
      status: "con_hang",
    },
    {
      sku: "BOSCH-S0081",
      slug: "loc-gio-dong-co-bosch-honda-civic-2016-2021",
      name: "Lọc gió động cơ Bosch Honda Civic 2016-2021",
      brandId: idBosch,
      categoryIds: [idLocGio],
      description: "Lọc gió động cơ Bosch aerotwin dành cho Honda Civic thế hệ 10 (2016–2021). Giấy lọc Premium gấp nếp mật độ cao, tăng 10% diện tích lọc so với OEM tiêu chuẩn.",
      specification: "Kích thước: 280×195×35mm | Hiệu suất lọc: ≥99.0% | Khoảng thay: 20.000km",
      status: "con_hang",
    },
    {
      sku: "NGK-AF3460",
      slug: "loc-gio-dong-co-ngk-toyota-innova-2016-2022",
      name: "Lọc gió động cơ NGK Toyota Innova 2016-2022",
      brandId: idNgk,
      categoryIds: [idLocGio],
      description: "Lọc gió động cơ NGK dành cho Toyota Innova thế hệ 2 (2016–2022) động cơ 2TR-FE. Thiết kế chống bụi mịn PM2.5, phù hợp điều kiện đô thị Việt Nam nhiều bụi.",
      specification: "Kích thước: 310×210×40mm | Hiệu suất lọc: ≥99.2% | Khoảng thay: 15.000–20.000km",
      status: "con_hang",
    },
  ];

  // ── Insert products ────────────────────────────────────────────────────────
  for (const def of productDefs) {
    // Insert product row — bỏ qua nếu slug đã tồn tại
    const inserted = await db
      .insert(product)
      .values({
        productBrandId: def.brandId,
        sku: def.sku,
        name: def.name,
        slug: def.slug,
        description: def.description,
        specification: def.specification,
        status: def.status,
        metaTitle: def.name,
        metaDescription: def.description.slice(0, 160),
      })
      .onConflictDoNothing()
      .returning({ id: product.id });

    // Nếu conflict (đã tồn tại), lấy id hiện tại
    let productId: number;
    if (inserted.length > 0) {
      productId = inserted[0]!.id;
    } else {
      const existing = await db
        .select({ id: product.id })
        .from(product)
        .where(eq(product.slug, def.slug))
        .limit(1);
      productId = existing[0]!.id;
    }

    // Insert thumbnail image placeholder
    await db
      .insert(productImage)
      .values({
        productId,
        imageUrl: `/images/products/placeholder.jpg`,
        altText: def.name,
        isThumbnail: true,
        displayOrder: 0,
      })
      .onConflictDoNothing();

    // Insert category mappings
    for (const categoryId of def.categoryIds) {
      await db
        .insert(productCategoryMap)
        .values({ productId, categoryId })
        .onConflictDoNothing();
    }

    console.log(`  ✓ ${def.name}`);
  }

  console.log(`Seeded ${productDefs.length} products.`);
}
