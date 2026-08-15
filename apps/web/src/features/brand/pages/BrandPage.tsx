import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import MetaTags from '../../../components/ui/MetaTags';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import { Pagination, SkeletonCard } from '../../../components/ui';
import ProductGrid from '../../product/components/ProductGrid';
import { fetchAllBrands, fetchBrandBySlug } from '../../product/api/product.api';
import type { BrandListItem, BrandDetail, ProductListItem } from '../../product/api/types';
import styles from './BrandPage.module.css';

const PAGE_SIZE = 24;
const SITE_URL = 'https://phutunghachi.com';

function breadcrumbSchema(items: { label: string; href?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
    })),
  };
}

const BrandListView: React.FC = () => {
  const [brands, setBrands] = useState<BrandListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const breadcrumbs = [{ label: 'Trang chủ', href: '/' }, { label: 'Thương hiệu' }];

  useEffect(() => {
    fetchAllBrands()
      .then((res) => setBrands(res.data))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <MetaTags
        title="Thương hiệu phụ tùng ô tô – Hachi Việt Nam"
        description="Khám phá các thương hiệu phụ tùng ô tô chính hãng tại Hachi: Bosch, Denso, Aisin, NGK, Toyota Genuine Parts và nhiều hơn nữa."
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(breadcrumbs)) }} />
      <div className={styles.breadcrumbRow}><Breadcrumb items={breadcrumbs} /></div>
      <div className={styles.header}>
        <h1 className={styles.title}>Thương hiệu phụ tùng</h1>
        <p className={styles.subtitle}>Tìm phụ tùng ô tô theo thương hiệu, xem sản phẩm đang có và tra cứu nhanh theo hãng xe tương thích.</p>
      </div>
      {error ? (
        <div className={styles.errorState}><div className={styles.errorIcon}>⚠️</div><p><strong>Không thể tải danh sách thương hiệu.</strong></p><p>{error}</p></div>
      ) : loading ? (
        <div className={styles.brandGrid}>{Array.from({ length: 8 }).map((_, i) => <div key={i} className={styles.skeletonCard} />)}</div>
      ) : brands.length === 0 ? (
        <div className={styles.emptyState}><div className={styles.errorIcon}>🏷️</div><p>Chưa có thương hiệu nào.</p></div>
      ) : (
        <div className={styles.brandGrid}>
          {brands.map((brand) => (
            <Link key={brand.id} to={`/thuong-hieu/${brand.slug}`} className={styles.brandCard}>
              <div className={styles.brandAvatar}>
                {brand.logoUrl ? <img src={brand.logoUrl} alt={`Logo ${brand.name}`} style={{ width: 48, height: 48, objectFit: 'contain', display: 'block' }} /> : brand.name[0]?.toUpperCase()}
              </div>
              <span className={styles.brandName}>{brand.name}</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
};

const BrandDetailView: React.FC<{ slug: string }> = ({ slug }) => {
  const [brand, setBrand] = useState<BrandDetail | null>(null);
  const [items, setItems] = useState<ProductListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null); setNotFound(false); setBrand(null); setItems([]); setTotal(0); setPage(1);
    fetchBrandBySlug(slug, 1, PAGE_SIZE)
      .then((res) => { if (!cancelled) { setBrand(res.data); setItems(res.products.data); setTotal(res.products.meta.total); } })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : 'Lỗi tải dữ liệu';
        if (msg.includes('404') || msg.toLowerCase().includes('not found')) setNotFound(true); else setError(msg);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    if (!brand || page === 1) return;
    let cancelled = false;
    setLoading(true);
    fetchBrandBySlug(slug, page, PAGE_SIZE)
      .then((res) => { if (!cancelled) { setItems(res.products.data); setTotal(res.products.meta.total); } })
      .catch((err: unknown) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Lỗi'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [brand, page, slug]);

  const handlePageChange = (newPage: number) => { setPage(newPage); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const breadcrumbs = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Thương hiệu', href: '/thuong-hieu' },
    ...(brand ? [{ label: brand.name }] : [{ label: '...' }]),
  ];

  if (notFound) return <div className={styles.errorState}><div className={styles.errorIcon}>🔍</div><p><strong>Không tìm thấy thương hiệu.</strong></p><Link to="/thuong-hieu" style={{ color: 'var(--color-text-link)', fontSize: 'var(--text-sm)' }}>← Xem tất cả thương hiệu</Link></div>;
  if (error) return <div className={styles.errorState}><div className={styles.errorIcon}>⚠️</div><p><strong>Không thể tải thông tin thương hiệu.</strong></p><p>{error}</p></div>;

  return (
    <>
      <MetaTags
        title={brand ? `${brand.name} – Phụ tùng chính hãng` : 'Thương hiệu'}
        description={brand ? `Tra cứu phụ tùng ô tô ${brand.name}: danh sách sản phẩm, thương hiệu và thông tin tương thích theo hãng xe tại Hachi Việt Nam.` : ''}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(breadcrumbs)) }} />
      <div className={styles.breadcrumbRow}><Breadcrumb items={breadcrumbs} /></div>
      <div className={styles.detailHeader}>
        <div className={styles.detailAvatar}>{brand?.name[0]?.toUpperCase() ?? '?'}</div>
        <div className={styles.detailInfo}>
          <h1 className={styles.title}>{brand?.name ?? 'Đang tải...'}</h1>
          {!loading && <p className={styles.subtitle}>{total} sản phẩm</p>}
        </div>
      </div>

      <div className={styles.productHeader}><span />{!loading && <span className={styles.productCount}>{total} sản phẩm</span>}</div>
      <p className={styles.subtitle} style={{ maxWidth: 760, marginBottom: 'var(--space-5)' }}>
        Tại HACHI, bạn có thể xem nhanh các sản phẩm {brand?.name ?? ''}, chọn sản phẩm phù hợp theo nhu cầu và tiếp tục tra cứu xe tương thích từ trang sản phẩm.
      </p>
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-5)' }}>
        <Link to="/san-pham" className={styles.childCat}>Tất cả phụ tùng</Link>
        <Link to="/hang-xe" className={styles.childCat}>Tra cứu theo hãng xe</Link>
        <Link to="/danh-muc" className={styles.childCat}>Xem theo danh mục</Link>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>{Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : (
        <>
          <ProductGrid products={items} emptyMessage={`Thương hiệu ${brand?.name ?? ''} chưa có sản phẩm nào`} />
          {total > PAGE_SIZE && <div className={styles.pagination}><Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={handlePageChange} /></div>}
        </>
      )}
    </>
  );
};

const BrandPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  return <div className="container"><div className={styles.page}>{slug ? <BrandDetailView slug={slug} /> : <BrandListView />}</div></div>;
};

export default BrandPage;
