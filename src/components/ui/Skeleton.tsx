import React from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
  lines?: number;
  gap?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%', height = '1rem', borderRadius, className = '',
}) => (
  <div
    className={`${styles.skeleton} ${className}`}
    style={{ width, height, borderRadius }}
    role="status"
    aria-label="Đang tải..."
    aria-busy="true"
  />
);

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ lines = 3, className = '' }) => (
  <div className={`${styles.textGroup} ${className}`} role="status" aria-label="Đang tải...">
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={styles.skeleton}
        style={{ height: '0.875rem', width: i === lines - 1 ? '70%' : '100%' }}
      />
    ))}
  </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`${styles.card} ${className}`} role="status" aria-label="Đang tải...">
    <div className={styles.skeleton} style={{ height: '180px', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }} />
    <div className={styles.cardBody}>
      <div className={styles.skeleton} style={{ height: '1rem', width: '80%' }} />
      <div className={styles.skeleton} style={{ height: '0.875rem', width: '60%' }} />
      <div className={styles.skeleton} style={{ height: '1.25rem', width: '40%' }} />
    </div>
  </div>
);

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; label?: string }> = ({ size = 'md', label = 'Đang tải...' }) => (
  <div className={`${styles.spinner} ${styles[`spinner--${size}`]}`} role="status" aria-label={label}>
    <span className={styles.srOnly}>{label}</span>
  </div>
);

export const PageLoader: React.FC = () => (
  <div className={styles.pageLoader} role="status" aria-label="Đang tải trang...">
    <div className={styles.pageLoaderInner}>
      <Spinner size="lg" />
      <p className={styles.pageLoaderText}>Đang tải...</p>
    </div>
  </div>
);
