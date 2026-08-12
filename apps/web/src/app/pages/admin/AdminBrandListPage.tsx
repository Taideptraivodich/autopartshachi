import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAdminAuth } from "../../../features/admin/context/AdminAuthContext";
import { Button, Input } from "../../../components/ui";
import {
  listAdminBrands,
  createAdminBrand,
  updateAdminBrand,
  deleteAdminBrand,
  uploadImage,
  type AdminBrand,
} from "../../../features/admin/api/admin-catalog.api";

// URL gốc static server (Express) — ảnh upload ở /uploads/
const STATIC_BASE = "http://localhost:3001";

function resolveUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("/uploads/")) return `${STATIC_BASE}${url}`;
  return url;
}

// ─── ImageUploadField ────────────────────────────────────────────────────────

interface ImageUploadFieldProps {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  value,
  onChange,
  label = "Ảnh logo",
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      setUploadError((err as Error).message ?? "Upload thất bại");
    } finally {
      setUploading(false);
      // reset input để có thể chọn lại cùng file
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const resolved = resolveUrl(value);

  return (
    <div>
      <label style={{ fontSize: "0.85rem", color: "#374151", display: "block", marginBottom: 6 }}>
        {label}
      </label>

      {resolved && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <img
            src={resolved}
            alt="logo"
            style={{
              width: 56, height: 56, objectFit: "contain",
              border: "1px solid #e5e7eb", borderRadius: 6, background: "#f9fafb",
            }}
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            style={{ fontSize: "0.78rem", color: "#b91c1c", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            Xóa ảnh
          </button>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          style={{
            fontSize: "0.82rem", padding: "5px 12px", borderRadius: 6,
            border: "1px solid #d1d5db", background: uploading ? "#f3f4f6" : "#fff",
            cursor: uploading ? "not-allowed" : "pointer", color: "#374151",
          }}
        >
          {uploading ? "Đang tải lên…" : resolved ? "Đổi ảnh" : "Chọn ảnh từ máy"}
        </button>
        <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>JPEG, PNG, WebP — tối đa 5MB</span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: "none" }}
        onChange={handleFile}
      />

      {uploadError && (
        <p style={{ color: "#b91c1c", fontSize: "0.8rem", marginTop: 4 }}>{uploadError}</p>
      )}
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────

type FormState = { name: string; logoUrl: string | null; isActive: boolean };

const AdminBrandListPage: React.FC = () => {
  const { logout } = useAdminAuth();

  const [items, setItems] = useState<AdminBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<AdminBrand | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>({ name: "", logoUrl: null, isActive: true });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await listAdminBrands());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", logoUrl: null, isActive: true });
    setShowModal(true);
  };

  const openEdit = (brand: AdminBrand) => {
    setEditing(brand);
    setForm({ name: brand.name, logoUrl: brand.logoUrl, isActive: brand.isActive });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await updateAdminBrand(editing.id, {
          name: form.name.trim(),
          logoUrl: form.logoUrl,
          isActive: form.isActive,
        });
      } else {
        await createAdminBrand(form.name.trim(), form.isActive, form.logoUrl);
      }
      setShowModal(false);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (brand: AdminBrand) => {
    if (!window.confirm(`Xóa thương hiệu "${brand.name}"? Hành động này không thể hoàn tác.`)) return;
    setDeletingId(brand.id);
    try {
      await deleteAdminBrand(brand.id);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={S.page}>
      <header style={S.header}>
        <span style={S.logo}>Hachi Admin</span>
        <Button variant="ghost" size="sm" onClick={logout}>Đăng xuất</Button>
      </header>

      <main style={S.main}>
        <Link to="/admin" style={S.backLink}>← Bảng điều khiển</Link>
        <div style={S.titleRow}>
          <h2>Thương hiệu sản phẩm</h2>
          <Button variant="primary" onClick={openCreate}>+ Thêm thương hiệu</Button>
        </div>

        {error && <p style={S.error}>{error}</p>}

        {loading ? <p>Đang tải…</p> : (
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>ID</th>
                  <th style={S.th}>Logo</th>
                  <th style={S.th}>Tên</th>
                  <th style={S.th}>Slug</th>
                  <th style={S.th}>Trạng thái</th>
                  <th style={S.th}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr><td colSpan={6} style={S.tdEmpty}>Chưa có thương hiệu nào.</td></tr>
                )}
                {items.map((b) => (
                  <tr key={b.id}>
                    <td style={S.td}>{b.id}</td>
                    <td style={S.td}>
                      {resolveUrl(b.logoUrl) ? (
                        <img
                          src={resolveUrl(b.logoUrl)!}
                          alt={b.name}
                          style={{ width: 36, height: 36, objectFit: "contain", display: "block" }}
                        />
                      ) : (
                        <span style={{ color: "#d1d5db", fontSize: "0.8rem" }}>—</span>
                      )}
                    </td>
                    <td style={S.td}>{b.name}</td>
                    <td style={S.td}><code>{b.slug}</code></td>
                    <td style={S.td}>
                      <span style={b.isActive ? S.badgeActive : S.badgeOff}>
                        {b.isActive ? "Hoạt động" : "Ẩn"}
                      </span>
                    </td>
                    <td style={S.td}>
                      <div style={S.actions}>
                        <Button variant="secondary" size="sm" onClick={() => openEdit(b)}>Sửa</Button>
                        <Button
                          variant="danger"
                          size="sm"
                          loading={deletingId === b.id}
                          onClick={() => handleDelete(b)}
                        >Xóa</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showModal && (
        <div style={S.backdrop} onClick={() => setShowModal(false)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>{editing ? "Sửa thương hiệu" : "Thêm thương hiệu"}</h3>

            <Input
              label="Tên thương hiệu *"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ví dụ: Bosch, Denso…"
              autoFocus
            />

            <ImageUploadField
              label="Logo thương hiệu"
              value={form.logoUrl}
              onChange={(url) => setForm((f) => ({ ...f, logoUrl: url }))}
            />

            <label style={S.checkLabel}>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              {" "}Hiển thị (active)
            </label>

            <div style={S.modalActions}>
              <Button variant="ghost" onClick={() => setShowModal(false)}>Hủy</Button>
              <Button variant="primary" loading={saving} onClick={handleSave}>
                {editing ? "Lưu" : "Tạo"}
              </Button>
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
  th: { textAlign: "left", padding: "0.75rem 1rem", borderBottom: "1px solid #e5e7eb", fontSize: "0.8rem", color: "#666", textTransform: "uppercase" },
  td: { padding: "0.75rem 1rem", borderBottom: "1px solid #f0f0f0", fontSize: "0.9rem" },
  tdEmpty: { padding: "2rem", textAlign: "center", color: "#999" },
  actions: { display: "flex", gap: "0.5rem" },
  badgeActive: { background: "#dcfce7", color: "#15803d", borderRadius: 4, padding: "2px 8px", fontSize: "0.78rem" },
  badgeOff: { background: "#f3f4f6", color: "#6b7280", borderRadius: 4, padding: "2px 8px", fontSize: "0.78rem" },
  backdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { background: "#fff", borderRadius: 12, padding: "2rem", minWidth: 340, maxWidth: 480, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", gap: "1rem" },
  checkLabel: { display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", cursor: "pointer" },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" },
};

export default AdminBrandListPage;
