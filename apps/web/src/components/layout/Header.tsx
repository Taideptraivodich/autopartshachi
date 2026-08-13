import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { NAV_ITEMS } from '../../constants/navigation';
import { SITE_CONFIG } from '../../constants/site';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import styles from './Header.module.css';
import SearchDropdown from '../../features/search/components/SearchDropdown';
import { useSearchHistory } from '../../features/search/hooks/useSearchHistory';
import { fetchSearchSuggestions } from '../../features/product/api/product.api';
import type { SuggestionItem } from '../../features/product/api/types';

const Header: React.FC = () => {
  const siteSettings = useSiteSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [historyItems, setHistoryItems] = useState<string[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { getHistory, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();

  // Pre-fill search input from URL when on /tim-kiem
  const [searchParams] = useSearchParams();

  // Refresh history khi dropdown mở
  useEffect(() => {
    if (dropdownVisible) {
      setHistoryItems(getHistory());
    }
  }, [dropdownVisible]);

  // Debounce fetch suggestions khi searchValue thay đổi
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (searchValue.length < 2) {
      setSuggestions([]);
      setSuggestionLoading(false);
      return;
    }

    setSuggestionLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetchSearchSuggestions(searchValue);
        setSuggestions(res.data);
      } catch {
        setSuggestions([]);
      } finally {
        setSuggestionLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchValue]);

  // Click ngoài dropdown → ẩn
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownVisible(false);
      }
    };
    if (dropdownVisible) {
      document.addEventListener('mousedown', handler);
    }
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownVisible]);

  const handleDropdownSelect = useCallback(
    (value: string, slug?: string) => {
      setDropdownVisible(false);
      if (slug) {
        // Product → navigate thẳng đến trang sản phẩm
        addToHistory(value);
        setHistoryItems(getHistory());
        navigate(`/san-pham/${slug}`);
      } else {
        // OEM hoặc history → điền vào input và submit tìm kiếm
        setSearchValue(value);
        addToHistory(value);
        setHistoryItems(getHistory());
        navigate(`/tim-kiem?q=${encodeURIComponent(value)}`);
      }
    },
    [navigate, addToHistory, getHistory],
  );

  const handleRemoveHistory = useCallback(
    (keyword: string) => {
      removeFromHistory(keyword);
      setHistoryItems(getHistory());
    },
    [removeFromHistory, getHistory],
  );

  const handleClearHistory = useCallback(() => {
    clearHistory();
    setHistoryItems([]);
  }, [clearHistory]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    if (location.pathname === '/tim-kiem') {
      const q = searchParams.get('q') ?? '';
      setSearchValue(q);
    }
  }, [location.pathname, searchParams]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Focus input when search bar opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  // Close search on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchValue.trim();
    if (!q) return;
    addToHistory(q);
    setHistoryItems(getHistory());
    setDropdownVisible(false);
    setSearchOpen(false);
    navigate(`/tim-kiem?q=${encodeURIComponent(q)}`);
  };

  const openSearch = () => {
    setSearchOpen(true);
  };

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`} role="banner">
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link to="/" className={styles.logo} aria-label={`${SITE_CONFIG.name} – Trang chủ`}>
		<img src="/logo.png" alt={SITE_CONFIG.name} style={{ height: 48, width: "auto", objectFit: "contain", display: "block" }} />
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
          <button
            className={styles.searchBtn}
            aria-label="Tìm kiếm phụ tùng"
            aria-expanded={searchOpen}
            onClick={openSearch}
          >
            <span aria-hidden="true">🔍</span>
            <span className={styles.searchHint}>Tìm phụ tùng...</span>
          </button>
          <a href={`tel:${siteSettings.phone}`} className={styles.phoneBtn} aria-label={`Gọi ${siteSettings.phone}`}>
            <span aria-hidden="true">📞</span>
            <span className={styles.phoneText}>{siteSettings.phone}</span>
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

      {/* Search overlay */}
      {searchOpen && (
        <div className={styles.searchOverlay} role="dialog" aria-label="Tìm kiếm">
          <div className={`container ${styles.searchOverlayInner}`}>
            <div className={styles.searchFormWrapper} ref={dropdownRef}>
              <form className={styles.searchForm} onSubmit={handleSearchSubmit} role="search">
                <span className={styles.searchIcon} aria-hidden="true">🔍</span>
                <input
                  ref={searchInputRef}
                  className={styles.searchInput}
                  type="search"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onFocus={() => setDropdownVisible(true)}
                  placeholder="Tìm theo tên, mã SKU, mã OEM, thương hiệu..."
                  aria-label="Tìm kiếm phụ tùng"
                  autoComplete="off"
                />
                {searchValue && (
                  <button
                    type="button"
                    className={styles.searchClear}
                    onClick={() => { setSearchValue(''); searchInputRef.current?.focus(); }}
                    aria-label="Xóa từ khóa"
                  >
                    ✕
                  </button>
                )}
                <button
                  type="submit"
                  className={styles.searchSubmit}
                  disabled={!searchValue.trim()}
                >
                  Tìm
                </button>
              </form>
              <SearchDropdown
                query={searchValue}
                history={historyItems}
                suggestions={suggestions}
                loading={suggestionLoading}
                onSelect={handleDropdownSelect}
                onRemoveHistory={handleRemoveHistory}
                onClearHistory={handleClearHistory}
                visible={dropdownVisible}
              />
            </div>
            <button
              className={styles.searchClose}
              onClick={() => setSearchOpen(false)}
              aria-label="Đóng tìm kiếm"
            >
              ✕
            </button>
          </div>
          {/* Backdrop */}
          <div
            className={styles.searchBackdrop}
            onClick={() => setSearchOpen(false)}
            aria-hidden="true"
          />
        </div>
      )}

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`${styles.mobileMenu} ${mobileOpen ? styles.mobileMenuOpen : ''}`}
        aria-hidden={!mobileOpen}
      >
        <nav aria-label="Menu di động">
          {/* Mobile search */}
          <div className={styles.mobileSearchWrap}>
            <form
              className={styles.mobileSearchForm}
              onSubmit={(e) => {
                e.preventDefault();
                const q = searchValue.trim();
                if (!q) return;
                setMobileOpen(false);
                navigate(`/tim-kiem?q=${encodeURIComponent(q)}`);
              }}
              role="search"
            >
              <span className={styles.mobileSearchIcon} aria-hidden="true">🔍</span>
              <input
                className={styles.mobileSearchInput}
                type="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Tìm phụ tùng..."
                aria-label="Tìm kiếm"
                autoComplete="off"
              />
            </form>
          </div>

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
            <a href={`tel:${siteSettings.phone}`} className={styles.mobilePhone}>
              📞 {siteSettings.phone}
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
