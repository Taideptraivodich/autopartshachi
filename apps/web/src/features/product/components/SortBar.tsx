import React from 'react';
import { Select } from '../../../components/ui';
import styles from './SortBar.module.css';

const SORT_OPTIONS = [
  { value: 'createdAt|desc', label: 'Mới nhất' },
  { value: 'name|asc', label: 'Tên A → Z' },
  { value: 'name|desc', label: 'Tên Z → A' },
];

interface SortBarProps {
  total: number;
  sortBy: 'createdAt' | 'name';
  sortDir: 'asc' | 'desc';
  onChange: (sortBy: 'createdAt' | 'name', sortDir: 'asc' | 'desc') => void;
  onMobileFilterToggle?: () => void;
}

const SortBar: React.FC<SortBarProps> = ({
  total,
  sortBy,
  sortDir,
  onChange,
  onMobileFilterToggle,
}) => {
  const currentValue = `${sortBy}|${sortDir}`;

  const handleChange = (value: string) => {
    const [sb, sd] = value.split('|') as ['createdAt' | 'name', 'asc' | 'desc'];
    onChange(sb, sd);
  };

  return (
    <div className={styles.bar}>
      <div className={styles.left}>
        {onMobileFilterToggle && (
          <button
            type="button"
            className={styles.mobileFilterBtn}
            onClick={onMobileFilterToggle}
          >
            🔧 Bộ lọc
          </button>
        )}
        <span className={styles.total}>{total} sản phẩm</span>
      </div>
      <div className={styles.right}>
        <span className={styles.sortLabel}>Sắp xếp:</span>
        <Select
          options={SORT_OPTIONS}
          value={currentValue}
          onChange={(e) => handleChange(e.target.value)}
          aria-label="Sắp xếp sản phẩm"
        />
      </div>
    </div>
  );
};

export default SortBar;
