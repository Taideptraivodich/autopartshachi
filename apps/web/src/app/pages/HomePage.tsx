import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MetaTags from '../../components/ui/MetaTags';
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

// ── Tiny inline sub-components ──────────────────────────────────────────────

const FeaturedProductCard: React.FC<{ product: ProductListItem }> = ({ product }) => (
  <Link to={`/san-pham/${product.slug}`} className={styles.productCard}>
    <div className={styles.productImg}>
      {product.featuredImage
        ? <img src={product.featuredImage} alt={product.name} loading="lazy" />
        : '🔩'}
    </div>
    <div className={styles.productBody}>
      <p className={styles.productName}>{product.name}</p>
      {product.brand && <p className={styles.productBrand}>{product.brand.name}</p>}
      <p className={styles.productSku}>{product.sku}</p>
      {product.status === 'con_hang' && <span className={styles.productStatus}>Còn hàng</span>}
    </div>
  </Link>
);

// ── Sections ────────────────────────────────────────────────────────────────

const FeaturedProductsSection: React.FC = () => {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts(8)
      .then((res) => setProducts(res.data))
      .catch(() => {/* silent — home page degrades gracefully */})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Sản phẩm nổi bật</h2>
          <Link to="/san-pham" className={styles.sectionLink}>Xem tất cả →</Link>
        </div>
        {loading ? (
          <div className={styles.productsGrid}>
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className={styles.skeletonProduct} />)}
          </div>
        ) : products.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
            Chưa có sản phẩm nào. <Link to="/san-pham" style={{ color: 'var(--color-text-link)' }}>Xem tất cả →</Link>
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

  // Fallback icons for categories
  const icons: Record<string, string> = {
    'he-thong-phanh': '🔧',
    'he-thong-loc': '🛢',
  };

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Danh mục phổ biến</h2>
          <Link to="/danh-muc" className={styles.sectionLink}>Xem tất cả →</Link>
        </div>
        {loading ? (
          <div className={styles.categoryGrid}>
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className={styles.skeletonCategory} />)}
          </div>
        ) : roots.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
            Chưa có danh mục nào.
          </p>
        ) : (
          <div className={styles.categoryGrid}>
            {roots.map((cat) => (
              <Link key={cat.id} to={`/danh-muc/${cat.slug}`} className={styles.categoryCard}>
                <span className={styles.catIcon}>{icons[cat.slug] ?? '📦'}</span>
                <span className={styles.catName}>{cat.name}</span>
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
      .then((res) => setBrands(res.data.slice(0, 8)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className={`${styles.section} ${styles.sectionAlt}`}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Thương hiệu phụ tùng</h2>
          <Link to="/thuong-hieu" className={styles.sectionLink}>Xem tất cả →</Link>
        </div>
        {loading ? (
          <div className={styles.brandGrid}>
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className={styles.skeletonBrand} />)}
          </div>
        ) : brands.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>Chưa có thương hiệu.</p>
        ) : (
          <div className={styles.brandGrid}>
            {brands.map((brand) => (
              <Link key={brand.id} to={`/thuong-hieu/${brand.slug}`} className={styles.brandCard}>
                <div className={styles.brandLogo}>{brand.name[0]?.toUpperCase()}</div>
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
          <h2 className={styles.sectionTitle}>Tra cứu theo hãng xe</h2>
          <Link to="/hang-xe" className={styles.sectionLink}>Xem tất cả →</Link>
        </div>
        {loading ? (
          <div className={styles.brandGrid}>
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className={styles.skeletonBrand} />)}
          </div>
        ) : brands.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>Chưa có dữ liệu hãng xe.</p>
        ) : (
          <div className={styles.brandGrid}>
            {brands.map((brand) => (
              <Link key={brand.id} to={`/hang-xe/${brand.slug}`} className={styles.brandCard}>
                <div className={styles.brandLogo}>{brand.name[0]?.toUpperCase()}</div>
                <span className={styles.brandName}>{brand.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// ── Main HomePage ────────────────────────────────────────────────────────────

const HomePage: React.FC = () => {
  const [keyword, setKeyword] = useState('');

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const q = keyword.trim();

    window.location.href =
      q
        ? `/san-pham?search=${encodeURIComponent(q)}`
        : '/san-pham';
  };

  return (  <>
    <MetaTags
      title="Trang chủ"
      description="Cung cấp phụ tùng ô tô chính hãng. Tra cứu theo hãng xe, mã OEM. Giao hàng toàn quốc."
    />

    {/* Hero */}
    <section className={styles.hero}>
      <div className="container">
        <div className={styles.heroBadge}>⚙ Phụ tùng chính hãng</div>
        <h1 className={styles.heroTitle}>
          Tra cứu &amp; đặt mua<br />
          <span className={styles.heroAccent}>phụ tùng ô tô</span> dễ dàng
        </h1>
        <p className={styles.heroSubtitle}>
          Hơn 10.000 mã phụ tùng. Tra cứu theo hãng xe, số khung, hoặc mã OEM.
          Giao hàng toàn quốc trong 24–48 giờ.
        </p>
        <div className={styles.searchPlaceholder} aria-label="Khu vực tìm kiếm">
          <form className={styles.searchBox} onSubmit={handleSearch}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Nhập tên phụ tùng, mã OEM, hoặc hãng xe..."
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none' }}
            />
            <button type="submit" className={styles.searchSubmit}>Tìm kiếm</button>
          </form>
          <div className={styles.searchTags}>
            <span className={styles.tagLabel}>Tìm nhiều nhất:</span>
            {['Lọc dầu Toyota', 'Má phanh Honda', 'Bugi Mazda', 'Dây curoa Hyundai'].map((tag) => (
              <Link key={tag} to="/san-pham" className={styles.tag}>{tag}</Link>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* Featured products – real API */}
    <FeaturedProductsSection />

    {/* Popular categories – real API */}
    <PopularCategoriesSection />

    {/* Product brands – real API */}
    <PopularBrandsSection />

    {/* Vehicle brands – real API */}
    <VehicleBrandsSection />

    {/* USP */}
    <section className={styles.section}>
      <div className="container">
        <div className={styles.uspGrid}>
          {[
            { icon: '✅', title: 'Hàng chính hãng', desc: '100% phụ tùng có xuất xứ rõ ràng, tem nhãn đầy đủ.' },
            { icon: '🔍', title: 'Tra cứu mã OEM', desc: 'Hỗ trợ tra cứu theo số khung, số máy và mã OEM gốc.' },
            { icon: '🚚', title: 'Giao nhanh toàn quốc', desc: 'Giao hàng trong 24–48 giờ tại TP.HCM và các tỉnh thành.' },
            { icon: '🛡', title: 'Bảo hành chính sách', desc: 'Bảo hành theo tiêu chuẩn nhà sản xuất, đổi trả dễ dàng.' },
          ].map((usp) => (
            <div key={usp.title} className={styles.uspCard}>
              <span className={styles.uspIcon}>{usp.icon}</span>
              <div>
                <h3 className={styles.uspTitle}>{usp.title}</h3>
                <p className={styles.uspDesc}>{usp.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </>
)};

export default HomePage;
