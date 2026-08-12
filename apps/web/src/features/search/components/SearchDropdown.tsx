import React from "react";
import type { SuggestionItem } from "../../product/api/types";
import styles from "./SearchDropdown.module.css";

interface SearchDropdownProps {
  query: string;
  history: string[];
  suggestions: SuggestionItem[];
  loading: boolean;
  onSelect: (value: string, slug?: string) => void;
  onRemoveHistory: (keyword: string) => void;
  onClearHistory: () => void;
  visible: boolean;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  query,
  history,
  suggestions,
  loading,
  onSelect,
  onRemoveHistory,
  onClearHistory,
  visible,
}) => {
  if (!visible) return null;
  const showHistory = query.length < 2;
  if (showHistory && history.length === 0) return null;

  return (
    <div className={styles.dropdown} role="listbox" aria-label="Gợi ý tìm kiếm">
      {showHistory ? (
        <>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Tìm kiếm gần đây</span>
            {history.length > 0 && (
              <button type="button" className={styles.clearAll} onClick={onClearHistory} aria-label="Xóa tất cả lịch sử">
                Xóa tất cả
              </button>
            )}
          </div>
          <ul className={styles.list}>
            {history.map((kw) => (
              <li key={kw} className={styles.item}>
                <button type="button" className={styles.itemBtn} onClick={() => onSelect(kw)} role="option" aria-selected={false}>
                  <span className={`${styles.itemIcon} ${styles.itemHistoryIcon}`} aria-hidden="true" />
                  <span className={styles.itemLabel}>{kw}</span>
                </button>
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={(e) => { e.stopPropagation(); onRemoveHistory(kw); }}
                  aria-label={`Xóa "${kw}" khỏi lịch sử`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          {loading ? (
            <div className={styles.loading} aria-live="polite"><span className={styles.spinner} aria-hidden="true" />Đang tìm...</div>
          ) : suggestions.length === 0 ? (
            <div className={styles.empty}>Không tìm thấy gợi ý</div>
          ) : (
            <>
              <div className={styles.sectionHeader}><span className={styles.sectionTitle}>Gợi ý</span></div>
              <ul className={styles.list}>
                {suggestions.map((item, idx) => (
                  <li key={`${item.type}-${item.value}-${idx}`} className={styles.item}>
                    <button type="button" className={styles.itemBtn} onClick={() => onSelect(item.value, item.slug)} role="option" aria-selected={false}>
                      <span className={`${styles.itemIcon} ${item.type === "product" ? styles.itemProductIcon : styles.itemOemIcon}`} aria-hidden="true" />
                      <span className={styles.itemLabel}>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default SearchDropdown;
