import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../../features/admin/context/AdminAuthContext";
import { Button, Pagination } from "../../../components/ui";
import {
  listProductsAdmin,
  deleteProduct,
} from "../../../features/admin/api/admin-product.api";
import type { ProductListItem } from "../../../features/product/api/types";

const STATUS_LABEL: Record<string, string> = {
  con_hang: "Còn hàng",
  het_hang: "Hết hàng",
  ngung_kinh_doanh: "Ngừng kinh doanh",
};

const PAGE_SIZE = 20;

const AdminProductListPage: React.FC = () => {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ProductListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listProductsAdmin({ page, pageSize: PAGE_SIZE });
      setItems(result.data);
      setTotal(result.meta.total);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Xóa sản phẩm "${name}"? Hành động này không thể hoàn tác.`)) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteProduct(id);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <span style={styles.logo}>Hachi Admin</span>
        <Button variant="ghost" size="sm" onClick={logout}>
          Đăng xuất
        </Button>
      </header>

      <main style={styles.main}>
        <Link to="/admin" style={styles.backLink}>
          ← Bảng điều khiển
        </Link>

        <div style={styles.titleRow}>
          <h2>Quản lý Sản phẩm</h2>
          <Button variant="primary" onClick={() => navigate("/admin/san-pham/moi")}>
            + Thêm sản phẩm
          </Button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Tên</th>
                    <th style={styles.th}>SKU</th>
                    <th style={styles.th}>Thương hiệu</th>
                    <th style={styles.th}>Trạng thái</th>
                    <th style={styles.th}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={6} style={styles.tdEmpty}>
                        Chưa có sản phẩm nào.
                      </td>
                    </tr>
                  )}
                  {items.map((p) => (
                    <tr key={p.id}>
                      <td style={styles.td}>{p.id}</td>
                      <td style={styles.td}>{p.name}</td>
                      <td style={styles.td}>{p.sku}</td>
                      <td style={styles.td}>{p.brand?.name ?? "—"}</td>
                      <td style={styles.td}>{STATUS_LABEL[p.status] ?? p.status}</td>
                      <td style={styles.td}>
                        <div style={styles.actions}>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate(`/admin/san-pham/${p.id}/sua`)}
                          >
                            Sửa
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            loading={deletingId === p.id}
                            onClick={() => handleDelete(p.id, p.name)}
                          >
                            Xóa
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
          </>
        )}
      </main>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", display: "flex", flexDirection: "column" },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.75rem 1.5rem",
    borderBottom: "1px solid #e5e7eb",
    background: "#fff",
  },
  logo: { fontWeight: 700, fontSize: "1rem", color: "#111" },
  main: { padding: "2rem 1.5rem", flex: 1 },
  backLink: { color: "#666", fontSize: "0.875rem", textDecoration: "none" },
  titleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "0.75rem 0 1.5rem",
  },
  error: { color: "#b91c1c", marginBottom: "1rem" },
  tableWrap: { overflowX: "auto", background: "#fff", borderRadius: 8, border: "1px solid #e5e7eb" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    padding: "0.75rem 1rem",
    borderBottom: "1px solid #e5e7eb",
    fontSize: "0.8rem",
    color: "#666",
    textTransform: "uppercase",
  },
  td: { padding: "0.75rem 1rem", borderBottom: "1px solid #f0f0f0", fontSize: "0.9rem" },
  tdEmpty: { padding: "2rem", textAlign: "center", color: "#999" },
  actions: { display: "flex", gap: "0.5rem" },
};

export default AdminProductListPage;
