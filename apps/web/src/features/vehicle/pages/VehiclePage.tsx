import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import MetaTags from '../../../components/ui/MetaTags';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import { fetchAllVehicleBrands, fetchVehicleBrandBySlug } from '../../product/api/product.api';
import type { VehicleBrandListItem, VehicleBrandDetail } from '../../product/api/types';
import styles from './VehiclePage.module.css';

// ── Vehicle Brand List ──────────────────────────────────────────────────────

const VehicleListView: React.FC = () => {
  const [brands, setBrands] = useState<VehicleBrandListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllVehicleBrands()
      .then((res) => setBrands(res.data))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <MetaTags
        title="Tra cứu phụ tùng theo hãng xe – Hachi Việt Nam"
        description="Tìm phụ tùng ô tô phù hợp theo hãng xe: Toyota, Honda, Ford, Hyundai, Kia và nhiều hãng khác."
      />
      <div className={styles.breadcrumbRow}>
        <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Hãng xe' }]} />
      </div>
      <div className={styles.header}>
        <h1 className={styles.title}>Tra cứu theo hãng xe</h1>
        <p className={styles.subtitle}>Chọn hãng xe để xem các dòng xe và phụ tùng phù hợp</p>
      </div>

      {error ? (
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>⚠️</div>
          <p><strong>Không thể tải danh sách hãng xe.</strong></p>
          <p>{error}</p>
        </div>
      ) : loading ? (
        <div className={styles.brandGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      ) : brands.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.errorIcon}>🚗</div>
          <p>Chưa có dữ liệu hãng xe.</p>
        </div>
      ) : (
        <div className={styles.brandGrid}>
          {brands.map((brand) => (
            <Link key={brand.id} to={`/hang-xe/${brand.slug}`} className={styles.brandCard}>
              <div className={styles.brandAvatar}>{brand.name[0]?.toUpperCase()}</div>
              <span className={styles.brandName}>{brand.name}</span>
              {brand.countryOfOrigin && (
                <span className={styles.brandMeta}>{brand.countryOfOrigin}</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </>
  );
};

// ── Vehicle Brand Detail ────────────────────────────────────────────────────

const VehicleDetailView: React.FC<{ slug: string }> = ({ slug }) => {
  const [brand, setBrand] = useState<VehicleBrandDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setNotFound(false);
    setBrand(null);

    fetchVehicleBrandBySlug(slug)
      .then((res) => { if (!cancelled) setBrand(res.data); })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : 'Lỗi tải dữ liệu';
        if (msg.includes('404') || msg.toLowerCase().includes('not found')) {
          setNotFound(true);
        } else {
          setError(msg);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [slug]);

  if (notFound) return (
    <div className={styles.errorState}>
      <div className={styles.errorIcon}>🔍</div>
      <p><strong>Không tìm thấy hãng xe.</strong></p>
      <Link to="/hang-xe" style={{ color: 'var(--color-text-link)', fontSize: 'var(--text-sm)' }}>
        ← Xem tất cả hãng xe
      </Link>
    </div>
  );

  if (error) return (
    <div className={styles.errorState}>
      <div className={styles.errorIcon}>⚠️</div>
      <p><strong>Không thể tải thông tin hãng xe.</strong></p>
      <p>{error}</p>
    </div>
  );

  const breadcrumbItems = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Hãng xe', href: '/hang-xe' },
    ...(brand ? [{ label: brand.name }] : [{ label: '...' }]),
  ];

  return (
    <>
      <MetaTags
        title={brand ? `${brand.name} – Phụ tùng ô tô` : 'Hãng xe'}
        description={brand ? `Xem các dòng xe ${brand.name} và tra cứu phụ tùng phù hợp tại Hachi Việt Nam.` : ''}
      />
      <div className={styles.breadcrumbRow}>
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {loading ? (
        <div className={styles.detailHeader} style={{ opacity: 0.5 }}>
          <div className={styles.detailAvatar}>?</div>
          <div className={styles.detailInfo}>
            <div style={{ height: '1.5rem', width: '160px', background: 'var(--color-surface-2)', borderRadius: 4 }} />
          </div>
        </div>
      ) : (
        <div className={styles.detailHeader}>
          <div className={styles.detailAvatar}>
            {brand?.name[0]?.toUpperCase() ?? '?'}
          </div>
          <div className={styles.detailInfo}>
            <h1 className={styles.title}>{brand?.name}</h1>
            {brand?.countryOfOrigin && (
              <span className={styles.detailCountry}>🌏 {brand.countryOfOrigin}</span>
            )}
          </div>
        </div>
      )}

      {/* CTA to products */}
      <div className={styles.productCta}>
        <p className={styles.productCtaText}>
          Tìm phụ tùng tương thích với xe <strong>{brand?.name ?? '...'}</strong>
        </p>
        <Link to="/san-pham" className={styles.productCtaLink}>
          Xem tất cả sản phẩm →
        </Link>
      </div>

      {/* Models */}
      <h2 className={styles.sectionTitle}>
        Các dòng xe {brand?.name ?? ''}
        {brand && ` (${brand.models.length} dòng)`}
      </h2>

      {loading ? (
        <div className={styles.modelGrid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ height: 72, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', opacity: 0.5 }} />
          ))}
        </div>
      ) : brand?.models.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Chưa có dữ liệu dòng xe cho hãng này.</p>
        </div>
      ) : (
        <div className={styles.modelGrid}>
          {brand?.models.map((model) => (
            <div key={model.id} className={styles.modelCard}>
              <span className={styles.modelName}>{model.name}</span>
              {model.segment && (
                <span className={styles.modelSegment}>{model.segment}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

// ── Page shell ──────────────────────────────────────────────────────────────

const VehiclePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  return (
    <div className="container">
      <div className={styles.page}>
        {slug ? <VehicleDetailView slug={slug} /> : <VehicleListView />}
      </div>
    </div>
  );
};

export default VehiclePage;
