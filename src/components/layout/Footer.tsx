import React from 'react';
import { Link } from 'react-router-dom';
import { SITE_CONFIG, ROUTES } from '../../constants/site';
import { QUICK_LINKS } from '../../constants/navigation';
import styles from './Footer.module.css';

const SUPPORT_LINKS = [
  { label: 'Chính sách bảo hành', href: '/chinh-sach-bao-hanh' },
  { label: 'Chính sách đổi trả', href: '/chinh-sach-doi-tra' },
  { label: 'Hướng dẫn mua hàng', href: '/huong-dan-mua-hang' },
  { label: 'Tra cứu đơn hàng', href: '/tra-cuu-don-hang' },
];

const Footer: React.FC = () => (
  <footer className={styles.footer} role="contentinfo">
    <div className={`container ${styles.inner}`}>
      {/* Brand */}
      <div className={styles.brand}>
        <Link to={ROUTES.HOME} className={styles.logoLink} aria-label={`${SITE_CONFIG.name} – Trang chủ`}>
          <span className={styles.logoIcon} aria-hidden="true">⚙</span>
          <span className={styles.logoText}>{SITE_CONFIG.name}</span>
        </Link>
        <p className={styles.tagline}>{SITE_CONFIG.tagline}</p>
        <div className={styles.contactInfo}>
          <p className={styles.contactItem}>
            <span aria-hidden="true">📞</span>
            <a href={`tel:${SITE_CONFIG.phone}`}>{SITE_CONFIG.phone}</a>
          </p>
          <p className={styles.contactItem}>
            <span aria-hidden="true">✉</span>
            <a href={`mailto:${SITE_CONFIG.email}`}>{SITE_CONFIG.email}</a>
          </p>
          <p className={styles.contactItem}>
            <span aria-hidden="true">📍</span>
            <span>{SITE_CONFIG.address}</span>
          </p>
          <p className={styles.contactItem}>
            <span aria-hidden="true">🕐</span>
            <span>{SITE_CONFIG.workingHours}</span>
          </p>
        </div>
      </div>

      {/* Quick Links */}
      <div className={styles.linkGroup}>
        <h3 className={styles.groupTitle}>Sản phẩm</h3>
        <ul className={styles.linkList}>
          {QUICK_LINKS.map((item) => (
            <li key={item.href}>
              <Link to={item.href} className={styles.link}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Support */}
      <div className={styles.linkGroup}>
        <h3 className={styles.groupTitle}>Hỗ trợ</h3>
        <ul className={styles.linkList}>
          {SUPPORT_LINKS.map((item) => (
            <li key={item.href}>
              <Link to={item.href} className={styles.link}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Contact CTA placeholder */}
      <div className={styles.linkGroup}>
        <h3 className={styles.groupTitle}>Tư vấn nhanh</h3>
        <p className={styles.ctaText}>
          Không tìm thấy phụ tùng bạn cần? Liên hệ chuyên viên để được hỗ trợ tra cứu mã OEM và báo giá.
        </p>
        <Link to={ROUTES.CONTACT} className={styles.ctaButton}>
          Liên hệ ngay
        </Link>
      </div>
    </div>

    <div className={styles.bottom}>
      <div className="container">
        <p className={styles.copyright}>
          © {new Date().getFullYear()} {SITE_CONFIG.name}. Bảo lưu mọi quyền.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
