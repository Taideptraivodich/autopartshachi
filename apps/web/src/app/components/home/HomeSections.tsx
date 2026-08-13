import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import VehicleSelectorWidget from '../../../features/vehicle/components/VehicleSelectorWidget';
import {
  fetchFeaturedProducts,
  fetchAllCategories,
  fetchAllBrands,
  fetchAllVehicleBrands,
} from '../../../features/product/api/product.api';
import type {
  ProductListItem,
  CategoryListItem,
  BrandListItem,
  VehicleBrandListItem,
} from '../../../features/product/api/types';
import styles from './HomeSections.module.css';

export const HeroSection: React.FC = () => (
  <section className={styles.hero}>
    <div className="container">
      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <p className={styles.heroKicker}>HACHI / AUTOMOTIVE PARTS</p>
          <h1 className={styles.heroTitle}>
            Phụ tùng ô tô.<br />
            <span>Giá tốt, giao nhanh.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Khám phá phụ tùng theo hãng xe, đời xe hoặc mã OEM trong một không gian mua sắm gọn gàng, dễ tra cứu.
          </p>
          <div className={styles.heroActions}>
            <Link to="/san-pham" className={styles.heroPrimary}>
              Khám phá sản phẩm <span aria-hidden="true">→</span>
            </Link>
            <Link to="/hang-xe" className={styles.heroSecondary}>
              Tra cứu theo hãng xe
            </Link>
          </div>
        </div>
        <div className={styles.heroMeta} aria-hidden="true">
          <span>HACHI</span>
          <span>OEM / AFTERMARKET</span>
        </div>
      </div>
    </div>
  </section>
);

export const VehicleFinderSection: React.FC = () => (
  <section className={styles.finderSection}>
    <div className="container">
      <div className={styles.finderPanel}>
        <div className={styles.finderIntro}>
          <div>
            <p className={styles.eyebrow}>VEHICLE FINDER</p>
            <h2 className={styles.finderTitle}>Tìm phụ tùng theo xe</h2>
          </div>
          <p className={styles.finderText}>
            Chọn hãng, dòng và đời xe để lọc phụ tùng phù hợp.
          </p>
        </div>
        <VehicleSelectorWidget mode="full" />
      </div>
    </div>
  </section>
);

export const FeaturedProductCard: React.FC<{ product: ProductListItem }> = ({ product }) => (
  <Link to={`/san-pham/${product.slug}`} className={styles.productCard}>
    <div className={styles.productImg}>
      {product.featuredImage ? (
        <>
          <img src={product.featuredImage} alt={product.name} loading="lazy" />
          <span className={styles.productWatermark} aria-hidden="true">
            <strong>HACHI</strong>
            <small>ORIGINAL PARTS</small>
          </span>
        </>
      ) : (
        <div className={styles.productImgEmpty} aria-hidden="true" />
      )}
    </div>
    <div className={styles.productBody}>
      {product.brand && <p className={styles.productBrand}>{product.brand.name}</p>}
      <p className={styles.productName}>{product.name}</p>
      <div className={styles.productMeta}>
        <span className={styles.productSku}>{product.sku}</span>
        {product.status === 'con_hang' && <span className={styles.productStatus}>Còn hàng</span>}
      </div>
    </div>
  </Link>
);

export const FeaturedProductsSection: React.FC = () => {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts(8)
      .then((res) => setProducts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>HACHI SELECTION</p>
            <h2 className={styles.sectionTitle}>Sản phẩm nổi bật</h2>
          </div>
          <Link to="/san-pham" className={styles.sectionLink}>
            Xem tất cả <span aria-hidden="true">→</span>
          </Link>
        </div>
        {loading ? (
          <div className={styles.productsGrid}>
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className={styles.skeletonProduct} />)}
          </div>
        ) : products.length === 0 ? (
          <p className={styles.emptyState}>
            Chưa có sản phẩm nổi bật. <Link to="/san-pham">Xem tất cả sản phẩm →</Link>
          </p>
        ) : (
          <div className={styles.productsGrid}>
            {products.map((product) => <FeaturedProductCard key={product.id} product={product} />)}
          </div>
        )}
      </div>
    </section>
  );
};

export const PopularCategoriesSection: React.FC = () => {
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllCategories()
      .then((res) => setCategories(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const roots = categories.filter((category) => category.parentCategoryId === null).slice(0, 8);

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>EXPLORE</p>
            <h2 className={styles.sectionTitle}>Danh mục phụ tùng</h2>
          </div>
          <Link to="/danh-muc" className={styles.sectionLink}>
            Xem tất cả <span aria-hidden="true">→</span>
          </Link>
        </div>
        {loading ? (
          <div className={styles.categoryGrid}>
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className={styles.skeletonCategory} />)}
          </div>
        ) : roots.length === 0 ? (
          <p className={styles.emptyState}>Chưa có danh mục nào.</p>
        ) : (
          <div className={styles.categoryGrid}>
            {roots.map((category, index) => (
              <Link key={category.id} to={`/danh-muc/${category.slug}`} className={styles.categoryCard}>
                <span className={styles.categoryIndex}>{String(index + 1).padStart(2, '0')}</span>
                <span className={styles.catName}>{category.name}</span>
                <span className={styles.categoryArrow} aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const LogoCard: React.FC<{ name: string; logoUrl: string | null; href: string }> = ({ name, logoUrl, href }) => (
  <Link to={href} className={styles.brandCard}>
    <div className={styles.brandLogo}>
      {logoUrl ? <img src={logoUrl} alt={name} loading="lazy" /> : <span className={styles.brandLogoFallback}>{name}</span>}
    </div>
    <span className={styles.brandName}>{name}</span>
  </Link>
);

export const PopularBrandsSection: React.FC = () => {
  const [brands, setBrands] = useState<BrandListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllBrands()
      .then((res) => setBrands(res.data.slice(0, 10)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className={`${styles.section} ${styles.sectionTint}`}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>AFTERMARKET BRANDS</p>
            <h2 className={styles.sectionTitle}>Thương hiệu phụ tùng</h2>
          </div>
          <Link to="/thuong-hieu" className={styles.sectionLink}>
            Xem tất cả <span aria-hidden="true">→</span>
          </Link>
        </div>
        {loading ? (
          <div className={styles.brandGrid}>
            {Array.from({ length: 10 }).map((_, i) => <div key={i} className={styles.skeletonBrand} />)}
          </div>
        ) : brands.length === 0 ? (
          <p className={styles.emptyState}>Chưa có thương hiệu.</p>
        ) : (
          <div className={styles.brandGrid}>
            {brands.map((brand) => (
              <LogoCard key={brand.id} name={brand.name} logoUrl={brand.logoUrl} href={`/thuong-hieu/${brand.slug}`} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export const VehicleBrandsSection: React.FC = () => {
  const [brands, setBrands] = useState<VehicleBrandListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllVehicleBrands()
      .then((res) => setBrands(res.data.slice(0, 10)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>VEHICLE MAKES</p>
            <h2 className={styles.sectionTitle}>Hãng xe</h2>
          </div>
          <Link to="/hang-xe" className={styles.sectionLink}>
            Xem tất cả <span aria-hidden="true">→</span>
          </Link>
        </div>
        {loading ? (
          <div className={styles.brandGrid}>
            {Array.from({ length: 10 }).map((_, i) => <div key={i} className={styles.skeletonBrand} />)}
          </div>
        ) : brands.length === 0 ? (
          <p className={styles.emptyState}>Chưa có dữ liệu hãng xe.</p>
        ) : (
          <div className={styles.brandGrid}>
            {brands.map((brand) => (
              <LogoCard key={brand.id} name={brand.name} logoUrl={brand.logoUrl} href={`/hang-xe/${brand.slug}`} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export const TrustSection: React.FC = () => (
  <section className={styles.trustSection}>
    <div className="container">
      <div className={styles.trustHeader}>
        <p className={styles.eyebrow}>WHY HACHI</p>
        <h2 className={styles.sectionTitle}>Mua phụ tùng với thông tin rõ ràng</h2>
      </div>
      <div className={styles.trustGrid}>
        <div className={styles.trustItem}><span>01</span><div><h3>Hàng chính hãng</h3><p>Xuất xứ và thông tin phụ tùng được thể hiện rõ ràng.</p></div></div>
        <div className={styles.trustItem}><span>02</span><div><h3>Tra cứu OEM</h3><p>Tìm theo mã OEM để giảm nhầm lẫn khi chọn phụ tùng.</p></div></div>
        <div className={styles.trustItem}><span>03</span><div><h3>Giao hàng toàn quốc</h3><p>Hỗ trợ gửi hàng tới khách hàng ở nhiều tỉnh thành.</p></div></div>
        <div className={styles.trustItem}><span>04</span><div><h3>Hỗ trợ tư vấn</h3><p>Liên hệ HACHI khi cần kiểm tra thêm thông tin tương thích.</p></div></div>
      </div>
    </div>
  </section>
);
