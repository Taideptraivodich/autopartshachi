import React from 'react';
import type { ProductListItem } from '../api/types';
import ProductCard from './ProductCard';
import styles from './ProductGrid.module.css';

interface ProductGridProps {
  products: ProductListItem[];
  emptyMessage?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  emptyMessage = 'Không có sản phẩm nào',
}) => (
  <div className={styles.grid}>
    {products.length === 0 ? (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>📦</div>
        <p className={styles.emptyTitle}>{emptyMessage}</p>
        <p className={styles.emptyDesc}>Vui lòng thử lại hoặc chọn danh mục khác.</p>
      </div>
    ) : (
      products.map((p) => <ProductCard key={p.id} product={p} />)
    )}
  </div>
);

export default ProductGrid;
