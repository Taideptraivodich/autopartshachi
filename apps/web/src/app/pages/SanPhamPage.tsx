import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import MetaTags from '../../components/ui/MetaTags';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { fetchAllBrands, fetchAllCategories, fetchProductList } from '../../features/product/api/product.api';
import type { BrandListItem, CategoryListItem, ProductListItem } from '../../features/product/api/types';
import styles from './SanPhamPage.module.css';

const PAGE_SIZE = 24;

const ProductCard: React.FC<{ product: ProductListItem }> = ({ product }) => (
  <Link to={`/san-pham/${product.slug}`} className={styles.productCard}>
    <div className={styles.productImage}>
      {product.featuredImage ? (
        <>
          <img src={product.featuredImage} alt={product.name} loading="lazy" />
          <span className={styles.watermark} aria-hidden="true">
            <strong>HACHI</strong>
            <small>ORIGINAL PARTS</small>
          </span>
        </>
      ) : (
        <span className={styles.imageFallback} aria-hidden="true" />
      )}
    </div>
    <div className={styles.productBody}>
      {product.brand && <span className={styles.brand}>{product.brand.name}</span>}
      <h3 className={styles.productName}>{product.name}</h3>
      <div className={styles.productMeta}>
        <span className={styles.sku}>{product.sku}</span>
        <span className={product.status === 'con_hang' ? styles.available : styles.unavailable}>
          {product.status === 'con_hang' ? 'Còn hàng' : product.status === 'het_hang' ? 'Hết hàng' : 'Ngừng kinh doanh'}
        </span>
      </div>
    </div>
  </Link>
);

const SanPhamPage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get('page') ?? '1'));
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [brands, setBrands] = useState<BrandListItem[]>([]);
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const brandId = params.get('brandId') ?? '';
  const categoryId = params.get('categoryId') ?? '';
  const status = params.get('status') ?? '';
  const sortBy = (params.get('sortBy') as 'createdAt' | 'name' | null) ?? 'createdAt';
  const sortDir = (params.get('sortDir') as 'asc' | 'desc' | null) ?? 'desc';
  const vehicleGenerationId = params.get('vehicleGenerationId') ?? '';

  useEffect(() => {
    Promise.all([
      fetchAllBrands().then((res) => setBrands(res.data)),
      fetchAllCategories().then((res) => setCategories(res.data)),
    ]).catch(() => {
      setBrands([]);
      setCategories([]);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchProductList(page, PAGE_SIZE, {
      brandId: brandId ? Number(brandId) : undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      status: status as 'con_hang' | 'het_hang' | 'ngung_kinh_doanh' | '',
      sortBy,
      sortDir,
      vehicleGenerationId: vehicleGenerationId ? Number(vehicleGenerationId) : undefined,
    })
      .then((res) => {
        setProducts(res.data);
        setTotal(res.meta.total);
      })
      .catch(() => {
        setProducts([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [page, brandId, categoryId, status, sortBy, sortDir, vehicleGenerationId]);

  const roots = useMemo(() => categories.filter((category) => category.parentCategoryId === null), [categories]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setParams(next);
  };

  const clearFilters = () => {
    setParams({ page: '1' });
  };

  return (
    <>
      <MetaTags
        title="Sản phẩm phụ tùng ô tô"
        description="Khám phá danh mục phụ tùng ô tô theo thương hiệu, danh mục và tình trạng."
      />
      <main className={styles.page}>
        <div className="container">
          <div className={styles.breadcrumb}>
            <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Sản phẩm' }]} />
          </div>

          <header className={styles.header}>
            <div>
              <p className={styles.eyebrow}>PARTS CATALOG</p>
              <h1 className={styles.title}>Sản phẩm</h1>
              <p className={styles.subtitle}>
                Tra cứu phụ tùng theo thương hiệu, danh mục hoặc xe tương thích.
              </p>
            </div>
            <button type="button" className={styles.filterToggle} onClick={() => setFiltersOpen((open) => !open)}>
              {filtersOpen ? 'Đóng bộ lọc' : 'Bộ lọc'}
            </button>
          </header>

          <div className={styles.catalogLayout}>
            <aside className={`${styles.sidebar} ${filtersOpen ? styles.sidebarOpen : ''}`} aria-label="Bộ lọc sản phẩm">
              <div className={styles.sidebarHeader}>
                <div>
                  <p className={styles.filterEyebrow}>FILTERS</p>
                  <h2 className={styles.filterTitle}>Lọc sản phẩm</h2>
                </div>
                <button type="button" className={styles.clearButton} onClick={clearFilters}>Xóa lọc</button>
              </div>

              <label className={styles.filterGroup}>
                <span>Thương hiệu</span>
                <select value={brandId} onChange={(event) => updateParam('brandId', event.target.value)}>
                  <option value="">Tất cả thương hiệu</option>
                  {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                </select>
              </label>

              <label className={styles.filterGroup}>
                <span>Danh mục</span>
                <select value={categoryId} onChange={(event) => updateParam('categoryId', event.target.value)}>
                  <option value="">Tất cả danh mục</option>
                  {roots.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </label>

              <label className={styles.filterGroup}>
                <span>Tình trạng</span>
                <select value={status} onChange={(event) => updateParam('status', event.target.value)}>
                  <option value="">Tất cả</option>
                  <option value="con_hang">Còn hàng</option>
                  <option value="het_hang">Hết hàng</option>
                  <option value="ngung_kinh_doanh">Ngừng kinh doanh</option>
                </select>
              </label>

              <label className={styles.filterGroup}>
                <span>Sắp xếp</span>
                <select
                  value={`${sortBy}:${sortDir}`}
                  onChange={(event) => {
                    const [nextSort, nextDir] = event.target.value.split(':');
                    const next = new URLSearchParams(params);
                    next.set('sortBy', nextSort);
                    next.set('sortDir', nextDir);
                    next.set('page', '1');
                    setParams(next);
                  }}
                >
                  <option value="createdAt:desc">Mới nhất</option>
                  <option value="name:asc">Tên A → Z</option>
                  <option value="name:desc">Tên Z → A</option>
                </select>
              </label>

              {vehicleGenerationId && (
                <div className={styles.vehicleFilter}>
                  <span className={styles.vehicleLabel}>XE ĐÃ CHỌN</span>
                  <p>Đang hiển thị sản phẩm tương thích với đời xe đã chọn.</p>
                  <button type="button" onClick={() => updateParam('vehicleGenerationId', '')}>Bỏ bộ lọc xe →</button>
                </div>
              )}
            </aside>

            <section className={styles.results} aria-live="polite">
              <div className={styles.resultsHeader}>
                <div>
                  <p className={styles.resultEyebrow}>HACHI SELECTION</p>
                  <h2 className={styles.resultsTitle}>{loading ? 'Đang tải sản phẩm...' : `${total.toLocaleString('vi-VN')} sản phẩm`}</h2>
                </div>
                <span className={styles.pageLabel}>Trang {page} / {totalPages}</span>
              </div>

              {loading ? (
                <div className={styles.productGrid}>
                  {Array.from({ length: 12 }).map((_, index) => <div className={styles.skeleton} key={index} />)}
                </div>
              ) : products.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className={styles.emptyMark}>—</span>
                  <h3>Không tìm thấy sản phẩm phù hợp</h3>
                  <p>Thử thay đổi thương hiệu, danh mục hoặc tình trạng.</p>
                  <button type="button" onClick={clearFilters}>Xóa tất cả bộ lọc</button>
                </div>
              ) : (
                <div className={styles.productGrid}>
                  {products.map((product) => <ProductCard key={product.id} product={product} />)}
                </div>
              )}

              {totalPages > 1 && (
                <nav className={styles.pagination} aria-label="Phân trang sản phẩm">
                  <button type="button" disabled={page <= 1} onClick={() => { const next = new URLSearchParams(params); next.set('page', String(page - 1)); setParams(next); }}>←</button>
                  {Array.from({ length: Math.min(totalPages, 7) }).map((_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <button key={pageNumber} type="button" className={pageNumber === page ? styles.pageActive : ''} onClick={() => { const next = new URLSearchParams(params); next.set('page', String(pageNumber)); setParams(next); }}>
                        {pageNumber}
                      </button>
                    );
                  })}
                  <button type="button" disabled={page >= totalPages} onClick={() => { const next = new URLSearchParams(params); next.set('page', String(page + 1)); setParams(next); }}>→</button>
                </nav>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
};

export default SanPhamPage;
