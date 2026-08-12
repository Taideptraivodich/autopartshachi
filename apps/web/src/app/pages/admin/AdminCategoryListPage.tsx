import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAdminAuth } from "../../../features/admin/context/AdminAuthContext";
import { Button, Input, Select } from "../../../components/ui";
import {
  listAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  type AdminCategory,
} from "../../../features/admin/api/admin-catalog.api";

type FormState = { name: string; parentCategoryId: string; isActive: boolean };

function buildTree(items: AdminCategory[]): AdminCategory[] {
  const roots: AdminCategory[] = [];
  const childrenMap: Record<number, AdminCategory[]> = {};
  for (const item of items) {
    if (item.parentCategoryId === null) roots.push(item);
    else (childrenMap[item.parentCategoryId] ??= []).push(item);
  }
  const result: AdminCategory[] = [];
  function visit(node: AdminCategory) {
    result.push(node);
    for (const child of childrenMap[node.id] ?? []) visit(child);
  }
  for (const root of roots) visit(root);
  return result;
}

function indentLevel(item: AdminCategory, all: AdminCategory[]): number {
  let level = 0;
  let cur = item;
  const map = Object.fromEntries(all.map((x) => [x.id, x]));
  while (cur.parentCategoryId !== null) {
    cur = map[cur.parentCategoryId]!;
    if (!cur) break;
    level++;
  }
  return level;
}

const AdminCategoryListPage: React.FC = () => {
  const { logout } = useAdminAuth();
  const [items, setItems] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [form, setForm] = useState<FormState>({ name: "", parentCategoryId: "", isActive: true });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try { setItems(await listAdminCategories()); }
    catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", parentCategoryId: "", isActive: true });
    setShowModal(true);
  };

  const openEdit = (cat: AdminCategory) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      parentCategoryId: cat.parentCategoryId !== null ? String(cat.parentCategoryId) : "",
      isActive: cat.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const parentCategoryId = form.parentCategoryId ? parseInt(form.parentCategoryId, 10) : null;
      if (editing) {
        await updateAdminCategory(editing.id, { name: form.name.trim(), parentCategoryId, isActive: form.isActive });
      } else {
        await createAdminCategory({ name: form.name.trim(), parentCategoryId, isActive: form.isActive });
      }
      setShowModal(false);
      await load();
    } catch (e) { setError((e as Error).message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (cat: AdminCategory) => {
    if (!window.confirm(`Xóa danh mục "${cat.name}"?`)) return;
    setDeletingId(cat.id);
    try { await deleteAdminCategory(cat.id); await load(); }
    catch (e) { setError((e as Error).message); }
    finally { setDeletingId(null); }
  };

  const tree = buildTree(items);
  const parentOptions = [
    { value: "", label: "— Không có cha —" },
    ...items.filter((c) => editing === null || c.id !== editing.id)
            .map((c) => ({ value: String(c.id), label: c.name })),
  ];

  return (
    <div style={S.page}>
      <header style={S.header}>
        <span style={S.logo}>Hachi Admin</span>
        <Button variant="ghost" size="sm" onClick={logout}>Đăng xuất</Button>
      </header>
      <main style={S.main}>
        <Link to="/admin" style={S.backLink}>← Bảng điều khiển</Link>
        <div style={S.titleRow}>
          <h2>Danh mục sản phẩm</h2>
          <Button variant="primary" onClick={openCreate}>+ Thêm danh mục</Button>
        </div>
        {error && <p style={S.error}>{error}</p>}
        {loading ? <p>Đang tải…</p> : (
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Tên</th>
                  <th style={S.th}>Slug</th>
                  <th style={S.th}>Cha</th>
                  <th style={S.th}>Trạng thái</th>
                  <th style={S.th}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {tree.length === 0 && (
                  <tr><td colSpan={5} style={S.tdEmpty}>Chưa có danh mục nào.</td></tr>
                )}
                {tree.map((cat) => {
                  const level = indentLevel(cat, items);
                  const parentName = cat.parentCategoryId !== null
                    ? items.find((x) => x.id === cat.parentCategoryId)?.name ?? "?"
                    : "—";
                  return (
                    <tr key={cat.id}>
                      <td style={{ ...S.td, paddingLeft: `${1 + level * 1.5}rem` }}>
                        {level > 0 && <span style={{ color: "#aaa", marginRight: 4 }}>↳</span>}
                        {cat.name}
                      </td>
                      <td style={S.td}><code>{cat.slug}</code></td>
                      <td style={S.td}>{parentName}</td>
                      <td style={S.td}>
                        <span style={cat.isActive ? S.badgeActive : S.badgeOff}>
                          {cat.isActive ? "Hoạt động" : "Ẩn"}
                        </span>
                      </td>
                      <td style={S.td}>
                        <div style={S.actions}>
                          <Button variant="secondary" size="sm" onClick={() => openEdit(cat)}>Sửa</Button>
                          <Button variant="danger" size="sm" loading={deletingId === cat.id} onClick={() => handleDelete(cat)}>Xóa</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
      {showModal && (
        <div style={S.backdrop} onClick={() => setShowModal(false)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>{editing ? "Sửa danh mục" : "Thêm danh mục"}</h3>
            <Input
              label="Tên danh mục *"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ví dụ: Phụ tùng động cơ"
              autoFocus
            />
            <Select
              label="Danh mục cha"
              options={parentOptions}
              value={form.parentCategoryId}
              onChange={(e) => setForm((f) => ({ ...f, parentCategoryId: e.target.value }))}
            />
            <label style={S.checkLabel}>
              <input type="checkbox" checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
              {" "}Hoạt động (hiển thị trên web)
            </label>
            <div style={S.modalActions}>
              <Button variant="ghost" onClick={() => setShowModal(false)}>Hủy</Button>
              <Button variant="primary" loading={saving} onClick={handleSave}>{editing ? "Lưu" : "Tạo"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const S: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", display: "flex", flexDirection: "column" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1.5rem", borderBottom: "1px solid #e5e7eb", background: "#fff" },
  logo: { fontWeight: 700, fontSize: "1rem", color: "#111" },
  main: { padding: "2rem 1.5rem", flex: 1 },
  backLink: { color: "#666", fontSize: "0.875rem", textDecoration: "none" },
  titleRow: { display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0.75rem 0 1.5rem" },
  error: { color: "#b91c1c", marginBottom: "1rem" },
  tableWrap: { overflowX: "auto", background: "#fff", borderRadius: 8, border: "1px solid #e5e7eb" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "0.75rem 1rem", borderBottom: "1px solid #e5e7eb", fontSize: "0.8rem", color: "#666", textTransform: "uppercase" as const },
  td: { padding: "0.75rem 1rem", borderBottom: "1px solid #f0f0f0", fontSize: "0.9rem" },
  tdEmpty: { padding: "2rem", textAlign: "center" as const, color: "#999" },
  actions: { display: "flex", gap: "0.5rem" },
  badgeActive: { background: "#dcfce7", color: "#15803d", borderRadius: 4, padding: "2px 8px", fontSize: "0.78rem" },
  badgeOff: { background: "#f3f4f6", color: "#6b7280", borderRadius: 4, padding: "2px 8px", fontSize: "0.78rem" },
  backdrop: { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { background: "#fff", borderRadius: 12, padding: "2rem", minWidth: 340, maxWidth: 480, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column" as const, gap: "1rem" },
  checkLabel: { display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", cursor: "pointer" },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" },
};

export default AdminCategoryListPage;
