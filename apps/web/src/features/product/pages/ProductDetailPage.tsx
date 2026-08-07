import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import MetaTags from '../../../components/ui/MetaTags';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import { Skeleton, SkeletonText } from '../../../components/ui';
import ProductGallery from '../components/ProductGallery';
import OEMBlock from '../components/OEMBlock';
import CompatibilityBlock from '../components/CompatibilityBlock';
import { fetchProductBySlug } from '../api/product.api';
import type { ProductDetail } from '../api/types';
import styles from './ProductDetailPage.module.css';

const STATUS_LABEL: Record<string, string> = {
  con_hang: 'Còn hàng',
  het_hang: 'Hết hàng',
  ngung_kinh_doanh: 'Ngừng kinh doanh',
};

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setNotFound(false);
    setProduct(null);

    fetchProductBySlug(slug)
      .then((res) => {
        if (cancelled) return;
        setProduct(res.data);
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
  }, [slug]);

  if (loading) {
    return (
      <div className="container">
        <div className={styles.page}>
          <div className={styles.skeleton}>
            <Skeleton height={400} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <SkeletonText lines={1} />
              <SkeletonText lines={3} />
              <SkeletonText lines={2} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="container">
        <div className={styles.page}>
          <div className={styles.errorState}>
            <div className={styles.errorIcon}>🔍</div>
            <p><strong>Không tìm thấy sản phẩm.</strong></p>
            <p>Sản phẩm này có thể đã bị xóa hoặc URL không chính xác.</p>
            <Link to="/san-pham" className={styles.backLink}>← Xem tất cả sản phẩm</Link>
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
            <p><strong>Không thể tải thông tin sản phẩm.</strong></p>
            <p>{error}</p>
            <Link to="/san-pham" className={styles.backLink}>← Xem tất cả sản phẩm</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const breadcrumbItems = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Sản phẩm', href: '/san-pham' },
    ...(product.categories[0]
      ? [{ label: product.categories[0].name, href: `/danh-muc/${product.categories[0].slug}` }]
      : []),
    { label: product.name },
  ];

  return (
    <>
      <MetaTags
        title={product.name}
        description={product.description ?? `Phụ tùng ${product.name} – SKU: ${product.sku}`}
        ogImage={product.featuredImage ?? undefined}
      />

      <div className="container">
        <div className={styles.page}>
          <div className={styles.breadcrumbRow}>
            <Breadcrumb items={breadcrumbItems} />
          </div>

          {/* Main 2-column layout */}
          <div className={styles.layout}>
            {/* Gallery */}
            <div className={styles.galleryCol}>
              <ProductGallery images={product.images} productName={product.name} />
            </div>

            {/* Info */}
            <div className={styles.infoCol}>
              <div className={styles.infoTop}>
                <h1 className={styles.productName}>{product.name}</h1>

                {/* Categories */}
                {product.categories.length > 0 && (
                  <div className={styles.categories}>
                    {product.categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/danh-muc/${cat.slug}`}
                        className={styles.catTag}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Meta row */}
                <div className={styles.meta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>SKU</span>
                    <span className={`${styles.metaValue} ${styles.skuValue}`}>{product.sku}</span>
                  </div>
                  {product.brand && (
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Thương hiệu</span>
                      <span className={styles.metaValue}>{product.brand.name}</span>
                    </div>
                  )}
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Trạng thái</span>
                    <span className={`${styles.statusBadge} ${styles[`status--${product.status}`]}`}>
                      {STATUS_LABEL[product.status] ?? product.status}
                    </span>
                  </div>
                </div>
              </div>

              {product.description && (
                <>
                  <hr className={styles.divider} />
                  <div className={styles.descSection}>
                    <p className={styles.sectionTitle}>Mô tả sản phẩm</p>
                    <p className={styles.description}>{product.description}</p>
                  </div>
                </>
              )}

              {product.specification && (
                <>
                  <hr className={styles.divider} />
                  <div className={styles.descSection}>
                    <p className={styles.sectionTitle}>Thông số kỹ thuật</p>
                    <p className={styles.description}>{product.specification}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* OEM + Compatibility sections */}
          <div className={styles.sections}>
            <OEMBlock codes={product.oemCodes} />
            <CompatibilityBlock entries={product.compatibility} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;
