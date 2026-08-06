import React from 'react';
import MetaTags from '../../components/ui/MetaTags';
import Breadcrumb from '../../components/ui/Breadcrumb';
import styles from './PlaceholderPage.module.css';

const ThuongHieuPage: React.FC = () => (
  <>
    <MetaTags title="ThuongHieu" />
    <div className="container">
      <div className={styles.breadcrumbRow}>
        <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'ThuongHieu' }]} />
      </div>
      <div className={styles.placeholder}>
        <div className={styles.icon}>🚧</div>
        <h1 className={styles.title}>ThuongHieu</h1>
        <p className={styles.desc}>Module này đang được phát triển bởi agent chuyên trách.</p>
        <p className={styles.note}>Placeholder – Route hoạt động bình thường.</p>
      </div>
    </div>
  </>
);

export default ThuongHieuPage;
