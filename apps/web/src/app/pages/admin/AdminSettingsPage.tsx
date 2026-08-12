import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAdminAuth } from "../../../features/admin/context/AdminAuthContext";
import { Button, Input } from "../../../components/ui";
import {
  listAdminSettings,
  updateAdminSettings,
  type AdminSetting,
} from "../../../features/admin/api/admin-catalog.api";

/** Keys hiển thị cố định — chỉ hiện fields này, theo thứ tự */
const FIELDS: { key: string; label: string; type?: string; hint?: string }[] = [
  { key: "zalo_phone", label: "Số Zalo", hint: "Ví dụ: 0901234567" },
  { key: "hotline", label: "Hotline", hint: "Ví dụ: 1800 1234" },
  {
    key: "show_oem",
    label: "Hiển thị OEM",
    type: "checkbox",
    hint: "Bật để hiện mục OEM trên website",
  },
  { key: "working_hours", label: "Giờ làm việc", hint: "Ví dụ: 8:00 – 18:00, Thứ 2 – Thứ 7" },
];

const AdminSettingsPage: React.FC = () => {
  const { logout } = useAdminAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data: AdminSetting[] = await listAdminSettings();
      const map: Record<string, string> = {};
      for (const s of data) map[s.key] = s.value;
      // Ensure all known keys have a default
      for (const f of FIELDS) {
        if (!(f.key in map)) map[f.key] = "";
      }
      setValues(map);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleChange = (key: string, val: string) =>
    setValues((v) => ({ ...v, [key]: val }));

  const handleCheckbox = (key: string, checked: boolean) =>
    setValues((v) => ({ ...v, [key]: checked ? "true" : "false" }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await updateAdminSettings(values);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
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
        <h2 style={{ margin: "0.75rem 0 1.5rem" }}>Cài đặt website</h2>

        {error && <p style={S.error}>{error}</p>}
        {success && <p style={S.success}>✅ Đã lưu thành công.</p>}

        {loading ? <p>Đang tải…</p> : (
          <div style={S.card}>
            {FIELDS.map((field) => (
              <div key={field.key} style={S.fieldRow}>
                {field.type === "checkbox" ? (
                  <label style={S.checkLabel}>
                    <input
                      type="checkbox"
                      checked={values[field.key] === "true"}
                      onChange={(e) => handleCheckbox(field.key, e.target.checked)}
                    />
                    <span>
                      <strong>{field.label}</strong>
                      {field.hint && (
                        <span style={S.hint}>{field.hint}</span>
                      )}
                    </span>
                  </label>
                ) : (
                  <Input
                    label={field.label}
                    hint={field.hint}
                    value={values[field.key] ?? ""}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                  />
                )}
              </div>
            ))}

            <div style={S.saveRow}>
              <Button variant="primary" loading={saving} onClick={handleSave}>
                Lưu cài đặt
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const S: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", display: "flex", flexDirection: "column" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1.5rem", borderBottom: "1px solid #e5e7eb", background: "#fff" },
  logo: { fontWeight: 700, fontSize: "1rem", color: "#111" },
  main: { padding: "2rem 1.5rem", flex: 1, maxWidth: 640 },
  backLink: { color: "#666", fontSize: "0.875rem", textDecoration: "none" },
  error: { color: "#b91c1c", marginBottom: "1rem" },
  success: { color: "#15803d", marginBottom: "1rem" },
  card: { background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" },
  fieldRow: {},
  checkLabel: { display: "flex", alignItems: "flex-start", gap: "0.75rem", fontSize: "0.9rem", cursor: "pointer", lineHeight: 1.4 },
  hint: { display: "block", fontSize: "0.8rem", color: "#9ca3af", marginTop: 2 },
  saveRow: { display: "flex", justifyContent: "flex-end", paddingTop: "0.5rem", borderTop: "1px solid #f0f0f0" },
};

export default AdminSettingsPage;
