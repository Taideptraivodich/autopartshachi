import React from 'react';
import { SITE_CONFIG } from '../../constants/site';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import styles from './FloatingZaloButton.module.css';

const FloatingZaloButton: React.FC = () => {
  const { zaloPhone } = useSiteSettings();
  const phone = (zaloPhone || SITE_CONFIG.zaloPhone).replace(/\D/g, '');

  if (!phone) return null;

  const greeting = encodeURIComponent('Xin chào HACHI, tôi cần tư vấn phụ tùng ô tô.');
  const href = `https://zalo.me/${phone}?text=${greeting}`;

  return (
    <a
      className={styles.button}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat Zalo với HACHI"
      title="Chat Zalo với HACHI"
    >
      <svg className={styles.icon} viewBox="0 0 48 48" aria-hidden="true">
        <path
          d="M24 4C13.2 4 4.5 12 4.5 22c0 5.1 2.8 9.7 7.1 12.7L9 42l8.2-4.1c2.2.7 4.5 1.1 6.8 1.1 10.8 0 19.5-7.6 19.5-17S34.8 4 24 4Z"
          fill="#fff"
        />
        <path d="M14 15h18v3L20 29h12v3H14v-3.2l12-10.8H14z" fill="#0068ff" />
      </svg>
      <span className={styles.srOnly}>Chat Zalo với HACHI</span>
    </a>
  );
};

export default FloatingZaloButton;
