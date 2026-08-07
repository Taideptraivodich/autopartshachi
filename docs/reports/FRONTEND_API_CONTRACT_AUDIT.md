# Frontend/API Contract Audit

**Agent:** 04D  
**Date:** 2026  
**Status:** ✅ All mismatches resolved — Build pass, 0 TypeScript errors

---

## Summary

| # | Screen / Component | Mismatch | Severity | Status |
|---|---|---|---|---|
| 1 | ProductCard | `product.categories` undefined | 🔴 Runtime crash | Fixed |
| 2 | ProductDetailPage | `product.categories/oemCodes/compatibility` undefined | 🔴 Runtime crash | Fixed |
| 3 | CategoryPage | `fetchProductsByCategory` → wrong API contract | 🔴 HTTP failure | Fixed |
| 4 | CategoryPage `/danh-muc` | `slug=undefined` → infinite skeleton | 🟠 UX broken | Fixed |
| 5 | CategoryPage `/danh-muc` | No list UI existed | 🟠 Blank page | Fixed |
| 6 | ProductListPage | `console.log` debug left in | 🟡 Dev artifact | Fixed |
| 7 | ProductListPage | No empty state | 🟡 UX gap | Fixed |
| 8 | ProductDetailPage | Breadcrumb used `categories[0]` | 🟠 Runtime crash | Fixed |
| 9 | ProductDetailPage | `metaTitle/metaDescription` not used | 🟡 SEO gap | Fixed |

---

## Mismatch Details

### 1 — ProductCard: `product.categories` undefined

**Expected (FE):**
```ts
interface ProductListItem {
  categories: CategorySummary[];  // FE expected this
}
```

**Actual (API `GET /api/san-pham`):**
```json
{ "id": 1, "slug": "...", "name": "...", "sku": "...", "status": "...", "featuredImage": "...", "brand": {...} }
```
`categories` không có trong response.

**Fix:** Xóa `categories` khỏi `ProductListItem` type. Xóa categories block khỏi `ProductCard.tsx`.

---

### 2 — ProductDetailPage: `categories`, `oemCodes`, `compatibility` undefined

**Expected (FE `ProductDetail`):**
```ts
interface ProductDetail extends ProductListItem {
  categories: CategorySummary[];    // ❌ không có
  oemCodes: OemCode[];              // ❌ không có
  compatibility: CompatibilityEntry[];  // ❌ không có
  images: ProductImage[];
}
```

**Actual (API `GET /api/san-pham/:slug`):**
```json
{
  "data": {
    "id", "slug", "name", "sku", "status",
    "description", "specification",
    "metaTitle", "metaDescription",
    "featuredImage", "brand",
    "images": [...]
  }
}
```

**Fix:**
- Xóa `categories/oemCodes/compatibility` khỏi `ProductDetail` interface.
- `OEMBlock` và `CompatibilityBlock` nhận `codes={[]}` / `entries={[]}` — hiển thị empty state đúng.
- `images` dùng `product.images ?? []` để null-safe.
- Giữ `OemCode` và `CompatibilityEntry` types riêng để components compile, chú thích rõ chờ API mở rộng.

---

### 3 — CategoryPage: sai API contract

**Expected (FE `fetchProductsByCategory`):**
```
GET /api/danh-muc/:slug?page=1&pageSize=24
→ { data: ProductListItem[], category: CategoryDetail, meta: { page, pageSize, total } }
```

**Actual (API `GET /api/danh-muc/:slug`):**
```json
{ "data": { "id", "name", "slug", "parentCategoryId", "displayOrder", "parent", "children" } }
```
Endpoint chỉ trả `CategoryDetail`, không kèm products.

**Fix:**
- Xóa `fetchProductsByCategory` cũ.
- Thêm `fetchCategoryBySlug(slug)` → `GET /api/danh-muc/:slug`.
- Thêm `fetchProductsByCategoryId(categoryId, page, pageSize)` → `GET /api/san-pham?categoryId=...`.
- `CategoryPage` dùng 2 calls tuần tự: load category trước, sau đó load products bằng `category.id`.

---

### 4 & 5 — CategoryPage `/danh-muc`: infinite skeleton + no list UI

**Problem:** `CategoryPage` dùng `useParams<{ slug: string }>()`. Khi route là `/danh-muc` (không có slug), `slug = undefined`. Code có `if (!slug) return;` → `setLoading` không bao giờ chuyển sang `false` → skeleton mãi mãi.

Đồng thời `/danh-muc` không có UI để hiển thị danh sách danh mục.

**Fix:** Tách thành 2 sub-component:
- `CategoryDetailView` — render khi `slug` có giá trị.
- `CategoryListView` — render khi `slug = undefined`, gọi `fetchAllCategories()`, hiển thị cây danh mục root + children.
- `CategoryPage` wrapper: `slug ? <CategoryDetailView> : <CategoryListView>`.

---

### 6 — ProductListPage: `console.log` debug

```ts
console.log("API RESPONSE", res);   // ❌
console.log("ITEMS", items);        // ❌ (còn dùng stale closure)
console.log("TOTAL", total);        // ❌
```

**Fix:** Xóa toàn bộ.

---

### 7 — ProductListPage: thiếu empty state

Khi API trả `data: []`, `loading=false`, không có `error` → component render `<ProductGrid products={[]}/>` mà không thông báo rõ ràng.

**Fix:** Thêm điều kiện `items.length === 0` riêng sau `loading=false`.

---

### 8 — ProductDetailPage: breadcrumb crash

```ts
// ❌ categories không còn trong type
...(product.categories[0]
  ? [{ label: product.categories[0].name, ... }]
  : []),
```

**Fix:** Breadcrumb đơn giản: `Trang chủ → Sản phẩm → [Tên SP]`.

---

### 9 — ProductDetailPage: metaTitle/metaDescription không được dùng

API trả `metaTitle` và `metaDescription` nhưng `MetaTags` dùng `product.name` và `product.description` thuần túy.

**Fix:**
```tsx
<MetaTags
  title={product.metaTitle ?? product.name}
  description={product.metaDescription ?? product.description ?? `...`}
/>
```

---

## Files Changed

| File | Change |
|---|---|
| `src/features/product/api/types.ts` | Xóa `categories` khỏi `ProductListItem`/`ProductDetail`; xóa `ProductsByCategory`; thêm `CategoryDetailResponse`; giữ `OemCode`/`CompatibilityEntry` với chú thích |
| `src/features/product/api/product.api.ts` | Xóa `fetchProductsByCategory`; thêm `fetchCategoryBySlug` + `fetchProductsByCategoryId` |
| `src/features/product/components/ProductCard.tsx` | Xóa categories block |
| `src/features/product/pages/ProductListPage.tsx` | Xóa console.log; thêm empty state |
| `src/features/product/pages/ProductDetailPage.tsx` | Xóa categories/oemCodes/compatibility; null-safe images; fix breadcrumb; dùng metaTitle/metaDescription |
| `src/features/product/pages/CategoryPage.tsx` | Rewrite: tách CategoryDetailView + CategoryListView; 2-call pattern |
| `src/features/product/pages/CategoryPage.module.css` | Thêm `.categoryTree`, `.categoryGroup`, `.categoryGroupTitle` |

---

## Verified Screens

| Route | Status | Notes |
|---|---|---|
| `/san-pham` | ✅ Renders 15 products | loading → success → list |
| `/san-pham/:slug` | ✅ Renders product detail | loading → success → detail |
| `/danh-muc` | ✅ Renders category tree | CategoryListView |
| `/danh-muc/:slug` | ✅ Renders products by category | 2-call: category then products |
| `/thuong-hieu` | ℹ️ Placeholder | Chờ Agent chuyên trách |
| `/thuong-hieu/:slug` | ℹ️ Placeholder | Chờ Agent chuyên trách |
| `/oem` | ℹ️ Placeholder | Chờ Agent chuyên trách |
| `/hang-xe` | ℹ️ Placeholder | Chờ Agent chuyên trách |

---

## API Features Not Yet Exposed (chờ Agent tiếp theo)

Các field API `04B` **đã implement** nhưng **FE chưa dùng**:

| Field | Endpoint | Ghi chú |
|---|---|---|
| `oemCodes[]` | Chưa có trong `ProductDetailResult` | Cần Agent 04B mở rộng |
| `compatibility[]` | Chưa có trong `ProductDetailResult` | Cần Agent 04B mở rộng |
| `categories[]` trong ProductDetail | Chưa có | Cần join `productCategoryMap` |
| `GET /api/san-pham/:slug/lien-quan` | Có route, chưa có UI | Sẵn sàng khi cần |
