import React from "react";
import { Link } from "react-router-dom";
import type { ProductListItem } from "../api/types";
import styles from "./ProductCardRedesign.module.css";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  con_hang: { label: "Còn hàng", cls: "statusAvailable" },
  het_hang: { label: "Hết hàng", cls: "statusOut" },
  ngung_kinh_doanh: { label: "Ngừng kinh doanh", cls: "statusDiscontinued" },
};

const ProductCard: React.FC<{ product: ProductListItem }> = ({ product }) => {
  const status = STATUS_LABEL[product.status];
  const categories = product.categories ?? [];

  return (
    <Link to={`/san-pham/${product.slug}`} className={styles.card}>
      <div className={styles.imageWrap}>
        {product.featuredImage ? (
          <>
            <img
              src={product.featuredImage}
              alt={product.name}
              className={styles.image}
              loading="lazy"
            />
            <span className={styles.watermark} aria-hidden="true">
              <strong>HACHI</strong>
              <small>ORIGINAL PARTS</small>
            </span>
          </>
        ) : (
          <div className={styles.imagePlaceholder} aria-hidden="true" />
        )}
        {status && (
          <span className={`${styles.statusBadge} ${styles[status.cls]}`}>
            {status.label}
          </span>
        )}
      </div>

      <div className={styles.body}>
        {product.brand && <p className={styles.brand}>{product.brand.name}</p>}
        <p className={styles.name}>{product.name}</p>
        {categories.length > 0 && (
          <div className={styles.categories}>
            {categories.slice(0, 2).map((cat) => (
              <span key={cat.id} className={styles.catTag}>{cat.name}</span>
            ))}
          </div>
        )}
        <p className={styles.sku}>SKU: {product.sku}</p>
      </div>
    </Link>
  );
};

export default ProductCard;
