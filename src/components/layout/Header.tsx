import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../../constants/navigation';
import { SITE_CONFIG } from '../../constants/site';
import styles from './Header.module.css';

const Header: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`} role="banner">
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link to="/" className={styles.logo} aria-label={`${SITE_CONFIG.name} – Trang chủ`}>
          <span className={styles.logoIcon} aria-hidden="true">⚙</span>
          <span className={styles.logoText}>{SITE_CONFIG.name}</span>
        </Link>

        {/* Desktop nav */}
        <nav className={styles.nav} aria-label="Điều hướng chính">
          <ul className={styles.navList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.href} className={styles.navItem}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* CTA */}
        <div className={styles.cta}>
          {/* Search placeholder – will be replaced by Search Agent */}
          <button className={styles.searchBtn} aria-label="Tìm kiếm phụ tùng">
            <span aria-hidden="true">🔍</span>
            <span className={styles.searchHint}>Tìm phụ tùng...</span>
          </button>
          <a href={`tel:${SITE_CONFIG.phone}`} className={styles.phoneBtn} aria-label={`Gọi ${SITE_CONFIG.phone}`}>
            <span aria-hidden="true">📞</span>
            <span className={styles.phoneText}>{SITE_CONFIG.phone}</span>
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className={styles.mobileToggle}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
        >
          <span className={`${styles.bar} ${mobileOpen ? styles.bar1Open : ''}`} />
          <span className={`${styles.bar} ${mobileOpen ? styles.bar2Open : ''}`} />
          <span className={`${styles.bar} ${mobileOpen ? styles.bar3Open : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`${styles.mobileMenu} ${mobileOpen ? styles.mobileMenuOpen : ''}`}
        aria-hidden={!mobileOpen}
      >
        <nav aria-label="Menu di động">
          <ul className={styles.mobileNavList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''}`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className={styles.mobileCta}>
            <a href={`tel:${SITE_CONFIG.phone}`} className={styles.mobilePhone}>
              📞 {SITE_CONFIG.phone}
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
