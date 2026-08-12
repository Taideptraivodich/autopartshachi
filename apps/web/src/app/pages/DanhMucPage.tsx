import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MetaTags from '../../components/ui/MetaTags';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { fetchAllCategories } from '../../features/product/api/product.api';
import type { CategoryListItem } from '../../features/product/api/types';
import styles from './DanhMucPage.module.css';

const DanhMucPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllCategories()
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  const roots = categories.filter((category) => category.parentCategoryId === null);

  return (
    <>
      <MetaTags title="Danh mục phụ tùng" description="Khám phá phụ tùng ô tô theo danh mục." />
      <main className={styles.page}>
        <div className="container">
          <div className={styles.breadcrumb}>
            <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Danh mục' }]} />
          </div>
          <header className={styles.header}>
            <p className={styles.eyebrow}>PARTS CATALOG</p>
            <h1 className={styles.title}>Danh mục phụ tùng</h1>
            <p className={styles.subtitle}>
              Chọn nhóm phụ tùng để đi thẳng tới các sản phẩm phù hợp.
            </p>
          </header>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Khám phá danh mục</h2>
              {!loading && <span className={styles.count}>{roots.length} nhóm</span>}
            </div>
            {loading ? (
              <div className={styles.grid} aria-label="Đang tải">
                {Array.from({ length: 8 }).map((_, index) => <div key={index} className={styles.skeleton} />)}
              </div>
            ) : roots.length === 0 ? (
              <p className={styles.empty}>Chưa có dữ liệu danh mục.</p>
            ) : (
              <div className={styles.grid}>
                {roots.map((category, index) => (
                  <Link key={category.id} to={`/danh-muc/${category.slug}`} className={styles.card}>
                    <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
                    <span className={styles.name}>{category.name}</span>
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

export default DanhMucPage;
