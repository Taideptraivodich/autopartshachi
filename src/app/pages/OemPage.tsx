import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import MetaTags from '../../components/ui/MetaTags';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Input from '../../components/ui/Input';
import { SkeletonCard } from '../../components/ui/Skeleton';
import ProductCard from '../../features/product/components/ProductCard';
import { fetchOemLookup, type OemResult } from '../../features/product/api/product.api';
import styles from './OemPage.module.css';

const CONFIDENCE_LABEL: Record<string, string> = {
  khop_hoan_toan: 'Khớp hoàn toàn',
  khop_tuong_duong: 'Tương đương',
};

const OEM_STATUS_LABEL: Record<string, string> = {
  hieu_luc: 'Hiệu lực',
  ngung: 'Ngừng',
  da_bi_thay_the: 'Đã thay thế',
};

const OemPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState(searchParams.get('code') ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<OemResult[] | null>(null);
  const [queriedCode, setQueriedCode] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const doLookup = (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setSearchParams({ code: trimmed }, { replace: true });
    setLoading(true);
    setError(null);
    setResults(null);
    setQueriedCode(trimmed);

    fetchOemLookup(trimmed)
      .then((res) => setResults(res.data))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Lỗi tra cứu'),
      )
      .finally(() => setLoading(false));
  };

  // Auto-run if code is in URL on mount
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setInputValue(code);
      doLookup(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doLookup(inputValue);
  };

  const hasSearched = queriedCode !== null;
  const isEmpty = hasSearched && !loading && !error && results?.length === 0;
  const hasResults = hasSearched && !loading && !error && (results?.length ?? 0) > 0;

  return (
    <>
      <MetaTags
        title="Tra cứu mã OEM phụ tùng ô tô"
        description="Nhập mã OEM để tìm phụ tùng ô tô chính hãng tại Hachi Việt Nam. Hỗ trợ mã Toyota, Honda, Mitsubishi và nhiều hãng xe khác."
      />

      <div className="container">
        <div className={styles.breadcrumbRow}>
          <Breadcrumb
            items={[
              { label: 'Trang chủ', href: '/' },
              { label: 'Tra cứu mã OEM' },
            ]}
          />
        </div>

        <div className={styles.page}>
          <div className={styles.hero}>
            <h1 className={styles.title}>Tra cứu mã OEM</h1>
            <p className={styles.subtitle}>
              Nhập mã OEM của hãng xe để tìm phụ tùng phù hợp.
              Hỗ trợ cả định dạng có gạch ngang (ví dụ: <code>04465-BZ160</code>) và liền (ví dụ: <code>04465BZ160</code>).
            </p>
          </div>

          <form className={styles.searchForm} onSubmit={handleSubmit} role="search" aria-label="Tìm theo mã OEM">
            <div className={styles.searchRow}>
              <Input
                ref={inputRef}
                variant="search"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Nhập mã OEM, ví dụ: 04465-BZ160"
                aria-label="Mã OEM"
                leftIcon={<span aria-hidden="true">🔍</span>}
                autoComplete="off"
                autoFocus
              />
              <button
                type="submit"
                className={styles.searchBtn}
                disabled={loading || !inputValue.trim()}
              >
                {loading ? 'Đang tra cứu…' : 'Tra cứu'}
              </button>
            </div>
            <p className={styles.hint}>
              Mã OEM thường in trên bao bì phụ tùng gốc hoặc trong tài liệu kỹ thuật của xe.
            </p>
          </form>

          {/* Loading */}
          {loading && (
            <div className={styles.loadingGrid} aria-busy="true" aria-label="Đang tải">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className={styles.errorState} role="alert">
              <div className={styles.stateIcon}>⚠️</div>
              <h2 className={styles.stateTitle}>Không thể tra cứu</h2>
              <p className={styles.stateDesc}>{error}</p>
              <button className={styles.retryBtn} onClick={() => doLookup(inputValue)}>
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
                Không có phụ tùng nào khớp với mã OEM <strong>"{queriedCode}"</strong>.
              </p>
              <ul className={styles.tips}>
                <li>Kiểm tra lại mã OEM trên bao bì hoặc tài liệu xe.</li>
                <li>Thử bỏ gạch ngang, ví dụ <code>04465BZ160</code> thay vì <code>04465-BZ160</code>.</li>
                <li>
                  Hoặc <Link to={`/tim-kiem?q=${encodeURIComponent(queriedCode ?? '')}`} className={styles.link}>
                    tìm kiếm theo từ khóa
                  </Link>.
                </li>
              </ul>
            </div>
          )}

          {/* Results */}
          {hasResults && (
            <div className={styles.results}>
              <div className={styles.resultsHeader}>
                <h2 className={styles.resultsTitle}>
                  Kết quả cho mã <span className={styles.codeHighlight}>"{queriedCode}"</span>
                </h2>
                <span className={styles.resultsCount}>{results!.length} phụ tùng</span>
              </div>

              <div className={styles.resultList}>
                {results!.map((item) => (
                  <div key={`${item.oemId}-${item.product.id}`} className={styles.resultItem}>
                    <div className={styles.oemMeta}>
                      <span className={styles.oemCode}>{item.oemCode}</span>
                      {item.issuingVehicleBrand && (
                        <span className={styles.oemBrand}>{item.issuingVehicleBrand}</span>
                      )}
                      <span className={`${styles.oemBadge} ${styles[`oemStatus_${item.status}`] ?? ''}`}>
                        {OEM_STATUS_LABEL[item.status] ?? item.status}
                      </span>
                      <span className={`${styles.oemBadge} ${styles.confidence}`}>
                        {CONFIDENCE_LABEL[item.matchConfidence] ?? item.matchConfidence}
                      </span>
                    </div>
                    <ProductCard product={item.product} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OemPage;
