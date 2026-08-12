# RESUME.md — Autopartshachi Admin Panel (Session 4 — HOÀN CHỈNH)

## Trạng thái
Patch tích lũy — paste đè toàn bộ lên repo. Tất cả tính năng admin đã hoàn chỉnh.

---

## ✅ TẤT CẢ ĐÃ XONG

### Backend API
| Route | Mô tả |
|---|---|
| POST `/api/admin/login` | Đăng nhập admin |
| GET/POST `/api/admin/san-pham` | Danh sách + tạo sản phẩm |
| GET/PUT/DELETE `/api/admin/san-pham/:id` | Chi tiết + sửa + xóa |
| PATCH `/api/admin/san-pham/:id/visibility` | Ẩn/hiện sản phẩm |
| GET/POST `/api/admin/thuong-hieu` | CRUD thương hiệu |
| PUT/DELETE `/api/admin/thuong-hieu/:id` | |
| GET/POST `/api/admin/danh-muc` | CRUD danh mục (isActive) |
| PUT/DELETE `/api/admin/danh-muc/:id` | |
| GET/PATCH `/api/admin/settings` | Cài đặt website |
| GET/POST `/api/admin/hang-xe` | CRUD hãng xe |
| GET/POST `/api/admin/hang-xe/:brandId/dong-xe` | CRUD dòng xe |
| GET/POST `/api/admin/hang-xe/dong-xe/:modelId/doi-xe` | CRUD đời xe |
| PUT/DELETE `/api/admin/hang-xe/:id` | |
| PUT/DELETE `/api/admin/hang-xe/dong-xe/:id` | |
| PUT/DELETE `/api/admin/hang-xe/doi-xe/:id` | |
| GET `/api/admin/lead` | Danh sách lead (phân trang, lọc unread) |
| PATCH `/api/admin/lead/:id/read` | Đánh dấu đọc/chưa đọc |
| DELETE `/api/admin/lead/:id` | Xóa lead |

### Frontend pages
| Route | Page | Tính năng |
|---|---|---|
| `/admin` | Dashboard | 6 cards |
| `/admin/san-pham` | ProductList | Search, filter status, toggle visibility |
| `/admin/san-pham/moi` | ProductForm | Tạo sản phẩm |
| `/admin/san-pham/:id/sua` | ProductForm | Sửa sản phẩm |
| `/admin/thuong-hieu` | BrandList | CRUD thương hiệu |
| `/admin/danh-muc` | CategoryList | CRUD + tree view |
| `/admin/hang-xe` | VehicleBrandList | 3-panel drill-down |
| `/admin/cai-dat` | Settings | Form cài đặt |
| `/admin/lead` | LeadList | Xem + mark read + xóa |

---

## 🔲 Không còn gì dang dở

Tất cả tính năng trong scope đã hoàn chỉnh. Nếu cần thêm:
- Image upload thực (S3/Cloudinary) trong ProductForm
- Export leads ra CSV
- Thống kê/dashboard charts

---

## Lệnh dev
```bash
npm run dev:api   # API port 3001
npm run dev       # Web port 5173
# http://localhost:5173/admin
```

## Migration cần chạy
```bash
npm run db:migrate
```
File migration: `packages/db/src/db/migrations/0005_visibility_settings.sql`
