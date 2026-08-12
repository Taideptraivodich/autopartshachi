import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import MetaTags from "../../components/ui/MetaTags";
import Breadcrumb from "../../components/ui/Breadcrumb";
import Input from "../../components/ui/Input";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { fetchOemLookup, type OemResult } from "../../features/product/api/product.api";
import styles from "./OemPage.module.css";

const OemPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState(searchParams.get("code") ?? "");
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
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Lỗi tra cứu"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const code = searchParams.get("code");
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
        description="Nhập mã OEM để tìm phụ tùng ô tô phù hợp tại Hachi Việt Nam."
      />

      <main className={styles.page}>
        <div className="container">
          <div className={styles.breadcrumbRow}>
            <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Tra cứu mã OEM" }]} />
          </div>

          <header className={styles.hero}>
            <p className={styles.eyebrow}>OEM LOOKUP</p>
            <h1 className={styles.title}>Tra cứu đúng mã phụ tùng</h1>
            <p className={styles.subtitle}>
              Nhập mã OEM từ bao bì hoặc tài liệu kỹ thuật để tìm phụ tùng tương ứng. Có thể nhập cả dạng có hoặc không có dấu gạch ngang.
            </p>
          </header>

          <form className={styles.searchForm} onSubmit={handleSubmit} role="search" aria-label="Tìm theo mã OEM">
            <div className={styles.searchRow}>
              <div className={styles.inputWrap}>
                <Input
                  ref={inputRef}
                  variant="search"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ví dụ: 04465-BZ160"
                  aria-label="Mã OEM"
                  leftIcon={<span className={styles.oemMark} aria-hidden="true">OEM</span>}
                  autoComplete="off"
                  autoFocus
                />
              </div>
              <button type="submit" className={styles.searchBtn} disabled={loading || !inputValue.trim()}>
                {loading ? "Đang tra cứu…" : "Tra cứu"}
              </button>
            </div>
            <p className={styles.hint}>Mã OEM thường được in trên bao bì phụ tùng gốc hoặc tài liệu kỹ thuật của xe.</p>
          </form>

          {loading && (
            <div className={styles.loadingGrid} aria-busy="true" aria-label="Đang tải">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {error && (
            <div className={styles.errorState} role="alert">
              <div className={styles.stateMark} aria-hidden="true">!</div>
              <p className={styles.eyebrow}>LOOKUP ERROR</p>
              <h2 className={styles.stateTitle}>Không thể tra cứu</h2>
              <p className={styles.stateDesc}>{error}</p>
              <button className={styles.retryBtn} onClick={() => doLookup(inputValue)}>Thử lại</button>
            </div>
          )}

          {isEmpty && (
            <div className={styles.emptyState}>
              <div className={styles.stateMark} aria-hidden="true">0</div>
              <p className={styles.eyebrow}>NO MATCH</p>
              <h2 className={styles.stateTitle}>Chưa tìm thấy phụ tùng</h2>
              <p className={styles.stateDesc}>
                Không có kết quả khớp với mã <strong>{queriedCode}</strong>.
              </p>
              <ul className={styles.tips}>
                <li>Kiểm tra lại từng ký tự trong mã.</li>
                <li>Thử bỏ dấu gạch ngang nếu có.</li>
                <li><Link to={`/tim-kiem?q=${encodeURIComponent(queriedCode ?? "")}`} className={styles.link}>Tìm bằng từ khóa</Link> nếu bạn biết tên hoặc SKU.</li>
              </ul>
            </div>
          )}

          {hasResults && (
            <section className={styles.results}>
              <div className={styles.resultsHeader}>
                <div>
                  <p className={styles.eyebrow}>MATCHED PARTS</p>
                  <h2 className={styles.resultsTitle}>Kết quả cho <span className={styles.codeHighlight}>{queriedCode}</span></h2>
                </div>
                <span className={styles.resultsCount}>{results!.length} phụ tùng</span>
              </div>

              <div className={styles.resultList}>
                {results!.map((item) => (
                  <article key={`${item.productId}-${item.matchedOemCode}`} className={styles.resultItem}>
                    <div className={styles.oemMeta}>
                      <span className={styles.oemCode}>{item.matchedOemCode}</span>
                    </div>
                    <div className={styles.productRow}>
                      <div className={styles.productInfo}>
                        <p className={styles.productEyebrow}>PRODUCT</p>
                        <h3 className={styles.productName}><Link to={`/san-pham/${item.productSlug}`}>{item.productName}</Link></h3>
                        <div className={styles.productSku}>SKU · {item.sku}</div>
                      </div>
                      <Link to={`/san-pham/${item.productSlug}`} className={styles.viewBtn}>Xem chi tiết <span aria-hidden="true">→</span></Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
};

export default OemPage;
