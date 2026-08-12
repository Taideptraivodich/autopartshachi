import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MetaTags from '../../components/ui/MetaTags';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { fetchAllBrands } from '../../features/product/api/product.api';
import type { BrandListItem } from '../../features/product/api/types';
import styles from './ThuongHieuPage.module.css';

const ThuongHieuPage: React.FC = () => {
  const [brands, setBrands] = useState<BrandListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllBrands()
      .then((res) => setBrands(res.data))
      .catch(() => setBrands([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <MetaTags title="Thương hiệu phụ tùng" description="Tra cứu phụ tùng theo thương hiệu." />
      <main className={styles.page}>
        <div className="container">
          <div className={styles.breadcrumb}>
            <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Thương hiệu' }]} />
          </div>
          <header className={styles.header}>
            <p className={styles.eyebrow}>AFTERMARKET BRANDS</p>
            <h1 className={styles.title}>Thương hiệu phụ tùng</h1>
            <p className={styles.subtitle}>
              Khám phá các thương hiệu đang có trong danh mục HACHI.
            </p>
          </header>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Danh sách thương hiệu</h2>
              {!loading && <span className={styles.count}>{brands.length} thương hiệu</span>}
            </div>
            {loading ? (
              <div className={styles.brandGrid}>
                {Array.from({ length: 10 }).map((_, index) => <div key={index} className={styles.skeleton} />)}
              </div>
            ) : brands.length === 0 ? (
              <p className={styles.empty}>Chưa có dữ liệu thương hiệu.</p>
            ) : (
              <div className={styles.brandGrid}>
                {brands.map((brand) => (
                  <Link key={brand.id} to={`/thuong-hieu/${brand.slug}`} className={styles.brandCard}>
                    <div className={styles.logo}>
                      {brand.logoUrl ? <img src={brand.logoUrl} alt={brand.name} loading="lazy" /> : <span className={styles.logoFallback}>{brand.name}</span>}
                    </div>
                    <span className={styles.brandName}>{brand.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
};

export default ThuongHieuPage;
