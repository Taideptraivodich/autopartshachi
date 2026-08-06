import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { PublicLayout } from '../components/layout';
import { PageLoader } from '../components/ui/Skeleton';

// Lazy-loaded pages for code splitting
const HomePage       = lazy(() => import('./pages/HomePage'));
const HangXePage     = lazy(() => import('./pages/HangXePage'));
const ThuongHieuPage = lazy(() => import('./pages/ThuongHieuPage'));
const OemPage        = lazy(() => import('./pages/OemPage'));
const BlogPage       = lazy(() => import('./pages/BlogPage'));
const LienHePage     = lazy(() => import('./pages/LienHePage'));
const NotFoundPage   = lazy(() => import('./pages/NotFoundPage'));
const ServerErrorPage = lazy(() => import('./pages/ServerErrorPage'));

// Agent 03 – Product Catalog
const SanPhamPage    = lazy(() => import('../features/product/pages/ProductListPage'));
const SanPhamDetail  = lazy(() => import('../features/product/pages/ProductDetailPage'));
const DanhMucPage    = lazy(() => import('../features/product/pages/CategoryPage'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    errorElement: (
      <PublicLayout />
    ),
    children: [
      { index: true,               element: <HomePage /> },
      { path: 'san-pham',          element: <SanPhamPage /> },
      { path: 'san-pham/:slug',    element: <SanPhamDetail /> },
      { path: 'hang-xe',           element: <HangXePage /> },
      { path: 'hang-xe/:slug',     element: <HangXePage /> },
      { path: 'danh-muc',          element: <DanhMucPage /> },
      { path: 'danh-muc/:slug',    element: <DanhMucPage /> },
      { path: 'thuong-hieu',       element: <ThuongHieuPage /> },
      { path: 'thuong-hieu/:slug', element: <ThuongHieuPage /> },
      { path: 'oem',               element: <OemPage /> },
      { path: 'blog',              element: <BlogPage /> },
      { path: 'blog/:slug',        element: <BlogPage /> },
      { path: 'lien-he',          element: <LienHePage /> },
      { path: '500',               element: <ServerErrorPage /> },
      { path: '404',               element: <NotFoundPage /> },
      { path: '*',                 element: <NotFoundPage /> },
    ],
  },
]);

const AppRouter: React.FC = () => (
  <Suspense fallback={<PageLoader />}>
    <RouterProvider router={router} />
  </Suspense>
);

export default AppRouter;
