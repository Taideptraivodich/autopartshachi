import { useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import styles from './HeroSection.module.css';

type Mode = 'systems' | 'oem';
type Hotspot = { n: string; label: string; x: number; y: number };

// x, y = vị trí (%) của nhãn trong khung ảnh. Chỉnh lại khi có ảnh thật.
const HOTSPOTS: Record<Mode, Hotspot[]> = {
  systems: [
    { n: '01', label: 'Hệ thống phanh', x: 2, y: 28 },
    { n: '02', label: 'Động cơ + bộ lọc', x: 64, y: 38 },
    { n: '03', label: 'Treo + gầm', x: 52, y: 84 },
  ],
  oem: [
    { n: '01', label: 'Mã OEM chuẩn', x: 4, y: 24 },
    { n: '02', label: 'Tương thích đời xe', x: 58, y: 34 },
    { n: '03', label: 'Aftermarket', x: 54, y: 86 },
  ],
};

interface HeroSectionProps {
  /** Ảnh phụ tùng tách nền (WebP/PNG), tỉ lệ ~1721x914. Bỏ trống = dùng hình minh hoạ SVG. */
  imageSrc?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ imageSrc }) => {
  const [mode, setMode] = useState<Mode>('systems');
  const stageRef = useRef<HTMLDivElement>(null);

  // Parallax nhẹ theo chuột bằng CSS variable → không re-render React.
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = stageRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--px', String(((e.clientX - r.left) / r.width - 0.5) * 2));
    el.style.setProperty('--py', String(((e.clientY - r.top) / r.height - 0.5) * 2));
  };
  const onLeave = () => {
    stageRef.current?.style.setProperty('--px', '0');
    stageRef.current?.style.setProperty('--py', '0');
  };

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className="container">
        <div className={styles.coords} aria-hidden="true">
          <span>10.94° N / 106.84° E</span>
          <i />
          <span>Biên Hòa · Đồng Nai</span>
        </div>

        <div className={styles.inner}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>
              <span className={styles.badge}>01</span>
              HACHI / Automotive parts
            </p>

            <h1 id="hero-title" className={styles.title}>
              Phụ tùng ô tô.<br />
              <em>Giá tốt, giao nhanh.</em>
            </h1>

            <p className={styles.lead}>
              Khám phá phụ tùng theo hãng xe, đời xe hoặc mã OEM trong một không gian mua sắm gọn
              gàng, dễ tra cứu.
            </p>

            <Link to="/san-pham" className={styles.cta}>
              <span>Khám phá sản phẩm</span>
              <span className={styles.ctaIcon} aria-hidden="true">→</span>
            </Link>

            <Link to="/hang-xe" className={styles.explore}>
              Tra cứu theo hãng xe <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div
            ref={stageRef}
            className={styles.stage}
            onPointerMove={onMove}
            onPointerLeave={onLeave}
          >
            <span className={`${styles.ring} ${styles.ring1}`} aria-hidden="true" />
            <span className={`${styles.ring} ${styles.ring2}`} aria-hidden="true" />

            <div className={styles.visual}>
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt="Phụ tùng ô tô HACHI: hệ thống phanh, động cơ, treo và gầm"
                  width={1721}
                  height={914}
                  decoding="async"
                />
              ) : (
                <BrakeDiscFallback />
              )}
            </div>

            {HOTSPOTS[mode].map((h) => (
              <div
                key={`${mode}-${h.n}`}
                className={styles.tag}
                style={{ left: `${h.x}%`, top: `${h.y}%` }}
              >
                <b>{h.n}</b> {h.label}
              </div>
            ))}

            <div className={styles.toggle} role="tablist" aria-label="Chế độ xem">
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'systems'}
                className={mode === 'systems' ? styles.on : ''}
                onClick={() => setMode('systems')}
              >
                Hệ thống
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'oem'}
                className={mode === 'oem' ? styles.on : ''}
                onClick={() => setMode('oem')}
              >
                OEM
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

/** Hình minh hoạ tạm (đĩa phanh) — thay bằng ảnh phụ tùng thật qua prop imageSrc. */
const BrakeDiscFallback: React.FC = () => {
  const bolts = Array.from({ length: 5 }, (_, i) => {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    return { x: 300 + Math.cos(a) * 62, y: 300 + Math.sin(a) * 62 };
  });
  const vents = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2;
    return { x: 300 + Math.cos(a) * 190, y: 300 + Math.sin(a) * 190 };
  });
  return (
    <svg viewBox="0 0 600 600" role="img" aria-label="Đĩa phanh" className={styles.fallback}>
      <defs>
        <radialGradient id="hachi-disc" cx="50%" cy="45%" r="55%">
          <stop offset="0" stopColor="#e9e6dc" />
          <stop offset="1" stopColor="#b9b6ab" />
        </radialGradient>
      </defs>
      <circle cx="300" cy="300" r="250" fill="url(#hachi-disc)" stroke="#161f2c" strokeWidth="3" />
      <circle cx="300" cy="300" r="215" fill="none" stroke="#161f2c" strokeOpacity=".25" />
      {vents.map((v, i) => (
        <circle key={i} cx={v.x} cy={v.y} r="7" fill="#f4f1e8" stroke="#161f2c" strokeOpacity=".5" />
      ))}
      <circle cx="300" cy="300" r="110" fill="#161f2c" />
      <circle cx="300" cy="300" r="40" fill="#f4f1e8" />
      {bolts.map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r="11" fill="#ff4f1a" />
      ))}
    </svg>
  );
};
