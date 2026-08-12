import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAdminAuth } from "../../../features/admin/context/AdminAuthContext";
import { Button, Pagination } from "../../../components/ui";
import {
  listAdminLeads,
  markLeadRead,
  deleteAdminLead,
  type AdminLead,
} from "../../../features/admin/api/admin-catalog.api";

const SOURCE_LABEL: Record<string, string> = {
  website: "Website",
  oem_page: "Trang OEM",
  search_page: "Trang tìm kiếm",
  product_page: "Trang sản phẩm",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const PAGE_SIZE = 30;

const AdminLeadListPage: React.FC = () => {
  const { logout } = useAdminAuth();

  const [items, setItems] = useState<AdminLead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listAdminLeads({ page, pageSize: PAGE_SIZE, onlyUnread });
      setItems(res.data);
      setTotal(res.meta.total);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page, onlyUnread]);

  useEffect(() => { load(); }, [load]);

  const handleToggleRead = async (lead: AdminLead) => {
    setTogglingId(lead.id);
    try {
      const updated = await markLeadRead(lead.id, !lead.isRead);
      setItems((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (lead: AdminLead) => {
    if (!window.confirm(`Xóa lead từ "${lead.name}" (${lead.phone})?`)) return;
    setDeletingId(lead.id);
    try {
      await deleteAdminLead(lead.id);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDeletingId(null);
    }
  };

  const unreadCount = items.filter((l) => !l.isRead).length;

  return (
    <div style={S.page}>
      <header style={S.header}>
        <span style={S.logo}>Hachi Admin</span>
        <Button variant="ghost" size="sm" onClick={logout}>Đăng xuất</Button>
      </header>

      <main style={S.main}>
        <Link to="/admin" style={S.backLink}>← Bảng điều khiển</Link>

        <div style={S.titleRow}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <h2 style={{ margin: 0 }}>Lead liên hệ</h2>
            {unreadCount > 0 && (
              <span style={S.unreadBadge}>{unreadCount} chưa đọc</span>
            )}
          </div>
          <label style={S.filterLabel}>
            <input
              type="checkbox"
              checked={onlyUnread}
              onChange={(e) => { setOnlyUnread(e.target.checked); setPage(1); }}
            />
            {" "}Chỉ chưa đọc
          </label>
        </div>

        {error && <p style={S.error}>{error}</p>}

        {loading ? (
          <p style={S.loading}>Đang tải…</p>
        ) : items.length === 0 ? (
          <div style={S.empty}>
            <p>{onlyUnread ? "Không có lead chưa đọc." : "Chưa có lead nào."}</p>
          </div>
        ) : (
          <>
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>Thời gian</th>
                    <th style={S.th}>Tên</th>
                    <th style={S.th}>Điện thoại</th>
                    <th style={S.th}>Sản phẩm</th>
                    <th style={S.th}>Nguồn</th>
                    <th style={S.th}>Trạng thái</th>
                    <th style={S.th}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((lead) => (
                    <React.Fragment key={lead.id}>
                      <tr
                        style={{
                          ...S.row,
                          background: lead.isRead ? "#fff" : "#fefce8",
                          cursor: lead.message ? "pointer" : "default",
                        }}
                        onClick={() =>
                          lead.message
                            ? setExpanded(expanded === lead.id ? null : lead.id)
                            : undefined
                        }
                      >
                        <td style={S.td}>{formatDate(lead.createdAt)}</td>
                        <td style={{ ...S.td, fontWeight: lead.isRead ? 400 : 600 }}>
                          {lead.name}
                        </td>
                        <td style={S.td}>
                          <a href={`tel:${lead.phone}`} style={S.phoneLink}>
                            {lead.phone}
                          </a>
                        </td>
                        <td style={S.td}>
                          {lead.productName ? (
                            <span title={lead.productSku ?? ""}>
                              {lead.productName}
                              {lead.productSku && (
                                <span style={S.sku}> ({lead.productSku})</span>
                              )}
                            </span>
                          ) : (
                            <span style={S.na}>—</span>
                          )}
                        </td>
                        <td style={S.td}>
                          <span style={S.sourceBadge}>
                            {SOURCE_LABEL[lead.source] ?? lead.source}
                          </span>
                        </td>
                        <td style={S.td}>
                          <span style={lead.isRead ? S.badgeRead : S.badgeUnread}>
                            {lead.isRead ? "Đã đọc" : "Chưa đọc"}
                          </span>
                        </td>
                        <td style={S.td} onClick={(e) => e.stopPropagation()}>
                          <div style={S.actions}>
                            <button
                              style={S.iconBtn}
                              title={lead.isRead ? "Đánh dấu chưa đọc" : "Đánh dấu đã đọc"}
                              disabled={togglingId === lead.id}
                              onClick={() => handleToggleRead(lead)}
                            >
                              {lead.isRead ? "📭" : "📬"}
                            </button>
                            <button
                              style={S.iconBtn}
                              title="Xóa lead"
                              disabled={deletingId === lead.id}
                              onClick={() => handleDelete(lead)}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expanded === lead.id && lead.message && (
                        <tr>
                          <td
                            colSpan={7}
                            style={S.messageRow}
                          >
                            <strong>Nội dung:</strong> {lead.message}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {total > PAGE_SIZE && (
              <div style={S.paginationWrap}>
                <Pagination
                  page={page}
                  pageSize={PAGE_SIZE}
                  total={total}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

const S: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f9fafb" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1.5rem", borderBottom: "1px solid #e5e7eb", background: "#fff" },
  logo: { fontWeight: 700, fontSize: "1rem", color: "#111" },
  main: { padding: "2rem 1.5rem", flex: 1 },
  backLink: { color: "#666", fontSize: "0.875rem", textDecoration: "none" },
  titleRow: { display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0.75rem 0 1.5rem", flexWrap: "wrap", gap: "0.75rem" },
  unreadBadge: { background: "#ef4444", color: "#fff", borderRadius: 99, padding: "2px 10px", fontSize: "0.78rem", fontWeight: 600 },
  filterLabel: { display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", cursor: "pointer" },
  error: { color: "#b91c1c", marginBottom: "1rem" },
  loading: { color: "#9ca3af", padding: "2rem 0" },
  empty: { background: "#fff", borderRadius: 8, border: "1px solid #e5e7eb", padding: "3rem", textAlign: "center", color: "#9ca3af" },
  tableWrap: { overflowX: "auto", background: "#fff", borderRadius: 8, border: "1px solid #e5e7eb" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "0.75rem 1rem", borderBottom: "1px solid #e5e7eb", fontSize: "0.78rem", color: "#6b7280", textTransform: "uppercase" as const, whiteSpace: "nowrap" as const },
  row: { borderBottom: "1px solid #f0f0f0", transition: "background 0.1s" },
  td: { padding: "0.7rem 1rem", fontSize: "0.875rem", verticalAlign: "middle" },
  messageRow: { padding: "0.75rem 1rem 1rem 1rem", background: "#f0f9ff", fontSize: "0.875rem", borderBottom: "1px solid #e0f2fe", color: "#0369a1" },
  phoneLink: { color: "#2563eb", textDecoration: "none", fontWeight: 500 },
  sku: { color: "#9ca3af", fontSize: "0.8rem" },
  na: { color: "#d1d5db" },
  sourceBadge: { background: "#f3f4f6", color: "#374151", borderRadius: 4, padding: "2px 7px", fontSize: "0.75rem" },
  badgeUnread: { background: "#fef3c7", color: "#92400e", borderRadius: 4, padding: "2px 8px", fontSize: "0.75rem", fontWeight: 600 },
  badgeRead: { background: "#f3f4f6", color: "#6b7280", borderRadius: 4, padding: "2px 8px", fontSize: "0.75rem" },
  actions: { display: "flex", gap: "0.25rem" },
  iconBtn: { background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", padding: "2px 4px", lineHeight: 1, borderRadius: 4 },
  paginationWrap: { marginTop: "1.25rem", display: "flex", justifyContent: "center" },
};

export default AdminLeadListPage;
