import React from 'react';
import { Link } from 'react-router-dom';
import MetaTags from '../../components/ui/MetaTags';
import styles from './ErrorPage.module.css';

const ServerErrorPage: React.FC = () => (
  <>
    <MetaTags title="500 – Lỗi máy chủ" noIndex />
    <div className={styles.wrapper}>
      <div className={styles.code}>500</div>
      <h1 className={styles.title}>Lỗi máy chủ</h1>
      <p className={styles.desc}>Có sự cố kỹ thuật. Vui lòng thử lại sau hoặc liên hệ chúng tôi.</p>
      <div className={styles.actions}>
        <Link to="/" className={styles.btnPrimary}>Về trang chủ</Link>
      </div>
    </div>
  </>
);

export default ServerErrorPage;
