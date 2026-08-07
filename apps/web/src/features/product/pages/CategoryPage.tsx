import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import MetaTags from '../../../components/ui/MetaTags';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import { Pagination, SkeletonCard } from '../../../components/ui';
import ProductGrid from '../components/ProductGrid';
import { fetchProductsByCategory } from '../api/product.api';
import type { ProductListItem, CategoryDetail } from '../api/types';
import styles from './CategoryPage.module.css';

const PAGE_SIZE = 24;

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [items, setItems] = useState<ProductListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<CategoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setNotFound(false);

    fetchProductsByCategory(slug, page, PAGE_SIZE)
      .then((res) => {
        if (cancelled) return;
        setItems(res.data);
        setTotal(res.meta.total);
        setCategory(res.category);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : 'Lỗi tải dữ liệu';
        if (msg.includes('404') || msg.toLowerCase().includes('không tìm thấy')) {
          setNotFound(true);
        } else {
          setError(msg);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [slug, page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset page when slug changes
  useEffect(() => { setPage(1); }, [slug]);

  if (notFound) {
    return (
      <div className="container">
        <div className={styles.page}>
          <div className={styles.errorState}>
            <div className={styles.errorIcon}>🔍</div>
            <p><strong>Không tìm thấy danh mục.</strong></p>
            <Link to="/san-pham" style={{ color: 'var(--color-text-link)', fontSize: 'var(--text-sm)' }}>
              ← Xem tất cả sản phẩm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className={styles.page}>
          <div className={styles.errorState}>
            <div className={styles.errorIcon}>⚠️</div>
            <p><strong>Không thể tải danh mục.</strong></p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Danh mục', href: '/danh-muc' },
    ...(category?.parent
      ? [{ label: category.parent.name, href: `/danh-muc/${category.parent.slug}` }]
      : []),
    ...(category ? [{ label: category.name }] : []),
  ];

  return (
    <>
      <MetaTags
        title={category ? `${category.name} – Phụ tùng ô tô` : 'Danh mục'}
        description={`Xem các sản phẩm trong danh mục ${category?.name ?? ''} tại Hachi Việt Nam`}
      />

      <div className="container">
        <div className={styles.page}>
          <div className={styles.breadcrumbRow}>
            <Breadcrumb items={breadcrumbItems} />
          </div>

          {/* Header */}
          <div className={styles.header}>
            {category?.parent && (
              <Link to={`/danh-muc/${category.parent.slug}`} className={styles.parentBreadcrumb}>
                ↑ {category.parent.name}
              </Link>
            )}
            <h1 className={styles.title}>
              {loading && !category ? 'Đang tải...' : (category?.name ?? 'Danh mục')}
            </h1>
          </div>

          {/* Child categories */}
          {category && category.children.length > 0 && (
            <div className={styles.childCategories}>
              {category.children.map((child) => (
                <Link
                  key={child.id}
                  to={`/danh-muc/${child.slug}`}
                  className={styles.childCat}
                >
                  {child.name}
                </Link>
              ))}
            </div>
          )}

          {/* Products */}
          <div className={styles.productHeader}>
            <span />
            {!loading && (
              <span className={styles.productCount}>{total} sản phẩm</span>
            )}
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <>
              <ProductGrid products={items} emptyMessage="Danh mục này chưa có sản phẩm" />

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
    </>
  );
};

export default CategoryPage;
