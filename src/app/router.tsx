import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { PublicLayout } from '../components/layout';
import { PageLoader } from '../components/ui/Skeleton';

// Lazy-loaded pages for code splitting
const HomePage       = lazy(() => import('./pages/HomePage'));
const SanPhamPage    = lazy(() => import('./pages/SanPhamPage'));
const HangXePage     = lazy(() => import('./pages/HangXePage'));
const DanhMucPage    = lazy(() => import('./pages/DanhMucPage'));
const ThuongHieuPage = lazy(() => import('./pages/ThuongHieuPage'));
const OemPage        = lazy(() => import('./pages/OemPage'));
const BlogPage       = lazy(() => import('./pages/BlogPage'));
const LienHePage     = lazy(() => import('./pages/LienHePage'));
const NotFoundPage   = lazy(() => import('./pages/NotFoundPage'));
const ServerErrorPage = lazy(() => import('./pages/ServerErrorPage'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    errorElement: (
      <PublicLayout />
    ),
    children: [
      { index: true,          element: <HomePage /> },
      { path: 'san-pham',    element: <SanPhamPage /> },
      { path: 'hang-xe',     element: <HangXePage /> },
      { path: 'hang-xe/:slug', element: <HangXePage /> },
      { path: 'danh-muc',   element: <DanhMucPage /> },
      { path: 'danh-muc/:slug', element: <DanhMucPage /> },
      { path: 'thuong-hieu', element: <ThuongHieuPage /> },
      { path: 'thuong-hieu/:slug', element: <ThuongHieuPage /> },
      { path: 'oem',        element: <OemPage /> },
      { path: 'blog',       element: <BlogPage /> },
      { path: 'blog/:slug', element: <BlogPage /> },
      { path: 'lien-he',   element: <LienHePage /> },
      { path: '500',       element: <ServerErrorPage /> },
      { path: '404',       element: <NotFoundPage /> },
      { path: '*',         element: <NotFoundPage /> },
    ],
  },
]);

const AppRouter: React.FC = () => (
  <Suspense fallback={<PageLoader />}>
    <RouterProvider router={router} />
  </Suspense>
);

export default AppRouter;
