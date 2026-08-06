import React from 'react';
import styles from './Pagination.module.css';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({ page, pageSize, total, onPageChange, showInfo = true }) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = Math.min((page - 1) * pageSize + 1, total);
  const to = Math.min(page * pageSize, total);

  const getPages = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (page >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  };

  return (
    <nav className={styles.nav} aria-label="Phân trang">
      {showInfo && (
        <p className={styles.info}>
          Hiển thị <strong>{from}–{to}</strong> trong <strong>{total}</strong> kết quả
        </p>
      )}
      <ul className={styles.list}>
        <li>
          <button
            className={`${styles.btn} ${styles.btnNav}`}
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Trang trước"
          >‹</button>
        </li>
        {getPages().map((p, i) =>
          p === '...' ? (
            <li key={`ellipsis-${i}`}><span className={styles.ellipsis}>…</span></li>
          ) : (
            <li key={p}>
              <button
                className={`${styles.btn} ${p === page ? styles.active : ''}`}
                onClick={() => onPageChange(p as number)}
                aria-label={`Trang ${p}`}
                aria-current={p === page ? 'page' : undefined}
              >{p}</button>
            </li>
          )
        )}
        <li>
          <button
            className={`${styles.btn} ${styles.btnNav}`}
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Trang sau"
          >›</button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
