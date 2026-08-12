/**
 * AdminVehicleBrandListPage — quản lý hãng xe / dòng xe / đời xe
 * UX: 3 bảng song song (hoặc drill-down trên mobile).
 * Chọn hãng → hiện dòng xe bên phải; chọn dòng xe → hiện đời xe.
 */
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAdminAuth } from "../../../features/admin/context/AdminAuthContext";
import { Button, Input } from "../../../components/ui";
import {
  listAdminVehicleBrands,
  createAdminVehicleBrand,
  updateAdminVehicleBrand,
  deleteAdminVehicleBrand,
  listAdminVehicleModels,
  createAdminVehicleModel,
  updateAdminVehicleModel,
  deleteAdminVehicleModel,
  listAdminVehicleGenerations,
  createAdminVehicleGeneration,
  updateAdminVehicleGeneration,
  deleteAdminVehicleGeneration,
  uploadImage,
  type AdminVehicleBrand,
  type AdminVehicleModel,
  type AdminVehicleGeneration,
} from "../../../features/admin/api/admin-catalog.api";

const STATIC_BASE = "http://localhost:3001";

function resolveUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("/uploads/")) return `${STATIC_BASE}${url}`;
  return url;
}

// ─── ImageUploadField ────────────────────────────────────────────────────────

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
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
              width: 52, height: 52, objectFit: "contain",
              border: "1px solid #e5e7eb", borderRadius: 6, background: "#f9fafb",
            }}
          />
          <button
            type="button"
            onClick={() => onChange("")}
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

// ─── Brand Modal ─────────────────────────────────────────────────────────────

interface BrandModalProps {
  title: string;
  form: Record<string, string>;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
  onChange: (key: string, val: string) => void;
}

const BrandModal: React.FC<BrandModalProps> = ({ title, form, saving, onClose, onSave, onChange }) => (
  <div style={S.backdrop} onClick={onClose}>
    <div style={S.modal} onClick={(e) => e.stopPropagation()}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <Input
        label="Tên hãng *"
        value={form.name ?? ""}
        onChange={(e) => onChange("name", e.target.value)}
        autoFocus
      />
      <Input
        label="Quốc gia"
        value={form.countryOfOrigin ?? ""}
        onChange={(e) => onChange("countryOfOrigin", e.target.value)}
        placeholder="Nhật Bản, Hàn Quốc…"
      />
      <ImageUploadField
        label="Logo hãng xe"
        value={form.logoUrl ?? ""}
        onChange={(url) => onChange("logoUrl", url)}
      />
      <label style={S.checkLabel}>
        <input
          type="checkbox"
          checked={form.isActive === "true"}
          onChange={(e) => onChange("isActive", e.target.checked ? "true" : "false")}
        />
        {" "}Hoạt động
      </label>
      <div style={S.modalActions}>
        <Button variant="ghost" onClick={onClose}>Hủy</Button>
        <Button variant="primary" loading={saving} onClick={onSave}>Lưu</Button>
      </div>
    </div>
  </div>
);

// ─── Generic simple modal (model, generation) ─────────────────────────────────

interface NameModalProps {
  title: string;
  fields: { label: string; key: string; type?: string }[];
  values: Record<string, string>;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
  onChange: (key: string, val: string) => void;
}

const NameModal: React.FC<NameModalProps> = ({ title, fields, values, saving, onClose, onSave, onChange }) => (
  <div style={S.backdrop} onClick={onClose}>
    <div style={S.modal} onClick={(e) => e.stopPropagation()}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {fields.map((f) => (
        <div key={f.key}>
          {f.type === "checkbox" ? (
            <label style={S.checkLabel}>
              <input
                type="checkbox"
                checked={values[f.key] === "true"}
                onChange={(e) => onChange(f.key, e.target.checked ? "true" : "false")}
              />
              {" "}{f.label}
            </label>
          ) : (
            <Input
              label={f.label}
              value={values[f.key] ?? ""}
              onChange={(e) => onChange(f.key, e.target.value)}
              type={f.type ?? "text"}
            />
          )}
        </div>
      ))}
      <div style={S.modalActions}>
        <Button variant="ghost" onClick={onClose}>Hủy</Button>
        <Button variant="primary" loading={saving} onClick={onSave}>Lưu</Button>
      </div>
    </div>
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────

const AdminVehicleBrandListPage: React.FC = () => {
  const { logout } = useAdminAuth();
  const [error, setError] = useState<string | null>(null);

  // ── Brands ──
  const [brands, setBrands] = useState<AdminVehicleBrand[]>([]);
  const [brandLoading, setBrandLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState<AdminVehicleBrand | null>(null);
  const [brandModal, setBrandModal] = useState<{ open: boolean; editing: AdminVehicleBrand | null }>({ open: false, editing: null });
  const [brandForm, setBrandForm] = useState<Record<string, string>>({});
  const [brandSaving, setBrandSaving] = useState(false);
  const [brandDeleting, setBrandDeleting] = useState<number | null>(null);

  // ── Models ──
  const [models, setModels] = useState<AdminVehicleModel[]>([]);
  const [modelLoading, setModelLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AdminVehicleModel | null>(null);
  const [modelModal, setModelModal] = useState<{ open: boolean; editing: AdminVehicleModel | null }>({ open: false, editing: null });
  const [modelForm, setModelForm] = useState<Record<string, string>>({});
  const [modelSaving, setModelSaving] = useState(false);
  const [modelDeleting, setModelDeleting] = useState<number | null>(null);

  // ── Generations ──
  const [generations, setGenerations] = useState<AdminVehicleGeneration[]>([]);
  const [genLoading, setGenLoading] = useState(false);
  const [genModal, setGenModal] = useState<{ open: boolean; editing: AdminVehicleGeneration | null }>({ open: false, editing: null });
  const [genForm, setGenForm] = useState<Record<string, string>>({});
  const [genSaving, setGenSaving] = useState(false);
  const [genDeleting, setGenDeleting] = useState<number | null>(null);

  // ── Loaders ──
  const loadBrands = useCallback(async () => {
    setBrandLoading(true);
    try { setBrands(await listAdminVehicleBrands()); }
    catch (e) { setError((e as Error).message); }
    finally { setBrandLoading(false); }
  }, []);

  useEffect(() => { loadBrands(); }, [loadBrands]);

  const loadModels = useCallback(async (brandId: number) => {
    setModelLoading(true);
    setModels([]); setSelectedModel(null); setGenerations([]);
    try { setModels(await listAdminVehicleModels(brandId)); }
    catch (e) { setError((e as Error).message); }
    finally { setModelLoading(false); }
  }, []);

  const loadGenerations = useCallback(async (modelId: number) => {
    setGenLoading(true); setGenerations([]);
    try { setGenerations(await listAdminVehicleGenerations(modelId)); }
    catch (e) { setError((e as Error).message); }
    finally { setGenLoading(false); }
  }, []);

  // ── Brand CRUD ──
  const openBrandCreate = () => {
    setBrandForm({ name: "", countryOfOrigin: "", logoUrl: "", isActive: "true" });
    setBrandModal({ open: true, editing: null });
  };
  const openBrandEdit = (b: AdminVehicleBrand) => {
    setBrandForm({ name: b.name, countryOfOrigin: b.countryOfOrigin ?? "", logoUrl: b.logoUrl ?? "", isActive: b.isActive ? "true" : "false" });
    setBrandModal({ open: true, editing: b });
  };
  const saveBrand = async () => {
    if (!brandForm.name?.trim()) return;
    setBrandSaving(true);
    try {
      const payload = {
        name: brandForm.name.trim(),
        countryOfOrigin: brandForm.countryOfOrigin || undefined,
        logoUrl: brandForm.logoUrl || undefined,
        isActive: brandForm.isActive === "true",
      };
      if (brandModal.editing) await updateAdminVehicleBrand(brandModal.editing.id, payload);
      else await createAdminVehicleBrand(payload);
      setBrandModal({ open: false, editing: null });
      await loadBrands();
    } catch (e) { setError((e as Error).message); }
    finally { setBrandSaving(false); }
  };
  const deleteBrand = async (b: AdminVehicleBrand) => {
    if (!window.confirm(`Xóa hãng xe "${b.name}"?`)) return;
    setBrandDeleting(b.id);
    try {
      await deleteAdminVehicleBrand(b.id);
      await loadBrands();
      if (selectedBrand?.id === b.id) { setSelectedBrand(null); setModels([]); setGenerations([]); }
    } catch (e) { setError((e as Error).message); }
    finally { setBrandDeleting(null); }
  };

  // ── Model CRUD ──
  const openModelCreate = () => {
    setModelForm({ name: "", segment: "", isActive: "true" });
    setModelModal({ open: true, editing: null });
  };
  const openModelEdit = (m: AdminVehicleModel) => {
    setModelForm({ name: m.name, segment: m.segment ?? "", isActive: m.isActive ? "true" : "false" });
    setModelModal({ open: true, editing: m });
  };
  const saveModel = async () => {
    if (!modelForm.name?.trim() || !selectedBrand) return;
    setModelSaving(true);
    try {
      const payload = { name: modelForm.name.trim(), segment: modelForm.segment || undefined, isActive: modelForm.isActive === "true" };
      if (modelModal.editing) await updateAdminVehicleModel(modelModal.editing.id, payload);
      else await createAdminVehicleModel(selectedBrand.id, payload);
      setModelModal({ open: false, editing: null });
      await loadModels(selectedBrand.id);
    } catch (e) { setError((e as Error).message); }
    finally { setModelSaving(false); }
  };
  const deleteModel = async (m: AdminVehicleModel) => {
    if (!window.confirm(`Xóa dòng xe "${m.name}"?`)) return;
    setModelDeleting(m.id);
    try {
      await deleteAdminVehicleModel(m.id);
      if (selectedBrand) await loadModels(selectedBrand.id);
      if (selectedModel?.id === m.id) { setSelectedModel(null); setGenerations([]); }
    } catch (e) { setError((e as Error).message); }
    finally { setModelDeleting(null); }
  };

  // ── Generation CRUD ──
  const openGenCreate = () => {
    setGenForm({ name: "", yearStart: "", yearEnd: "", isActive: "true" });
    setGenModal({ open: true, editing: null });
  };
  const openGenEdit = (g: AdminVehicleGeneration) => {
    setGenForm({ name: g.name, yearStart: String(g.yearStart), yearEnd: g.yearEnd !== null ? String(g.yearEnd) : "", isActive: g.isActive ? "true" : "false" });
    setGenModal({ open: true, editing: g });
  };
  const saveGen = async () => {
    if (!genForm.name?.trim() || !genForm.yearStart || !selectedModel) return;
    setGenSaving(true);
    try {
      const payload = {
        name: genForm.name.trim(),
        yearStart: parseInt(genForm.yearStart, 10),
        yearEnd: genForm.yearEnd ? parseInt(genForm.yearEnd, 10) : null,
        isActive: genForm.isActive === "true",
      };
      if (genModal.editing) await updateAdminVehicleGeneration(genModal.editing.id, payload);
      else await createAdminVehicleGeneration(selectedModel.id, payload);
      setGenModal({ open: false, editing: null });
      await loadGenerations(selectedModel.id);
    } catch (e) { setError((e as Error).message); }
    finally { setGenSaving(false); }
  };
  const deleteGen = async (g: AdminVehicleGeneration) => {
    if (!window.confirm(`Xóa đời xe "${g.name}"?`)) return;
    setGenDeleting(g.id);
    try {
      await deleteAdminVehicleGeneration(g.id);
      if (selectedModel) await loadGenerations(selectedModel.id);
    } catch (e) { setError((e as Error).message); }
    finally { setGenDeleting(null); }
  };

  return (
    <div style={S.page}>
      <header style={S.header}>
        <span style={S.logo}>Hachi Admin</span>
        <Button variant="ghost" size="sm" onClick={logout}>Đăng xuất</Button>
      </header>

      <main style={S.main}>
        <Link to="/admin" style={S.backLink}>← Bảng điều khiển</Link>
        <h2 style={{ margin: "0.75rem 0 1.25rem" }}>Quản lý Hãng xe</h2>

        {error && <p style={S.error}>{error}</p>}

        <div style={S.columns}>
          {/* ── Column 1: Brands ── */}
          <div style={S.col}>
            <div style={S.colHeader}>
              <strong>Hãng xe</strong>
              <Button variant="primary" size="sm" onClick={openBrandCreate}>+ Thêm</Button>
            </div>
            {brandLoading ? <p style={S.loading}>Đang tải…</p> : (
              <ul style={S.list}>
                {brands.length === 0 && <li style={S.emptyItem}>Chưa có hãng nào.</li>}
                {brands.map((b) => {
                  const logo = resolveUrl(b.logoUrl);
                  return (
                    <li
                      key={b.id}
                      style={{ ...S.listItem, ...(selectedBrand?.id === b.id ? S.listItemActive : {}) }}
                      onClick={() => { setSelectedBrand(b); loadModels(b.id); }}
                    >
                      {logo ? (
                        <img src={logo} alt={b.name} style={{ width: 28, height: 28, objectFit: "contain", flexShrink: 0 }} />
                      ) : (
                        <span style={{ width: 28, height: 28, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", background: "#f3f4f6", borderRadius: 4 }}>
                          🚗
                        </span>
                      )}
                      <span style={S.itemName}>{b.name}</span>
                      {b.countryOfOrigin && <span style={S.itemSub}>{b.countryOfOrigin}</span>}
                      <div style={S.itemActions}>
                        <button style={S.iconBtn} onClick={(e) => { e.stopPropagation(); openBrandEdit(b); }} title="Sửa">✏️</button>
                        <button
                          style={S.iconBtn}
                          disabled={brandDeleting === b.id}
                          onClick={(e) => { e.stopPropagation(); deleteBrand(b); }}
                          title="Xóa"
                        >🗑️</button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* ── Column 2: Models ── */}
          <div style={S.col}>
            <div style={S.colHeader}>
              <strong>{selectedBrand ? `Dòng xe — ${selectedBrand.name}` : "Dòng xe"}</strong>
              {selectedBrand && <Button variant="primary" size="sm" onClick={openModelCreate}>+ Thêm</Button>}
            </div>
            {!selectedBrand ? (
              <p style={S.placeholder}>← Chọn hãng xe</p>
            ) : modelLoading ? <p style={S.loading}>Đang tải…</p> : (
              <ul style={S.list}>
                {models.length === 0 && <li style={S.emptyItem}>Chưa có dòng xe nào.</li>}
                {models.map((m) => (
                  <li
                    key={m.id}
                    style={{ ...S.listItem, ...(selectedModel?.id === m.id ? S.listItemActive : {}) }}
                    onClick={() => { setSelectedModel(m); loadGenerations(m.id); }}
                  >
                    <span style={S.itemName}>{m.name}</span>
                    {m.segment && <span style={S.itemSub}>{m.segment}</span>}
                    <div style={S.itemActions}>
                      <button style={S.iconBtn} onClick={(e) => { e.stopPropagation(); openModelEdit(m); }} title="Sửa">✏️</button>
                      <button
                        style={S.iconBtn}
                        disabled={modelDeleting === m.id}
                        onClick={(e) => { e.stopPropagation(); deleteModel(m); }}
                        title="Xóa"
                      >🗑️</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ── Column 3: Generations ── */}
          <div style={S.col}>
            <div style={S.colHeader}>
              <strong>{selectedModel ? `Đời xe — ${selectedModel.name}` : "Đời xe"}</strong>
              {selectedModel && <Button variant="primary" size="sm" onClick={openGenCreate}>+ Thêm</Button>}
            </div>
            {!selectedModel ? (
              <p style={S.placeholder}>← Chọn dòng xe</p>
            ) : genLoading ? <p style={S.loading}>Đang tải…</p> : (
              <ul style={S.list}>
                {generations.length === 0 && <li style={S.emptyItem}>Chưa có đời xe nào.</li>}
                {generations.map((g) => (
                  <li key={g.id} style={S.listItem}>
                    <span style={S.itemName}>{g.name}</span>
                    <span style={S.itemSub}>{g.yearStart}–{g.yearEnd !== null ? g.yearEnd : "nay"}</span>
                    <div style={S.itemActions}>
                      <button style={S.iconBtn} onClick={() => openGenEdit(g)} title="Sửa">✏️</button>
                      <button
                        style={S.iconBtn}
                        disabled={genDeleting === g.id}
                        onClick={() => deleteGen(g)}
                        title="Xóa"
                      >🗑️</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      {brandModal.open && (
        <BrandModal
          title={brandModal.editing ? "Sửa hãng xe" : "Thêm hãng xe"}
          form={brandForm}
          saving={brandSaving}
          onClose={() => setBrandModal({ open: false, editing: null })}
          onSave={saveBrand}
          onChange={(k, v) => setBrandForm((f) => ({ ...f, [k]: v }))}
        />
      )}
      {modelModal.open && (
        <NameModal
          title={modelModal.editing ? "Sửa dòng xe" : "Thêm dòng xe"}
          fields={[
            { label: "Tên dòng xe *", key: "name" },
            { label: "Phân khúc (sedan, suv…)", key: "segment" },
            { label: "Hoạt động", key: "isActive", type: "checkbox" },
          ]}
          values={modelForm}
          saving={modelSaving}
          onClose={() => setModelModal({ open: false, editing: null })}
          onSave={saveModel}
          onChange={(k, v) => setModelForm((f) => ({ ...f, [k]: v }))}
        />
      )}
      {genModal.open && (
        <NameModal
          title={genModal.editing ? "Sửa đời xe" : "Thêm đời xe"}
          fields={[
            { label: "Tên đời xe *", key: "name" },
            { label: "Năm bắt đầu *", key: "yearStart", type: "number" },
            { label: "Năm kết thúc (để trống = đang sản xuất)", key: "yearEnd", type: "number" },
            { label: "Hoạt động", key: "isActive", type: "checkbox" },
          ]}
          values={genForm}
          saving={genSaving}
          onClose={() => setGenModal({ open: false, editing: null })}
          onSave={saveGen}
          onChange={(k, v) => setGenForm((f) => ({ ...f, [k]: v }))}
        />
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
  error: { color: "#b91c1c", marginBottom: "1rem" },
  columns: { display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" },
  col: { flex: "1 1 260px", minWidth: 240, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" },
  colHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", borderBottom: "1px solid #e5e7eb", background: "#f9fafb" },
  list: { listStyle: "none", margin: 0, padding: 0 },
  listItem: { display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1rem", cursor: "pointer", borderBottom: "1px solid #f0f0f0", transition: "background 0.1s" },
  listItemActive: { background: "#eff6ff" },
  itemName: { flex: 1, fontSize: "0.9rem", fontWeight: 500 },
  itemSub: { fontSize: "0.75rem", color: "#9ca3af" },
  itemActions: { display: "flex", gap: "0.25rem" },
  iconBtn: { background: "none", border: "none", cursor: "pointer", fontSize: "1rem", padding: 2, opacity: 0.6, lineHeight: 1 },
  emptyItem: { padding: "1.25rem 1rem", color: "#9ca3af", fontSize: "0.875rem" },
  loading: { padding: "1rem", color: "#9ca3af", fontSize: "0.875rem" },
  placeholder: { padding: "1rem", color: "#d1d5db", fontSize: "0.875rem" },
  backdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { background: "#fff", borderRadius: 12, padding: "2rem", minWidth: 340, maxWidth: 480, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", gap: "1rem" },
  checkLabel: { display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", cursor: "pointer" },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" },
};

export default AdminVehicleBrandListPage;
