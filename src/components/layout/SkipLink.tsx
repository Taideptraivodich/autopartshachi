import React from 'react';
import styles from './SkipLink.module.css';

const SkipLink: React.FC = () => (
  <a href="#main-content" className={styles.skip}>
    Bỏ qua điều hướng, đến nội dung chính
  </a>
);
export default SkipLink;
