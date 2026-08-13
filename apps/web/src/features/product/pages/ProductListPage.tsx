import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MetaTags from '../../../components/ui/MetaTags';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import { Pagination, SkeletonCard } from '../../../components/ui';
import ProductGrid from '../components/ProductGrid';
import FilterSidebar from '../components/FilterSidebar';
import SortBar from '../components/SortBar';
import { fetchProductList, fetchAllBrands, fetchAllCategories } from '../api/product.api';
import type { ProductListItem, BrandListItem, CategoryListItem, ProductFilterParams } from '../api/types';
import { useVehicleSelector } from '../../vehicle/hooks/useVehicleSelector';
import styles from './ProductListPage.module.css';

const PAGE_SIZE = 24;

const ProductListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getSelected, clearSelected } = useVehicleSelector();

  const [items, setItems] = useState<ProductListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const vehicleModelIdFromUrl = searchParams.get('vehicleModelId')
    ? Number(searchParams.get('vehicleModelId'))
    : undefined;
  const vehicleYearFromUrl = searchParams.get('vehicleYear')
    ? Number(searchParams.get('vehicleYear'))
    : undefined;

  const [filters, setFilters] = useState<ProductFilterParams>(() => ({
    sortBy: 'createdAt',
    sortDir: 'desc',
    vehicleModelId: vehicleModelIdFromUrl,
    vehicleYear: vehicleYearFromUrl,
  }));
  const [brands, setBrands] = useState<BrandListItem[]>([]);
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    setFilters((f) => ({
      ...f,
      vehicleModelId: vehicleModelIdFromUrl,
      vehicleYear: vehicleYearFromUrl,
    }));
    setPage(1);
  }, [vehicleModelIdFromUrl, vehicleYearFromUrl]);

  useEffect(() => {
    fetchAllBrands().then((res) => setBrands(res.data)).catch(() => {});
    fetchAllCategories().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchProductList(page, PAGE_SIZE, filters)
      .then((res) => {
        if (cancelled) return;
        setItems(res.data);
        setTotal(res.meta.total);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [filters, page]);

  const handleFilterChange = (newFields: ProductFilterParams) => {
    setFilters((f) => ({ ...f, ...newFields }));
    setPage(1);
  };

  const handleReset = () => {
    setFilters({ sortBy: 'createdAt', sortDir: 'desc' });
    setPage(1);
    setSearchParams({});
  };

  const handleClearVehicle = () => {
    clearSelected();
    const next = new URLSearchParams(searchParams);
    next.delete('vehicleModelId');
    next.delete('vehicleYear');
    setSearchParams(next);
  };

  const selectedVehicle = getSelected();
  const vehicleBannerLabel = vehicleModelIdFromUrl && vehicleYearFromUrl
    && selectedVehicle?.modelId === vehicleModelIdFromUrl
    && selectedVehicle?.year === vehicleYearFromUrl
    ? selectedVehicle.vehicleLabel
    : vehicleModelIdFromUrl && vehicleYearFromUrl
      ? `Dòng xe #${vehicleModelIdFromUrl} — ${vehicleYearFromUrl}`
      : null;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <MetaTags
        title="Sản phẩm phụ tùng ô tô"
        description="Xem toàn bộ danh sách phụ tùng ô tô chính hãng tại Hachi Việt Nam"
      />

      <div className="container">
        <div className={styles.page}>
          <div className={styles.breadcrumbRow}>
            <Breadcrumb
              items={[
                { label: 'Trang chủ', href: '/' },
                { label: 'Sản phẩm' },
              ]}
            />
          </div>

          <h1 className={styles.title}>Sản phẩm phụ tùng</h1>

          {vehicleBannerLabel && (
            <div className={styles.vehicleBanner}>
              <span>🚗 Đang lọc phụ tùng cho: <strong>{vehicleBannerLabel}</strong></span>
              <button className={styles.vehicleBannerClear} onClick={handleClearVehicle}>
                ✕ Bỏ lọc xe
              </button>
            </div>
          )}

          <div className={styles.layout}>
            <aside
              className={`${styles.sidebarWrap} ${mobileFilterOpen ? styles.mobileOpen : ''}`}
            >
              <FilterSidebar
                brands={brands}
                categories={categories}
                filters={filters}
                onChange={handleFilterChange}
                onReset={handleReset}
                loading={loading}
              />
            </aside>

            <div className={styles.mainContent}>
              <SortBar
                total={total}
                sortBy={filters.sortBy ?? 'createdAt'}
                sortDir={filters.sortDir ?? 'desc'}
                onChange={(sortBy, sortDir) => handleFilterChange({ sortBy, sortDir })}
                onMobileFilterToggle={() => setMobileFilterOpen((o) => !o)}
              />

              {error ? (
                <div className={styles.errorState}>
                  <div className={styles.errorIcon}>⚠️</div>
                  <p><strong>Không thể tải danh sách sản phẩm.</strong></p>
                  <p>{error}</p>
                </div>
              ) : loading ? (
                <div className={styles.loadingGrid}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : (
                <>
                  <ProductGrid products={items} />

                  {total > PAGE_SIZE && (
                    <div className={styles.pagination}>
                      <Pagination
                        page={page}
                        pageSize={PAGE_SIZE}
                        total={total}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductListPage;
