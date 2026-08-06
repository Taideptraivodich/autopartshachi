# Autoparts Monorepo

Monorepo tích hợp frontend React + database layer Drizzle ORM cho hệ thống phụ tùng ô tô.

## Cấu trúc

```
autoparts-monorepo/
├── apps/
│   └── web/          ← Frontend React + Vite (autopartshachi-main)
└── packages/
    └── db/           ← Database layer PostgreSQL + Drizzle ORM (autoparts-db)
```

## Khởi động

### 1. Cài đặt dependencies (root — npm workspaces tự link packages)

```bash
npm install
```

### 2. Cấu hình database

```bash
cp packages/db/.env.example packages/db/.env
# Sửa DATABASE_URL trong packages/db/.env
```

### 3. Chạy migrations & seed

```bash
npm run db:migrate
npm run db:seed
```

### 4. Chạy frontend

```bash
npm run dev
# → http://localhost:3000
```

## Scripts gốc (root)

| Script | Mô tả |
|--------|-------|
| `npm run dev` | Chạy Vite dev server (apps/web) |
| `npm run build` | Build production frontend |
| `npm run db:generate` | Tạo lại SQL migration từ schema |
| `npm run db:migrate` | Apply migrations lên database |
| `npm run db:seed` | Chèn dữ liệu mẫu (dev only) |
| `npm run db:reset` | Xoá toàn bộ DB (dev only) |
| `npm run db:studio` | Mở Drizzle Studio |
| `npm run typecheck` | Kiểm tra TypeScript cả hai packages |
| `npm run lint` | Lint frontend với oxlint |

## Import DB trong Web App

Sau khi `npm install`, web app có thể import trực tiếp từ package DB:

```ts
import { db } from 'autoparts-db';
import { vehicleBrand, product } from 'autoparts-db/schema';
```

> **Lưu ý:** DB package chạy server-side (Node.js + PostgreSQL). Không import
> trực tiếp vào React components — dùng qua API routes hoặc BFF layer.

## Packages

### `packages/db` — Database Layer (Agent 02B.2)

- PostgreSQL + Drizzle ORM
- 13 tables: vehicle_brand, vehicle_model, vehicle_generation, product_brand,
  product_category, product, product_image, product_category_map,
  oem_number, oem_mapping, oem_replacement, oem_cross_reference, compatibility
- Seed data: Toyota, Honda, Ford, Hyundai, Kia + categories + OEM codes

### `apps/web` — Frontend (Agent 01)

- React 19 + Vite 8 + TypeScript
- React Router v7 với 13 routes sẵn sàng
- Design system đầy đủ (tokens, 15+ UI components)
- SEO infrastructure (MetaTags, buildPageTitle)
