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

interface GenerationGroup {
  genName: string;
  yearStart: number;
  yearEnd: number | null;
  installationPosition: string;
  notes: string | null;
}

interface ModelGroup {
  modelName: string;
  modelSlug: string;
  generations: GenerationGroup[];
}

interface BrandGroup {
  brandName: string;
  brandSlug: string;
  models: ModelGroup[];
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
      model = { modelName: e.modelName, modelSlug: e.modelSlug, generations: [] };
      brand.models.push(model);
    }

    model.generations.push({
      genName: e.generationName,
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
        <span className={styles.headerIcon}>🚗</span>
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
                      {model.generations.map((gen, idx) => {
                        const yearRange = gen.yearEnd
                          ? `${gen.yearStart}–${gen.yearEnd}`
                          : `${gen.yearStart}+`;
                        const posLabel = POSITION_LABEL[gen.installationPosition] ?? '';
                        return (
                          <span key={idx} className={styles.genTag}>
                            <span className={styles.genYear}>{yearRange}</span>
                            <span className={styles.genName}>{gen.genName}</span>
                            {posLabel && (
                              <span className={styles.genPosition}>{posLabel}</span>
                            )}
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
