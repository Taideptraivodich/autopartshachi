import React, { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { PublicLayout } from "../components/layout";
import { PageLoader } from "../components/ui/Skeleton";
import AdminRoute from "./AdminRoute";

// Lazy-loaded pages for code splitting
const HomePage = lazy(() => import("./pages/HomePage"));
const HangXePage = lazy(() => import("../features/vehicle/pages/VehiclePage"));
const ThuongHieuPage = lazy(() => import("../features/brand/pages/BrandPage"));
const OemPage = lazy(() => import("./pages/OemPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const LienHePage = lazy(() => import("./pages/LienHePage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const ServerErrorPage = lazy(() => import("./pages/ServerErrorPage"));

// Admin
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage"));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const AdminProductListPage = lazy(() => import("./pages/admin/AdminProductListPage"));
const AdminProductFormPage = lazy(() => import("./pages/admin/AdminProductFormPage"));

// Agent 03 – Product Catalog
const SanPhamPage = lazy(
  () => import("../features/product/pages/ProductListPage"),
);
const SanPhamDetail = lazy(
  () => import("../features/product/pages/ProductDetailPage"),
);
const DanhMucPage = lazy(
  () => import("../features/product/pages/CategoryPage"),
);

const router = createBrowserRouter([
  // ── Admin (outside PublicLayout) ─────────────────────────────────────────
  {
    path: "/admin/login",
    element: <AdminLoginPage />,
  },
  {
    path: "/admin",
    element: <AdminRoute />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: "san-pham", element: <AdminProductListPage /> },
      { path: "san-pham/moi", element: <AdminProductFormPage /> },
      { path: "san-pham/:id/sua", element: <AdminProductFormPage /> },
    ],
  },
  // ── Public site ───────────────────────────────────────────────────────────
  {
    path: "/",
    element: <PublicLayout />,
    errorElement: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "san-pham", element: <SanPhamPage /> },
      { path: "san-pham/:slug", element: <SanPhamDetail /> },
      { path: "hang-xe", element: <HangXePage /> },
      { path: "hang-xe/:slug/:modelSlug", element: <HangXePage /> },
      { path: "hang-xe/:slug", element: <HangXePage /> },
      { path: "danh-muc", element: <DanhMucPage /> },
      { path: "danh-muc/:slug", element: <DanhMucPage /> },
      { path: "thuong-hieu", element: <ThuongHieuPage /> },
      { path: "thuong-hieu/:slug", element: <ThuongHieuPage /> },
      { path: "tim-kiem", element: <SearchPage /> },
      { path: "oem", element: <OemPage /> },
      { path: "blog", element: <BlogPage /> },
      { path: "blog/:slug", element: <BlogPage /> },
      { path: "lien-he", element: <LienHePage /> },
      { path: "500", element: <ServerErrorPage /> },
      { path: "404", element: <NotFoundPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

const AppRouter: React.FC = () => (
  <Suspense fallback={<PageLoader />}>
    <RouterProvider router={router} />
  </Suspense>
);

export default AppRouter;
