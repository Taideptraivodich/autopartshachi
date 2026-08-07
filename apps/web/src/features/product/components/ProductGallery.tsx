import React, { useState } from 'react';
import type { ProductImage } from '../api/types';
import styles from './ProductGallery.module.css';

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName }) => {
  const sorted = [...images].sort((a, b) => {
    if (a.isThumbnail !== b.isThumbnail) return a.isThumbnail ? -1 : 1;
    return a.displayOrder - b.displayOrder;
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const active = sorted[activeIndex] ?? null;

  return (
    <div className={styles.gallery}>
      <div className={styles.mainWrap}>
        {active ? (
          <img
            src={active.imageUrl}
            alt={active.altText ?? productName}
            className={styles.mainImage}
          />
        ) : (
          <div className={styles.noImage} aria-label="Không có ảnh">⚙️</div>
        )}
      </div>

      {sorted.length > 1 && (
        <div className={styles.thumbs}>
          {sorted.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              className={`${styles.thumb} ${idx === activeIndex ? styles['thumb--active'] : ''}`}
              onClick={() => setActiveIndex(idx)}
              aria-label={`Xem ảnh ${idx + 1}`}
            >
              <img
                src={img.imageUrl}
                alt={img.altText ?? `${productName} ${idx + 1}`}
                className={styles.thumbImage}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
