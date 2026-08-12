import React, { useState } from 'react';
import type { BrandListItem, CategoryListItem, ProductFilterParams } from '../api/types';
import styles from './FilterSidebar.module.css';

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'con_hang', label: 'Còn hàng' },
  { value: 'het_hang', label: 'Hết hàng' },
  { value: 'ngung_kinh_doanh', label: 'Ngừng kinh doanh' },
] as const;

const CATEGORY_SHOW_LIMIT = 8;

interface FilterSidebarProps {
  brands: BrandListItem[];
  categories: CategoryListItem[];
  filters: ProductFilterParams;
  onChange: (filters: ProductFilterParams) => void;
  onReset: () => void;
  loading?: boolean;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  brands,
  categories,
  filters,
  onChange,
  onReset,
  loading,
}) => {
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Chỉ hiển thị root categories
  const rootCategories = categories.filter((c) => c.parentCategoryId === null);
  const visibleCategories = showAllCategories
    ? rootCategories
    : rootCategories.slice(0, CATEGORY_SHOW_LIMIT);

  const hasActiveFilter =
    !!filters.brandId || !!filters.categoryId || !!filters.status;

  return (
    <div className={styles.sidebar}>
      {/* Section: Thương hiệu */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>Thương hiệu</p>
        <label className={styles.radioItem}>
          <input
            type="radio"
            name="brandId"
            checked={!filters.brandId}
            onChange={() => onChange({ ...filters, brandId: undefined, page: 1 })}
            disabled={loading}
          />
          Tất cả
        </label>
        {brands.map((b) => (
          <label key={b.id} className={styles.radioItem}>
            <input
              type="radio"
              name="brandId"
              checked={filters.brandId === b.id}
              onChange={() => onChange({ ...filters, brandId: b.id, page: 1 })}
              disabled={loading}
            />
            {b.name}
          </label>
        ))}
      </div>

      {/* Section: Danh mục */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>Danh mục</p>
        <label className={styles.radioItem}>
          <input
            type="radio"
            name="categoryId"
            checked={!filters.categoryId}
            onChange={() => onChange({ ...filters, categoryId: undefined, page: 1 })}
            disabled={loading}
          />
          Tất cả
        </label>
        {visibleCategories.map((c) => (
          <label key={c.id} className={styles.radioItem}>
            <input
              type="radio"
              name="categoryId"
              checked={filters.categoryId === c.id}
              onChange={() => onChange({ ...filters, categoryId: c.id, page: 1 })}
              disabled={loading}
            />
            {c.name}
          </label>
        ))}
        {rootCategories.length > CATEGORY_SHOW_LIMIT && (
          <button
            type="button"
            className={styles.toggleBtn}
            onClick={() => setShowAllCategories((v) => !v)}
          >
            {showAllCategories
              ? 'Thu gọn'
              : `Xem thêm (${rootCategories.length - CATEGORY_SHOW_LIMIT})`}
          </button>
        )}
      </div>

      {/* Section: Tình trạng */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>Tình trạng</p>
        {STATUS_OPTIONS.map((opt) => (
          <label key={opt.value} className={styles.radioItem}>
            <input
              type="radio"
              name="status"
              checked={(filters.status ?? '') === opt.value}
              onChange={() =>
                onChange({
                  ...filters,
                  status: opt.value as ProductFilterParams['status'],
                  page: 1,
                })
              }
              disabled={loading}
            />
            {opt.label}
          </label>
        ))}
      </div>

      {/* Nút xóa bộ lọc */}
      {hasActiveFilter && (
        <button type="button" className={styles.resetBtn} onClick={onReset}>
          Xóa bộ lọc
        </button>
      )}
    </div>
  );
};

export default FilterSidebar;
