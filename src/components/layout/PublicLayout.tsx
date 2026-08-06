import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { PageLoader } from '../ui/Skeleton';
import styles from './PublicLayout.module.css';

const PublicLayout: React.FC = () => (
  <div className={styles.layout}>
    <Header />
    <main className={styles.main} id="main-content" tabIndex={-1}>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </main>
    <Footer />
  </div>
);

export default PublicLayout;
