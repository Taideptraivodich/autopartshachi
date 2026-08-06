import React from 'react';
import MetaTags from '../../components/ui/MetaTags';
import styles from './HomePage.module.css';

const HomePage: React.FC = () => (
  <>
    <MetaTags
      title="Trang chủ"
      description="Cung cấp phụ tùng ô tô chính hãng. Tra cứu theo hãng xe, mã OEM. Giao hàng toàn quốc."
    />

    {/* Hero – placeholder for Product/Search agents */}
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

        {/* Search placeholder – Search Agent sẽ thay thế */}
        <div className={styles.searchPlaceholder} aria-label="Khu vực tìm kiếm – sẽ được tích hợp ở giai đoạn sau">
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>🔍</span>
            <span className={styles.searchHint}>Nhập tên phụ tùng, mã OEM, hoặc hãng xe...</span>
            <button className={styles.searchSubmit}>Tìm kiếm</button>
          </div>
          <div className={styles.searchTags}>
            <span className={styles.tagLabel}>Tìm nhiều nhất:</span>
            {['Lọc dầu Toyota', 'Má phanh Honda', 'Bugi Mazda', 'Dây curoa Hyundai'].map((tag) => (
              <button key={tag} className={styles.tag}>{tag}</button>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* Featured categories placeholder */}
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Danh mục phổ biến</h2>
          <a href="/danh-muc" className={styles.sectionLink}>Xem tất cả →</a>
        </div>
        <div className={styles.categoryGrid}>
          {[
            { icon: '🛢', name: 'Lọc & Dầu', count: '2.400+' },
            { icon: '🔧', name: 'Hệ thống phanh', count: '1.800+' },
            { icon: '⚡', name: 'Hệ thống điện', count: '3.200+' },
            { icon: '🔩', name: 'Động cơ', count: '4.100+' },
            { icon: '💨', name: 'Hệ thống làm mát', count: '900+' },
            { icon: '🔗', name: 'Truyền động', count: '1.500+' },
            { icon: '🛞', name: 'Hệ thống treo', count: '2.000+' },
            { icon: '💡', name: 'Đèn & Điện thân', count: '1.200+' },
          ].map((cat) => (
            <a key={cat.name} href="/danh-muc" className={styles.categoryCard}>
              <span className={styles.catIcon}>{cat.icon}</span>
              <span className={styles.catName}>{cat.name}</span>
              <span className={styles.catCount}>{cat.count} mã</span>
            </a>
          ))}
        </div>
      </div>
    </section>

    {/* Vehicle brands placeholder */}
    <section className={`${styles.section} ${styles.sectionAlt}`}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Tra cứu theo hãng xe</h2>
          <a href="/hang-xe" className={styles.sectionLink}>Xem tất cả →</a>
        </div>
        <div className={styles.brandGrid}>
          {['Toyota', 'Honda', 'Hyundai', 'Kia', 'Mazda', 'Ford', 'Mitsubishi', 'Suzuki', 'Isuzu', 'VinFast'].map((brand) => (
            <a key={brand} href={`/hang-xe/${brand.toLowerCase()}`} className={styles.brandCard}>
              <div className={styles.brandLogo} aria-hidden="true">{brand[0]}</div>
              <span className={styles.brandName}>{brand}</span>
            </a>
          ))}
        </div>
      </div>
    </section>

    {/* USP section */}
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
);

export default HomePage;
