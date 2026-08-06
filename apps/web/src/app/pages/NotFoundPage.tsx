import React from 'react';
import { Link } from 'react-router-dom';
import MetaTags from '../../components/ui/MetaTags';
import styles from './ErrorPage.module.css';

const NotFoundPage: React.FC = () => (
  <>
    <MetaTags title="404 – Không tìm thấy trang" noIndex />
    <div className={styles.wrapper}>
      <div className={styles.code}>404</div>
      <h1 className={styles.title}>Không tìm thấy trang</h1>
      <p className={styles.desc}>Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
      <div className={styles.actions}>
        <Link to="/" className={styles.btnPrimary}>Về trang chủ</Link>
        <Link to="/san-pham" className={styles.btnSecondary}>Xem sản phẩm</Link>
      </div>
    </div>
  </>
);

export default NotFoundPage;
