import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import MetaTags from '../../../components/ui/MetaTags';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import { fetchAllVehicleBrands, fetchVehicleBrandBySlug, fetchVehicleGenerationsByModelId } from '../../product/api/product.api';
import type { VehicleBrandListItem, VehicleBrandDetail, VehicleGenerationItem } from '../../product/api/types';
import styles from './VehiclePage.module.css';

const API_BASE = (import.meta as unknown as { env: Record<string, string> }).env.VITE_API_BASE_URL ?? "http://localhost:3001/api";
const STATIC_BASE = API_BASE.replace(/\/api$/, "");
const SITE_URL = 'https://phutunghachi.com';
function resolveLogoUrl(value: string | null | undefined) { return !value ? null : value.startsWith('/uploads/') ? `${STATIC_BASE}${value}` : value; }
function breadcrumbSchema(items: { label: string; href?: string }[]) { return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.label, ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}) })) }; }

const VehicleListView: React.FC = () => {
  const [brands, setBrands] = useState<VehicleBrandListItem[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  const breadcrumbs = [{ label: 'Trang chủ', href: '/' }, { label: 'Hãng xe' }];
  useEffect(() => { fetchAllVehicleBrands().then((res) => setBrands(res.data)).catch((err: unknown) => setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu')).finally(() => setLoading(false)); }, []);
  return <>
    <MetaTags title="Phụ tùng ô tô theo hãng xe – HACHI" description="Tra cứu phụ tùng ô tô theo hãng xe tại HACHI. Chọn Toyota, Honda, Ford, Hyundai, Kia và xem các dòng xe cùng sản phẩm tương thích." />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(breadcrumbs)) }} />
    <div className={styles.breadcrumbRow}><Breadcrumb items={breadcrumbs} /></div>
    <div className={styles.header}><h1 className={styles.title}>Tra cứu phụ tùng theo hãng xe</h1><p className={styles.subtitle}>Chọn hãng xe để đi tới dòng xe, khoảng năm và các phụ tùng tương thích.</p></div>
    {error ? <div className={styles.errorState}><div className={styles.errorIcon}>⚠️</div><p><strong>Không thể tải danh sách hãng xe.</strong></p><p>{error}</p></div> : loading ? <div className={styles.brandGrid}>{Array.from({ length: 6 }).map((_, i) => <div key={i} className={styles.skeletonCard} />)}</div> : brands.length === 0 ? <div className={styles.emptyState}><div className={styles.errorIcon}>🚗</div><p>Chưa có dữ liệu hãng xe.</p></div> : <div className={styles.brandGrid}>{brands.map((brand) => { const logoSrc = resolveLogoUrl((brand as VehicleBrandListItem & { logoUrl?: string | null }).logoUrl); return <Link key={brand.id} to={`/hang-xe/${brand.slug}`} className={styles.brandCard}><div className={styles.brandAvatar}>{logoSrc ? <img src={logoSrc} alt={`Logo ${brand.name}`} style={{ width: 48, height: 48, objectFit: 'contain', display: 'block' }} /> : brand.name[0]?.toUpperCase()}</div><span className={styles.brandName}>{brand.name}</span>{brand.countryOfOrigin && <span className={styles.brandMeta}>{brand.countryOfOrigin}</span>}</Link>; })}</div>}
  </>;
};

const VehicleDetailView: React.FC<{ slug: string }> = ({ slug }) => {
  const [brand, setBrand] = useState<VehicleBrandDetail | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null); const [notFound, setNotFound] = useState(false);
  useEffect(() => { let cancelled = false; setLoading(true); setError(null); setNotFound(false); setBrand(null); fetchVehicleBrandBySlug(slug).then((res) => { if (!cancelled) setBrand(res.data); }).catch((err: unknown) => { if (cancelled) return; const msg = err instanceof Error ? err.message : 'Lỗi tải dữ liệu'; if (msg.includes('404') || msg.toLowerCase().includes('not found')) setNotFound(true); else setError(msg); }).finally(() => { if (!cancelled) setLoading(false); }); return () => { cancelled = true; }; }, [slug]);
  const breadcrumbs = [{ label: 'Trang chủ', href: '/' }, { label: 'Hãng xe', href: '/hang-xe' }, ...(brand ? [{ label: brand.name }] : [{ label: '...' }])];
  if (notFound) return <div className={styles.errorState}><div className={styles.errorIcon}>🔍</div><p><strong>Không tìm thấy hãng xe.</strong></p><Link to="/hang-xe">← Xem tất cả hãng xe</Link></div>;
  if (error) return <div className={styles.errorState}><div className={styles.errorIcon}>⚠️</div><p><strong>Không thể tải thông tin hãng xe.</strong></p><p>{error}</p></div>;
  return <>
    <MetaTags title={brand ? `${brand.name} – Phụ tùng ô tô` : 'Hãng xe'} description={brand ? `Tra cứu phụ tùng ô tô ${brand.name} theo dòng xe và khoảng năm tại HACHI Việt Nam.` : ''} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(breadcrumbs)) }} />
    <div className={styles.breadcrumbRow}><Breadcrumb items={breadcrumbs} /></div>
    {loading ? <div className={styles.detailHeader} style={{ opacity: 0.5 }}><div className={styles.detailAvatar}>?</div><div className={styles.detailInfo}><div style={{ height: '1.5rem', width: 160, background: 'var(--color-surface-2)', borderRadius: 4 }} /></div></div> : <div className={styles.detailHeader}><div className={styles.detailAvatar}>{(() => { const src = resolveLogoUrl((brand as (typeof brand & { logoUrl?: string | null }))?.logoUrl); return src ? <img src={src} alt={`Logo ${brand?.name ?? ''}`} style={{ width: 48, height: 48, objectFit: 'contain', display: 'block' }} /> : brand?.name[0]?.toUpperCase() ?? '?'; })()}</div><div className={styles.detailInfo}><h1 className={styles.title}>{brand?.name}</h1>{brand?.countryOfOrigin && <span className={styles.detailCountry}>🌏 {brand.countryOfOrigin}</span>}</div></div>}
    <div className={styles.productCta}><p className={styles.productCtaText}>Chọn dòng xe <strong>{brand?.name ?? '...'}</strong> để xem các khoảng năm có phụ tùng phù hợp. Bạn cũng có thể quay lại <Link to="/san-pham">danh sách phụ tùng</Link> hoặc <Link to="/thuong-hieu">thương hiệu phụ tùng</Link>.</p></div>
    <h2 className={styles.sectionTitle}>Các dòng xe {brand?.name ?? ''}{brand && ` (${brand.models.length} dòng)`}</h2>
    {loading ? <div className={styles.modelGrid}>{Array.from({ length: 4 }).map((_, i) => <div key={i} style={{ height: 72, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', opacity: 0.5 }} />)}</div> : brand?.models.length === 0 ? <div className={styles.emptyState}><p>Chưa có dữ liệu dòng xe cho hãng này.</p></div> : <div className={styles.modelGrid}>{brand.models.map((model) => <Link key={model.id} to={`/hang-xe/${brand.slug}/${model.slug}`} className={styles.modelCard}><span className={styles.modelName}>{model.name}</span>{model.segment && <span className={styles.modelSegment}>{model.segment}</span>}</Link>)}</div>}
  </>;
};

const ModelDetailView: React.FC<{ brandSlug: string; modelSlug: string }> = ({ brandSlug, modelSlug }) => {
  const [brand, setBrand] = useState<VehicleBrandDetail | null>(null); const [generations, setGenerations] = useState<VehicleGenerationItem[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  useEffect(() => { let cancelled = false; setLoading(true); setError(null); fetchVehicleBrandBySlug(brandSlug).then(async (res) => { if (cancelled) return; const b = res.data; setBrand(b); const model = b.models.find((m) => m.slug === modelSlug); if (!model) return; const gRes = await fetchVehicleGenerationsByModelId(model.id); if (!cancelled) setGenerations(gRes.data); }).catch((err: unknown) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu'); }).finally(() => { if (!cancelled) setLoading(false); }); return () => { cancelled = true; }; }, [brandSlug, modelSlug]);
  const model = brand?.models.find((m) => m.slug === modelSlug); const breadcrumbs = [{ label: 'Trang chủ', href: '/' }, { label: 'Hãng xe', href: '/hang-xe' }, { label: brand?.name ?? '...', href: `/hang-xe/${brandSlug}` }, { label: model?.name ?? '...' }];
  if (error) return <div className={styles.errorState}><div className={styles.errorIcon}>⚠️</div><p><strong>Không thể tải dữ liệu.</strong></p><p>{error}</p></div>;
  return <>
    <MetaTags title={brand && model ? `${brand.name} ${model.name} – Phụ tùng theo năm` : 'Năm xe'} description={brand && model ? `Tra cứu phụ tùng ${brand.name} ${model.name} theo khoảng năm tương thích tại HACHI.` : ''} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(breadcrumbs)) }} />
    <div className={styles.breadcrumbRow}><Breadcrumb items={breadcrumbs} /></div>
    <div className={styles.header}><h1 className={styles.title}>{loading ? 'Đang tải...' : brand && model ? `${brand.name} ${model.name}` : 'Không tìm thấy'}</h1><p className={styles.subtitle}>Xem khoảng năm có phụ tùng tương thích cho {brand?.name ?? ''} {model?.name ?? ''}, sau đó mở danh sách sản phẩm phù hợp.</p></div>
    {loading ? <div className={styles.modelGrid}>{Array.from({ length: 4 }).map((_, i) => <div key={i} style={{ height: 96, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', opacity: 0.5 }} />)}</div> : generations.length === 0 ? <div className={styles.emptyState}><p>Chưa có sản phẩm nào gắn tương thích cho dòng xe này.</p></div> : <div className={styles.generationList}>{generations.map((range) => { const yearStr = range.yearEnd ? `${range.yearStart} – ${range.yearEnd}` : `${range.yearStart} – nay`; return <div key={`${range.yearStart}-${range.yearEnd ?? 'now'}`} className={styles.generationCard}><div className={styles.generationInfo}><span className={styles.generationName}>Khoảng năm</span><span className={styles.generationYear}>{yearStr}</span></div><Link to={`/san-pham?vehicleModelId=${model?.id}&vehicleYear=${range.yearStart}`} className={styles.generationCta}>Xem phụ tùng →</Link></div>; })}</div>}
  </>;
};

const VehiclePage: React.FC = () => { const { slug, modelSlug } = useParams<{ slug: string; modelSlug: string }>(); return <div className="container"><div className={styles.page}>{slug && modelSlug ? <ModelDetailView brandSlug={slug} modelSlug={modelSlug} /> : slug ? <VehicleDetailView slug={slug} /> : <VehicleListView />}</div></div>; };
export default VehiclePage;
