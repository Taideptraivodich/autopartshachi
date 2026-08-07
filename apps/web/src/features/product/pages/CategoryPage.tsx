import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import MetaTags from '../../../components/ui/MetaTags';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import { Pagination, SkeletonCard } from '../../../components/ui';
import ProductGrid from '../components/ProductGrid';
import {
  fetchProductsByCategory,
  fetchAllCategories,
} from '../api/product.api';
import type { ProductListItem, CategoryDetail, CategoryListItem } from '../api/types';
import styles from './CategoryPage.module.css';

const PAGE_SIZE = 24;

const CategoryDetailView: React.FC<{ slug: string }> = ({ slug }) => {
  const [items, setItems] = useState<ProductListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<CategoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  
  useEffect(() => {
  let cancelled = false;

  setLoading(true);
  setError(null);
  setNotFound(false);

  fetchProductsByCategory(slug, page, PAGE_SIZE)
    .then((res) => {
      if (cancelled) return;

      setCategory(res.category);
      setItems(res.data);
      setTotal(res.meta.total);
    })
    .catch((err: unknown) => {
      if (cancelled) return;

      const msg =
        err instanceof Error ? err.message : 'Lỗi tải dữ liệu';

      if (
        msg.includes('404') ||
        msg.toLowerCase().includes('not found')
      ) {
        setNotFound(true);
      } else {
        setError(msg);
      }
    })
    .finally(() => {
      if (!cancelled) setLoading(false);
    });

  return () => {
    cancelled = true;
  };
}, [slug, page]);

  const handlePageChange = (newPage: number) => { setPage(newPage); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  if (notFound) return (
    <div className={styles.page}><div className={styles.errorState}>
      <div className={styles.errorIcon}>🔍</div>
      <p><strong>Không tìm thấy danh mục.</strong></p>
      <Link to="/danh-muc" style={{ color: 'var(--color-text-link)', fontSize: 'var(--text-sm)' }}>← Xem tất cả danh mục</Link>
    </div></div>
  );

  if (error) return (
    <div className={styles.page}><div className={styles.errorState}>
      <div className={styles.errorIcon}>⚠️</div>
      <p><strong>Không thể tải danh mục.</strong></p><p>{error}</p>
    </div></div>
  );

  const breadcrumbItems = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Danh mục', href: '/danh-muc' },
    ...(category?.parent ? [{ label: category.parent.name, href: `/danh-muc/${category.parent.slug}` }] : []),
    ...(category ? [{ label: category.name }] : [{ label: '...' }]),
  ];

  return (
    <>
      <MetaTags title={category ? `${category.name} – Phụ tùng ô tô` : 'Danh mục'} description={`Xem các sản phẩm trong danh mục ${category?.name ?? ''} tại Hachi Việt Nam`} />
      <div className={styles.breadcrumbRow}><Breadcrumb items={breadcrumbItems} /></div>
      <div className={styles.header}>
        {category?.parent && <Link to={`/danh-muc/${category.parent.slug}`} className={styles.parentBreadcrumb}>↑ {category.parent.name}</Link>}
        <h1 className={styles.title}>{category?.name ?? 'Đang tải...'}</h1>
      </div>
      {(category?.children?.length ?? 0) > 0 && (
        <div className={styles.childCategories}>
          {category!.children.map((child) => <Link key={child.id} to={`/danh-muc/${child.slug}`} className={styles.childCat}>{child.name}</Link>)}
        </div>
      )}
      <div className={styles.productHeader}>
        <span />{!loading && <span className={styles.productCount}>{total} sản phẩm</span>}
      </div>
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          <ProductGrid products={items} emptyMessage="Danh mục này chưa có sản phẩm" />
          {total > PAGE_SIZE && <div className={styles.pagination}><Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={handlePageChange} /></div>}
        </>
      )}
    </>
  );
};

const CategoryListView: React.FC = () => {
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllCategories()
      .then((res) => setCategories(res.data))
      .catch((err: unknown) => { setError(err instanceof Error ? err.message : 'Lỗi tải danh mục'); })
      .finally(() => setLoading(false));
  }, []);

  const roots = categories.filter((c) => c.parentCategoryId === null);
  const childrenOf = (parentId: number) => categories.filter((c) => c.parentCategoryId === parentId);

  return (
    <>
      <MetaTags title="Danh mục phụ tùng ô tô" description="Xem tất cả danh mục phụ tùng ô tô tại Hachi Việt Nam" />
      <div className={styles.breadcrumbRow}><Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Danh mục' }]} /></div>
      <div className={styles.header}><h1 className={styles.title}>Danh mục sản phẩm</h1></div>
      {error ? (
        <div className={styles.errorState}><div className={styles.errorIcon}>⚠️</div><p><strong>Không thể tải danh mục.</strong></p><p>{error}</p></div>
      ) : loading ? (
        <div className={styles.childCategories}>
          {Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ height: 40, background: 'var(--color-surface-raised)', borderRadius: 6, opacity: 0.5 }} />)}
        </div>
      ) : roots.length === 0 ? (
        <div className={styles.errorState}><div className={styles.errorIcon}>📂</div><p>Chưa có danh mục nào.</p></div>
      ) : (
        <div className={styles.categoryTree}>
          {roots.map((root) => {
            const children = childrenOf(root.id);
            return (
              <div key={root.id} className={styles.categoryGroup}>
                <Link to={`/danh-muc/${root.slug}`} className={styles.categoryGroupTitle}>{root.name}</Link>
                {children.length > 0 && (
                  <div className={styles.childCategories}>
                    {children.map((child) => <Link key={child.id} to={`/danh-muc/${child.slug}`} className={styles.childCat}>{child.name}</Link>)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  return (
    <div className="container">
      <div className={styles.page}>
        {slug ? <CategoryDetailView slug={slug} /> : <CategoryListView />}
      </div>
    </div>
  );
};

export default CategoryPage;
