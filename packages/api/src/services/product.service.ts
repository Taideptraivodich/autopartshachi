import { db } from "autoparts-db";
import { eq, inArray } from "drizzle-orm";
import {
  product,
  productBrand,
  productCategory,
  productImage,
  productCategoryMap,
} from "autoparts-db/schema";
import { compatibility } from "autoparts-db/schema";
import { oemMapping, oemNumber } from "autoparts-db/schema";
import { vehicleGeneration, vehicleModel, vehicleBrand } from "autoparts-db/schema";

// ─── List types ────────────────────────────────────────────────────────────────

export interface ProductListItem {
  id: number;
  slug: string;
  name: string;
  sku: string;
  status: string;
  featuredImage: string | null;
  brand: { id: number; name: string; slug: string } | null;
  categories: { id: number; name: string; slug: string }[];
}

export interface ProductDetail extends ProductListItem {
  description: string | null;
  specification: string | null;
  images: {
    id: number;
    imageUrl: string;
    altText: string | null;
    isThumbnail: boolean;
    displayOrder: number;
  }[];
  oemCodes: {
    id: number;
    code: string;
    status: string;
    matchConfidence: string;
    issuingBrand: string | null;
  }[];
  compatibility: {
    brandName: string;
    brandSlug: string;
    modelName: string;
    modelSlug: string;
    generationName: string;
    yearStart: number;
    yearEnd: number | null;
    installationPosition: string;
    notes: string | null;
  }[];
}

export interface CategoryWithAncestors {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  parentCategoryId: number | null;
  parent?: { id: number; name: string; slug: string } | null;
  children: { id: number; name: string; slug: string; displayOrder: number }[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

async function getCategoriesForProducts(
  productIds: number[]
): Promise<Map<number, { id: number; name: string; slug: string }[]>> {
  if (productIds.length === 0) return new Map();
  const maps = await db
    .select({
      productId: productCategoryMap.productId,
      catId: productCategory.id,
      catName: productCategory.name,
      catSlug: productCategory.slug,
    })
    .from(productCategoryMap)
    .innerJoin(productCategory, eq(productCategoryMap.categoryId, productCategory.id))
    .where(inArray(productCategoryMap.productId, productIds));

  const result = new Map<number, { id: number; name: string; slug: string }[]>();
  for (const row of maps) {
    if (!result.has(row.productId)) result.set(row.productId, []);
    result.get(row.productId)!.push({ id: row.catId, name: row.catName, slug: row.catSlug });
  }
  return result;
}

function getFeaturedImage(
  images: { imageUrl: string; isThumbnail: boolean; displayOrder: number }[]
): string | null {
  if (images.length === 0) return null;
  const thumb = images.find((i) => i.isThumbnail);
  if (thumb) return thumb.imageUrl;
  return images.sort((a, b) => a.displayOrder - b.displayOrder)[0].imageUrl;
}

// ─── Service functions ─────────────────────────────────────────────────────────

/** Get paginated product list (no OEM/compatibility data — perf rule) */
export async function getProductList(opts: {
  page: number;
  pageSize: number;
}): Promise<{ items: ProductListItem[]; total: number }> {
  const { page, pageSize } = opts;
  const offset = (page - 1) * pageSize;

  // Count total
  const allProducts = await db
    .select({ id: product.id })
    .from(product);
  const total = allProducts.length;

  // Fetch page
  const rows = await db
    .select({
      id: product.id,
      slug: product.slug,
      name: product.name,
      sku: product.sku,
      status: product.status,
      brandId: productBrand.id,
      brandName: productBrand.name,
      brandSlug: productBrand.slug,
    })
    .from(product)
    .leftJoin(productBrand, eq(product.productBrandId, productBrand.id))
    .limit(pageSize)
    .offset(offset);

  if (rows.length === 0) return { items: [], total };

  // Fetch images (thumbnail only for list)
  const productIds = rows.map((r) => r.id);
  const images = await db
    .select({
      productId: productImage.productId,
      imageUrl: productImage.imageUrl,
      isThumbnail: productImage.isThumbnail,
      displayOrder: productImage.displayOrder,
    })
    .from(productImage)
    .where(inArray(productImage.productId, productIds));

  const imagesByProduct = new Map<number, typeof images>();
  for (const img of images) {
    if (!imagesByProduct.has(img.productId)) imagesByProduct.set(img.productId, []);
    imagesByProduct.get(img.productId)!.push(img);
  }

  const categoriesByProduct = await getCategoriesForProducts(productIds);

  const items: ProductListItem[] = rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    sku: row.sku,
    status: row.status,
    featuredImage: getFeaturedImage(imagesByProduct.get(row.id) ?? []),
    brand: row.brandId
      ? { id: row.brandId, name: row.brandName!, slug: row.brandSlug! }
      : null,
    categories: categoriesByProduct.get(row.id) ?? [],
  }));

  return { items, total };
}

/** Get full product detail by slug */
export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const rows = await db
    .select({
      id: product.id,
      slug: product.slug,
      name: product.name,
      sku: product.sku,
      status: product.status,
      description: product.description,
      specification: product.specification,
      brandId: productBrand.id,
      brandName: productBrand.name,
      brandSlug: productBrand.slug,
    })
    .from(product)
    .leftJoin(productBrand, eq(product.productBrandId, productBrand.id))
    .where(eq(product.slug, slug))
    .limit(1);

  if (rows.length === 0) return null;
  const row = rows[0];

  // Images
  const images = await db
    .select({
      id: productImage.id,
      imageUrl: productImage.imageUrl,
      altText: productImage.altText,
      isThumbnail: productImage.isThumbnail,
      displayOrder: productImage.displayOrder,
    })
    .from(productImage)
    .where(eq(productImage.productId, row.id));

  // Categories
  const categoriesByProduct = await getCategoriesForProducts([row.id]);

  // OEM
  const oemRows = await db
    .select({
      mappingId: oemMapping.id,
      matchConfidence: oemMapping.matchConfidence,
      code: oemNumber.oemNumber,
      oemStatus: oemNumber.status,
      oemNumberId: oemNumber.id,
      issuingBrandId: oemNumber.issuingVehicleBrandId,
    })
    .from(oemMapping)
    .innerJoin(oemNumber, eq(oemMapping.oemNumberId, oemNumber.id))
    .where(eq(oemMapping.productId, row.id));

  // Fetch issuing brand names for OEM
  const issuingBrandIds = [...new Set(oemRows.map((o) => o.issuingBrandId).filter(Boolean))] as number[];
  const issuingBrands = issuingBrandIds.length > 0
    ? await db
        .select({ id: vehicleBrand.id, name: vehicleBrand.name })
        .from(vehicleBrand)
        .where(inArray(vehicleBrand.id, issuingBrandIds))
    : [];
  const brandNameById = new Map(issuingBrands.map((b) => [b.id, b.name]));

  const oemCodes = oemRows.map((o) => ({
    id: o.oemNumberId,
    code: o.code,
    status: o.oemStatus,
    matchConfidence: o.matchConfidence,
    issuingBrand: o.issuingBrandId ? (brandNameById.get(o.issuingBrandId) ?? null) : null,
  }));

  // Compatibility
  const compatRows = await db
    .select({
      genId: vehicleGeneration.id,
      genName: vehicleGeneration.name,
      yearStart: vehicleGeneration.yearStart,
      yearEnd: vehicleGeneration.yearEnd,
      modelId: vehicleModel.id,
      modelName: vehicleModel.name,
      modelSlug: vehicleModel.slug,
      brandId: vehicleBrand.id,
      brandName: vehicleBrand.name,
      brandSlug: vehicleBrand.slug,
      installationPosition: compatibility.installationPosition,
      notes: compatibility.notes,
    })
    .from(compatibility)
    .innerJoin(vehicleGeneration, eq(compatibility.vehicleGenerationId, vehicleGeneration.id))
    .innerJoin(vehicleModel, eq(vehicleGeneration.vehicleModelId, vehicleModel.id))
    .innerJoin(vehicleBrand, eq(vehicleModel.vehicleBrandId, vehicleBrand.id))
    .where(eq(compatibility.productId, row.id));

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    sku: row.sku,
    status: row.status,
    description: row.description,
    specification: row.specification,
    featuredImage: getFeaturedImage(images),
    brand: row.brandId
      ? { id: row.brandId, name: row.brandName!, slug: row.brandSlug! }
      : null,
    categories: categoriesByProduct.get(row.id) ?? [],
    images: images.sort((a, b) => a.displayOrder - b.displayOrder),
    oemCodes,
    compatibility: compatRows.map((c) => ({
      brandName: c.brandName,
      brandSlug: c.brandSlug,
      modelName: c.modelName,
      modelSlug: c.modelSlug,
      generationName: c.genName,
      yearStart: c.yearStart,
      yearEnd: c.yearEnd,
      installationPosition: c.installationPosition,
      notes: c.notes,
    })),
  };
}

/** Get category by slug with parent & children */
export async function getCategoryBySlug(slug: string): Promise<CategoryWithAncestors | null> {
  const rows = await db
    .select()
    .from(productCategory)
    .where(eq(productCategory.slug, slug))
    .limit(1);

  if (rows.length === 0) return null;
  const cat = rows[0];

  // Children
  const children = cat.id
    ? await db
        .select({ id: productCategory.id, name: productCategory.name, slug: productCategory.slug, displayOrder: productCategory.displayOrder })
        .from(productCategory)
        .where(eq(productCategory.parentCategoryId, cat.id))
    : [];

  // Parent
  let parent: { id: number; name: string; slug: string } | null = null;
  if (cat.parentCategoryId) {
    const parentRows = await db
      .select({ id: productCategory.id, name: productCategory.name, slug: productCategory.slug })
      .from(productCategory)
      .where(eq(productCategory.id, cat.parentCategoryId))
      .limit(1);
    if (parentRows.length > 0) parent = parentRows[0];
  }

  return {
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    parentCategoryId: cat.parentCategoryId,
    parent,
    children: children.sort((a, b) => a.displayOrder - b.displayOrder),
  };
}

/** Get all categories (tree) */
export async function getAllCategories(): Promise<{ id: number; name: string; slug: string; parentCategoryId: number | null; displayOrder: number }[]> {
  return db
    .select({
      id: productCategory.id,
      name: productCategory.name,
      slug: productCategory.slug,
      parentCategoryId: productCategory.parentCategoryId,
      displayOrder: productCategory.displayOrder,
    })
    .from(productCategory);
}

/** Get products by category slug (and all child categories) */
export async function getProductsByCategory(categorySlug: string, opts: { page: number; pageSize: number }): Promise<{ items: ProductListItem[]; total: number; category: CategoryWithAncestors | null }> {
  const cat = await getCategoryBySlug(categorySlug);
  if (!cat) return { items: [], total: 0, category: null };

  // Collect all category IDs (self + children)
  const categoryIds = [cat.id, ...cat.children.map((c) => c.id)];

  // Find product IDs in these categories
  const productMaps = await db
    .select({ productId: productCategoryMap.productId })
    .from(productCategoryMap)
    .where(inArray(productCategoryMap.categoryId, categoryIds));

  const productIds = [...new Set(productMaps.map((m) => m.productId))];
  const total = productIds.length;

  if (productIds.length === 0) return { items: [], total: 0, category: cat };

  const { page, pageSize } = opts;
  const offset = (page - 1) * pageSize;
  const pageIds = productIds.slice(offset, offset + pageSize);

  const rows = await db
    .select({
      id: product.id,
      slug: product.slug,
      name: product.name,
      sku: product.sku,
      status: product.status,
      brandId: productBrand.id,
      brandName: productBrand.name,
      brandSlug: productBrand.slug,
    })
    .from(product)
    .leftJoin(productBrand, eq(product.productBrandId, productBrand.id))
    .where(inArray(product.id, pageIds));

  // Images
  const images = await db
    .select({
      productId: productImage.productId,
      imageUrl: productImage.imageUrl,
      isThumbnail: productImage.isThumbnail,
      displayOrder: productImage.displayOrder,
    })
    .from(productImage)
    .where(inArray(productImage.productId, pageIds));

  const imagesByProduct = new Map<number, typeof images>();
  for (const img of images) {
    if (!imagesByProduct.has(img.productId)) imagesByProduct.set(img.productId, []);
    imagesByProduct.get(img.productId)!.push(img);
  }

  const categoriesByProduct = await getCategoriesForProducts(pageIds);

  const items: ProductListItem[] = rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    sku: row.sku,
    status: row.status,
    featuredImage: getFeaturedImage(imagesByProduct.get(row.id) ?? []),
    brand: row.brandId
      ? { id: row.brandId, name: row.brandName!, slug: row.brandSlug! }
      : null,
    categories: categoriesByProduct.get(row.id) ?? [],
  }));

  return { items, total, category: cat };
}
