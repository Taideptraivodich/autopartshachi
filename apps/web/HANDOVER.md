# HANDOVER – AGENT 01: BASE FOUNDATION

## ✅ Trạng thái: HOÀN THÀNH

Build production: **PASS** | TypeScript: **PASS** | Routes: **9/9** hoạt động

---

## Cấu trúc thư mục

```
src/
├── app/
│   ├── pages/           ← Tất cả placeholder pages
│   └── router.tsx       ← React Router v7 config
├── components/
│   ├── layout/          ← Header, Footer, PublicLayout, SkipLink
│   └── ui/              ← Design system components
├── constants/
│   ├── navigation.ts    ← NAV_ITEMS, QUICK_LINKS
│   └── site.ts          ← SITE_CONFIG, ROUTES, BREAKPOINTS
├── lib/
│   └── seo.ts           ← buildPageTitle(), buildMeta()
├── styles/
│   ├── tokens.css       ← CSS custom properties (single source of truth)
│   └── global.css       ← Reset + typography utilities
├── types/
│   └── index.ts         ← Shared TypeScript types
└── vite-env.d.ts        ← CSS module declarations
```

---

## Routes sẵn sàng

| URL | Component | Ghi chú |
|-----|-----------|---------|
| `/` | HomePage | Layout đầy đủ với placeholder sections |
| `/san-pham` | SanPhamPage | Placeholder – Agent Product thay thế |
| `/hang-xe` | HangXePage | Placeholder – Agent Vehicle thay thế |
| `/hang-xe/:slug` | HangXePage | Dynamic route sẵn sàng |
| `/danh-muc` | DanhMucPage | Placeholder – Agent Category thay thế |
| `/danh-muc/:slug` | DanhMucPage | Dynamic route sẵn sàng |
| `/thuong-hieu` | ThuongHieuPage | Placeholder |
| `/oem` | OemPage | Placeholder – Agent OEM thay thế |
| `/blog` | BlogPage | Placeholder – Agent Blog thay thế |
| `/blog/:slug` | BlogPage | Dynamic route sẵn sàng |
| `/lien-he` | LienHePage | Placeholder – Agent LeadForm thay thế |
| `/404` | NotFoundPage | Error UI hoàn chỉnh |
| `/500` | ServerErrorPage | Error UI hoàn chỉnh |
| `/*` | NotFoundPage | Catch-all |

---

## Design Tokens (CSS Variables)

Tất cả tokens định nghĩa trong `src/styles/tokens.css`. Không hardcode màu hoặc spacing.

### Colors
- `--color-primary-{50..900}` – Steel blue
- `--color-secondary-{50..900}` – Slate
- `--color-accent-{50..700}` – Chrome orange (CTA)
- `--color-success/warning/danger/info` – Semantic
- `--color-bg`, `--color-surface`, `--color-surface-2/3` – Backgrounds
- `--color-border`, `--color-border-strong`, `--color-border-focus`
- `--color-text-primary/secondary/tertiary/disabled/inverse/link`

### Typography
- `--text-xs` (12px) → `--text-5xl` (60px)
- `--font-regular/medium/semibold/bold/extrabold`
- Class utilities: `.text-display`, `.text-heading-1` → `.text-small`, `.text-label`

### Spacing
- `--space-1` (4px) → `--space-32` (128px) — base 4px grid

### Others
- `--radius-sm/md/lg/xl/2xl/full`
- `--shadow-xs/sm/md/lg/xl/focus`
- `--transition-fast/base/slow`
- `--z-base/above/dropdown/sticky/overlay/modal/toast`
- `--header-height: 64px`

---

## Shared Components (src/components/ui/)

| Component | Props nổi bật |
|-----------|--------------|
| `Button` | variant, size, loading, fullWidth, leftIcon, rightIcon |
| `Input` | label, error, hint, leftIcon, rightIcon |
| `Textarea` | label, error, hint, rows |
| `Select` | options[], placeholder, label, error |
| `Checkbox` | label, description |
| `RadioGroup` | name, options[], value, onChange, direction |
| `Badge` | variant, size, dot |
| `Card` + CardHeader/Body/Footer | padding, shadow, border, hover |
| `Modal` | open, onClose, title, size, footer |
| `Drawer` | open, onClose, title, side, footer |
| `Pagination` | page, pageSize, total, onPageChange |
| `Breadcrumb` | items: BreadcrumbItem[] |
| `Skeleton` | width, height |
| `SkeletonText` | lines |
| `SkeletonCard` | — |
| `Spinner` | size |
| `PageLoader` | — |
| `MetaTags` | title, description, canonical, ogTitle, ogImage, noIndex |

Import:
```ts
import { Button, Input, Badge, Modal } from '@/components/ui';
```

---

## SEO Infrastructure

- `MetaTags` component – quản lý `<title>`, `<meta>`, canonical, OG tags qua `useEffect`
- `src/lib/seo.ts` – `buildPageTitle()`, `buildMeta()` helpers
- **Chưa làm:** sitemap generation, robots.txt (Agent SEO mở rộng)

---

## Quy tắc cho Agent tiếp theo

1. **Không sửa** `tokens.css` – thêm token mới nếu cần, không đổi tên cũ
2. **Không tạo component UI riêng** – dùng `src/components/ui/` hoặc extend
3. **Mọi page mới** phải wrap trong `<MetaTags />` với title đầy đủ
4. **Route mới** – thêm vào `src/app/router.tsx`, không tạo router riêng
5. **Spacing/color** – chỉ dùng CSS variables, không hardcode
6. **Code splitting** – mọi page lazy import: `const Page = lazy(() => import('./pages/Page'))`

---

## Khởi động local

```bash
npm install
npm run dev   # http://localhost:3000
npm run build # Production build
```
