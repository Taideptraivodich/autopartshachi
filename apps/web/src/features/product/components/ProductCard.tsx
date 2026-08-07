import React from "react";
import { Link } from "react-router-dom";
import type { ProductListItem } from "../api/types";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: ProductListItem;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const categories = product.categories ?? [];

  return (
    <div className={styles.body}>
      <p className={styles.name}>{product.name}</p>

      {product.brand && <p className={styles.brand}>{product.brand.name}</p>}

      {categories.length > 0 && (
        <div className={styles.categories}>
          {categories.slice(0, 2).map((cat) => (
            <span key={cat.id} className={styles.catTag}>
              {cat.name}
            </span>
          ))}
        </div>
      )}

      <p className={styles.sku}>SKU: {product.sku}</p>
    </div>
  );
};

export default ProductCard;
