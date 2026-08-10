import React, { useEffect, useState } from 'react';
import MetaTags from '../../../components/ui/MetaTags';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import { Pagination, SkeletonCard } from '../../../components/ui';
import ProductGrid from '../components/ProductGrid';
import FilterSidebar from '../components/FilterSidebar';
import SortBar from '../components/SortBar';
import { fetchProductList, fetchAllBrands, fetchAllCategories } from '../api/product.api';
import type { ProductListItem, BrandListItem, CategoryListItem, ProductFilterParams } from '../api/types';
import styles from './ProductListPage.module.css';

const PAGE_SIZE = 24;

const ProductListPage: React.FC = () => {
  const [items, setItems] = useState<ProductListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<ProductFilterParams>({
    sortBy: 'createdAt',
    sortDir: 'desc',
  });
  const [brands, setBrands] = useState<BrandListItem[]>([]);
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Load brands + categories một lần
  useEffect(() => {
    fetchAllBrands().then((res) => setBrands(res.data)).catch(() => {});
    fetchAllCategories().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  // Fetch sản phẩm khi filter hoặc page thay đổi
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
  };

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

          <div className={styles.layout}>
            {/* Sidebar */}
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

            {/* Main content */}
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
