import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import MetaTags from '../../components/ui/MetaTags';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { SkeletonCard } from '../../components/ui';
import { fetchSearch } from '../../features/product/api/product.api';
import type { SearchResult } from '../../features/product/api/types';
import styles from './SearchPage.module.css';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';

  const [items, setItems] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doSearch = useCallback((q: string) => {
    if (!q.trim()) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    fetchSearch(q)
      .then((res) => {
        setItems(res.data);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Lỗi tìm kiếm');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    doSearch(query);
  }, [query, doSearch]);

  const total = items.length;
  const hasQuery = query.trim().length > 0;
  const isEmpty = hasQuery && !loading && !error && total === 0;
  const hasResults = hasQuery && !loading && !error && total > 0;

  return (
    <>
      <MetaTags
        title={hasQuery ? `Tìm kiếm "${query}" – Phụ tùng ô tô Hachi` : 'Tìm kiếm phụ tùng ô tô'}
        description={
          hasQuery
            ? `Kết quả tìm kiếm cho "${query}" – ${total} phụ tùng ô tô tại Hachi Việt Nam`
            : 'Tìm kiếm phụ tùng ô tô theo tên, mã SKU, mã OEM hoặc thương hiệu tại Hachi Việt Nam'
        }
      />

      <div className="container">
        <div className={styles.breadcrumbRow}>
          <Breadcrumb
            items={[
              { label: 'Trang chủ', href: '/' },
              { label: 'Tìm kiếm' },
            ]}
          />
        </div>

        <div className={styles.page}>
          {!hasQuery ? (
            <div className={styles.emptyQuery}>
              <div className={styles.stateIcon}>🔍</div>
              <h1 className={styles.stateTitle}>Tìm kiếm phụ tùng</h1>
              <p className={styles.stateDesc}>
                Nhập từ khóa vào ô tìm kiếm trên thanh điều hướng để tìm phụ tùng theo tên,
                mã SKU, mã OEM hoặc thương hiệu.
              </p>
              <div className={styles.quickLinks}>
                <Link to="/san-pham" className={styles.quickLink}>Xem tất cả sản phẩm →</Link>
                <Link to="/oem" className={styles.quickLink}>Tra cứu mã OEM →</Link>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.header}>
                <h1 className={styles.title}>
                  Kết quả tìm kiếm: <span className={styles.queryHighlight}>"{query}"</span>
                </h1>
                {hasResults && (
                  <span className={styles.count}>{total} kết quả</span>
                )}
              </div>

              {/* Loading */}
              {loading && (
                <div className={styles.loadingGrid} aria-busy="true">
                  {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              )}

              {/* Error */}
              {error && (
                <div className={styles.errorState} role="alert">
                  <div className={styles.stateIcon}>⚠️</div>
                  <h2 className={styles.stateTitle}>Không thể tìm kiếm</h2>
                  <p className={styles.stateDesc}>{error}</p>
                  <button className={styles.retryBtn} onClick={() => doSearch(query)}>
                    Thử lại
                  </button>
                </div>
              )}

              {/* Empty */}
              {isEmpty && (
                <div className={styles.emptyState}>
                  <div className={styles.stateIcon}>🔎</div>
                  <h2 className={styles.stateTitle}>Không tìm thấy kết quả</h2>
                  <p className={styles.stateDesc}>
                    Không có phụ tùng nào khớp với từ khóa <strong>"{query}"</strong>.
                  </p>
                  <ul className={styles.tips}>
                    <li>Kiểm tra lại chính tả từ khóa.</li>
                    <li>Thử tìm bằng mã SKU hoặc tên thương hiệu.</li>
                    <li>
                      Nếu có mã OEM, hãy dùng{' '}
                      <Link to={`/oem?code=${encodeURIComponent(query)}`} className={styles.link}>
                        tra cứu mã OEM
                      </Link>.
                    </li>
                  </ul>
                </div>
              )}

              {/* Results */}
              {hasResults && (
                <div className={styles.resultsGrid}>
                  {items.map((item) => (
                    <Link
                      key={item.id}
                      to={`/san-pham/${item.slug}`}
                      className={styles.resultCard}
                    >
                      <div className={styles.resultImg}>
                        {item.featuredImage
                          ? <img src={item.featuredImage} alt={item.name} loading="lazy" />
                          : <span>🔩</span>}
                      </div>
                      <div className={styles.resultBody}>
                        <p className={styles.resultName}>{item.name}</p>
                        <p className={styles.resultSku}>{item.sku}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default SearchPage;
