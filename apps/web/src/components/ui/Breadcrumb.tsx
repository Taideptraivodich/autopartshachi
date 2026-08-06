import React from 'react';
import { Link } from 'react-router-dom';
import type { BreadcrumbItem } from '../../types';
import styles from './Breadcrumb.module.css';

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => (
  <nav aria-label="Đường dẫn" className={styles.nav}>
    <ol className={styles.list}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <li key={index} className={styles.item}>
            {!isLast && item.href ? (
              <Link to={item.href} className={styles.link}>{item.label}</Link>
            ) : (
              <span className={isLast ? styles.current : styles.text} aria-current={isLast ? 'page' : undefined}>
                {item.label}
              </span>
            )}
            {!isLast && <span className={styles.separator} aria-hidden="true">›</span>}
          </li>
        );
      })}
    </ol>
  </nav>
);

export default Breadcrumb;
