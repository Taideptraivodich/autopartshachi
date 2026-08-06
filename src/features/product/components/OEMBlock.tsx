import React from 'react';
import type { OemCode } from '../api/types';
import styles from './OEMBlock.module.css';

interface OEMBlockProps {
  codes: OemCode[];
}

const STATUS_LABEL: Record<string, string> = {
  hieu_luc: 'Hiệu lực',
  ngung: 'Ngừng',
  da_bi_thay_the: 'Đã thay thế',
};

const CONFIDENCE_LABEL: Record<string, string> = {
  khop_hoan_toan: 'Khớp hoàn toàn',
  khop_tuong_duong: 'Tương đương',
};

const OEMBlock: React.FC<OEMBlockProps> = ({ codes }) => (
  <div className={styles.block}>
    <div className={styles.header}>
      <span className={styles.headerIcon}>🏷️</span>
      <h3 className={styles.headerTitle}>Mã OEM / Số phụ tùng gốc</h3>
    </div>

    {codes.length === 0 ? (
      <p className={styles.empty}>Không có thông tin mã OEM.</p>
    ) : (
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Mã OEM</th>
            <th>Hãng phát hành</th>
            <th>Trạng thái</th>
            <th>Độ khớp</th>
          </tr>
        </thead>
        <tbody>
          {codes.map((oem) => (
            <tr key={oem.id}>
              <td><span className={styles.code}>{oem.code}</span></td>
              <td>{oem.issuingBrand ?? '—'}</td>
              <td>
                <span className={`${styles.statusBadge} ${styles[`status--${oem.status}`]}`}>
                  {STATUS_LABEL[oem.status] ?? oem.status}
                </span>
              </td>
              <td>
                <span className={styles.confidence}>
                  {CONFIDENCE_LABEL[oem.matchConfidence] ?? oem.matchConfidence}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

export default OEMBlock;
