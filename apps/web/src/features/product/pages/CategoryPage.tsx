import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MetaTags from "../../../components/ui/MetaTags";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import { Pagination, SkeletonCard } from "../../../components/ui";
import ProductGrid from "../components/ProductGrid";
import { fetchCategoryBySlug, fetchProductsByCategoryId, fetchAllCategories } from "../api/product.api";
import type { ProductListItem, CategoryDetail, CategoryListItem } from "../api/types";
import styles from "./CategoryPage.module.css";

const PAGE_SIZE = 24;
const SITE_URL = "https://phutunghachi.com";

function breadcrumbSchema(items: { label: string; href?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
    })),
  };
}

const CategoryDetailView: React.FC<{ slug: string }> = ({ slug }) => {
  const [items, setItems] = useState<ProductListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<CategoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null); setNotFound(false);
    fetchCategoryBySlug(slug)
      .then((res) => { if (!cancelled) setCategory(res.data); })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Lỗi tải danh mục";
        if (msg.includes("404") || msg.toLowerCase().includes("not found")) setNotFound(true); else setError(msg);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    if (!category) return;
    let cancelled = false;
    setLoading(true);
    fetchProductsByCategoryId(category.id, page, PAGE_SIZE)
      .then((res) => { if (!cancelled) { setItems(res.data); setTotal(res.meta.total); } })
      .catch((err: unknown) => { if (!cancelled) setError(err instanceof Error ? err.message : "Lỗi tải sản phẩm"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [category, page]);

  const breadcrumbs = [
    { label: "Trang chủ", href: "/" },
    { label: "Danh mục", href: "/danh-muc" },
    ...(category?.parent ? [{ label: category.parent.name, href: `/danh-muc/${category.parent.slug}` }] : []),
    ...(category ? [{ label: category.name }] : [{ label: "..." }]),
  ];
  const handlePageChange = (newPage: number) => { setPage(newPage); window.scrollTo({ top: 0, behavior: "smooth" }); };

  if (notFound) return <div className={styles.errorState}><div className={styles.errorIcon}>🔍</div><p><strong>Không tìm thấy danh mục.</strong></p><Link to="/danh-muc">← Xem tất cả danh mục</Link></div>;
  if (error) return <div className={styles.errorState}><div className={styles.errorIcon}>⚠️</div><p><strong>Không thể tải danh mục.</strong></p><p>{error}</p></div>;

  return (
    <>
      <MetaTags
        title={category ? `${category.name} – Phụ tùng ô tô` : "Danh mục"}
        description={category ? `Tra cứu phụ tùng ô tô trong danh mục ${category.name} tại HACHI. Xem sản phẩm, danh mục con và thông tin phù hợp theo nhu cầu.` : ""}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(breadcrumbs)) }} />
      <div className={styles.breadcrumbRow}><Breadcrumb items={breadcrumbs} /></div>
      <div className={styles.header}>
        {category?.parent && <Link to={`/danh-muc/${category.parent.slug}`} className={styles.parentBreadcrumb}>↑ {category.parent.name}</Link>}
        <h1 className={styles.title}>{category?.name ?? "Đang tải..."}</h1>
        <p className={styles.subtitle}>Danh sách phụ tùng thuộc nhóm {category?.name ?? "này"}; bạn có thể lọc tiếp theo thương hiệu và xe tương thích từ các trang sản phẩm.</p>
      </div>
      {(category?.children?.length ?? 0) > 0 && <div className={styles.childCategories}>{category!.children.map((child) => <Link key={child.id} to={`/danh-muc/${child.slug}`} className={styles.childCat}>{child.name}</Link>)}</div>}
      <div className={styles.productHeader}><span />{!loading && <span className={styles.productCount}>{total} sản phẩm</span>}</div>
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-5)' }}>
        <Link to="/hang-xe" className={styles.childCat}>Tra cứu theo hãng xe</Link>
        <Link to="/thuong-hieu" className={styles.childCat}>Xem theo thương hiệu</Link>
      </div>
      {loading ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "var(--space-4)" }}>{Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}</div> : <>
        <ProductGrid products={items} emptyMessage="Danh mục này chưa có sản phẩm" />
        {total > PAGE_SIZE && <div className={styles.pagination}><Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={handlePageChange} /></div>}
      </>}
    </>
  );
};

const CategoryListView: React.FC = () => {
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetchAllCategories().then((res) => setCategories(res.data)).catch((err: unknown) => setError(err instanceof Error ? err.message : "Lỗi tải danh mục")).finally(() => setLoading(false));
  }, []);
  const roots = categories.filter((c) => c.parentCategoryId === null);
  const childrenOf = (parentId: number) => categories.filter((c) => c.parentCategoryId === parentId);
  const breadcrumbs = [{ label: "Trang chủ", href: "/" }, { label: "Danh mục" }];
  return (
    <>
      <MetaTags title="Danh mục phụ tùng ô tô" description="Xem các nhóm phụ tùng ô tô tại HACHI, chọn danh mục để tìm sản phẩm phù hợp và tra cứu tiếp theo thương hiệu hoặc hãng xe." />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(breadcrumbs)) }} />
      <div className={styles.breadcrumbRow}><Breadcrumb items={breadcrumbs} /></div>
      <div className={styles.header}><h1 className={styles.title}>Danh mục phụ tùng ô tô</h1><p className={styles.subtitle}>Chọn nhóm phụ tùng để đi sâu tới các sản phẩm và danh mục con.</p></div>
      {error ? <div className={styles.errorState}><div className={styles.errorIcon}>⚠️</div><p><strong>Không thể tải danh mục.</strong></p><p>{error}</p></div> : loading ? <div className={styles.childCategories}>{Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ height: 40, background: "var(--color-surface-raised)", borderRadius: 6, opacity: 0.5 }} />)}</div> : roots.length === 0 ? <div className={styles.errorState}><div className={styles.errorIcon}>📂</div><p>Chưa có danh mục nào.</p></div> : <div className={styles.categoryTree}>{roots.map((root) => { const children = childrenOf(root.id); return <div key={root.id} className={styles.categoryGroup}><Link to={`/danh-muc/${root.slug}`} className={styles.categoryGroupTitle}>{root.name}</Link>{children.length > 0 && <div className={styles.childCategories}>{children.map((child) => <Link key={child.id} to={`/danh-muc/${child.slug}`} className={styles.childCat}>{child.name}</Link>)}</div>}</div>; })}</div>}
    </>
  );
};

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  return <div className="container"><div className={styles.page}>{slug ? <CategoryDetailView slug={slug} /> : <CategoryListView />}</div></div>;
};

export default CategoryPage;
