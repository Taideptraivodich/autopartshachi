import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MetaTags from '../../components/ui/MetaTags';
import VehicleSelectorWidget from '../../features/vehicle/components/VehicleSelectorWidget';
import {
  fetchFeaturedProducts,
  fetchAllCategories,
  fetchAllBrands,
  fetchAllVehicleBrands,
} from '../../features/product/api/product.api';
import type {
  ProductListItem,
  CategoryListItem,
  BrandListItem,
  VehicleBrandListItem,
} from '../../features/product/api/types';
import styles from './HomePage.module.css';

const FeaturedProductCard: React.FC<{ product: ProductListItem }> = ({ product }) => (
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

const FeaturedProductsSection: React.FC = () => {
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
          <Link to="/san-pham" className={styles.sectionLink}>Xem tất cả <span aria-hidden="true">→</span></Link>
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
            {products.map((p) => <FeaturedProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </section>
  );
};

const PopularCategoriesSection: React.FC = () => {
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllCategories()
      .then((res) => setCategories(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const roots = categories.filter((c) => c.parentCategoryId === null).slice(0, 8);

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>EXPLORE</p>
            <h2 className={styles.sectionTitle}>Danh mục phụ tùng</h2>
          </div>
          <Link to="/danh-muc" className={styles.sectionLink}>Xem tất cả <span aria-hidden="true">→</span></Link>
        </div>
        {loading ? (
          <div className={styles.categoryGrid}>
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className={styles.skeletonCategory} />)}
          </div>
        ) : roots.length === 0 ? (
          <p className={styles.emptyState}>Chưa có danh mục nào.</p>
        ) : (
          <div className={styles.categoryGrid}>
            {roots.map((cat, index) => (
              <Link key={cat.id} to={`/danh-muc/${cat.slug}`} className={styles.categoryCard}>
                <span className={styles.categoryIndex}>{String(index + 1).padStart(2, '0')}</span>
                <span className={styles.catName}>{cat.name}</span>
                <span className={styles.categoryArrow} aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const PopularBrandsSection: React.FC = () => {
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
          <Link to="/thuong-hieu" className={styles.sectionLink}>Xem tất cả <span aria-hidden="true">→</span></Link>
        </div>
        {loading ? (
          <div className={styles.brandGrid}>
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className={styles.skeletonBrand} />)}
          </div>
        ) : brands.length === 0 ? (
          <p className={styles.emptyState}>Chưa có thương hiệu.</p>
        ) : (
          <div className={styles.brandGrid}>
            {brands.map((brand) => (
              <Link key={brand.id} to={`/thuong-hieu/${brand.slug}`} className={styles.brandCard}>
                <div className={styles.brandLogo}>
                  {brand.logoUrl ? <img src={brand.logoUrl} alt={brand.name} loading="lazy" /> : null}
                </div>
                <span className={styles.brandName}>{brand.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const VehicleBrandsSection: React.FC = () => {
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
          <Link to="/hang-xe" className={styles.sectionLink}>Xem tất cả <span aria-hidden="true">→</span></Link>
        </div>
        {loading ? (
          <div className={styles.brandGrid}>
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className={styles.skeletonBrand} />)}
          </div>
        ) : brands.length === 0 ? (
          <p className={styles.emptyState}>Chưa có dữ liệu hãng xe.</p>
        ) : (
          <div className={styles.brandGrid}>
            {brands.map((brand) => (
              <Link key={brand.id} to={`/hang-xe/${brand.slug}`} className={styles.brandCard}>
                <div className={styles.brandLogo}>
                  {brand.logoUrl ? <img src={brand.logoUrl} alt={brand.name} loading="lazy" /> : null}
                </div>
                <span className={styles.brandName}>{brand.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <MetaTags
        title="Trang chủ"
        description="Cung cấp phụ tùng ô tô chính hãng. Tra cứu theo hãng xe, mã OEM. Giao hàng toàn quốc."
      />

      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <p className={styles.heroKicker}>HACHI / AUTOMOTIVE PARTS</p>
              <h1 className={styles.heroTitle}>Phụ tùng đúng xe.<br /><span>Đúng mã.</span></h1>
              <p className={styles.heroSubtitle}>
                Khám phá phụ tùng theo hãng xe, đời xe hoặc mã OEM trong một không gian mua sắm gọn gàng, dễ tra cứu.
              </p>
              <div className={styles.heroActions}>
                <Link to="/san-pham" className={styles.heroPrimary}>Khám phá sản phẩm <span aria-hidden="true">→</span></Link>
                <Link to="/hang-xe" className={styles.heroSecondary}>Tra cứu theo hãng xe</Link>
              </div>
            </div>
            <div className={styles.heroMeta} aria-hidden="true">
              <span>HACHI</span>
              <span>OEM / AFTERMARKET</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.finderSection}>
        <div className="container">
          <div className={styles.finderIntro}>
            <div>
              <p className={styles.eyebrow}>VEHICLE FINDER</p>
              <h2 className={styles.finderTitle}>Tìm phụ tùng theo xe</h2>
            </div>
            <p className={styles.finderText}>Chọn hãng, dòng và đời xe để lọc nhanh danh mục phù hợp.</p>
          </div>
          <VehicleSelectorWidget
            mode="full"
            onVehicleSelect={(v) => {
              if (v) navigate(`/san-pham?vehicleGenerationId=${v.generationId}`);
            }}
          />
        </div>
      </section>

      <FeaturedProductsSection />
      <PopularCategoriesSection />
      <PopularBrandsSection />
      <VehicleBrandsSection />

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
    </>
  );
};

export default HomePage;
