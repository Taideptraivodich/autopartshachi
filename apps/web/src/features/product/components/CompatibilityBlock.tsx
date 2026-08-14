import React from 'react';
import type { CompatibilityEntry } from '../api/types';
import styles from './CompatibilityBlock.module.css';

interface CompatibilityBlockProps {
  entries: CompatibilityEntry[];
}

const POSITION_LABEL: Record<string, string> = {
  chung: '',
  truoc: 'Trước',
  sau: 'Sau',
  truoc_trai: 'Trước trái',
  truoc_phai: 'Trước phải',
  sau_trai: 'Sau trái',
  sau_phai: 'Sau phải',
};

interface YearRangeEntry {
  yearStart: number | null;
  yearEnd: number | null;
  installationPosition: string;
  notes: string | null;
}

interface ModelGroup {
  modelName: string;
  modelSlug: string;
  entries: YearRangeEntry[];
}

interface BrandGroup {
  brandName: string;
  brandSlug: string;
  models: ModelGroup[];
}

function formatYearRange(yearStart: number | null, yearEnd: number | null): string {
  if (yearStart == null && yearEnd == null) return 'Từ trước – nay';
  if (yearStart == null) return `Từ trước – ${yearEnd}`;
  if (yearEnd == null) return `${yearStart} – nay`;
  return `${yearStart} – ${yearEnd}`;
}

function groupEntries(entries: CompatibilityEntry[]): BrandGroup[] {
  const brandMap = new Map<string, BrandGroup>();

  for (const e of entries) {
    if (!brandMap.has(e.brandSlug)) {
      brandMap.set(e.brandSlug, { brandName: e.brandName, brandSlug: e.brandSlug, models: [] });
    }
    const brand = brandMap.get(e.brandSlug)!;

    let model = brand.models.find((m) => m.modelSlug === e.modelSlug);
    if (!model) {
      model = { modelName: e.modelName, modelSlug: e.modelSlug, entries: [] };
      brand.models.push(model);
    }

    model.entries.push({
      yearStart: e.yearStart,
      yearEnd: e.yearEnd,
      installationPosition: e.installationPosition,
      notes: e.notes,
    });
  }

  return [...brandMap.values()];
}

const CompatibilityBlock: React.FC<CompatibilityBlockProps> = ({ entries }) => {
  const groups = groupEntries(entries);

  return (
    <div className={styles.block}>
      <div className={styles.header}>
        <span className={styles.headerIcon} aria-hidden="true" />
        <h3 className={styles.headerTitle}>Xe tương thích</h3>
      </div>

      {groups.length === 0 ? (
        <p className={styles.empty}>Chưa có thông tin xe tương thích.</p>
      ) : (
        <div className={styles.content}>
          {groups.map((brand) => (
            <div key={brand.brandSlug} className={styles.brandGroup}>
              <p className={styles.brandName}>{brand.brandName}</p>
              <div className={styles.models}>
                {brand.models.map((model) => (
                  <div key={model.modelSlug} className={styles.modelRow}>
                    <span className={styles.modelName}>{model.modelName}</span>
                    <div className={styles.generations}>
                      {model.entries.map((entry, idx) => {
                        const posLabel = POSITION_LABEL[entry.installationPosition] ?? '';
                        return (
                          <span key={`${entry.yearStart ?? 'before'}-${entry.yearEnd ?? 'now'}-${idx}`} className={styles.genTag}>
                            <span className={styles.genYear}>{formatYearRange(entry.yearStart, entry.yearEnd)}</span>
                            {posLabel && <span className={styles.genPosition}>{posLabel}</span>}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompatibilityBlock;
