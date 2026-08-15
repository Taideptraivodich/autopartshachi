import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import MetaTags from '../../../components/ui/MetaTags';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import { Skeleton, SkeletonText } from '../../../components/ui';
import ProductGallery from '../components/ProductGallery';
import OEMBlock from '../components/OEMBlock';
import CompatibilityBlock from '../components/CompatibilityBlock';
import { fetchProductBySlug } from '../api/product.api';
import RelatedProducts from '../components/RelatedProducts';
import type { ProductDetail } from '../api/types';
import { SITE_CONFIG } from '../../../constants/site';
import { useSiteSettings } from '../../../context/SiteSettingsContext';
import styles from './ProductDetailPage.module.css';

function buildZaloOrderLink(product: ProductDetail, quantity: number, zaloPhone: string): { url: string; message: string } {
  const message =
    `Tôi muốn hỏi về sản phẩm: ${product.name} (SKU: ${product.sku})\n` +
    `Số lượng: ${quantity}\n` +
    `---\n` +
    `(Vui lòng cho biết số lượng và địa chỉ nhận hàng để được báo giá)`;
  const phone = zaloPhone.replace(/\D/g, '');
  return { url: `https://zalo.me/${phone}?text=${encodeURIComponent(message)}`, message };
}

function absoluteUrl(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  return value.startsWith('http://') || value.startsWith('https://')
    ? value
    : `${SITE_CONFIG.url}${value.startsWith('/') ? '' : '/'}${value}`;
}

function buildProductSeo(product: ProductDetail): { title: string; description: string } {
  const brandName = product.brand?.name;
  const modelNames = [...new Set(product.compatibility.map((entry) => entry.modelName))].slice(0, 4);
  const compatibilityText = modelNames.length > 0 ? ` Tương thích ${modelNames.join(', ')}.` : '';
  const oemText = product.oemCodes.length > 0
    ? ` Mã OEM: ${product.oemCodes.slice(0, 4).map((code) => code.code).join(', ')}.`
    : '';

  const title = product.metaTitle?.trim() || `${product.name} | HACHI`;
  const description = product.metaDescription?.trim()
    || `${product.name}${brandName ? ` – thương hiệu ${brandName}.` : '.'} SKU ${product.sku}.${compatibilityText}${oemText}`;

  return { title, description };
}

const STATUS_LABEL: Record<string, string> = {
  con_hang: 'Còn hàng',
  het_hang: 'Hết hàng',
  ngung_kinh_doanh: 'Ngừng kinh doanh',
};

const ProductDetailPage: React.FC = () => {
  const siteSettings = useSiteSettings();
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [copiedHint, setCopiedHint] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setNotFound(false);
    setProduct(null);

    fetchProductBySlug(slug)
      .then((res) => {
        if (!cancelled) setProduct(res.data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : 'Lỗi tải dữ liệu';
        if (msg.includes('404') || msg.toLowerCase().includes('không tìm thấy')) setNotFound(true);
        else setError(msg);
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

  if (notFound || error) {
    return (
      <div className="container">
        <div className={styles.page}>
          <div className={styles.errorState}>
            <div className={styles.errorIcon} aria-hidden="true" />
            <p><strong>{notFound ? 'Không tìm thấy sản phẩm.' : 'Không thể tải thông tin sản phẩm.'}</strong></p>
            <p>{notFound ? 'Sản phẩm này có thể đã bị xóa hoặc URL không chính xác.' : error}</p>
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
    ...(product.categories[0] ? [{ label: product.categories[0].name, href: `/danh-muc/${product.categories[0].slug}` }] : []),
    { label: product.name },
  ];
  const productUrl = `${SITE_CONFIG.url}/san-pham/${product.slug}`;
  const imageUrl = absoluteUrl(product.featuredImage);
  const { title: seoTitle, description: seoDescription } = buildProductSeo(product);
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href ? `${SITE_CONFIG.url}${item.href}` : productUrl,
    })),
  };
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: seoTitle,
    description: seoDescription,
    url: productUrl,
    ...(imageUrl ? { primaryImageOfPage: { '@type': 'ImageObject', contentUrl: imageUrl } } : {}),
  };

  return (
    <>
      <MetaTags title={seoTitle} description={seoDescription} ogImage={imageUrl} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema, webPageSchema]) }} />

      <div className="container">
        <div className={styles.page}>
          <div className={styles.breadcrumbRow}><Breadcrumb items={breadcrumbItems} /></div>

          <div className={styles.layout}>
            <div className={styles.galleryCol}>
              <ProductGallery images={product.images} productName={product.name} />
            </div>

            <div className={styles.infoCol}>
              <div className={styles.infoTop}>
                <h1 className={styles.productName}>{product.name}</h1>

                {product.categories.length > 0 && (
                  <div className={styles.categories}>
                    {product.categories.map((cat) => (
                      <Link key={cat.id} to={`/danh-muc/${cat.slug}`} className={styles.catTag}>{cat.name}</Link>
                    ))}
                  </div>
                )}

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
                <div className={styles.descSection}>
                  <p className={styles.sectionTitle}>Mô tả sản phẩm</p>
                  <p className={styles.description}>{product.description}</p>
                </div>
              )}

              {product.specification && (
                <div className={styles.descSection}>
                  <p className={styles.sectionTitle}>Thông số kỹ thuật</p>
                  <p className={styles.description}>{product.specification}</p>
                </div>
              )}

              <div className={styles.quantityRow}>
                <label htmlFor="product-quantity" className={styles.metaLabel}>Số lượng</label>
                <div className={styles.quantityStepper}>
                  <button type="button" aria-label="Giảm số lượng" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
                  <input id="product-quantity" type="number" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))} />
                  <button type="button" aria-label="Tăng số lượng" onClick={() => setQuantity((q) => q + 1)}>+</button>
                </div>
              </div>

              <div className={styles.ctaBlock}>
                <a href={`tel:${siteSettings.phone}`} className={styles.ctaCallBtn}>
                  Gọi ngay tư vấn <span aria-hidden="true">→</span>
                </a>
                <button
                  className={styles.ctaContactBtn}
                  onClick={async () => {
                    const { url, message } = buildZaloOrderLink(product, quantity, siteSettings.zaloPhone);
                    try {
                      await navigator.clipboard.writeText(message);
                      setCopiedHint(true);
                      setTimeout(() => setCopiedHint(false), 3000);
                    } catch {
                      // Clipboard có thể bị chặn; vẫn mở Zalo.
                    }
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }}
                >
                  Đặt hàng qua Zalo <span aria-hidden="true">→</span>
                </button>
                {copiedHint && <p className={styles.copiedHint}>Đã copy nội dung, paste vào Zalo nhé!</p>}
              </div>
            </div>
          </div>

          <div className={styles.sections}>
            {siteSettings.showOem && <OEMBlock codes={product.oemCodes} />}
            <CompatibilityBlock entries={product.compatibility} />
          </div>

          <RelatedProducts currentSlug={product.slug} />
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;
