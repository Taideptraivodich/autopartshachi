# HANDOVER_02 — Product CRUD (Admin) — Gói file cập nhật

Giải nén và paste đè (copy overwrite) các thư mục `apps/` và `packages/` vào
đúng vị trí trong repo local (root repo: `autopartshachi/`).

## File MỚI (6 file)

```
packages/api/src/services/admin-product.service.ts
packages/api/src/controllers/admin-product.controller.ts
packages/api/src/routes/admin-product.routes.ts
apps/web/src/features/admin/api/admin-product.api.ts
apps/web/src/app/pages/admin/AdminProductListPage.tsx
apps/web/src/app/pages/admin/AdminProductFormPage.tsx
```

## File SỬA (11 file — đè lên bản cũ, KHÔNG xóa gì ngoài phần liên quan)

```
packages/db/src/repositories/product.repository.ts   — thêm create/update/delete/setCategories/setImages/findBySlugLike/findCategoryIdsByProductId
packages/db/src/repositories/oem.repository.ts        — thêm findOrCreateByCode/setOemMappings/findOemCodesByProductId
packages/db/src/repositories/vehicle.repository.ts    — thêm setCompatibility/findCompatibilityByProductId

packages/api/src/services/vehicle.service.ts           — thêm getGenerationsByModelId (VehicleGenerationItem)
packages/api/src/controllers/vehicle.controller.ts     — thêm getGenerationsByModel
packages/api/src/routes/vehicle.routes.ts               — thêm GET /hang-xe/dong-xe/:modelId/doi-xe
packages/api/src/routes/admin.routes.ts                 — SỬA QUAN TRỌNG: route catch-all cũ
                                                            (router.use("/admin", requireAdmin, handler))
                                                            sẽ nuốt mọi request /api/admin/san-pham/*.
                                                            Đã đổi thành router.get("/admin", ...) chỉ khớp
                                                            đúng path gốc, không còn shadow các sub-router.
packages/api/src/index.ts                                — wire AdminProductService/Controller + mount
                                                            app.use("/api/admin/san-pham", requireAdmin, ...)

apps/web/src/features/admin/api/adminApiFetch.ts         — thêm xử lý response 204 No Content (DELETE)
                                                            để không crash khi res.json() gặp body rỗng
apps/web/src/features/product/api/product.api.ts         — thêm fetchVehicleGenerationsByModelId
apps/web/src/features/product/api/types.ts                — thêm type VehicleGenerationItem
apps/web/src/app/router.tsx                                — thêm 3 route con /admin/san-pham,
                                                            /admin/san-pham/moi, /admin/san-pham/:id/sua
```

## Lưu ý khi paste đè

- File `packages/api/src/routes/admin.routes.ts` có thay đổi **quan trọng** —
  nếu bạn có sửa gì thêm ở file này sau khi nhận handover trước, hãy diff kỹ
  trước khi đè, vì route catch-all cũ chặn hoàn toàn các API sản phẩm admin.
- Sau khi paste xong, chạy lại:
  ```bash
  npm install
  npm run typecheck   # packages/db có 10 lỗi TS pre-existing (không liên quan
                       # đến handover này — đã xác nhận tồn tại từ trước, xem
                       # ghi chú trong report cũ nếu cần fix riêng)
  npm run build        # build apps/web — đã pass sạch
  ```
- Không có migration DB mới — dùng đúng các bảng đã có (`product`, `product_category_map`,
  `product_image`, `oem_number`, `oem_mapping`, `compatibility`).

## Endpoint mới cần biết

```
GET    /api/admin/san-pham              (list, page/pageSize/brandId/categoryId/status)
GET    /api/admin/san-pham/:id          (full detail — categoryIds, oemCodes, compatibility)
POST   /api/admin/san-pham              (create)
PUT    /api/admin/san-pham/:id          (update — partial, field không gửi = giữ nguyên)
DELETE /api/admin/san-pham/:id          (delete — 204)

GET    /api/hang-xe/dong-xe/:modelId/doi-xe   (danh sách đời xe theo dòng xe — public,
                                                cần cho form "Xe tương thích")
```

Tất cả `/api/admin/san-pham/*` đều yêu cầu header `Authorization: Bearer <token>`.
