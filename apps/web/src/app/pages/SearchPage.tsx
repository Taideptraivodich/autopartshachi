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
      .then((res) => setItems(res.data))
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
        noIndex
      />

      <main className={styles.page}>
        <div className="container">
          <div className={styles.breadcrumbRow}>
            <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Tìm kiếm' }]} />
          </div>

          {!hasQuery ? (
            <section className={styles.emptyQuery}>
              <div className={styles.stateMark} aria-hidden="true"><span /></div>
              <p className={styles.eyebrow}>SEARCH</p>
              <h1 className={styles.stateTitle}>Tìm kiếm phụ tùng</h1>
              <p className={styles.stateDesc}>
                Tìm theo tên phụ tùng, mã SKU, mã OEM hoặc thương hiệu.
              </p>
              <div className={styles.quickLinks}>
                <Link to="/san-pham" className={styles.quickLink}>Xem sản phẩm <span aria-hidden="true">→</span></Link>
                <Link to="/oem" className={styles.quickLink}>Tra cứu mã OEM <span aria-hidden="true">→</span></Link>
              </div>
            </section>
          ) : (
            <>
              <div className={styles.header}>
                <div>
                  <p className={styles.eyebrow}>SEARCH RESULTS</p>
                  <h1 className={styles.title}>Kết quả cho <span className={styles.queryHighlight}>"{query}"</span></h1>
                </div>
                {hasResults && <span className={styles.count}>{total} kết quả</span>}
              </div>

              {loading && (
                <div className={styles.loadingGrid} aria-busy="true">
                  {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              )}

              {error && (
                <div className={styles.errorState} role="alert">
                  <div className={styles.stateMark} aria-hidden="true"><span /></div>
                  <h2 className={styles.stateTitle}>Không thể tìm kiếm</h2>
                  <p className={styles.stateDesc}>{error}</p>
                  <button className={styles.retryBtn} onClick={() => doSearch(query)}>Thử lại</button>
                </div>
              )}

              {isEmpty && (
                <div className={styles.emptyState}>
                  <p className={styles.eyebrow}>NO RESULTS</p>
                  <h2 className={styles.stateTitle}>Không tìm thấy sản phẩm</h2>
                  <p className={styles.stateDesc}>
                    Không có phụ tùng nào khớp với <strong>"{query}"</strong>.
                  </p>
                  <ul className={styles.tips}>
                    <li>Kiểm tra lại chính tả hoặc thử từ khóa ngắn hơn.</li>
                    <li>Thử tìm theo mã SKU hoặc tên thương hiệu.</li>
                    <li>
                      Có mã OEM? <Link to={`/oem?code=${encodeURIComponent(query)}`} className={styles.link}>Tra cứu trực tiếp</Link>.
                    </li>
                  </ul>
                </div>
              )}

              {hasResults && (
                <div className={styles.resultsGrid}>
                  {items.map((item) => (
                    <Link key={item.id} to={`/san-pham/${item.slug}`} className={styles.resultCard}>
                      <div className={styles.resultImg}>
                        {item.featuredImage ? (
                          <img src={item.featuredImage} alt={item.name} loading="lazy" />
                        ) : (
                          <div className={styles.resultImgEmpty} aria-hidden="true" />
                        )}
                        <span className={styles.watermark} aria-hidden="true">
                          <strong>HACHI</strong>
                          <small>ORIGINAL PARTS</small>
                        </span>
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
      </main>
    </>
  );
};

export default SearchPage;
