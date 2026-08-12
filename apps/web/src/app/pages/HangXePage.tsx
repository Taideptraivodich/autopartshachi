import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MetaTags from '../../components/ui/MetaTags';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { fetchAllVehicleBrands } from '../../features/product/api/product.api';
import type { VehicleBrandListItem } from '../../features/product/api/types';
import styles from './HangXePage.module.css';

const HangXePage: React.FC = () => {
  const [brands, setBrands] = useState<VehicleBrandListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllVehicleBrands()
      .then((res) => setBrands(res.data))
      .catch(() => setBrands([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <MetaTags title="Hãng xe" description="Tra cứu phụ tùng theo hãng xe, dòng xe và đời xe." />
      <main className={styles.page}>
        <div className="container">
          <div className={styles.breadcrumb}>
            <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Hãng xe' }]} />
          </div>
          <header className={styles.header}>
            <p className={styles.eyebrow}>VEHICLE MAKES</p>
            <h1 className={styles.title}>Hãng xe</h1>
            <p className={styles.subtitle}>
              Chọn hãng xe để xem các dòng xe và đời xe được HACHI hỗ trợ tra cứu.
            </p>
          </header>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Danh sách hãng xe</h2>
              {!loading && <span className={styles.count}>{brands.length} hãng</span>}
            </div>
            {loading ? (
              <div className={styles.modelGrid}>
                {Array.from({ length: 8 }).map((_, index) => <div key={index} className={styles.skeleton} />)}
              </div>
            ) : brands.length === 0 ? (
              <p className={styles.empty}>Chưa có dữ liệu hãng xe.</p>
            ) : (
              <div className={styles.modelGrid}>
                {brands.map((brand, index) => (
                  <Link key={brand.id} to={`/hang-xe/${brand.slug}`} className={styles.modelCard}>
                    <span className={styles.modelIndex}>{String(index + 1).padStart(2, '0')}</span>
                    <div className={styles.logo}>
                      {brand.logoUrl ? <img src={brand.logoUrl} alt={brand.name} loading="lazy" /> : <span className={styles.logoFallback}>{brand.name}</span>}
                    </div>
                    <span className={styles.modelName}>{brand.name}</span>
                    <span className={styles.arrow} aria-hidden="true">↗</span>
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

export default HangXePage;
