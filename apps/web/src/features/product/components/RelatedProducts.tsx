import React, { useEffect, useState } from 'react';
import { SkeletonCard } from '../../../components/ui';
import ProductGrid from './ProductGrid';
import { fetchRelatedProducts } from '../api/product.api';
import type { ProductListItem } from '../api/types';
import styles from './RelatedProducts.module.css';

interface RelatedProductsProps {
  currentSlug: string;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ currentSlug }) => {
  const [items, setItems] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchRelatedProducts(currentSlug, 8)
      .then((res) => {
        if (!cancelled) setItems(res.data);
      })
      .catch(() => {
        // non-critical — im lặng
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [currentSlug]);

  if (!loading && items.length === 0) return null;

  return (
    <div className={styles.section}>
      <h2 className={styles.title}>Sản phẩm liên quan</h2>
      {loading ? (
        <div className={styles.skeletonGrid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <ProductGrid products={items} />
      )}
    </div>
  );
};

export default RelatedProducts;
